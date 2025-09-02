import React from 'react';
import { Badge } from '@/components/ui/badge';
import { WifiOff, Wifi, Clock } from 'lucide-react';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';

export function OfflineIndicator() {
  const { isOnline, hasPendingSales, getPendingSales } = useOfflineQueue();
  const pendingSalesCount = getPendingSales().length;

  if (isOnline && !hasPendingSales) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <Wifi className="h-3 w-3 mr-1" />
        Online
      </Badge>
    );
  }

  if (!isOnline) {
    return (
      <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
        <WifiOff className="h-3 w-3 mr-1" />
        Offline
      </Badge>
    );
  }

  if (hasPendingSales) {
    return (
      <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <Clock className="h-3 w-3 mr-1" />
        {pendingSalesCount} pendente{pendingSalesCount > 1 ? 's' : ''}
      </Badge>
    );
  }

  return null;
}