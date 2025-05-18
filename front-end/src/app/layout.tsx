'use client';

import { ReactNode, useEffect, useState } from 'react';
import './globals.css';
import { Providers } from './providers';
import { useAppSelector } from '@/hooks/redux';
import { RootState } from '@/store';
import SocketProvider from '@/provider/SocketProvider';
import NotificationProvider from '@/provider/SocketTestingProvide';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
   <NotificationProvider>
            {children}

          </NotificationProvider>
        </Providers>
      </body>
    </html>
  );
}

function SocketWrapper({ children }: { children: ReactNode }) {
  const { user, token } = useAppSelector((state: RootState) => state.auth);
  const [isReady, setIsReady] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    // This function extracts the user ID from a JWT token
    const extractUserIdFromToken = (token: string): string | null => {
      try {
        // JWT tokens are in format: header.payload.signature
        const payload = token.split('.')[1];
        // Decode the base64 payload
        const decodedPayload = JSON.parse(atob(payload));
        return decodedPayload.userId || decodedPayload.id || null;
      } catch (error) {
        console.error("Error extracting user ID from token:", error);
        return null;
      }
    };

    // Get user ID either from user object or token
    let extractedUserId;
    
    // First priority: user object if available
    if (user && user.id) {
      extractedUserId = user.id;
      console.log('Using user ID from user object:', extractedUserId);
    } 
    // Second priority: extract from token if available
    else if (token) {
      extractedUserId = extractUserIdFromToken(token);
      console.log('Extracted user ID from token:', extractedUserId);
    }

    if (extractedUserId) {
      setUserId(extractedUserId);
      setIsReady(true);
    }
  }, [user, token]);

  // Now we use the userId from our state which could come from either source
  if (!userId) {
    return <>{children}</>;
  }

  return (
    <SocketProvider userId={userId}>
      {children}
    </SocketProvider>
  );
}