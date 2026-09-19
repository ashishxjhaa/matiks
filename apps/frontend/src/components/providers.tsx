"use client";

import { AuthProvider } from "@/lib/auth-context";
import { WsProvider } from "@/lib/ws-context";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <WsProvider>{children}</WsProvider>
    </AuthProvider>
  );
}
