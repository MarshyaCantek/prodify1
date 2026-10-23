(function(){
const {h,state}=P,$=s=>document.querySelector(s);
const PAGES=['dashboard','tasks','calendar','finance','progress','settings'];
const mascotAssets={happy:'mascot-happy.png',excited:'mascot-excited.png',worried:'mascot-worried.png',sleepy:'mascot-sleepy.png',idle:'mascot-idle.png'};
P.mascot=(mood,size,live)=>h('span',{class:'mascot '+size+' m-'+mood+(live?' live':'')},h('img',{src:'assets/images/'+(mascotAssets[mood]||mascotAssets.idle),alt:'Mascot '+mood+' Prodify'}));
const MSG={happy:'Yeay, tugas selesai! Kerja bagus!',excited:'Siap! Langkah baru dimulai.',worried:'Hmm, ada yang perlu perhatian.',sleepy:'Zzz... belum ada kegiatan.'};
let mt;const setLive=m=>document.querySelectorAll('.mascot.live').forEach(e=>{e.className='mascot sm live m-'+m;e.firstChild.src='assets/images/'+(mascotAssets[m]||mascotAssets.idle)});
P.mood=(mood,msg)=>{const b=$('#buddy');b.replaceChildren(P.mascot(mood,'md'),h('div',{class:'bubble',text:msg||MSG[mood]}));b.classList.add('show');setLive(mood);
 clearTimeout(mt);mt=setTimeout(()=>{b.classList.remove('show');setLive('idle')},2800)};
P.view=()=>{const on=!!state.settings.session;$('#landing').hidden=on;$('#shell').hidden=!on;$('#buddy').hidden=!on;if(on)P.go('dashboard')};
P.loginForm=()=>{const n=h('input',{maxLength:30,placeholder:'Nama panggilanmu',value:state.settings.name!=='Friend'?state.settings.name:''}),err=h('p',{class:'err'});
 const f=h('form',{class:'form',novalidate:true},P.mascot('happy','md'),h('h2',{text:'Selamat datang!'}),h('p',{class:'note',text:'Masukkan namamu untuk mulai. Tidak ada password: data hanya tersimpan di browser ini.'}),P.field('Nama',n),err,h('div',{class:'row end'},h('button',{type:'button',class:'btn ghost',onclick:P.closeModal,text:'Batal'}),h('button',{class:'btn',text:'Masuk'})));
 f.addEventListener('submit',e=>{e.preventDefault();const v=n.value.trim();if(!v)return err.textContent='Nama wajib diisi.';state.settings.name=v;state.settings.session=true;P.save('settings',state.settings);$('#sName').value=v;P.closeModal();P.view();P.render();P.mood('excited','Halo '+v+'! Yuk mulai.')});return f};
P.go=p=>{PAGES.forEach(x=>$('#page-'+x).hidden=x!==p);document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.page===p));$('#notifPanel').hidden=true;scrollTo(0,0)};
P.toast=m=>{const t=h('div',{class:'toast',text:m});$('#toasts').append(t);setTimeout(()=>t.remove(),2600)};
P.openModal=n=>{$('#modalBody').replaceChildren(n);if(!$('#modal').open)$('#modal').showModal()};
P.closeModal=()=>{if($('#modal').open)$('#modal').close()};
P.confirm=msg=>new Promise(res=>{const f=v=>{P.closeModal();res(v)};
 P.openModal(h('div',{},h('h2',{text:'Konfirmasi'}),h('p',{text:msg}),h('div',{class:'row end'},h('button',{class:'btn ghost',onclick:()=>f(false),text:'Batal'}),h('button',{class:'btn danger',onclick:()=>f(true),text:'Ya, lanjutkan'}))));
 $('#modal').addEventListener('close',()=>res(false),{once:true})});
