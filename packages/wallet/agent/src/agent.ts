import type { WalletGateway } from './gateway';
import {
  AnthropicMessagesClient,
  type AnthropicTool,
  collectText,
  collectToolUses,
  type MessageParam,
  type MessagesClient,
  type ToolResultBlock,
  type ToolUseBlock,
} from './messages';
import { buildSystemPrompt, DEFAULT_PERSONA, type Persona } from './persona';
import { type ApproveFn, createToolGate, type ToolGate, type TransactionPolicy } from './policy';
import { createWalletTools, type WalletTool } from './tools';

/** A current, capable default model; override per deployment. */
const DEFAULT_MODEL = 'claude-sonnet-4-6';
const DEFAULT_MAX_TOKENS = 1024;
/** Safety bound on tool-use iterations within a single turn. */
const MAX_STEPS = 8;

export interface WalletAgentConfig {
  gateway: WalletGateway;
  /** Anthropic API key. On-device this ships in the app — see the mobile TODO. */
  apiKey: string;
  /** Display name of the network, e.g. "XRPL Testnet". */
  network: string;
  /** Native asset symbol, e.g. "XRP". */
  symbol: string;
  /** Personality. Defaults to {@link DEFAULT_PERSONA}. */
  persona?: Persona;
  /** Hard deny rules for mutating actions. */
  policy?: TransactionPolicy;
  /** Human approval callback for gated actions (e.g. submitting a payment). */
  approve: ApproveFn;
  /** Claude model id. Defaults to {@link DEFAULT_MODEL}. */
  model?: string;
  /** Max output tokens per response. Defaults to {@link DEFAULT_MAX_TOKENS}. */
  maxTokens?: number;
  /** Override the API base URL (proxies, gateways). */
  baseUrl?: string;
  /** Inject a custom fetch (RN polyfills, tests). */
  fetchImpl?: typeof fetch;
  /** Allow direct calls from a browser / React Native origin. Defaults true. */
  dangerouslyAllowBrowser?: boolean;
  /** Inject the Claude connection (tests). Defaults to the Anthropic SDK client. */
  client?: MessagesClient;
}

/**
 * XRPL wallet agent that runs the Claude tool-use loop against the Anthropic SDK
 * Messages API — so it runs in React Native, the browser, or Node with no agent
 * framework or subprocess. It owns the system prompt (persona + code-owned
 * scope/safety), the wallet tools, and the policy/approval gate, and keeps
 * conversation history so turns have memory. It never holds keys: signing
 * happens behind the {@link WalletGateway}.
 */
export class WalletAgent {
  private readonly client: MessagesClient;
  private readonly systemPrompt: string;
  private readonly tools: WalletTool[];
  private readonly anthropicTools: AnthropicTool[];
  private readonly gate: ToolGate;
  private readonly model: string;
  private readonly maxTokens: number;
  private readonly history: MessageParam[] = [];

  constructor(config: WalletAgentConfig) {
    this.client =
      config.client ??
      new AnthropicMessagesClient({
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        fetchImpl: config.fetchImpl,
        dangerouslyAllowBrowser: config.dangerouslyAllowBrowser,
      });
    this.tools = createWalletTools(config.gateway);
    this.anthropicTools = this.tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema,
    }));
    this.gate = createToolGate({
      policy: config.policy ?? {},
      approve: config.approve,
    });
    this.systemPrompt = buildSystemPrompt(config.persona ?? DEFAULT_PERSONA, {
      address: config.gateway.address,
      network: config.network,
      symbol: config.symbol,
    });
    this.model = config.model ?? DEFAULT_MODEL;
    this.maxTokens = config.maxTokens ?? DEFAULT_MAX_TOKENS;
  }

  /** Sends a user message, runs the tool loop to completion, returns the reply. */
  async ask(message: string): Promise<string> {
    this.history.push({ role: 'user', content: message });

    for (let step = 0; step < MAX_STEPS; step += 1) {
      const response = await this.client.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: this.systemPrompt,
        messages: this.history,
        tools: this.anthropicTools,
      });
      this.history.push({ role: 'assistant', content: response.content });

      const toolUses = collectToolUses(response.content);
      if (response.stop_reason !== 'tool_use' || toolUses.length === 0) {
        return collectText(response.content);
      }

      const results: ToolResultBlock[] = [];
      for (const toolUse of toolUses) {
        results.push(await this.runTool(toolUse));
      }
      this.history.push({ role: 'user', content: results });
    }

    return 'I had to stop after several steps without finishing. Please try rephrasing.';
  }

  /** Clears the conversation history (starts a fresh session, same wallet). */
  reset(): void {
    this.history.length = 0;
  }

  private async runTool(toolUse: ToolUseBlock): Promise<ToolResultBlock> {
    const base = { type: 'tool_result' as const, tool_use_id: toolUse.id };
    const tool = this.tools.find((t) => t.name === toolUse.name);
    if (!tool) {
      return {
        ...base,
        content: `Unknown tool: ${toolUse.name}`,
        is_error: true,
      };
    }

    const decision = await this.gate(toolUse.name, toolUse.input);
    if (!decision.allowed) {
      return {
        ...base,
        content: decision.message ?? 'Denied.',
        is_error: true,
      };
    }

    try {
      const result = await tool.run(toolUse.input);
      return { ...base, content: result.text, is_error: result.isError };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { ...base, content: `Tool error: ${message}`, is_error: true };
    }
  }
}
