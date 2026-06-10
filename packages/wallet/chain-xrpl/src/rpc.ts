/**
 * Thin JSON-RPC (HTTP) client. We intentionally use HTTP instead of the
 * xrpl.js WebSocket client: it avoids the Node polyfills the WS client needs
 * under Metro/Hermes, and the slice only needs request/response calls.
 */
export class XrplRpcClient {
  constructor(private readonly url: string) {}

  async request<T>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, params: [params] }),
    });
    if (!response.ok) {
      throw new Error(`XRPL RPC request failed with HTTP ${response.status}`);
    }
    const json = (await response.json()) as { result?: T };
    if (!json.result) {
      throw new Error(`XRPL RPC returned no result for "${method}"`);
    }
    return json.result;
  }
}
