/* eslint-disable no-restricted-globals */
self.addEventListener("push", function (event) {
    const data = event.data ? event.data.json() : {};
    const title = data.notification.title || "New Notification";
    const options = {
      body: data.notification.body || "You have a new message",
      icon: "/icon.png", // Optional: Add an icon for the notification
      badge: "/badge.png", // Optional: Add a badge for the notification
    };
  
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  });
  /* eslint-enable no-restricted-globals */
  