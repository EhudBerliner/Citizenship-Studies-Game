self.addEventListener('fetch', function(event) {
    // מאפשר לאפליקציה לעבוד גם בחיבור איטי
    event.respondWith(fetch(event.request));
});