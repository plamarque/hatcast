/**
 * Custom service worker — extends Angular ngsw with Web Push handlers (story 8.1).
 * Listeners registered before importScripts to take precedence over ngsw push handler.
 */
(function () {
  'use strict';

  function sameOriginUrl(value) {
    try {
      var url = new URL(value || '/', self.location.origin);
      if (url.origin !== self.location.origin) {
        return self.location.origin + '/';
      }
      return url.href;
    } catch (_err) {
      return self.location.origin + '/';
    }
  }

  self.addEventListener('push', function (event) {
    event.stopImmediatePropagation();

    var title = 'HatCast';
    var options = {
      body: 'Nouvelle notification HatCast',
      icon: '/icons/manifest-icon-192.maskable.png',
      badge: '/icons/manifest-icon-192.maskable.png',
      data: { url: '/' },
    };

    if (event.data) {
      try {
        var payload = event.data.json();
        if (payload.title) {
          title = payload.title;
        }
        if (payload.body) {
          options.body = payload.body;
        }
        if (payload.url) {
          options.data.url = sameOriginUrl(payload.url);
        }
      } catch (_err) {
        /* keep defaults */
      }
    }

    event.waitUntil(self.registration.showNotification(title, options));
  });

  self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    var targetUrl = sameOriginUrl(event.notification.data && event.notification.data.url);

    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url.indexOf(self.location.origin) === 0 && 'focus' in client) {
            if ('navigate' in client) {
              return client.navigate(targetUrl).then(function (navigatedClient) {
                return (navigatedClient || client).focus();
              });
            }
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
        return undefined;
      }),
    );
  });
})();

importScripts('./ngsw-worker.js');
