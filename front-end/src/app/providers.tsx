// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { ReactNode, useState, useEffect } from 'react';
import { store, persistor } from '@/store';
import { getCurrentUser } from '@/store/slices/authSlice';
import { AuthProvider } from '@/context/auth-context';
import { PersistGate } from 'redux-persist/integration/react';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const unsubscribe = persistor.subscribe(() => {
      if (persistor.getState().bootstrapped) {
        store.dispatch(getCurrentUser());
      }
    });

    return () => unsubscribe();
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
