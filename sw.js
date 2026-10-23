const CACHE='prodify-shell-v1';
const SHELL=['./','./index.html','./css/style.css','./css/responsive.css','./css/theme.css','./js/storage.js','./js/tasks.js','./js/calendar.js','./js/finance.js','./js/statistics.js','./js/notifications.js','./js/app.js','./assets/images/Icon.png'];

self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
  const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;
 }).catch(()=>caches.match('./index.html'))));
});
self.addEventListener('push',event=>{
 let data={title:'Prodify',body:'Ada pengingat baru.'};
 try{if(event.data)data=Object.assign(data,event.data.json())}catch(e){console.error('Prodify: payload push tidak valid',e)}
 event.waitUntil(self.registration.showNotification(data.title,{body:data.body,icon:'assets/images/Icon.png',badge:'assets/images/Icon.png',tag:data.tag||'prodify-push',data:{url:data.url||'./'}}));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
  const target=new URL(event.notification.data&&event.notification.data.url||'./',self.location.origin).href;
  const open=list.find(client=>client.url===target);
  if(open)return open.focus();
  return clients.openWindow(target);
 }));
});
