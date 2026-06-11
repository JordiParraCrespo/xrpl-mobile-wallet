import { query } from '@anthropic-ai/claude-agent-sdk';
import type { WalletGateway } from './gateway';
import { buildSystemPrompt, DEFAULT_PERSONA, type Persona } from './persona';
import {
  type ApproveFn,
  type CanUseTool,
  createCanUseTool,
  type TransactionPolicy,
} from './policy';
import { createWalletTools, WALLET_SERVER_NAME } from './tools';

export interface WalletAgentConfig {
  gateway: WalletGateway;
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
  /** Claude model id; falls back to the SDK default when omitted. */
  model?: string;
}

/** A structured event from a single agent turn. */
export type AgentEvent = { type: 'assistant'; text: string } | { type: 'result'; text: string };

/** Minimal view of the SDK message shapes this agent consumes. */
interface SdkMessageLike {
  type: string;
  subtype?: string;
  session_id?: string;
  result?: unknown;
  message?: { content?: unknown };
}

/**
 * The XRPL wallet agent: a thin, key-free wrapper around the Claude Agent SDK
 * tool-use loop. It owns the system prompt (persona + code-owned scope/safety),
 * the wallet tools, and the `canUseTool` policy/approval gate, and resumes its
 * session across turns so the conversation has memory.
 */
export class WalletAgent {
  private sessionId: string | undefined;
  private readonly mcpServer: ReturnType<typeof createWalletTools>;
  private readonly canUseTool: CanUseTool;
  private readonly systemPrompt: string;
  private readonly model: string | undefined;

  constructor(config: WalletAgentConfig) {
    this.mcpServer = createWalletTools(config.gateway);
    this.canUseTool = createCanUseTool({
      serverName: WALLET_SERVER_NAME,
      policy: config.policy ?? {},
      approve: config.approve,
    });
    this.systemPrompt = buildSystemPrompt(config.persona ?? DEFAULT_PERSONA, {
      address: config.gateway.address,
      network: config.network,
      symbol: config.symbol,
    });
    this.model = config.model;
  }

  /** Sends a user message, runs the tool loop, and returns the final reply text. */
  async ask(message: string): Promise<string> {
    let finalText = '';
    for await (const event of this.run(message)) {
      finalText = event.text || finalText;
    }
    return finalText;
  }

  /** Streams structured events (assistant text, final result) for one turn. */
  async *run(message: string): AsyncGenerator<AgentEvent> {
    const stream = query({
      prompt: message,
      options: {
        systemPrompt: this.systemPrompt,
        mcpServers: { [WALLET_SERVER_NAME]: this.mcpServer },
        // Our 2-arg callback is structurally assignable to the SDK's CanUseTool
        // (it ignores the extra context arg; the return shape matches).
        canUseTool: this.canUseTool,
        ...(this.model ? { model: this.model } : {}),
        ...(this.sessionId ? { resume: this.sessionId } : {}),
      },
    });

    for await (const raw of stream) {
      const event = this.handle(raw as unknown as SdkMessageLike);
      if (event) {
        yield event;
      }
    }
  }

  private handle(msg: SdkMessageLike): AgentEvent | undefined {
    if (msg.type === 'system' && msg.subtype === 'init') {
      this.sessionId = msg.session_id;
      return undefined;
    }
    if (msg.type === 'assistant') {
      const text = extractText(msg.message?.content);
      return text ? { type: 'assistant', text } : undefined;
    }
    if (msg.type === 'result') {
      return {
        type: 'result',
        text: typeof msg.result === 'string' ? msg.result : '',
      };
    }
    return undefined;
  }
}

/** Concatenates the text blocks of an assistant message's content array. */
function extractText(content: unknown): string {
  if (!Array.isArray(content)) {
    return '';
  }
  let text = '';
  for (const block of content) {
    if (
      block &&
      typeof block === 'object' &&
      (block as { type?: unknown }).type === 'text' &&
      typeof (block as { text?: unknown }).text === 'string'
    ) {
      text += (block as { text: string }).text;
    }
  }
  return text;
}
