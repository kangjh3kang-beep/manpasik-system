// Manpasik Service Worker v1.0.0
const CACHE_NAME = 'manpasik-v1';
const OFFLINE_URL = '/offline.html';

// 캐시할 정적 리소스
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/auth',
  '/manifest.json',
  '/offline.html',
];

// 설치 이벤트 - 정적 자산 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] 정적 자산 캐싱 중...');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 활성화 이벤트 - 이전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('[SW] 이전 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch 이벤트 - 네트워크 우선, 캐시 폴백
self.addEventListener('fetch', (event) => {
  // API 요청은 캐시하지 않음
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 네비게이션 요청 처리
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // 기타 요청: 캐시 우선, 네트워크 폴백
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        // 유효한 응답만 캐시
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        // 응답 복제 후 캐시에 저장
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});

// 푸시 알림 이벤트
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || '만파식 알림';
  const options = {
    body: data.body || '새로운 알림이 있습니다.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/dashboard',
    },
    actions: [
      { action: 'open', title: '열기' },
      { action: 'close', title: '닫기' },
    ],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// 알림 클릭 이벤트
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data?.url || '/dashboard';
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

// 백그라운드 동기화
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-measurements') {
    event.waitUntil(syncMeasurements());
  }
});

async function syncMeasurements() {
  console.log('[SW] 측정 데이터 동기화 중...');
  // 오프라인 상태에서 저장된 측정 데이터를 서버에 동기화
  // IndexedDB에서 데이터를 읽어 서버에 전송
}

console.log('[SW] 만파식 Service Worker 로드됨');











