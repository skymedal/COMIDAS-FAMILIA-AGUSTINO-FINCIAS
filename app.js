const DAYS = ["Lunes","Martes","Miércoles","Jueves","Viernes"];
const CATEGORIES = {
  verduras: "🥬 Verduras y fruta",
  proteinas: "🥩 Carne, pescado y huevos",
  lacteos: "🧀 Lácteos",
  despensa: "🥖 Despensa",
  congelados: "❄️ Congelados",
  otros: "🧺 Otros"
};

const lunchPool = [
  {id:"pollo-tomate-aguacate", name:"Pollo a la plancha con tomate y aguacate", group:"carne", items:{proteinas:["pollo"], verduras:["tomate","aguacate"]}, pasta:false},
  {id:"arroz-pollo-verduras", name:"Arroz con pollo y verduras", group:"carne", items:{proteinas:["pollo"], despensa:["arroz"], verduras:["calabacín","zanahoria","cebolla"]}, pasta:false},
  {id:"lentejas-arroz", name:"Lentejas con verduras y arroz", group:"legumbre", items:{proteinas:["lentejas"], despensa:["arroz"], verduras:["zanahoria","cebolla","calabacín"]}, pasta:false},
  {id:"salmon-brocoli", name:"Salmón con patata y brócoli", group:"pescado", items:{proteinas:["salmón"], verduras:["brócoli","patatas"]}, pasta:false},
  {id:"merluza-judias", name:"Merluza a la plancha con judías verdes", group:"pescado", items:{proteinas:["merluza"], verduras:["judías verdes","patatas"]}, pasta:false},
  {id:"pasta-atun", name:"Pasta con tomate y atún", group:"pasta", items:{despensa:["pasta","tomate frito"], proteinas:["atún"]}, pasta:true},
  {id:"pasta-pollo-calabacin", name:"Pasta con pollo y calabacín", group:"pasta", items:{despensa:["pasta"], proteinas:["pollo"], verduras:["calabacín"]}, pasta:true},
  {id:"tortilla-patata", name:"Tortilla de patata con ensalada", group:"huevo", items:{proteinas:["huevos"], verduras:["patatas","lechuga","tomate"]}, pasta:false},
  {id:"garbanzos-espinacas", name:"Garbanzos salteados con espinacas", group:"legumbre", items:{proteinas:["garbanzos"], verduras:["espinacas","zanahoria"]}, pasta:false},
  {id:"hamburguesa-casera", name:"Hamburguesa casera con ensalada", group:"carne", items:{proteinas:["carne picada"], despensa:["pan hamburguesa"], verduras:["lechuga","tomate"]}, pasta:false},
  {id:"sardinas-tomate", name:"Sardinas con ensalada de tomate", group:"pescado", items:{proteinas:["sardinas"], verduras:["tomate","lechuga"]}, pasta:false}
];

const dinnerPool = [
  {id:"sandwich-pavo-queso", name:"Sándwich mixto de pavo y queso", group:"rapida", items:{despensa:["pan de molde"], proteinas:["pavo"], lacteos:["queso"]}, pasta:false},
  {id:"tortilla-francesa", name:"Tortilla francesa con tomate", group:"huevo", items:{proteinas:["huevos"], verduras:["tomate"]}, pasta:false},
  {id:"gulas-huevos", name:"Gulas con huevos", group:"huevo", items:{proteinas:["gulas","huevos"]}, pasta:false},
  {id:"nuggets-ensalada", name:"Nuggets en airfryer con ensalada", group:"airfryer", items:{congelados:["nuggets"], verduras:["lechuga","tomate"]}, pasta:false},
  {id:"alitas-verduras", name:"Alitas de pollo con verduras al horno", group:"airfryer", items:{proteinas:["alitas de pollo"], verduras:["verduras para horno"]}, pasta:false},
  {id:"cherry-mozzarella", name:"Tomate cherry y mozzarella con algo rápido", group:"rapida", items:{verduras:["tomate cherry"], lacteos:["mozzarella"], otros:["acompañamiento rápido"]}, pasta:false},
  {id:"crema-verduras", name:"Crema de verduras + queso", group:"verdura", items:{verduras:["verduras para crema"], lacteos:["queso"]}, pasta:false},
  {id:"quesadillas-pavo", name:"Quesadillas de pavo y queso", group:"rapida", items:{despensa:["tortillas de trigo"], proteinas:["pavo"], lacteos:["queso"]}, pasta:false},
  {id:"rabas-brocoli", name:"Rabas con brócoli", group:"airfryer", items:{congelados:["rabas"], verduras:["brócoli"]}, pasta:false}
];

