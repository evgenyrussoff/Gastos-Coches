const CARS = {
  c: {
    id: "c",
    name: "Serie C",
    model: "Mercedes-Benz Serie C",
    logo: "./assets/c_logo.jpg",
    background: "./assets/c_fondo.jpeg",
    accent: "Serie C"
  },
  glb: {
    id: "glb",
    name: "GLB",
    model: "Mercedes-Benz GLB",
    logo: "./assets/glb_logo.jpg",
    background: "./assets/glb_fondo.jpeg",
    accent: "GLB"
  },
  fiesta: {
    id: "fiesta",
    name: "Ford Fiesta",
    model: "Ford Fiesta",
    logo: null,
    background: null,
    accent: "Ford Fiesta"
  }
};

const CATEGORIES = ["Mantenimiento", "Neumáticos", "Seguro", "ITV", "Impuestos", "Otros gastos"];
const STORAGE_KEY = "mis-coches-gastos-v1";

const state = {
  route: "home",
  carId: null,
  routeStack: [],
  expenses: loadExpenses()
};

const $ = (sel) => document.querySelector(sel);

function loadExpenses(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}
function saveExpenses(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.expenses));
}
function id(){
  return (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2));
}
function money(n){
  return new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"}).format(Number(n)||0);
}
function dateText(value){
  if(!value) return "";
  return new Intl.DateTimeFormat("es-ES",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(value+"T12:00:00"));
}
function total(carId){
  return (state.expenses[carId]||[]).reduce((s,e)=>s+Number(e.amount||0),0);
}
function expenses(carId){
  return [...(state.expenses[carId]||[])].sort((a,b)=>b.date.localeCompare(a.date));
}
function latestMileage(list){
  const withKm = list.filter(e => Number.isFinite(Number(e.mileage)) && e.mileage !== "");
  if(!withKm.length) return null;
  return Math.max(...withKm.map(e=>Number(e.mileage)));
}
function formatKm(km){
  return km === null || km === undefined ? "—" : new Intl.NumberFormat("es-ES").format(km) + " km";
}
function categoryInterval(list, category){
  const kms = list
    .filter(e => e.category === category && Number.isFinite(Number(e.mileage)) && e.mileage !== "")
    .map(e => Number(e.mileage))
    .sort((a,b)=>b-a);
  if(kms.length < 2) return null;
  return kms[0] - kms[1];
}
function setTitle(title){
  $("#pageTitle").textContent = title;
  $("#homeButton").hidden = state.route === "home";
}
function navigate(route, carId=null, remember=true){
  if(remember && (route!==state.route || carId!==state.carId)) state.routeStack.push({route:state.route,carId:state.carId});
  state.route=route; state.carId=carId;
  render();
  window.scrollTo({top:0,behavior:"smooth"});
}
function goBack(){
  const previous=state.routeStack.pop();
  if(previous) navigate(previous.route,previous.carId,false);
  else if(state.route!="home") navigate("home",null,false);
  else return;
}
function render(){
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active", b.dataset.route===state.route && state.route!=="car"));
  if(state.route==="home"){ setTitle("Mis coches"); renderHome(); }
  else if(state.route==="stats"){ setTitle("Estadística general"); renderGeneral(); }
  else if(state.route==="settings"){ setTitle("Ajustes"); renderSettings(); }
  else { setTitle(CARS[state.carId].name); renderCar(state.carId); }
}
function carLogo(car){
  if(car.logo) return `<img class="car-logo" src="${car.logo}" alt="${car.name}">`;
  return `<div class="car-logo placeholder-logo" aria-hidden="true">
    <svg viewBox="0 0 300 130" width="100%" height="100%">
      <path d="M47 79 68 49q9-14 28-17l76-9q21-2 37 13l31 31 21 4q13 2 13 16v12H47Z" fill="#e8edf5"/>
      <path d="m91 51 19-12 55-7q17-1 29 11l14 16H83Z" fill="#101827"/>
      <circle cx="91" cy="91" r="16" fill="#101827"/><circle cx="91" cy="91" r="7" fill="#aeb8c8"/>
      <circle cx="214" cy="91" r="16" fill="#101827"/><circle cx="214" cy="91" r="7" fill="#aeb8c8"/>
    </svg></div>`;
}
function renderHome(){
  const totals = Object.keys(CARS).map(id=>total(id));
  const all = totals.reduce((a,b)=>a+b,0);
  $("#mainContent").innerHTML = `
    <section class="hero-intro">
      <div class="eyebrow">CONTROL DE GASTOS</div>
      <h2>Tu garaje</h2>
      <p>Selecciona un coche para consultar sus gastos, estadísticas y registrar un nuevo movimiento.</p>
    </section>
    <section class="car-grid">
      ${Object.values(CARS).map(car=>`
        <button class="car-card ${car.logo?'':'placeholder'}" data-open-car="${car.id}">
          <div class="card-bg" style="${car.background?`background-image:url('${car.background}');${car.id==='glb'?'background-position:78% 68%;':''}`:''}"></div>
          <div class="card-content">
            <h2>${car.name}</h2>
            <div class="small">${car.model}</div>
            <div class="small">${money(total(car.id))} registrados</div>
          </div>
        </button>`).join("")}
    </section>
    <section class="home-section">
      <div class="section-head"><div><div class="eyebrow">RESUMEN</div><h3>Los 3 coches</h3></div></div>
      <div class="general-card">
        <div><div class="big-number">${money(all)}</div><div class="muted">gasto total acumulado</div></div>
        <button class="primary-button" data-route="stats">Ver estadísticas</button>
      </div>
    </section>`;
  document.querySelectorAll("[data-open-car]").forEach(b=>b.onclick=()=>navigate("car",b.dataset.openCar));
  document.querySelectorAll("[data-route='stats']").forEach(b=>b.onclick=()=>navigate("stats"));
}
function renderCar(carId){
  const car=CARS[carId], list=expenses(carId), t=total(carId);
  const catTotals=Object.fromEntries(CATEGORIES.map(c=>[c,list.filter(e=>e.category===c).reduce((s,e)=>s+Number(e.amount||0),0)]));
  $("#mainContent").innerHTML=`
    <section class="detail-hero">
      <div class="detail-bg" style="${car.background?`background-image:url('${car.background}');${car.id==='glb'?'background-position:78% 68%;':''}`:''};${!car.background?'background:linear-gradient(135deg,#17233b,#070b14)':''}"></div>
      <div class="detail-info">
        <div><div class="eyebrow">${car.model}</div><h2>${car.name}</h2><p>${list.length} ${list.length===1?'registro':'registros'}</p></div>
        <div class="detail-actions"><button class="primary-button" id="addExpense">+ Gasto</button></div>
      </div>
    </section>
    <section class="stats-row">
      <div class="stat"><div class="label">Total</div><div class="value">${money(t)}</div></div>
      <div class="stat"><div class="label">Registros</div><div class="value">${list.length}</div></div>
      <div class="stat"><div class="label">Media</div><div class="value">${money(list.length?t/list.length:0)}</div></div>
    </section>
    <section class="stats-row mileage-summary">
      <div class="stat"><div class="label">Km actual</div><div class="value">${formatKm(latestMileage(list))}</div></div>
      <div class="stat"><div class="label">Últimos neumáticos</div><div class="value">${formatKm(categoryInterval(list, "Neumáticos"))}</div></div>
      <div class="stat"><div class="label">Último mantenimiento</div><div class="value">${formatKm(categoryInterval(list, "Mantenimiento"))}</div></div>
    </section>
    <section class="chart-card">
      <div class="section-head"><div><div class="eyebrow">DISTRIBUCIÓN</div><h3>Gastos por categoría</h3></div></div>
      ${CATEGORIES.map(c=>{
        const val=catTotals[c], pct=t?Math.round(val/t*100):0;
        return `<div class="bar-row"><div class="bar-label">${c}</div><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><div class="bar-value">${money(val)}</div></div>`;
      }).join("")}
    </section>
    <section class="expenses-panel">
      <div class="section-head"><div><div class="eyebrow">HISTORIAL</div><h3>Registros</h3></div></div>
      <div class="expense-list">
        ${list.length?list.map(e=>expenseHtml(e,carId)).join(""):`<div class="empty"><strong>Aún no hay gastos</strong>Empieza registrando el primer gasto de este coche.</div>`}
      </div>
    </section>`;
  $("#addExpense").onclick=()=>openExpenseModal(carId);
  document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>editExpense(carId,b.dataset.edit));
  document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>deleteExpense(carId,b.dataset.delete));
}
function expenseHtml(e,carId){
  return `<article class="expense-item">
    <div class="expense-main">
      <div class="expense-top"><span class="expense-category">${e.category}</span><span class="expense-concept">${escapeHtml(e.concept||"Sin concepto")}</span></div>
      <div class="expense-meta">${dateText(e.date)} · ${formatKm(Number.isFinite(Number(e.mileage)) ? Number(e.mileage) : null)}${e.notes?` · ${escapeHtml(e.notes)}`:""}</div>
    </div>
    <div><div class="expense-amount">${money(e.amount)}</div>
      <div class="item-buttons"><button class="mini-button" data-edit="${e.id}">Editar</button><button class="mini-button delete" data-delete="${e.id}">Borrar</button></div>
    </div>
  </article>`;
}
function renderGeneral(){
  const all=Object.values(CARS).map(c=>({car:c,total:total(c.id),list:expenses(c.id)}));
  const grand=all.reduce((s,x)=>s+x.total,0);
  const catTotals=Object.fromEntries(CATEGORIES.map(c=>[c,all.reduce((s,x)=>s+x.list.filter(e=>e.category===c).reduce((a,e)=>a+Number(e.amount||0),0),0)]));
  $("#mainContent").innerHTML=`
    <section class="hero-intro"><div class="eyebrow">RESUMEN DEL GARAJE</div><h2>Estadística general</h2><p>Vista conjunta de los tres coches, sin combustible ni cálculos de consumo. El kilometraje se registra para analizar la duración entre mantenimientos y neumáticos.</p></section>
    <div class="general-card"><div><div class="big-number">${money(grand)}</div><div class="muted">gasto total de los 3 coches</div></div><div class="eyebrow">${all.reduce((s,x)=>s+x.list.length,0)} REGISTROS</div></div>
    <section class="chart-card"><div class="section-head"><div><div class="eyebrow">CATEGORÍAS</div><h3>Total por tipo</h3></div></div>
      ${CATEGORIES.map(c=>{const v=catTotals[c],p=grand?Math.round(v/grand*100):0;return `<div class="bar-row"><div class="bar-label">${c}</div><div class="bar-track"><div class="bar-fill" style="width:${p}%"></div></div><div class="bar-value">${money(v)}</div></div>`}).join("")}
    </section>
    <section class="home-section"><div class="section-head"><div><div class="eyebrow">POR COCHE</div><h3>Comparativa</h3></div></div>
      <div class="general-grid">${all.map(x=>`
        <button class="general-car" data-open-car="${x.car.id}">
          <span class="general-car-logo">${carLogo(x.car)}</span>
          <span class="general-car-info"><strong>${x.car.name}</strong><b>${money(x.total)}</b><small>${x.list.length} ${x.list.length===1?'registro':'registros'}</small></span>
        </button>`).join("")}</div>
    </section>`;
  document.querySelectorAll("[data-open-car]").forEach(b=>b.onclick=()=>navigate("car",b.dataset.openCar));
}
function renderSettings(){
  const totalRecords=Object.values(state.expenses).reduce((n,items)=>n+(Array.isArray(items)?items.length:0),0);
  $('#mainContent').innerHTML=`
    <section class="hero-intro"><div class="eyebrow">DATOS Y HERRAMIENTAS</div><h2>Copias e informes</h2><p>Guarda una copia de tus registros o genera un informe para enviarlo por correo. Los datos se guardan en este dispositivo.</p></section>
    <section class="settings-card">
      <div class="settings-icon">⇩</div><div class="settings-copy"><h3>Copia de seguridad</h3><p>Exporta todos los coches, gastos, fechas, categorías, notas y kilometrajes en un archivo JSON.</p></div>
      <button class="primary-button" id="exportBackup">Exportar copia</button>
    </section>
    <section class="settings-card">
      <div class="settings-icon">⇧</div><div class="settings-copy"><h3>Importar copia</h3><p>Recupera una copia JSON exportada previamente. La importación sustituirá los registros actuales.</p></div>
      <label class="file-button">Elegir archivo<input type="file" id="importBackupFile" accept=".json,application/json" hidden></label>
    </section>
    <section class="settings-card report-card">
      <div class="settings-icon">✉</div><div class="settings-copy"><h3>Informe por correo</h3><p>Elige un coche o prepara un informe conjunto. Podrás compartir el archivo desde el menú del iPhone o abrir tu aplicación de correo.</p></div>
      <label>Tipo de informe<select id="reportScope"><option value="all">Todos los coches</option>${Object.values(CARS).map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select></label>
      <button class="primary-button" id="makeReport">Preparar informe</button>
    </section>
    <p class="settings-footnote">Registros guardados en este dispositivo: <strong>${totalRecords}</strong>. La copia de seguridad no incluye las fotos de los coches ni se guarda automáticamente en la nube.</p>`;
  $('#exportBackup').onclick=exportBackup;
  $('#importBackupFile').onchange=importBackup;
  $('#makeReport').onclick=makeReport;
}
function downloadBlob(blob,filename){
  const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function exportBackup(){
  const payload={app:'Mis Coches · Gastos',formatVersion:1,exportedAt:new Date().toISOString(),cars:Object.keys(CARS),expenses:state.expenses};
  downloadBlob(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),`copia-mis-coches-${new Date().toISOString().slice(0,10)}.json`);
  toast('Copia de seguridad preparada');
}
async function importBackup(event){
  const file=event.target.files?.[0]; if(!file)return;
  try{
    const parsed=JSON.parse(await file.text());
    const incoming=parsed?.expenses;
    if(!incoming || typeof incoming!=='object' || Array.isArray(incoming)) throw new Error('Formato incorrecto');
    const clean={};
    for(const carId of Object.keys(CARS)){
      const records=incoming[carId]??[];
      if(!Array.isArray(records)) throw new Error('La lista de registros no es válida');
      clean[carId]=records.map(e=>{
        if(!e || typeof e!=='object' || !e.date || !Number.isFinite(Number(e.amount))) throw new Error('Hay un registro no válido');
        return {id:String(e.id||id()),date:String(e.date),amount:Number(e.amount),mileage:e.mileage===''||e.mileage==null?'':Number(e.mileage),category:CATEGORIES.includes(e.category)?e.category:'Otros gastos',concept:String(e.concept||''),notes:String(e.notes||'')};
      });
    }
    if(!confirm('La importación sustituirá todos los registros actuales. ¿Has guardado una copia de seguridad y quieres continuar?')) return;
    state.expenses=clean; saveExpenses(); render(); toast('Copia importada correctamente');
  }catch(err){alert('No se pudo importar la copia. Comprueba que sea un archivo JSON de Mis Coches.');}
  finally{event.target.value='';}
}
function reportText(scope){
  const selected=scope==='all'?Object.values(CARS):[CARS[scope]];
  const lines=['INFORME DE GASTOS · MIS COCHES',`Generado: ${new Date().toLocaleDateString('es-ES')}`,''];
  for(const car of selected){
    const list=expenses(car.id); lines.push(`${car.name} — Total: ${money(total(car.id))} — ${list.length} registros`,'Fecha;Kilometraje (km);Categoría;Concepto;Importe (€);Notas');
    for(const e of [...list].reverse()) lines.push([e.date,e.mileage??'',e.category,e.concept||'',Number(e.amount||0).toFixed(2).replace('.',','),e.notes||''].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(';'));
    lines.push('');
  }
  return lines.join('\r\n');
}
async function makeReport(){
  const scope=$('#reportScope').value; const report=reportText(scope); const carName=scope==='all'?'todos-los-coches':CARS[scope].name.toLowerCase().replace(/\s+/g,'-');
  const file=new File(['\ufeff'+report],`informe-gastos-${carName}-${new Date().toISOString().slice(0,10)}.csv`,{type:'text/csv;charset=utf-8'});
  const subject=encodeURIComponent(`Informe de gastos · ${scope==='all'?'Todos los coches':CARS[scope].name}`);
  const body=encodeURIComponent('Adjunto/preparo el informe de gastos de Mis Coches.\n\nSi el archivo no aparece adjunto, comparte el CSV descargado desde Archivos o desde la hoja de compartir del iPhone.');
  if(navigator.canShare && navigator.canShare({files:[file]}) && navigator.share){
    try{await navigator.share({files:[file],title:'Informe de gastos'});return;}catch(err){if(err?.name==='AbortError')return;}
  }
  downloadBlob(file,file.name);
  window.location.href=`mailto:?subject=${subject}&body=${body}`;
  toast('Informe descargado; adjúntalo al correo si no aparece');
}

