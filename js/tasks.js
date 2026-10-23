(function(){
const {h,state,$}=Object.assign({$:s=>document.querySelector(s)},P);
const PRI={urgent:0,high:1,medium:2,low:3};
P.PL={urgent:'Urgent',high:'High',medium:'Medium',low:'Low'};
P.due=t=>t.deadline||t.date;
P.isOverdue=t=>!!P.due(t)&&t.status!=='done'&&P.due(t)<P.today();
P.toggle=id=>{const t=state.tasks.find(x=>x.id===id);if(!t)return;
 if(t.status==='done'){t.status='todo';t.completedAt=null}else{t.status='done';t.completedAt=P.nowL();P.mood('happy')}
 P.commit('tasks')};
P.taskItem=t=>h('div',{class:'item'+(t.status==='done'?' done':'')+(P.isOverdue(t)?' late':''),'data-id':t.id},
 h('input',{type:'checkbox',checked:t.status==='done','data-act':'toggle','aria-label':'Tandai selesai'}),
 h('div',{class:'grow'},h('b',{text:t.title||'Tanpa judul'}),h('small',{text:(t.date?P.fd(t.date):'Tanggal belum diisi')+(t.start?' · '+t.start+(t.end?'–'+t.end:''):'')+(P.due(t)?' · deadline '+P.fd(P.due(t)):'')+(P.isOverdue(t)?' (terlambat)':'')})),
 h('span',{class:'pill p-'+t.priority,text:P.PL[t.priority]}),
 h('button',{class:'ic','data-act':'edit',text:'Edit'}),h('button',{class:'ic','data-act':'del',text:'Hapus'}));
P.taskForm=(task,date)=>{
 const t=task||{};
 const title=h('input',{maxLength:120,value:t.title||''}),notes=h('textarea',{rows:2,value:t.notes||''}),
  d=h('input',{type:'date',value:t.date||date||'',placeholder:'Opsional'}),dl=h('input',{type:'date',value:t.deadline||'',placeholder:'Opsional'}),
  st=h('input',{type:'text',inputMode:'numeric',value:t.start||'',placeholder:'08:00',maxLength:5}),en=h('input',{type:'text',inputMode:'numeric',value:t.end||'',placeholder:'10:00',maxLength:5}),
  pri=P.sel([['urgent','Urgent'],['high','High'],['medium','Medium'],['low','Low']],t.priority||'medium'),
  stat=P.sel([['todo','Belum dikerjakan'],['doing','Sedang dikerjakan'],['done','Selesai']],t.status||'todo'),
  rem=P.sel([['-1','Mati'],['0','Tepat waktu'],['5','5 menit sebelumnya'],['15','15 menit sebelumnya'],['30','30 menit sebelumnya']],String(t.reminder??-1)),
  err=h('p',{class:'err'}),
  form=h('form',{class:'form',novalidate:true},h('h2',{text:task?'Edit Tugas':'Tambah Tugas'}),
   P.field('Judul',title),P.field('Catatan',notes),
   h('div',{class:'row'},P.field('Tanggal',d),P.field('Deadline (opsional)',dl)),
   h('div',{class:'row'},P.field('Jam mulai',st),P.field('Jam selesai',en)),
   h('div',{class:'row'},P.field('Prioritas',pri),P.field('Status',stat)),
   P.field('Pengingat (perlu jam mulai)',rem),err,
   h('div',{class:'row end'},h('button',{type:'button',class:'btn ghost',onclick:P.closeModal,text:'Batal'}),h('button',{class:'btn',text:'Simpan'})));
 form.addEventListener('submit',e=>{e.preventDefault();
  const v=title.value.trim();
  if(dl.value&&dl.value<d.value)return err.textContent='Deadline tidak boleh sebelum tanggal tugas.';
  if(st.value&&!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(st.value))return err.textContent='Jam mulai gunakan format HH:MM.';
  if(en.value&&!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(en.value))return err.textContent='Jam selesai gunakan format HH:MM.';
  if(st.value&&en.value&&en.value<st.value)return err.textContent='Jam selesai tidak boleh sebelum jam mulai.';
  if(+rem.value>=0&&!st.value)return err.textContent='Isi jam mulai untuk memakai pengingat.';
  const done=stat.value==='done',wasDone=task&&task.status==='done';
  const data={title:v,notes:notes.value.trim(),date:d.value,deadline:dl.value||d.value,start:st.value,end:en.value,priority:pri.value,status:stat.value,reminder:+rem.value};
  if(task){data.completedAt=done?(task.completedAt||P.nowL()):null;Object.assign(task,data)}
  else state.tasks.push(Object.assign({id:P.uid(),createdAt:P.nowL(),completedAt:done?P.nowL():null},data));
  P.commit('tasks');P.closeModal();if(task)P.toast('Tugas diperbarui');else P.mood('excited','Tugas baru ditambahkan!');if(done&&(!task||!wasDone))P.mood('happy')});
 return form};
P.renderTasks=()=>{
 const q=$('#tSearch').value.toLowerCase(),st=$('#tStatus').value,pr=$('#tPri').value,dt=$('#tDate').value,vw=$('#tView').value,today=P.today();
 let l=state.tasks.filter(t=>(t.title||'').toLowerCase().includes(q)&&(!st||t.status===st)&&(!pr||t.priority===pr)&&(!dt||t.date===dt));
 if(vw==='today')l=l.filter(t=>t.date===today);
 if(vw==='upcoming')l=l.filter(t=>t.date>today&&t.status!=='done');
 if(vw==='late')l=l.filter(P.isOverdue);
 if(vw==='done')l=l.filter(t=>t.status==='done');
 const s=$('#tSort').value;
 l.sort((a,b)=>s==='priority'?(PRI[a.priority]??99)-(PRI[b.priority]??99):(P.due(a)+(a.start||'')).localeCompare(P.due(b)+(b.start||'')));
 const n=state.tasks.length,dn=state.tasks.filter(t=>t.status==='done').length;
 $('#tProg').style.width=(n?dn/n*100:0)+'%';
 $('#tProgTxt').textContent=n?dn+' dari '+n+' tugas selesai ('+Math.round(dn/n*100)+'%)':'Belum ada tugas';
 $('#taskList').replaceChildren(...(l.length?l.map(P.taskItem):[P.empty(n?'Tidak ada tugas yang cocok dengan filter.':'Belum ada tugas. Yuk mulai dengan langkah kecil!',h('button',{class:'btn','data-act':'addtask',text:'+ Tambah tugas'}))]));
};
})();
