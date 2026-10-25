self.addEventListener("push", (event) => {
  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = {
        title: "Savel Selling",
        body: event.data.text(),
      };
    }
  }

  const title = data.title || "Savel Selling";


  const options = {
    body: data.body || "You have a new notification.",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    silent: false,
    tag: data.orderId
      ? `savel-order-${data.orderId}`
      : `savel-notification-${Date.now()}`,
    renotify: true,
    data: {
      url: data.url || "/",
      orderId: data.orderId || null,
    },
  };


  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || "/",
    self.location.origin
  ).href;

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      return clients.openWindow(targetUrl);
    })
  );
});