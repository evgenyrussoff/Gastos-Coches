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
function navigate(route, carId=null){
  state.route=route; state.carId=carId;
  render();
  window.scrollTo({top:0,behavior:"smooth"});
}
function render(){
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active", b.dataset.route===state.route && state.route!=="car"));
  if(state.route==="home"){ setTitle("Mis coches"); renderHome(); }
  else if(state.route==="stats"){ setTitle("Estadística general"); renderGeneral(); }
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
          <div class="card-bg" style="${car.background?`background-image:url('${car.background}')`:''}"></div>
          <div class="card-content">
            ${car.logo ? carLogo(car) : carLogo(car)}
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
      <div class="detail-bg" style="${car.background?`background-image:url('${car.background}')`:''};${!car.background?'background:linear-gradient(135deg,#17233b,#070b14)':''}"></div>
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
          ${carLogo(x.car)}
          <h3>${x.car.name}</h3><p>${money(x.total)} · ${x.list.length} ${x.list.length===1?'registro':'registros'}</p>
        </button>`).join("")}</div>
    </section>`;
  document.querySelectorAll("[data-open-car]").forEach(b=>b.onclick=()=>navigate("car",b.dataset.openCar));
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
$("#homeButton").onclick=()=>navigate("home");
document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>navigate(b.dataset.route));

render();

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