const fridayPizza = {id:"pizza-viernes", name:"Pizza del viernes", group:"pizza", items:{congelados:["pizza"], lacteos:["mozzarella extra opcional"]}, pasta:false};

let state = { version:"1.2", accepted:false, week:[], checked:{}, favorites:{}, lastGenerated:null };

function mondayOfNextWeek(date = new Date()){
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 8);
  return d;
}
function isoDate(d){ return d.toISOString().slice(0,10); }
function formatWeek(){
  const start = mondayOfNextWeek();
  const end = new Date(start);
  end.setDate(start.getDate()+4);
  return `Semana del ${start.getDate()} al ${end.getDate()} de ${end.toLocaleDateString("es-ES",{month:"long"})} · lunes a viernes`;
}
function isSaturday(){ return new Date().getDay() === 6; }

function schoolForIndex(idx){
  const start = mondayOfNextWeek();
  const d = new Date(start);
  d.setDate(start.getDate()+idx);
  return window.SCHOOL_MENU?.days?.[isoDate(d)] || null;
}
function monthSchoolLoaded(){
  const start = mondayOfNextWeek();
  const key = isoDate(start).slice(0,7);
  return Object.keys(window.SCHOOL_MENU?.days || {}).some(k => k.startsWith(key));
}
function avoidGroupsFromSchool(school){
  if(!school) return [];
  const tags = school.tags || [];
  const avoid = [];
  if(tags.includes("pasta")) avoid.push("pasta");
  if(tags.includes("arroz")) avoid.push("pasta");
  if(tags.includes("legumbre")) avoid.push("legumbre");
  if(tags.includes("pescado")) avoid.push("pescado");
  if(tags.includes("huevo")) avoid.push("huevo");
  if(tags.includes("pizza")) avoid.push("pizza");
  return avoid;
}
function dinnerBalanceNote(school, dinner){
  if(!school) return {text:"🏫 Sin menú del cole para este día.", ok:true};
  const avoid = avoidGroupsFromSchool(school);
  if(avoid.includes(dinner.group)){
    return {text:`⚠️ Revisa: en el cole ya hay ${avoid.join(", ")}.`, ok:false};
  }
  return {text:"✅ Cena bien compensada con el cole.", ok:true};
}
function weightedPool(pool){
  const expanded = [];
  pool.forEach(item => {
    const fav = state.favorites[item.id] ? 2 : 0;
    const weight = 1 + fav;
    for(let i=0;i<weight;i++) expanded.push(item);
  });
  return expanded;
}
function pick(pool, avoidNames=[], avoidGroups=[]){
  let options = weightedPool(pool).filter(x => !avoidNames.includes(x.name) && !avoidGroups.includes(x.group));
  if (!options.length) options = weightedPool(pool).filter(x => !avoidNames.includes(x.name));
  if (!options.length) options = weightedPool(pool);
  return options[Math.floor(Math.random()*options.length)];
}
function countPasta(week){
  return week.reduce((n,d)=>n + (d.lunch?.pasta?1:0) + (d.dinner?.pasta?1:0),0);
}
function usedGroups(week, type){
  return week.map(d => d[type]?.group).filter(Boolean);
}

