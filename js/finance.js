(function(){
const {h,state}=P,$=s=>document.querySelector(s);
P.CATS={in:['Uang saku','Gaji','Freelance','Penjualan','Beasiswa','Hadiah','Pendapatan lain'],out:['Makanan','Transportasi','Pendidikan','Belanja','Tagihan','Kesehatan','Hiburan','Kebutuhan pribadi','Lainnya']};
P.sum=(type,m)=>state.tx.filter(x=>x.type===type&&(!m||(x.date||'').startsWith(m))).reduce((a,x)=>a+x.amount,0);
P.balance=()=>(Number(state.settings.opening)||0)+P.sum('in')-P.sum('out');
P.prevKey=k=>{const [y,m]=k.split('-').map(Number);return P.ymd(new Date(y,m-2,1)).slice(0,7)};
P.topCat=m=>{const t={};state.tx.filter(x=>x.type==='out'&&(x.date||'').startsWith(m)).forEach(x=>t[x.category||'Tanpa kategori']=(t[x.category||'Tanpa kategori']||0)+x.amount);
 return Object.entries(t).sort((a,b)=>b[1]-a[1])};
P.txForm=tx=>{
 const t=tx||{};
 const type=P.sel([['','Pilih jenis (opsional)'],['out','Pengeluaran'],['in','Pemasukan']],t.type),cat=h('select'),
  amt=h('input',{type:'number',min:0,step:'any',inputMode:'decimal',value:t.amount!=null?t.amount:'',placeholder:'25000'}),
  desc=h('input',{maxLength:100,value:t.desc||'',placeholder:'Makan siang'}),
  date=h('input',{type:'date',value:t.date||''}),err=h('p',{class:'err'}),
  btn=h('button',{class:'btn',text:'Simpan'});
 const fill=()=>cat.replaceChildren(h('option',{value:'',text:'Pilih kategori (opsional)'}),...(P.CATS[type.value]||[]).map(c=>h('option',{value:c,text:c,selected:c===t.category})));
 type.addEventListener('change',fill);fill();
 const form=h('form',{class:'form',novalidate:true},h('h2',{text:tx?'Edit Transaksi':'Tambah Transaksi'}),
  P.field('Jenis transaksi',type),P.field('Kategori',cat),P.field('Nominal (Rp)',amt),P.field('Keterangan',desc),P.field('Tanggal',date),err,
  h('div',{class:'row end'},h('button',{type:'button',class:'btn ghost',onclick:P.closeModal,text:'Batal'}),btn));
 form.addEventListener('submit',e=>{e.preventDefault();
  if(btn.disabled)return;
  const a=Number(amt.value);
  if(amt.value!==''&&!Number.isFinite(a))return err.textContent='Nominal harus berupa angka yang valid.';
  if(a<0)return err.textContent='Nominal tidak boleh negatif.';
  btn.disabled=true;
  const data={type:type.value,category:cat.value,amount:amt.value===''?0:a,desc:desc.value.trim(),date:date.value};
  if(tx)Object.assign(tx,data);else state.tx.push(Object.assign({id:P.uid(),createdAt:P.nowL()},data));
  P.commit('tx');P.closeModal();if(tx)P.toast('Transaksi diperbarui');else P.mood('excited','Transaksi tercatat!')});
 return form};
P.txItem=x=>h('div',{class:'item','data-id':x.id},
h('div',{class:'grow'},h('b',{text:x.desc||'Transaksi tanpa keterangan'}),h('small',{text:(x.category||'Kategori belum diisi')+(x.date?' · '+P.fd(x.date):' · Tanggal belum diisi')})),
 h('strong',{class:x.type==='in'?'in':'out',text:(x.type==='in'?'+ ':'- ')+P.rp(x.amount)}),
 h('button',{class:'ic','data-act':'txedit',text:'Edit'}),h('button',{class:'ic','data-act':'txdel',text:'Hapus'}));
P.fillCatFilter=()=>{const s=$('#fCat'),v=s.value;s.replaceChildren(h('option',{value:'',text:'Semua kategori'}),...[...P.CATS.in,...P.CATS.out].map(c=>h('option',{value:c,text:c})));s.value=v};
P.renderFin=()=>{
 const m=$('#fMonth').value,ty=$('#fType').value,c=$('#fCat').value,q=$('#fSearch').value.toLowerCase();
 let l=state.tx.filter(x=>(!m||(x.date||'').startsWith(m))&&(!ty||x.type===ty)&&(!c||x.category===c)&&(x.desc||'').toLowerCase().includes(q));
 l.sort((a,b)=>$('#fSort').value==='amount'?b.amount-a.amount:(b.date+b.createdAt).localeCompare(a.date+a.createdAt));
 const inc=P.sum('in',m),out=P.sum('out',m),card=(l,v,cls)=>h('div',{class:'card stat'},h('small',{text:l}),h('strong',{class:cls,text:v}));
 $('#finSum').replaceChildren(card('Total pemasukan',P.rp(inc),'in'),card('Total pengeluaran',P.rp(out),'out'),card('Cash flow bersih',P.rp(inc-out),inc-out>=0?'in':'out'),card('Saldo saat ini',P.rp(P.balance())));
 const cats=m?P.topCat(m):(()=>{const t={};state.tx.filter(x=>x.type==='out').forEach(x=>t[x.category]=(t[x.category]||0)+x.amount);return Object.entries(t).sort((a,b)=>b[1]-a[1])})();
 const extra=[h('div',{class:'card wide'},h('h3',{text:'Pengeluaran per kategori'}),cats.length?P.bars(cats,P.rp,'neg'):h('small',{text:'Belum ada pengeluaran.'}))];
 if(m){const pk=P.prevKey(m);extra.push(h('div',{class:'card wide'},h('h3',{text:'Perbandingan dengan bulan lalu'}),P.bars([['Masuk '+pk.slice(5),P.sum('in',pk),'pos'],['Masuk '+m.slice(5),inc,'pos'],['Keluar '+pk.slice(5),P.sum('out',pk),'neg'],['Keluar '+m.slice(5),out,'neg']],P.rp)))}
 else extra.push(h('div',{class:'card wide'},h('h3',{text:'Pemasukan vs pengeluaran'}),P.bars([['Masuk',inc,'pos'],['Keluar',out,'neg']],P.rp)));
 $('#finExtra').replaceChildren(...extra);
 $('#finList').replaceChildren(...(l.length?l.map(P.txItem):[P.empty(state.tx.length?'Tidak ada transaksi yang cocok.':'Belum ada transaksi. Catat yang pertama!',h('button',{class:'btn alt','data-act':'addtx',text:'+ Tambah transaksi'}))]));
};
})();
