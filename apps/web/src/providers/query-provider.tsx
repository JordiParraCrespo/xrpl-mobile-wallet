import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useState } from 'react';

// Keep cached queries fresh for a day before we drop them from storage on
// rehydrate. Anything older is considered stale and refetched on mount.
const MAX_AGE = 1000 * 60 * 60 * 24; // 24h

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
            // Must be <= persister maxAge so entries don't get garbage
            // collected before they're written back to storage.
            gcTime: MAX_AGE,
          },
        },
      }),
  );

  const [persister] = useState(() =>
    createSyncStoragePersister({
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      key: 'flama-query-cache',
    }),
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: MAX_AGE }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
