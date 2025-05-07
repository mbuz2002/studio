"use client";

import type { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider as TanstackQueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function QueryClientProvider({ children }: PropsWithChildren) {
  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
    </TanstackQueryClientProvider>
  );
}
