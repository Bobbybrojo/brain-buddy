"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QuizStoreProvider } from "@/providers/quizStoreProvider";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient inside the client component
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <QuizStoreProvider>{children}</QuizStoreProvider>
    </QueryClientProvider>
  );
}