P.renderDash=()=>{
 const hr=new Date().getHours(),today=P.today(),mk=today.slice(0,7),tt=state.tasks.filter(t=>t.date===today),dn=tt.filter(t=>t.status==='done').length,pc=tt.length?Math.round(dn/tt.length*100):0;
 const inc=P.sum('in',mk),out=P.sum('out',mk);
 const mood=!state.tasks.length&&!state.tx.length?'sleepy':state.tasks.some(P.isOverdue)?'worried':tt.length&&dn===tt.length?'happy':'idle';
 const greet=hr<11?'Good Morning':hr<15?'Good Afternoon':hr<19?'Good Evening':'Good Night';
 const st=(l,v,pg,cls)=>h('div',{class:'card stat','data-act':'goto','data-page':pg,tabindex:0,role:'link'},h('small',{text:l}),h('strong',{class:cls,text:v}));
 const up=state.tasks.filter(t=>t.status!=='done'&&P.due(t)>=today).sort((a,b)=>(P.due(a)+(a.start||'')).localeCompare(P.due(b)+(b.start||''))).slice(0,5);
 const ag=tt.slice().sort((a,b)=>(a.start||'').localeCompare(b.start||''));
 const quick=h('div',{class:'row'},h('button',{class:'btn','data-act':'addtask',text:'+ Tambah tugas'}),h('button',{class:'btn alt','data-act':'addtx',text:'+ Tambah transaksi'}));
 const kids=[h('div',{class:'card hero'},P.mascot('happy','lg'),h('div',{},h('h1',{},greet+', ',h('span',{class:'hl',text:state.settings.name}),'!'),h('small',{text:new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+' · Small Steps, Big Progress.'})))];
 if(!state.tasks.length&&!state.tx.length){kids.push(h('div',{class:'card'},P.empty('Belum ada data. Mulai dari satu langkah kecil!',quick)))}
 else{
  kids.push(h('div',{class:'grid'},st('Tugas hari ini',tt.length+' ('+dn+' selesai, '+(tt.length-dn)+' belum)','tasks'),st('Penyelesaian hari ini',tt.length?pc+'%':'Belum ada data','progress'),
   st('Pemasukan bulan ini',P.rp(inc),'finance','in'),st('Pengeluaran bulan ini',P.rp(out),'finance','out'),st('Saldo',P.rp(P.balance()),'finance'),st('Cash flow bulan ini',P.rp(inc-out),'finance',inc-out>=0?'in':'out')));
  kids.push(h('div',{class:'card'},h('div',{class:'bar-wrap'},h('div',{class:'fill',style:'width:'+pc+'%'})),h('small',{text:'Progress produktivitas hari ini'})));
  kids.push(h('div',{class:'grid'},h('div',{class:'card wide'},h('h3',{text:'Tugas terdekat'}),h('div',{class:'list'},up.length?up.map(P.taskItem):[h('small',{text:'Tidak ada tugas mendatang.'})])),
   h('div',{class:'card wide'},h('h3',{text:'Agenda hari ini'}),h('div',{class:'list'},ag.length?ag.map(P.taskItem):[h('small',{text:'Tidak ada agenda hari ini.'})])),
   h('div',{class:'card wide'},h('h3',{text:'Ringkasan cash flow'}),P.bars([['Masuk',inc,'pos'],['Keluar',out,'neg']],P.rp)),
   h('div',{class:'card wide'},h('h3',{text:'Aksi cepat'}),quick,h('p',{class:'note',text:pc===100&&tt.length?'Hebat, semua tugas hari ini selesai!':'Satu langkah kecil hari ini sudah cukup.'}))))}
 $('#page-dashboard').replaceChildren(...kids)};
P.render=()=>{[['renderDash','#page-dashboard'],['renderTasks','#taskList'],['renderCal','#calBody'],['renderFin','#finList'],['renderProg','#progBody'],['renderNotif','#notifPanel']].forEach(([f,sel])=>{
 try{P[f]()}catch(e){console.error('Prodify:',f,e);const el=$(sel);if(el&&sel!=='#notifPanel')el.replaceChildren(h('div',{class:'card'},h('p',{class:'err',text:'Bagian ini gagal dimuat ('+f+'): '+e.message+'. Pastikan semua file js/ dan css/ sudah diganti dengan versi terbaru lalu refresh paksa (Ctrl+Shift+R).'})))}})};
const applySettings=()=>{document.documentElement.dataset.theme=state.settings.theme};
const validImport=d=>d&&typeof d==='object'&&Array.isArray(d.tasks)&&Array.isArray(d.tx)&&d.tasks.every(t=>t&&typeof t.id==='string'&&typeof t.title==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(t.date)&&['urgent','high','medium','low'].includes(t.priority)&&['todo','doing','done'].includes(t.status))
 &&d.tx.every(x=>x&&typeof x.id==='string'&&['in','out'].includes(x.type)&&Number.isFinite(x.amount)&&x.amount>0&&typeof x.desc==='string'&&typeof x.category==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x.date))&&(!d.settings||typeof d.settings==='object');
