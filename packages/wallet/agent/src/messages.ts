import Anthropic from '@anthropic-ai/sdk';

/**
 * The wallet agent connects to Claude through the Anthropic SDK
 * (`@anthropic-ai/sdk`, the Messages API client), which runs in React Native,
 * the browser, and Node. The agentic tool-use loop is built on top in `agent.ts`.
 *
 * NOTE: `@anthropic-ai/claude-agent-sdk` (the agent framework) is intentionally
 * NOT used here — it spawns a Node subprocess and cannot run on a device.
 *
 * A small {@link MessagesClient} interface sits in front of the SDK so the agent
 * loop can be unit-tested offline with a fake client.
 */

export interface TextBlock {
  type: 'text';
  text: string;
}

export interface ToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResultBlock {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}

export type ContentBlock = TextBlock | ToolUseBlock | ToolResultBlock;

export interface MessageParam {
  role: 'user' | 'assistant';
  content: string | ContentBlock[];
}

export interface AnthropicTool {
  name: string;
  description: string;
  /** JSON Schema for the tool's arguments. */
  input_schema: Record<string, unknown>;
}

export interface CreateMessageRequest {
  model: string;
  max_tokens: number;
  system?: string;
  messages: MessageParam[];
  tools?: AnthropicTool[];
}

export interface CreateMessageResponse {
  content: ContentBlock[];
  stop_reason: string | null;
}

/** The Claude connection the agent loop drives. Swappable for tests. */
export interface MessagesClient {
  create(request: CreateMessageRequest): Promise<CreateMessageResponse>;
}

export interface AnthropicClientConfig {
  apiKey: string;
  /** Override the API base URL (proxies, gateways). */
  baseUrl?: string;
  /**
   * Allow calls from a browser / React Native origin. Defaults to true because
   * this client runs in app code, not a server.
   */
  dangerouslyAllowBrowser?: boolean;
  /** Inject a custom fetch (RN polyfills, tests). */
  fetchImpl?: typeof fetch;
}

/** {@link MessagesClient} backed by the official Anthropic SDK. */
export class AnthropicMessagesClient implements MessagesClient {
  private readonly client: Anthropic;

  constructor(config: AnthropicClientConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      dangerouslyAllowBrowser: config.dangerouslyAllowBrowser ?? true,
      ...(config.fetchImpl ? { fetch: config.fetchImpl } : {}),
    });
  }

  async create(request: CreateMessageRequest): Promise<CreateMessageResponse> {
    const params: Anthropic.MessageCreateParamsNonStreaming = {
      model: request.model,
      max_tokens: request.max_tokens,
      messages: request.messages as unknown as Anthropic.MessageParam[],
      ...(request.system ? { system: request.system } : {}),
      ...(request.tools ? { tools: request.tools as unknown as Anthropic.Tool[] } : {}),
    };
    const message = await this.client.messages.create(params);
    return {
      content: message.content as unknown as ContentBlock[],
      stop_reason: message.stop_reason,
    };
  }
}

/** Concatenates the text of an assistant message's content blocks. */
export function collectText(content: ContentBlock[]): string {
  return content
    .filter((block): block is TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');
}

/** The tool-use blocks the model wants executed this turn. */
export function collectToolUses(content: ContentBlock[]): ToolUseBlock[] {
  return content.filter((block): block is ToolUseBlock => block.type === 'tool_use');
}
