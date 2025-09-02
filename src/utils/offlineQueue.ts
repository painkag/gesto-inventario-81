// IndexedDB wrapper for offline sales queue
interface OfflineSale {
  id: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

class OfflineQueueManager {
  private dbName = 'EstoqueManagerDB';
  private dbVersion = 1;
  private storeName = 'offlineSales';

  // Open IndexedDB connection
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store for offline sales
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('retryCount', 'retryCount', { unique: false });
        }
      };
    });
  }

  // Add sale to offline queue
  async addToQueue(saleData: any): Promise<string> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    const sale: OfflineSale = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      data: saleData,
      timestamp: Date.now(),
      retryCount: 0
    };
    
    return new Promise((resolve, reject) => {
      const request = store.add(sale);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('Sale added to offline queue:', sale.id);
        resolve(sale.id);
      };
      
      transaction.oncomplete = () => db.close();
    });
  }

  // Get all pending offline sales
  async getAllPending(): Promise<OfflineSale[]> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        db.close();
        resolve(request.result);
      };
    });
  }

  // Remove sale from queue after successful sync
  async removeFromQueue(saleId: string): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(saleId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('Sale removed from offline queue:', saleId);
        resolve();
      };
      
      transaction.oncomplete = () => db.close();
    });
  }

  // Update retry count for failed sync attempts
  async incrementRetryCount(saleId: string): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(saleId);
      
      getRequest.onsuccess = () => {
        const sale = getRequest.result;
        if (sale) {
          sale.retryCount++;
          const updateRequest = store.put(sale);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Sale not found'));
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
      transaction.oncomplete = () => db.close();
    });
  }

  // Clear all offline sales (useful for debugging)
  async clearAll(): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('All offline sales cleared');
        resolve();
      };
      
      transaction.oncomplete = () => db.close();
    });
  }

  // Get count of pending sales
  async getPendingCount(): Promise<number> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.count();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        db.close();
        resolve(request.result);
      };
    });
  }
}

// Export singleton instance
export const offlineQueue = new OfflineQueueManager();

// Service Worker registration and sync
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW registered successfully:', registration);
        
        // Register for background sync
        if ('sync' in registration) {
          console.log('Background sync is supported');
        }
        
        // Listen for service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, refresh the page
                if (confirm('Nova versão disponível. Recarregar página?')) {
                  window.location.reload();
                }
              }
            });
          }
        });
        
      } catch (error) {
        console.log('SW registration failed:', error);
      }
    });
  }
}

// Trigger background sync when back online
export function triggerBackgroundSync() {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration: any) => {
      return registration.sync.register('offline-sales-sync');
    }).catch((error) => {
      console.error('Background sync registration failed:', error);
    });
  }
}

// Check if the app is currently online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Network status listeners
export function setupNetworkListeners(
  onOnline: () => void,
  onOffline: () => void
) {
  window.addEventListener('online', () => {
    console.log('App is back online');
    onOnline();
    // Trigger sync when back online
    triggerBackgroundSync();
  });
  
  window.addEventListener('offline', () => {
    console.log('App went offline');
    onOffline();
  });
}