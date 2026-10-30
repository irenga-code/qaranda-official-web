/* Qaranda Industries Ltd: lightweight offline cache. Keep this file next to index.html. */
var V="qaranda-v1",CORE=["./","./index.html"];
var SKIP=/googletagmanager|google-analytics|doubleclick|googleadservices/;
self.addEventListener("install",function(e){e.waitUntil(caches.open(V).then(function(c){return c.addAll(CORE)}).then(function(){return self.skipWaiting()}))});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(n){return n!==V}).map(function(n){return caches.delete(n)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener("fetch",function(e){
var r=e.request;if(r.method!=="GET"||SKIP.test(r.url))return;
var u=new URL(r.url);
if(u.origin===location.origin){
/* the page itself: network first so updates arrive, cache when offline */
e.respondWith(fetch(r).then(function(res){var cp=res.clone();caches.open(V).then(function(c){c.put(r,cp)});return res}).catch(function(){return caches.match(r).then(function(m){return m||caches.match("./index.html")})}));
return}
/* three.js and fonts: cache first, refresh in the background */
e.respondWith(caches.match(r).then(function(m){var f=fetch(r).then(function(res){if(res&&(res.ok||res.type==="opaque")){var cp=res.clone();caches.open(V).then(function(c){c.put(r,cp)})}return res}).catch(function(){return m});return m||f}))});
