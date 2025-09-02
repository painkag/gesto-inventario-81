import { useState, useEffect } from 'react';

export interface OfflineSale {
  id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    batch_id?: string;
  }>;
  total: number;
  customer_name?: string;
  payment_method: string;
  created_at: string;
  synced: boolean;
}

const OFFLINE_SALES_KEY = 'offline_sales_queue';

export function useOfflineQueue() {
  const [offlineQueue, setOfflineQueue] = useState<OfflineSale[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Load offline queue from localStorage on init
    const savedQueue = localStorage.getItem(OFFLINE_SALES_KEY);
    if (savedQueue) {
      try {
        setOfflineQueue(JSON.parse(savedQueue));
      } catch (error) {
        console.error('Error loading offline queue:', error);
      }
    }

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToQueue = (sale: Omit<OfflineSale, 'id' | 'synced'>) => {
    const newSale: OfflineSale = {
      ...sale,
      id: crypto.randomUUID(),
      synced: false,
    };

    const updatedQueue = [...offlineQueue, newSale];
    setOfflineQueue(updatedQueue);
    localStorage.setItem(OFFLINE_SALES_KEY, JSON.stringify(updatedQueue));
    
    return newSale.id;
  };

  const markAsSynced = (saleId: string) => {
    const updatedQueue = offlineQueue.map(sale => 
      sale.id === saleId ? { ...sale, synced: true } : sale
    );
    setOfflineQueue(updatedQueue);
    localStorage.setItem(OFFLINE_SALES_KEY, JSON.stringify(updatedQueue));
  };

  const removeFromQueue = (saleId: string) => {
    const updatedQueue = offlineQueue.filter(sale => sale.id !== saleId);
    setOfflineQueue(updatedQueue);
    localStorage.setItem(OFFLINE_SALES_KEY, JSON.stringify(updatedQueue));
  };

  const clearSyncedSales = () => {
    const updatedQueue = offlineQueue.filter(sale => !sale.synced);
    setOfflineQueue(updatedQueue);
    localStorage.setItem(OFFLINE_SALES_KEY, JSON.stringify(updatedQueue));
  };

  const getPendingSales = () => offlineQueue.filter(sale => !sale.synced);

  return {
    offlineQueue,
    isOnline,
    addToQueue,
    markAsSynced,
    removeFromQueue,
    clearSyncedSales,
    getPendingSales,
    hasPendingSales: getPendingSales().length > 0,
  };
}