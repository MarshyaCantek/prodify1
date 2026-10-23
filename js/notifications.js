(function(){
const {h,state}=P,$=s=>document.querySelector(s);
const APP_URL=location.href.split('#')[0];

function reminderKey(task){
 return task.id+'|'+task.date+'|'+(task.start||'')+'|'+task.reminder;
}
function addNotification(title,body,id){
 const list=Array.isArray(state.notif.list)?state.notif.list:[];
 if(list.some(x=>x.id===id))return;
 list.unshift({id,title,body,at:new Date().toISOString(),read:false});
 state.notif.list=list.slice(0,50);
 P.save('notif',state.notif);
 P.renderNotif();
}
function showNotification(title,body,id){
 addNotification(title,body,id);
 if(!('Notification' in window)||Notification.permission!=='granted')return;
 try{
  const n=new Notification(title,{body,icon:'assets/images/Icon.png',tag:id});
  n.onclick=()=>{window.focus();n.close()};
 }catch(e){console.error('Prodify: gagal menampilkan notifikasi',e)}
}

P.registerServiceWorker=async()=>{
 if(!('serviceWorker' in navigator))return null;
 try{return await navigator.serviceWorker.register('sw.js',{scope:'./'})}
 catch(e){console.error('Prodify: service worker gagal didaftarkan',e);return null}
};
P.requestPerm=async()=>{
 if(!('Notification' in window)){P.setNotificationToggle(false);return P.toast('Notifikasi dinonaktifkan')}
 const permission=await Notification.requestPermission();
 state.settings.notificationsEnabled=permission==='granted';
 P.save('settings',state.settings);
 P.setNotificationToggle(permission==='granted');
 if(permission==='granted'){
  await P.registerServiceWorker();
  P.toast('Notifikasi diaktifkan');
 }else P.toast('Notifikasi dinonaktifkan');
};
P.setNotificationToggle=enabled=>{
 const toggle=$('#notificationToggle');
 if(toggle)toggle.checked=enabled;
 const stateLabel=document.querySelector('.switch-state');
 if(stateLabel)stateLabel.textContent=enabled?'ON':'OFF';
};
P.permissionStatus=async()=>{
 let permission='unsupported';
 if('Notification' in window)permission=Notification.permission;
 if(navigator.permissions){
  try{const result=await navigator.permissions.query({name:'notifications'});permission=result.state}catch(e){console.warn('Prodify: status izin tidak dapat divalidasi',e)}
 }
 const enabled=state.settings.notificationsEnabled!==false;
 P.setNotificationToggle(enabled&&permission==='granted');
 return permission;
};
P.cancelNotifications=async()=>{
 state.settings.notificationsEnabled=false;
 P.save('settings',state.settings);
 if('serviceWorker' in navigator){
  try{
   const registration=await navigator.serviceWorker.getRegistration();
   const subscription=registration&&await registration.pushManager.getSubscription();
   if(subscription)await subscription.unsubscribe();
  }catch(e){console.error('Prodify: subscription push gagal dilepas',e)}
 }
 P.setNotificationToggle(false);
 await P.permissionStatus();
 P.toast('Notifikasi dinonaktifkan');
};
P.toggleNotifications=async event=>{
 if(event.target.checked){
  await P.requestPerm();
  await P.permissionStatus();
 }else await P.cancelNotifications();
};
P.checkReminders=()=>{
 if(state.settings.notificationsEnabled===false)return;
 const now=new Date(),today=P.today(),minute=now.getHours()*60+now.getMinutes();
 state.tasks.filter(t=>t.status!=='done'&&t.date===today&&t.start&&Number.isInteger(t.reminder)&&t.reminder>=0)
  .forEach(t=>{
   const [hour,min]=t.start.split(':').map(Number),target=hour*60+min-t.reminder;
   const id=reminderKey(t)+'|'+today;
   if(minute===target&&!state.notif.fired.includes(id)){
    state.notif.fired.push(id);P.save('notif',state.notif);
    showNotification('Pengingat tugas: '+t.title,(t.reminder?'Mulai dalam '+t.reminder+' menit.':'Waktunya mulai sekarang.'),id);
   }
  });
};
P.renderNotif=()=>{
 const panel=$('#notifPanel'),list=Array.isArray(state.notif.list)?state.notif.list:[];
 const unread=list.filter(x=>!x.read).length;
 $('#badge').hidden=!unread;$('#badge').textContent=unread;
 panel.replaceChildren(
  h('div',{class:'row between'},h('h3',{text:'Notifikasi'}),unread?h('button',{class:'ic','data-act':'readnotif',text:'Tandai dibaca'}):null),
  list.length?h('div',{class:'list'},list.map(x=>h('div',{class:'it'+(x.read?'':' unread')},h('b',{text:x.title}),h('small',{text:x.body+' · '+new Date(x.at).toLocaleString('id-ID')})))):
   h('small',{text:'Belum ada notifikasi.'})
 );
};
P.toggleNotif=()=>{
 const panel=$('#notifPanel');
 panel.hidden=!panel.hidden;
 if(!panel.hidden){state.notif.list.forEach(x=>x.read=true);P.save('notif',state.notif);P.renderNotif()}
};
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-act="readnotif"]');
 if(!b)return;
 state.notif.list.forEach(x=>x.read=true);P.save('notif',state.notif);P.renderNotif();
});
P.registerServiceWorker();
})();
