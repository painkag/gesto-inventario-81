import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  offlineQueue, 
  isOnline, 
  setupNetworkListeners,
  triggerBackgroundSync 
} from "@/utils/offlineQueue";

export function useOfflineSync() {
  const { toast } = useToast();
  const [isOffline, setIsOffline] = useState(!isOnline());
  const [pendingSalesCount, setPendingSalesCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Setup network event listeners
    setupNetworkListeners(
      // On online
      () => {
        setIsOffline(false);
        toast({
          title: "Conexão restaurada",
          description: "Sincronizando vendas pendentes...",
        });
        handleOnlineSync();
      },
      // On offline
      () => {
        setIsOffline(true);
        toast({
          title: "Sem conexão",
          description: "As vendas serão salvas localmente e sincronizadas quando a conexão for restaurada.",
          variant: "destructive"
        });
      }
    );

    // Load initial pending count
    loadPendingCount();
  }, [toast]);

  const loadPendingCount = async () => {
    try {
      const count = await offlineQueue.getPendingCount();
      setPendingSalesCount(count);
    } catch (error) {
      console.error('Error loading pending count:', error);
    }
  };

  const handleOnlineSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      // Get all pending sales
      const pendingSales = await offlineQueue.getAllPending();
      
      if (pendingSales.length === 0) {
        setPendingSalesCount(0);
        return;
      }

      toast({
        title: `Sincronizando ${pendingSales.length} vendas...`,
        description: "Aguarde enquanto as vendas offline são enviadas.",
      });

      // Try to sync each sale
      let successCount = 0;
      for (const sale of pendingSales) {
        try {
          // Attempt to create the sale via API
          const response = await fetch('/api/sales', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(sale.data)
          });

          if (response.ok) {
            await offlineQueue.removeFromQueue(sale.id);
            successCount++;
          } else {
            // Increment retry count for failed attempts
            await offlineQueue.incrementRetryCount(sale.id);
          }
        } catch (error) {
          console.error(`Failed to sync sale ${sale.id}:`, error);
          await offlineQueue.incrementRetryCount(sale.id);
        }
      }

      // Update pending count
      await loadPendingCount();

      if (successCount > 0) {
        toast({
          title: "Sincronização concluída",
          description: `${successCount} vendas foram sincronizadas com sucesso.`,
        });
      }

      // Trigger background sync for any remaining sales
      if (successCount < pendingSales.length) {
        triggerBackgroundSync();
      }

    } catch (error) {
      console.error('Error during sync:', error);
      toast({
        title: "Erro na sincronização",
        description: "Algumas vendas não puderam ser sincronizadas. Tentaremos novamente em breve.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const addSaleToOfflineQueue = async (saleData: any): Promise<string> => {
    try {
      const saleId = await offlineQueue.addToQueue(saleData);
      await loadPendingCount();
      
      toast({
        title: "Venda salva offline",
        description: "A venda será sincronizada quando a conexão for restaurada.",
        variant: "default"
      });
      
      return saleId;
    } catch (error) {
      console.error('Error adding sale to offline queue:', error);
      throw error;
    }
  };

  const manualSync = async () => {
    if (!isOnline()) {
      toast({
        title: "Sem conexão",
        description: "Verifique sua conexão com a internet antes de sincronizar.",
        variant: "destructive"
      });
      return;
    }

    await handleOnlineSync();
  };

  const clearOfflineQueue = async () => {
    try {
      await offlineQueue.clearAll();
      setPendingSalesCount(0);
      toast({
        title: "Fila offline limpa",
        description: "Todas as vendas offline foram removidas.",
      });
    } catch (error) {
      console.error('Error clearing offline queue:', error);
      toast({
        title: "Erro",
        description: "Não foi possível limpar a fila offline.",
        variant: "destructive"
      });
    }
  };

  return {
    isOffline,
    pendingSalesCount,
    isSyncing,
    addSaleToOfflineQueue,
    manualSync,
    clearOfflineQueue,
    refreshPendingCount: loadPendingCount
  };
}