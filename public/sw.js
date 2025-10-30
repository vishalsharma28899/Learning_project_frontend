self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "New Notification";
  const options = {
    body: data.body || "You have a new message.",
      
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
