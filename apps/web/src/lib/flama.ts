import { FlamaApp } from "@flama/frontend";
import { env } from "./env";
import { LocalStorageService } from "./storage";

export const app = FlamaApp.create({
  apiBaseUrl: env.NEXT_PUBLIC_API_URL,
  storage: new LocalStorageService(),
});
