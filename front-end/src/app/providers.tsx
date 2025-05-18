'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider, useSelector } from 'react-redux';
import { ReactNode, useState, useEffect } from 'react';
import { store, persistor } from '@/store';
import { getCurrentUser } from '@/store/slices/authSlice';
import { AuthProvider } from '@/context/auth-context';
import { PersistGate } from 'redux-persist/integration/react';
import { RootState } from '@/store'; // Make sure to import your RootState type

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [isMounted, setIsMounted] = useState(false);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
              {children}
          </AuthProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}




// Helper hook to properly type useAppSelector
function useAppSelector<T>(selector: (state: RootState) => T): T {
  return useSelector<RootState, T>(selector);
}