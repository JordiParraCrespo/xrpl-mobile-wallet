"use client";
import { FlamaProvider } from "@flama/frontend/react";
import { app } from "@/lib/flama";
import type { ReactNode } from "react";

export function WebFlamaProvider({ children }: { children: ReactNode }) {
  return <FlamaProvider app={app}>{children}</FlamaProvider>;
}