function openExpenseModal(carId, editId=null){
  $("#expenseModal").hidden=false;
  $("#expenseId").value=editId||"";
  $("#expenseDate").value=new Date().toISOString().slice(0,10);
  $("#expenseAmount").value="";
  $("#expenseMileage").value="";
  $("#expenseCategory").value="Mantenimiento";
  $("#expenseConcept").value="";
  $("#expenseNotes").value="";
  $("#modalTitle").textContent="Añadir gasto";
  if(editId){
    const e=(state.expenses[carId]||[]).find(x=>x.id===editId);
    if(e){
      $("#modalTitle").textContent="Editar gasto";
      $("#expenseDate").value=e.date;
      $("#expenseAmount").value=e.amount;
      $("#expenseMileage").value=e.mileage ?? "";
      $("#expenseCategory").value=e.category;
      $("#expenseConcept").value=e.concept||"";
      $("#expenseNotes").value=e.notes||"";
    }
  }
  $("#expenseAmount").focus();
}
function closeModal(){ $("#expenseModal").hidden=true; }
function editExpense(carId, editId){ openExpenseModal(carId,editId); }
function deleteExpense(carId, editId){
  if(!confirm("¿Borrar este gasto?")) return;
  state.expenses[carId]=(state.expenses[carId]||[]).filter(e=>e.id!==editId);
  saveExpenses(); render(); toast("Gasto borrado");
}
function toast(msg){
  const el=document.createElement("div"); el.className="toast"; el.textContent=msg; document.body.appendChild(el);
  setTimeout(()=>el.remove(),1800);
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

$("#expenseForm").addEventListener("submit",e=>{
  e.preventDefault();
  const carId=state.carId;
  const editId=$("#expenseId").value;
  const item={
    id:editId||id(),
    date:$("#expenseDate").value,
    amount:Number($("#expenseAmount").value),
    mileage:Number($("#expenseMileage").value),
    category:$("#expenseCategory").value,
    concept:$("#expenseConcept").value.trim(),
    notes:$("#expenseNotes").value.trim()
  };
  if(!state.expenses[carId]) state.expenses[carId]=[];
  if(editId){
    state.expenses[carId]=state.expenses[carId].map(x=>x.id===editId?item:x);
  } else state.expenses[carId].push(item);
  saveExpenses(); closeModal(); render(); toast(editId?"Gasto actualizado":"Gasto guardado");
});
$("#closeModal").onclick=closeModal;
$("#expenseModal").addEventListener("click",e=>{if(e.target.id==="expenseModal")closeModal()});
$("#homeButton").onclick=goBack;
document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>navigate(b.dataset.route));

// Gesto de volver: deslizar desde el borde izquierdo hacia la derecha.
let edgeStart=null;
document.addEventListener('touchstart',e=>{
  if(!$('#expenseModal').hidden || e.touches.length!==1)return;
  const t=e.touches[0]; edgeStart=t.clientX<=24?{x:t.clientX,y:t.clientY}:null;
},{passive:true});
document.addEventListener('touchend',e=>{
  if(!edgeStart)return;
  const t=e.changedTouches[0],dx=t.clientX-edgeStart.x,dy=t.clientY-edgeStart.y;
  if(dx>75 && Math.abs(dy)<70) goBack();
  edgeStart=null;
},{passive:true});
window.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('#expenseModal').hidden)closeModal();else goBack();}});

render();

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
