import { ChainError, ChainErrors } from '@flama/chain-core';

/**
 * Thin JSON-RPC (HTTP) client. We intentionally use HTTP instead of the
 * xrpl.js WebSocket client: it avoids the Node polyfills the WS client needs
 * under Metro/Hermes, and the slice only needs request/response calls.
 *
 * Transport-level failures (network down, non-2xx, empty body) surface as a
 * common {@link ChainError}. JSON-RPC `error` fields in a 200 response are left
 * for the adapter to interpret, since their meaning is method-specific.
 */
export class XrplRpcClient {
  constructor(
    private readonly url: string,
    private readonly chainId?: string,
  ) {}

  async request<T>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    let response: Response;
    try {
      response = await fetch(this.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, params: [params] }),
      });
    } catch (cause) {
      throw new ChainError(ChainErrors.NETWORK, {
        chainId: this.chainId,
        detail: `"${method}" request failed`,
        cause,
      });
    }
    if (!response.ok) {
      throw new ChainError(ChainErrors.RPC, {
        chainId: this.chainId,
        detail: `HTTP ${response.status}`,
      });
    }
    const json = (await response.json()) as { result?: T };
    if (!json.result) {
      throw new ChainError(ChainErrors.RPC, {
        chainId: this.chainId,
        detail: `Empty result for "${method}"`,
      });
    }
    return json.result;
  }
}
