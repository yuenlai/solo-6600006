import { useState, useEffect, useCallback } from 'react';
import { NetworkStatus } from '../types';

export const useNetworkStatus = (): NetworkStatus => {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    lastOnline: navigator.onLine ? new Date().toISOString() : undefined,
    lastOffline: navigator.onLine ? undefined : new Date().toISOString(),
  });

  const handleOnline = useCallback(() => {
    setStatus({
      isOnline: true,
      lastOnline: new Date().toISOString(),
      lastOffline: undefined,
    });
  }, []);

  const handleOffline = useCallback(() => {
    setStatus({
      isOnline: false,
      lastOnline: undefined,
      lastOffline: new Date().toISOString(),
    });
  }, []);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return status;
};
