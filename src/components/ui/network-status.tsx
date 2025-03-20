
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface NetworkStatusProps {
  className?: string;
  offlineMessage?: string;
  showOfflineOnly?: boolean;
}

export function NetworkStatus({
  className = '',
  offlineMessage = 'Você está offline. Alguns recursos podem não estar disponíveis.',
  showOfflineOnly = true
}: NetworkStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (showOfflineOnly && isOnline) return null;

  return (
    <div className={`flex items-center p-3 rounded-md ${isOnline ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'} ${className}`}>
      {isOnline ? (
        <>
          <Wifi className="w-5 h-5 mr-2" />
          <span>Conectado à internet</span>
        </>
      ) : (
        <>
          <WifiOff className="w-5 h-5 mr-2" />
          <span>{offlineMessage}</span>
        </>
      )}
    </div>
  );
}
