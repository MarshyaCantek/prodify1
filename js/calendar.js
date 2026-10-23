(function(){
const {h,state}=P,$=s=>document.querySelector(s);
const n=new Date();P.cal={y:n.getFullYear(),m:n.getMonth(),sel:P.today()};
P.renderCal=()=>{
 const {y,m,sel}=P.cal,days=new Date(y,m+1,0).getDate(),off=(new Date(y,m,1).getDay()+6)%7,today=P.today();
 const grid=h('div',{class:'cgrid'},['Sen','Sel','Rab','Kam','Jum','Sab','Min'].map(d=>h('b',{class:'dow',text:d})));
 for(let i=0;i<off;i++)grid.append(h('span'));
 for(let d=1;d<=days;d++){
  const ds=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'),c=state.tasks.filter(t=>t.date===ds).length;
  grid.append(h('button',{class:'day'+(ds===today?' today':'')+(ds===sel?' sel':''),'data-act':'calsel','data-date':ds,'aria-label':P.fd(ds)+', '+c+' tugas'},h('span',{text:d}),c?h('i',{class:'dot',text:c}):null))}
 const list=state.tasks.filter(t=>t.date===sel).sort((a,b)=>(a.start||'').localeCompare(b.start||''));
 $('#calBody').replaceChildren(
  h('div',{class:'card'},h('div',{class:'row between'},h('button',{class:'btn ghost','data-act':'calprev','aria-label':'Bulan sebelumnya',text:'‹'}),
   h('h3',{text:new Date(y,m,1).toLocaleDateString('id-ID',{month:'long',year:'numeric'})}),
   h('button',{class:'btn ghost','data-act':'calnext','aria-label':'Bulan berikutnya',text:'›'})),
   h('div',{class:'row',style:'margin-top:8px'},h('button',{class:'btn ghost','data-act':'caltoday',text:'Kembali ke hari ini'})),grid),
  h('div',{class:'card'},h('div',{class:'row between'},h('h3',{text:'Agenda '+P.fd(sel)}),h('button',{class:'btn','data-act':'addtask','data-date':sel,text:'+ Tugas'})),
   h('div',{class:'list',style:'margin-top:10px'},list.length?list.map(P.taskItem):[h('small',{text:'Tidak ada agenda di tanggal ini.'})])));
};
})();
