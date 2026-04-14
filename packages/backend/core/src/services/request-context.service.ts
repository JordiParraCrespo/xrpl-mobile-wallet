import { AsyncLocalStorage } from "node:async_hooks";
import { Injectable } from "@nestjs/common";

interface RequestContext {
  correlationId: string;
}

@Injectable()
export class RequestContextService {
  private static storage = new AsyncLocalStorage<RequestContext>();

  static run(context: RequestContext, fn: () => void) {
    this.storage.run(context, fn);
  }

  static getCorrelationId(): string | undefined {
    return this.storage.getStore()?.correlationId;
  }

  static setCorrelationId(id: string) {
    const store = this.storage.getStore();
    if (store) {
      store.correlationId = id;
    }
  }
}
