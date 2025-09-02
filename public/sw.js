const CACHE_NAME = 'estoque-manager-v1';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/dashboard/sales',
  '/dashboard/inventory',
  '/dashboard/products',
  '/dashboard/reports',
  '/manifest.json'
];

// Service Worker installation
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('[SW] Cache installation failed:', error);
      })
  );
  
  // Force the SW to activate immediately
  self.skipWaiting();
});

// Service Worker activation
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated');
  
  event.waitUntil(
    // Clean up old caches
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event handler - Cache strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests (Supabase)
  if (request.url.includes('/rest/v1/') || request.url.includes('/functions/v1/')) {
    // Network first for API calls
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network and cache
        return fetch(request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          
          return response;
        });
      })
      .catch(() => {
        // Fallback for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});

// Background sync for offline sales
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'offline-sales-sync') {
    event.waitUntil(syncOfflineSales());
  }
});

// Sync offline sales when back online
async function syncOfflineSales() {
  try {
    console.log('[SW] Syncing offline sales...');
    
    // Get offline sales from IndexedDB
    const db = await openDB();
    const transaction = db.transaction(['offlineSales'], 'readonly');
    const objectStore = transaction.objectStore('offlineSales');
    const offlineSales = await getAllFromStore(objectStore);
    
    if (offlineSales.length === 0) {
      console.log('[SW] No offline sales to sync');
      return;
    }
    
    console.log(`[SW] Found ${offlineSales.length} offline sales to sync`);
    
    // Attempt to sync each sale
    for (const sale of offlineSales) {
      try {
        const response = await fetch('/api/sales', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sale.data)
        });
        
        if (response.ok) {
          // Remove from offline queue
          await removeFromOfflineQueue(sale.id);
          console.log(`[SW] Successfully synced offline sale ${sale.id}`);
        }
      } catch (error) {
        console.error(`[SW] Failed to sync sale ${sale.id}:`, error);
      }
    }
    
  } catch (error) {
    console.error('[SW] Error during offline sales sync:', error);
  }
}

// IndexedDB helpers
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('EstoqueManagerDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offlineSales')) {
        const store = db.createObjectStore('offlineSales', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

function getAllFromStore(objectStore) {
  return new Promise((resolve, reject) => {
    const request = objectStore.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function removeFromOfflineQueue(saleId) {
  const db = await openDB();
  const transaction = db.transaction(['offlineSales'], 'readwrite');
  const objectStore = transaction.objectStore('offlineSales');
  return new Promise((resolve, reject) => {
    const request = objectStore.delete(saleId);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Push notification handling (future feature)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do Estoque Manager',
    icon: '/placeholder.svg',
    badge: '/placeholder.svg',
    tag: 'estoque-manager-notification',
    renotify: true
  };
  
  event.waitUntil(
    self.registration.showNotification('Estoque Manager', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received.');
  
  event.notification.close();
  
  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
