const CACHE="sm-v1";
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(["/","/sales","/manifest.json"])));
});
self.addEventListener("activate",e=>self.clients.claim());
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return;
  e.respondWith(
    caches.match(r).then(resp=>resp||fetch(r).then(net=>{
      caches.open(CACHE).then(c=>c.put(r, net.clone())); return net;
    }).catch(()=>resp))
  );
});