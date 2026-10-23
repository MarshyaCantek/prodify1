(function(){
const {h,state}=P,$=s=>document.querySelector(s);
P.mstats=k=>{
 const ts=state.tasks.filter(t=>P.due(t).slice(0,7)===k),done=ts.filter(t=>t.status==='done'),
  onTime=done.filter(t=>t.completedAt&&t.completedAt.slice(0,10)<=P.due(t)),overdue=ts.filter(P.isOverdue);
 return {n:ts.length,done:done.length,pending:ts.length-done.length,onTime:onTime.length,late:done.length-onTime.length,overdue,rate:ts.length?Math.round(done.length/ts.length*100):null}};
P.evaluate=k=>{
 const s=P.mstats(k),p=P.mstats(P.prevKey(k)),inc=P.sum('in',k),out=P.sum('out',k),L=[],R=[];
 if(!s.n&&!inc&&!out)return {lines:['Evaluasi belum dapat dibuat karena belum ada tugas atau transaksi di bulan ini.'],recs:[]};
 if(s.n){
  L.push(s.rate>=80?'Sebagian besar tugas berhasil diselesaikan.':s.rate>=50?'Sekitar separuh tugas sudah selesai.':'Banyak tugas yang belum selesai bulan ini.');
  if(p.rate!=null)L.push(s.rate>p.rate?'Produktivitasmu meningkat dibandingkan bulan sebelumnya.':s.rate<p.rate?'Produktivitasmu menurun dibandingkan bulan sebelumnya.':'Produktivitasmu sama dengan bulan sebelumnya.');
  if(s.overdue.length){L.push(s.overdue.length+' tugas masih melewati deadline.');R.push('Selesaikan tugas yang terlambat lebih dulu atau jadwalkan ulang.')}
  L.push(s.rate>=state.settings.target?'Target penyelesaian '+state.settings.target+'% tercapai.':'Target penyelesaian '+state.settings.target+'% belum tercapai.')}
 if(inc||out){
  L.push(inc>=out?'Cash flow bersih positif.':'Pengeluaran melebihi pemasukan.');
  const tc=P.topCat(k)[0];if(tc){L.push('Pengeluaran terbesar: '+tc[0]+' ('+P.rp(tc[1])+').');if(out>inc)R.push('Kurangi pengeluaran di kategori '+tc[0]+'.')}}
 if(!R.length)R.push('Pertahankan ritme yang sudah baik bulan depan.');
 return {lines:L,recs:R}};
P.renderProg=()=>{
 const k=$('#pMonth').value||P.today().slice(0,7),s=P.mstats(k),ev=P.evaluate(k),inc=P.sum('in',k),out=P.sum('out',k),[y,m]=k.split('-').map(Number);
 const box=(l,v)=>h('div',{class:'card stat'},h('small',{text:l}),h('strong',{text:String(v)}));
 const days=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const ds=P.ymd(d);days.push([ds.slice(5),state.tasks.filter(t=>t.completedAt&&t.completedAt.slice(0,10)===ds).length])}
 const months=[];for(let i=5;i>=0;i--){const kk=P.ymd(new Date(y,m-1-i,1)).slice(0,7);const r=P.mstats(kk).rate;months.push([kk,r==null?0:r])}
 const ul=a=>h('ul',{},a.map(x=>h('li',{text:x})));
 $('#progBody').replaceChildren(
  h('div',{class:'card hero'},P.mascot(s.rate==null?'sleepy':s.rate>=80?'happy':s.rate<50?'worried':'idle','lg'),h('div',{},h('h3',{text:s.rate==null?'Belum ada data':'Completion rate: '+s.rate+'%'}),h('small',{text:'Rumus: tugas selesai ÷ tugas yang jatuh tempo di bulan ini × 100%. Tugas tanpa data jatuh tempo menampilkan "Belum ada data".'}))),
  h('div',{class:'grid'},box('Jatuh tempo',s.n),box('Selesai',s.done),box('Belum selesai',s.pending),box('Terlambat (belum selesai)',s.overdue.length),box('Selesai tepat waktu',s.onTime),box('Selesai terlambat',s.late)),
  h('div',{class:'card'},h('h3',{text:'Tugas selesai 7 hari terakhir'}),P.bars(days,v=>v+' tugas')),
  h('div',{class:'card'},h('h3',{text:'Completion rate 6 bulan terakhir'}),P.bars(months,v=>v+'%')),
  h('div',{class:'card'},h('h3',{text:'Evaluasi bulanan'}),ul(ev.lines),ev.recs.length?h('b',{text:'Rekomendasi'}):null,ul(ev.recs),
   s.overdue.length?h('small',{text:'Tugas tertunda: '+s.overdue.slice(0,3).map(t=>t.title).join(', ')}):null),
  h('div',{class:'card'},h('h3',{text:'Ringkasan keuangan bulan ini'}),P.bars([['Masuk',inc,'pos'],['Keluar',out,'neg']],P.rp),h('p',{text:'Cash flow bersih: '+P.rp(inc-out)})));
};
})();
