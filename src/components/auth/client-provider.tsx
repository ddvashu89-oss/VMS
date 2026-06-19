"use client";

import { ReactNode } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FullPageLoader } from "@/components/ui/loader";

/** Shows FullPageLoader while next-auth resolves the session */
function SessionGate({ children }: { children: ReactNode }) {
  const { status } = useSession();
  if (status === "loading") return <FullPageLoader />;
  return <>{children}</>;
}

export default function ClientProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <SessionGate>{children}</SessionGate>
        </TooltipProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