document.addEventListener('click',async e=>{
 const b=e.target.closest('[data-act]');if(!b)return;
 const a=b.dataset.act,id=b.closest('[data-id]')?.dataset.id,c=P.cal,T=()=>state.tasks.find(t=>t.id===id),X=()=>state.tx.find(t=>t.id===id);
 if(a==='login')P.openModal(P.loginForm());
 else if(a==='logout'){if(await P.confirm('Apakah kamu yakin ingin keluar? Data tugas, transaksi, dan progres tidak akan dihapus. Data hanya akan hilang jika cache atau penyimpanan browser dihapus.')){state.settings.session=false;P.save('settings',state.settings);P.view();scrollTo(0,0)}}
 else if(a==='goto')P.go(b.dataset.page);
 else if(a==='toggle')P.toggle(id);
 else if(a==='edit'&&T())P.openModal(P.taskForm(T()));
 else if(a==='del'&&T()){if(await P.confirm('Hapus tugas ini?')){state.tasks=state.tasks.filter(t=>t.id!==id);P.commit('tasks');P.toast('Tugas dihapus')}}
 else if(a==='addtask')P.openModal(P.taskForm(null,b.dataset.date));
 else if(a==='addtx')P.openModal(P.txForm());
 else if(a==='txedit'&&X())P.openModal(P.txForm(X()));
 else if(a==='txdel'&&X()){if(await P.confirm('Hapus transaksi ini?')){state.tx=state.tx.filter(t=>t.id!==id);P.commit('tx');P.toast('Transaksi dihapus')}}
 else if(a==='calsel'){c.sel=b.dataset.date;P.renderCal()}
 else if(a==='calprev'||a==='calnext'){c.m+=a==='calnext'?1:-1;if(c.m<0){c.m=11;c.y--}if(c.m>11){c.m=0;c.y++}P.renderCal()}
 else if(a==='caltoday'){const n=new Date();c.y=n.getFullYear();c.m=n.getMonth();c.sel=P.today();P.renderCal()}
});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('.stat[data-act=goto]'))e.target.click()});
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal'))P.closeModal()});
$('#nav').addEventListener('click',e=>{const b=e.target.closest('button');if(b)P.go(b.dataset.page)});
$('#qaTask').addEventListener('click',()=>P.openModal(P.taskForm()));
$('#qaTx').addEventListener('click',()=>P.openModal(P.txForm()));
$('#bell').addEventListener('click',P.toggleNotif);
['#tSearch','#tStatus','#tPri','#tDate','#tView','#tSort'].forEach(s=>$(s).addEventListener('input',P.renderTasks));
['#fMonth','#fType','#fCat','#fSearch','#fSort'].forEach(s=>$(s).addEventListener('input',P.renderFin));
$('#pMonth').addEventListener('input',P.renderProg);
const S=state.settings,save=()=>{P.save('settings',S);applySettings();P.render()};
$('#sName').addEventListener('change',e=>{S.name=e.target.value.trim()||'Friend';save();P.toast('Nama disimpan')});
$('#sOpen').addEventListener('change',e=>{const v=Number(e.target.value);S.opening=Number.isFinite(v)?v:0;e.target.value=S.opening;save();P.toast('Saldo awal disimpan')});
$('#sTarget').addEventListener('change',e=>{S.target=Math.min(100,Math.max(1,Number(e.target.value)||80));e.target.value=S.target;save()});
$('#sTheme').addEventListener('change',e=>{S.theme=e.target.value;save()});
$('#btnPerm').addEventListener('click',P.requestPerm);
$('#btnCashflowExport').addEventListener('click',P.exportCashflow);
$('#btnExport').addEventListener('click',()=>{const data={};Object.keys(P.KEYS).forEach(k=>data[k]=state[k]);
 const a=h('a',{href:URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),download:'prodify-backup-'+P.today()+'.json'});a.click();URL.revokeObjectURL(a.href);P.toast('Data diekspor')});
$('#fileImport').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();
 r.onload=async()=>{let d;try{d=JSON.parse(r.result)}catch(x){return P.toast('File bukan JSON yang valid')}
  if(!validImport(d))return P.toast('Struktur data tidak valid. Data lama tidak diubah.');
  if(!await P.confirm('Impor akan menggantikan data saat ini (backup otomatis dibuat). Lanjutkan?'))return;
  P.backup();state.tasks=d.tasks;state.tx=d.tx;Object.assign(state.settings,d.settings||{});
  if(d.notif&&Array.isArray(d.notif.fired)&&Array.isArray(d.notif.list))state.notif=d.notif;
  Object.keys(P.KEYS).forEach(k=>P.save(k,state[k]));init();P.toast('Impor berhasil')};
 r.readAsText(f);e.target.value=''});
$('#btnReset').addEventListener('click',async()=>{
 if(!await P.confirm('Hapus SEMUA tugas, transaksi, dan pengaturan? Backup otomatis dibuat, tetapi tindakan ini tidak bisa dibatalkan dari aplikasi.'))return;
 P.backup();Object.keys(P.KEYS).forEach(k=>{const d=JSON.parse(JSON.stringify(P.defaults[k]));if(k==='settings')Object.assign(state.settings,d);else state[k]=d;P.save(k,state[k])});init();P.toast('Semua data dihapus')});
function init(){
 const s=state.settings;applySettings();
 $('#sName').value=s.name;$('#sOpen').value=s.opening;$('#sTarget').value=s.target;$('#sTheme').value=s.theme;
 if(!$('#fMonth').value)$('#fMonth').value=P.today().slice(0,7);
 if(!$('#pMonth').value)$('#pMonth').value=P.today().slice(0,7);
 if('Notification' in window)$('#permInfo').textContent='Izin: '+Notification.permission;
 P.fillCatFilter();P.render()}
init();P.view();
P.checkReminders();setInterval(P.checkReminders,30000);
})();
