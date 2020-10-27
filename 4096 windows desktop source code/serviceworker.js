const VERSION = '1';

const CACHE_URLS = [
  '/',
  'game_files/style/main.css',
  'game_files/js/bind_polyfill.js',
  'game_files/js/classlist_polyfill.js',
  'game_files/js/animframe_polyfill.js',
  'game_files/js/keyboard_input_manager.js',
  'game_files/js/html_actuator.js',
  'game_files/js/grid.js',
  'game_files/js/tile.js',
  'game_files/js/local_storage_manager.js',
  'game_files/js/game_manager.js',
  'game_files/js/application.js',
  'images/logo/icon.png',
  'images/logo/icon2.png',
  'images/logo/icon3.png',
  'images/logo/4096.gif',
  'images/logo/favicon.ico',
  'music/halloween.mp3',
  'music/normal.mp3',
  'music/normal2.mp3',
  'music/christmas.mp3',
  'convertDataUrl.js',
  'electronOpenFile.js',
  'newSongObject.js',
  'index.js',
];

const OPTIONAL_CACHE_URLS = [
  'game_files/style/fonts/BenchNine.css',
  'game_files/style/fonts/BenchNine-Light.otf',
  'game_files/style/fonts/BenchNine-Regular.otf',
  'game_files/style/fonts/BenchNine-Bold.otf',
];

function deleteOldCaches(keys) {
  return Promise.all(
    keys
      .filter(key => key !== VERSION)
      .map(key => caches.delete(key))
  );
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION).then(cache => {
      cache.addAll(OPTIONAL_CACHE_URLS);
      return cache.addAll(CACHE_URLS);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(deleteOldCaches)
  )
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
 