function generateWeek(force=false){
  const previous = state.week || [];
  const week = [];
  let usedLunch = [];
  let usedDinner = [];

  DAYS.forEach((day, idx) => {
    const prev = previous[idx];
    const school = schoolForIndex(idx);
    if (!force && prev && prev.locked) {
      week.push(prev);
      usedLunch.push(prev.lunch.name);
      usedDinner.push(prev.dinner.name);
      return;
    }

    let lunch;
    if (!force && prev?.lunchLocked) lunch = prev.lunch;
    else {
      lunch = pick(lunchPool, usedLunch, usedGroups(week,"lunch").slice(-1));
      let attempts = 0;
      while (lunch.pasta && countPasta([...week, {lunch, dinner:{pasta:false}}]) > 2 && attempts < 40) {
        lunch = pick(lunchPool, usedLunch);
        attempts++;
      }
    }
    usedLunch.push(lunch.name);

    let dinner;
    if (!force && prev?.dinnerLocked) dinner = prev.dinner;
    else if (day === "Viernes") dinner = fridayPizza;
    else dinner = pick(dinnerPool, usedDinner, [...usedGroups(week,"dinner").slice(-1), ...avoidGroupsFromSchool(school)]);
    usedDinner.push(dinner.name);

    week.push({
      day, lunch, dinner,
      locked: prev?.locked || false,
      lunchLocked: prev?.lunchLocked || false,
      dinnerLocked: prev?.dinnerLocked || false
    });
  });

  state.week = week;
  state.accepted = false;
  state.lastGenerated = new Date().toISOString();
  persist();
  render();
}
function regenerateMeal(index, type){
  const day = state.week[index];
  if (!day || day.locked || day[`${type}Locked`]) return;
  const used = state.week.map(d => d[type]?.name).filter(Boolean);
  if(type === "dinner" && day.day === "Viernes") day.dinner = fridayPizza;
  else {
    const pool = type === "lunch" ? lunchPool : dinnerPool;
    const avoid = type === "dinner" ? avoidGroupsFromSchool(schoolForIndex(index)) : [];
    day[type] = pick(pool, used, avoid);
  }
  state.accepted = false;
  persist();
  render();
}
function regenerateDay(index){
  const current = state.week[index];
  if (!current || current.locked) return;
  if (!current.lunchLocked) current.lunch = pick(lunchPool, state.week.map(d=>d.lunch?.name));
  if (!current.dinnerLocked) current.dinner = current.day === "Viernes" ? fridayPizza : pick(dinnerPool, state.week.map(d=>d.dinner?.name), avoidGroupsFromSchool(schoolForIndex(index)));
  state.accepted = false;
  persist();
  render();
}
function toggleLock(index, key="locked"){
  state.week[index][key] = !state.week[index][key];
  persist();
  render();
}
function toggleFavorite(item){
  if(state.favorites[item.id]) delete state.favorites[item.id];
  else state.favorites[item.id] = item.name;
  persist();
  render();
}
function acceptMenu(){
  state.accepted = true;
  persist();
  render();
}
function buildShopping(){
  const data = {};
  Object.keys(CATEGORIES).forEach(k => data[k] = {});
  state.week.forEach(day => {
    ["lunch","dinner"].forEach(type => {
      const items = day[type].items || {};
      Object.entries(items).forEach(([cat, arr]) => {
        arr.forEach(item => data[cat][item] = (data[cat][item] || 0) + 1);
      });
    });
  });
  return data;
}
function render(){
  document.getElementById("weekLabel").textContent = formatWeek();
  const status = document.getElementById("statusPill");
  status.textContent = state.accepted ? "Aceptado" : "Pendiente";
  status.className = "status-pill " + (state.accepted ? "accepted" : "pending");
  document.getElementById("saturdayBanner").classList.toggle("hidden", !isSaturday());
  document.getElementById("schoolReminder").classList.toggle("hidden", monthSchoolLoaded());

  const grid = document.getElementById("menuGrid");
  const tpl = document.getElementById("dayTemplate");
  grid.innerHTML = "";
  state.week.forEach((d, idx) => {
    const school = schoolForIndex(idx);
    const node = tpl.content.cloneNode(true);
    const card = node.querySelector(".day-card");
    if(d.locked) card.classList.add("locked");
    node.querySelector(".weekday").textContent = d.day;
    node.querySelector(".day-title").textContent = d.day.slice(0,3);
    node.querySelector(".school-chip").innerHTML = school ? `🏫 Cole: ${school.main} + ${school.second}` : "🏫 Cole: menú no cargado";
    node.querySelector(".lunch-name").textContent = d.lunch.name;
    node.querySelector(".dinner-name").textContent = d.dinner.name;
    const note = dinnerBalanceNote(school, d.dinner);
    const noteEl = node.querySelector(".balance-note");
    noteEl.textContent = note.text;
    noteEl.classList.toggle("ok", note.ok);

    const dayLock = node.querySelector(".day-lock");
    dayLock.textContent = d.locked ? "🔒" : "🔓";
    dayLock.addEventListener("click", () => toggleLock(idx, "locked"));

    const lunchLock = node.querySelector(".lock-lunch");
    lunchLock.textContent = d.lunchLocked ? "🔒 Plato" : "🔓 Plato";
    lunchLock.classList.toggle("on", d.lunchLocked);
    lunchLock.addEventListener("click", () => toggleLock(idx, "lunchLocked"));

    const dinnerLock = node.querySelector(".lock-dinner");
    dinnerLock.textContent = d.dinnerLocked ? "🔒 Plato" : "🔓 Plato";
    dinnerLock.classList.toggle("on", d.dinnerLocked);
    dinnerLock.addEventListener("click", () => toggleLock(idx, "dinnerLocked"));

    const favLunch = node.querySelector(".fav-lunch");
    favLunch.textContent = state.favorites[d.lunch.id] ? "♥" : "♡";
    favLunch.classList.toggle("on", !!state.favorites[d.lunch.id]);
    favLunch.addEventListener("click", () => toggleFavorite(d.lunch));

    const favDinner = node.querySelector(".fav-dinner");
    favDinner.textContent = state.favorites[d.dinner.id] ? "♥" : "♡";
    favDinner.classList.toggle("on", !!state.favorites[d.dinner.id]);
    favDinner.addEventListener("click", () => toggleFavorite(d.dinner));

    node.querySelector(".regen-lunch").addEventListener("click", () => regenerateMeal(idx,"lunch"));
    node.querySelector(".regen-dinner").addEventListener("click", () => regenerateMeal(idx,"dinner"));
    node.querySelector(".regen-day").addEventListener("click", () => regenerateDay(idx));
    grid.appendChild(node);
  });

  renderSchool();
  renderShopping();
  renderFavorites();
}
function renderSchool(){
  document.getElementById("schoolMonthLabel").textContent = `${window.SCHOOL_MENU?.source || "Cole"} · ${window.SCHOOL_MENU?.month || "Sin mes cargado"}`;
  const box = document.getElementById("schoolList");
  box.innerHTML = "";
  const entries = Object.entries(window.SCHOOL_MENU?.days || {}).sort();
  entries.forEach(([date, d]) => {
    const card = document.createElement("article");
    card.className = "school-day";
    card.innerHTML = `<h3>${d.day} ${date.slice(8,10)}</h3><p><strong>1º:</strong> ${d.main}</p><p><strong>2º:</strong> ${d.second}</p><p><strong>Guarnición:</strong> ${d.side || "-"}</p><div class="tags">${(d.tags||[]).map(t=>`<span class="tag">${t}</span>`).join("")}</div>`;
    box.appendChild(card);
  });
}
function renderShopping(){
  const container = document.getElementById("shoppingList");
  container.innerHTML = "";
  const data = buildShopping();
  Object.entries(CATEGORIES).forEach(([key, title]) => {
    const items = Object.entries(data[key] || {}).sort((a,b)=>a[0].localeCompare(b[0],"es"));
    if(!items.length) return;
    const card = document.createElement("article");
    card.className = "shop-card";
    card.innerHTML = `<h3>${title}</h3>`;
    items.forEach(([name,count]) => {
      const id = `${key}:${name}`;
      const row = document.createElement("label");
      row.className = "shop-item";
      row.innerHTML = `<input type="checkbox" ${state.checked[id] ? "checked":""}><span>${name}${count>1 ? ` ×${count}` : ""}</span>`;
      row.querySelector("input").addEventListener("change", e => {
        state.checked[id] = e.target.checked;
        persist();
      });
      card.appendChild(row);
    });
    container.appendChild(card);
  });
}
function renderFavorites(){
  const box = document.getElementById("favoritesList");
  box.innerHTML = "";
  const favs = Object.entries(state.favorites || {});
  if(!favs.length){
    box.innerHTML = `<div class="favorite-empty">Todavía no has marcado favoritos. Pulsa el corazón de un plato cuando guste mucho en casa.</div>`;
    return;
  }
  favs.sort((a,b)=>a[1].localeCompare(b[1],"es")).forEach(([id,name]) => {
    const row = document.createElement("div");
    row.className = "favorite-row";
    row.innerHTML = `<span>❤️ ${name}</span><button>Quitar</button>`;
    row.querySelector("button").addEventListener("click", () => {
      delete state.favorites[id];
      persist();
      render();
    });
    box.appendChild(row);
  });
}
function showView(id){
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === id));
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.view === id));
}
function persist(){ localStorage.setItem("comidasFamiliaV12", JSON.stringify(state)); }
function load(){
  try {
    const saved12 = JSON.parse(localStorage.getItem("comidasFamiliaV12") || "null");
    const saved11 = JSON.parse(localStorage.getItem("comidasFamiliaV11") || "null");
    const saved10 = JSON.parse(localStorage.getItem("comidasFamiliaV1") || "null");
    const saved = saved12 || saved11 || saved10;
    if(saved && saved.week && saved.week.length) {
      state = {...state, ...saved, version:"1.2", favorites:saved.favorites || {}, checked:saved.checked || {}};
      state.week = state.week.map(d => ({...d, lunchLocked: d.lunchLocked || false, dinnerLocked: d.dinnerLocked || false}));
    } else generateWeek(true);
  } catch(e) { generateWeek(true); }
}
document.getElementById("generateBtn").addEventListener("click", () => generateWeek(false));
document.getElementById("regenAllBtn").addEventListener("click", () => generateWeek(true));
document.getElementById("pdfBtn").addEventListener("click", () => window.print());
document.getElementById("acceptBtn").addEventListener("click", acceptMenu);
document.getElementById("acceptBtnTop").addEventListener("click", acceptMenu);
document.getElementById("clearChecksBtn").addEventListener("click", () => { state.checked = {}; persist(); render(); });
document.querySelectorAll(".tab").forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.view)));
document.querySelectorAll("[data-view-jump]").forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.viewJump)));

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
load();
render();
