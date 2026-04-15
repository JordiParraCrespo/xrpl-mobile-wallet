import { FlamaProvider } from '@flama/frontend/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import '../lib/i18n';
import { app } from '../lib/flama';

export function AppProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <FlamaProvider app={app}>{children}</FlamaProvider>
    </QueryClientProvider>
  );
}
