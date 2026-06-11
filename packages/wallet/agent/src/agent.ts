import { query, type SDKUserMessage } from '@anthropic-ai/claude-agent-sdk';
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
  /** Diagnostics: receives the underlying agent subprocess's stderr. */
  onStderr?: (data: string) => void;
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

type QueryStream = AsyncGenerator<unknown, void, unknown>;

/**
 * A pushable async-iterable of user messages. The Agent SDK requires
 * streaming-input mode for `canUseTool` to work (permission decisions flow back
 * over the same channel), so we feed turns through this queue instead of a
 * one-shot string prompt.
 */
function createInputStream() {
  const buffer: SDKUserMessage[] = [];
  let pending: ((value: SDKUserMessage | null) => void) | null = null;
  let closed = false;

  const push = (message: SDKUserMessage) => {
    if (pending) {
      pending(message);
      pending = null;
    } else {
      buffer.push(message);
    }
  };
  const close = () => {
    closed = true;
    if (pending) {
      pending(null);
      pending = null;
    }
  };
  const iterator = (async function* () {
    while (!closed) {
      const next =
        buffer.shift() ??
        (await new Promise<SDKUserMessage | null>((r) => {
          pending = r;
        }));
      if (next === null) {
        return;
      }
      yield next;
    }
  })();

  return { iterator, push, close };
}

const userMessage = (text: string): SDKUserMessage => ({
  type: 'user',
  message: { role: 'user', content: text },
  parent_tool_use_id: null,
});

/**
 * The XRPL wallet agent: a thin, key-free wrapper around the Claude Agent SDK
 * tool-use loop. It owns the system prompt (persona + code-owned scope/safety),
 * the wallet tools, and the `canUseTool` policy/approval gate. A single
 * streaming session is kept open so the conversation has memory across turns.
 */
export class WalletAgent {
  private readonly canUseTool: CanUseTool;
  private readonly systemPrompt: string;
  private readonly model: string | undefined;
  private readonly mcpServer: ReturnType<typeof createWalletTools>;
  private readonly onStderr: ((data: string) => void) | undefined;

  private input: ReturnType<typeof createInputStream> | undefined;
  private stream: QueryStream | undefined;

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
    this.onStderr = config.onStderr;
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
    const stream = this.ensureStarted();
    this.input?.push(userMessage(message));

    // Read with manual .next() rather than `for await … break`, which would
    // call the stream's .return() and close the session after a single turn.
    while (true) {
      const { value, done } = await stream.next();
      if (done) {
        return;
      }
      const event = this.handle(value as SdkMessageLike);
      if (event) {
        yield event;
        if (event.type === 'result') {
          return; // end of this turn; the session stays open for the next ask()
        }
      }
    }
  }

  /** Closes the streaming session. Call when the conversation is finished. */
  close(): void {
    this.input?.close();
  }

  private ensureStarted(): QueryStream {
    if (this.stream) {
      return this.stream;
    }
    const input = createInputStream();
    this.input = input;
    this.stream = query({
      prompt: input.iterator,
      options: {
        systemPrompt: this.systemPrompt,
        mcpServers: { [WALLET_SERVER_NAME]: this.mcpServer },
        // Streaming input mode: our 2-arg callback is structurally assignable to
        // the SDK's CanUseTool (it ignores the extra context arg).
        canUseTool: this.canUseTool,
        ...(this.model ? { model: this.model } : {}),
        ...(this.onStderr ? { stderr: this.onStderr } : {}),
      },
    }) as unknown as QueryStream;
    return this.stream;
  }

  private handle(msg: SdkMessageLike): AgentEvent | undefined {
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
