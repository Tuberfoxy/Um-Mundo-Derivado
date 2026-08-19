const cfg = window.CRX_CONFIG || {};
const configured = cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes("COLE_AQUI") && cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.includes("COLE_AQUI");
const sb = configured && window.supabase ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
let session = null, profile = null, allCreatures = [], profiles = [], section = "catalog", filter = "all";

const $ = id => document.getElementById(id);
const attrs = {forca:"Força", robustez:"Robustez", agilidade:"Agilidade", instinto:"Instinto", afinidade:"Afinidade", presenca:"Presença"};
const esc = x => String(x ?? "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const porteKey = x => (x || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

async function ensureSeedLoaded(){
  if (window.CRX_SEED) return true;
  return new Promise(resolve => {
    const script = document.createElement("script");
    script.src = "seed.js";
    script.onload = () => resolve(!!window.CRX_SEED);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

async function init(){
  if (!sb) {
    $("systemStatus").textContent = "CONFIGURAÇÃO AUSENTE";
    renderMessage("Configure config.js para conectar ao banco.");
    return;
  }

  const {data, error} = await sb.auth.getSession();
  if (error || !data.session) { location.href = "login.html"; return; }
  session = data.session;

  const pr = await sb.from("profiles").select("*").eq("id", session.user.id).single();
  if (pr.error) {
    renderMessage("Perfil não encontrado. Execute o SQL e verifique o cadastro do usuário.");
    return;
  }

  profile = pr.data;
  $("userBadge").textContent = (profile.username || "").toUpperCase() + " // " + (profile.role || "").toUpperCase();
  $("accessLabel").textContent = profile.role === "master" ? "ARQUIVO MESTRE / NÍVEL OMEGA" : "ARQUIVO BIOLÓGICO / PLAYER";
  $("systemStatus").textContent = "SISTEMA ONLINE";
  document.querySelectorAll(".master-only").forEach(x => x.style.display = profile.role === "master" ? "block" : "none");

  await ensureSeedLoaded();
  await load();
  bind();
  switchSection("catalog");
}

async function load(){
  const result = await sb.from("creatures").select("*").order("name");
  if(result.error){ renderMessage("Falha ao consultar o banco: " + result.error.message); return; }
  allCreatures = result.data || [];

  if(profile?.role === "master"){
    const pr = await sb.from("profiles").select("id,username,display_name,role").order("username");
    profiles = pr.error ? [] : (pr.data || []);
  }
}

function renderMessage(t){ $("contentGrid").innerHTML = `<div class="empty">${esc(t)}</div>`; $("count").textContent = "0"; }

function bind(){
  document.querySelectorAll(".nav").forEach(b => b.onclick = () => switchSection(b.dataset.section));
  document.querySelectorAll(".filter").forEach(b => b.onclick = () => {
    document.querySelectorAll(".filter").forEach(x => x.classList.remove("active"));
    b.classList.add("active"); filter = b.dataset.filter; render();
  });
  $("search").oninput = render;
  $("sort").onchange = render;
  $("closeModal").onclick = () => $("modal").classList.add("hidden");
  $("modal").onclick = e => { if(e.target.id === "modal") $("modal").classList.add("hidden"); };
  $("logoutBtn").onclick = async () => { await sb.auth.signOut(); location.href = "login.html"; };
}

function switchSection(s){
  if(s === "seasonal" && profile.role !== "master") s = "catalog";
  if(s === "manage" && profile.role !== "master") s = "catalog";
  section = s;
  document.querySelectorAll(".nav").forEach(x => x.classList.toggle("active", x.dataset.section === s));
  $("catalogToolbar").style.display = s === "manage" ? "none" : "flex";
  const info = {
    catalog:["DATABASE / WILDLIFE","CATÁLOGO DE ESPÉCIES","Registros comuns e espécies públicas."],
    players:["DATABASE / PLAYERS","ESPÉCIES DOS PLAYERS","Fichas vinculadas aos personagens da campanha."],
    seasonal:["DATABASE / RESTRICTED","ARQUIVOS SAZONAIS","Somente o Mestre pode acessar estes registros."],
    manage:["MASTER CONTROL / CRUD","GERENCIAR CRIATURAS","Criar, editar, duplicar e excluir registros do banco."]
  }[s];
  $("sectionEyebrow").textContent = info[0];
  $("sectionTitle").textContent = info[1];
  $("sectionSubtitle").textContent = info[2];
  render();
}

function visible(){
  let arr = allCreatures;
  if(section === "catalog") arr = arr.filter(c => c.category === "common" || c.category === "npc");
  if(section === "players") arr = arr.filter(c => c.category === "player" && (profile.role === "master" || c.owner_id === profile.id));
  if(section === "seasonal") arr = arr.filter(c => c.category === "seasonal");
  if(filter !== "all" && section === "catalog") arr = arr.filter(c => c.porte_key === filter);
  const q = ($("search").value || "").toLowerCase();
  if(q) arr = arr.filter(c => [c.name,c.species,c.tipo,c.habitat].join(" ").toLowerCase().includes(q));
  const s = $("sort").value;
  arr = [...arr].sort((a,b) => s === "level" ? Number(b.level)-Number(a.level) : s === "hp" ? Number(b.hp)-Number(a.hp) : a.name.localeCompare(b.name));
  return arr;
}

function render(){
  if(section === "manage"){ renderManage(); return; }
  const arr = visible();
  $("count").textContent = arr.length;
  $("contentGrid").innerHTML = arr.map(c => card(c)).join("") || `<div class="empty">NENHUM REGISTRO ENCONTRADO.</div>`;
  document.querySelectorAll("[data-open]").forEach(x => x.onclick = () => openDetail(x.dataset.open));
}

function card(c){
  const defense = 10 + Number(c.attrs?.agilidade || 0);
  return `<article class="creature-card" data-open="${esc(c.id)}"><div class="record-code">${esc(c.category).toUpperCase()} // LV ${c.level}</div><div class="card-body"><div><h2>${esc(c.name)}</h2><p>${esc(c.species || "Espécie não catalogada")}</p><small>${esc(c.porte)} • ${esc(c.tipo || "—")} • ${esc(c.habitat || "—")}</small></div>${c.image_url ? `<img src="${esc(c.image_url)}" alt="">` : "<div class=\"thumb-placeholder\">◈</div>"}</div><div class="stats-mini"><span>HP ${c.hp}</span><span>EN ${c.energia}</span><span>DEF ${defense}</span></div></article>`;
}

function openDetail(id){
  const c = allCreatures.find(x => x.id === id); if(!c) return;
  const a = c.attrs || {}, attacks = Array.isArray(c.attacks) ? c.attacks : [], perks = c.perks || {}, specials = Array.isArray(c.specials) ? c.specials : [], loot = Array.isArray(c.loot) ? c.loot : [];
  $("modalContent").innerHTML = `<div class="detail-head">${c.image_url ? `<img class="detail-image" src="${esc(c.image_url)}">` : ""}<div><p class="eyebrow">${esc(c.category).toUpperCase()} // SPECIMEN</p><h2>${esc(c.name).toUpperCase()}</h2><p class="muted">${esc(c.species || "")} • ${esc(c.porte)} • ${esc(c.tipo || "")} • ${esc(c.habitat || "")}</p></div></div><div class="detail-grid">
  <div class="detail-box"><h3>STATUS</h3><p>❤️ HP: ${c.hp}</p><p>⚡ Energia: ${c.energia}</p><p>🛡 Defesa: ${10 + Number(a.agilidade || 0)} <span class="muted">(10 + Agilidade)</span></p></div>
  <div class="detail-box"><h3>ATRIBUTOS</h3>${Object.entries(attrs).map(([k,n]) => `<p>${n}: <b>${a[k] ?? 0}</b></p>`).join("")}</div>
  <div class="detail-box"><h3>ATAQUES</h3>${attacks.length ? `<ul>${attacks.map(x => `<li><b>${esc(x[0])}</b> — ${esc(x[1])}</li>`).join("")}</ul>` : "<p>—</p>"}</div>
  <div class="detail-box"><h3>PERÍCIAS</h3>${Object.entries(perks).map(([k,v]) => `<p>${esc(k)}: <b>${v}</b></p>`).join("") || "<p>—</p>"}</div>
  <div class="detail-box"><h3>PERÍCIAS ESPECIAIS</h3>${specials.length ? `<ul>${specials.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : "<p>—</p>"}</div>
  <div class="detail-box"><h3>LOOT</h3>${loot.length ? `<ul>${loot.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : "<p>—</p>"}</div>
  ${c.notes ? `<div class="detail-box full"><h3>OBSERVAÇÕES</h3><p>${esc(c.notes).replace(/\\n/g,"<br>")}</p></div>` : ""}</div>`;
  $("modal").classList.remove("hidden");
}

function renderManage(){
  if(profile.role !== "master"){ renderMessage("ACESSO NEGADO"); return; }
  $("count").textContent = allCreatures.length;
  $("contentGrid").innerHTML = `<div class="manage-actions"><button class="btn primary" id="newCreature">+ NOVA CRIATURA</button><button class="btn" id="importSeed">IMPORTAR DADOS INICIAIS</button></div><div class="table-wrap"><table><thead><tr><th>Nome</th><th>Categoria</th><th>Porte</th><th>HP</th><th>Lv</th><th>Ações</th></tr></thead><tbody>${allCreatures.map(c => `<tr><td>${esc(c.name)}</td><td>${esc(c.category)}</td><td>${esc(c.porte)}</td><td>${c.hp}</td><td>${c.level}</td><td><button class="btn tiny" data-edit="${esc(c.id)}">EDITAR</button> <button class="btn tiny danger" data-del="${esc(c.id)}">EXCLUIR</button></td></tr>`).join("")}</tbody></table></div>`;
  $("newCreature").onclick = () => openEditor();
  $("importSeed").onclick = importSeed;
  document.querySelectorAll("[data-edit]").forEach(b => b.onclick = () => openEditor(allCreatures.find(c => c.id === b.dataset.edit)));
  document.querySelectorAll("[data-del]").forEach(b => b.onclick = () => deleteCreature(b.dataset.del));
}

function jsonArrayText(arr){ return (arr || []).map(x => Array.isArray(x) ? x.join(" | ") : x).join("\n"); }
function jsonPerksText(obj){ return Object.entries(obj || {}).map(([k,v]) => `${k} | ${v}`).join("\n"); }

function openEditor(c = null){
  const a = c?.attrs || {forca:0,robustez:0,agilidade:0,instinto:0,afinidade:0,presenca:0};
  $("modalContent").innerHTML = `<p class="eyebrow">MASTER CONTROL // ${c ? "EDIT" : "NEW"}</p><h2>${c ? "EDITAR" : "CRIAR"} CRIATURA</h2>
  <form id="creatureForm" class="editor"><div class="form-grid">
  <label>Nome<input name="name" required value="${esc(c?.name || "")}"></label><label>Espécie<input name="species" value="${esc(c?.species || "")}"></label>
  <label>Nível<input name="level" type="number" min="1" value="${c?.level || 1}"></label><label>Porte<select name="porte"><option ${c?.porte === "Pequeno" ? "selected" : ""}>Pequeno</option><option ${(!c || c?.porte === "Médio") ? "selected" : ""}>Médio</option><option ${c?.porte === "Grande" ? "selected" : ""}>Grande</option><option ${c?.porte === "Colossal" ? "selected" : ""}>Colossal</option></select></label>
  <label>Tipo<input name="tipo" value="${esc(c?.tipo || "")}"></label><label>Habitat<input name="habitat" value="${esc(c?.habitat || "")}"></label>
  <label>Categoria<select name="category"><option value="common" ${c?.category === "common" ? "selected" : ""}>Comum</option><option value="npc" ${c?.category === "npc" ? "selected" : ""}>NPC</option><option value="player" ${c?.category === "player" ? "selected" : ""}>Player</option><option value="seasonal" ${c?.category === "seasonal" ? "selected" : ""}>Sazonal</option></select></label>
  <label>Player responsável<select name="owner_id"><option value="">— Não atribuído —</option>${profiles.filter(p => p.role === "player").map(p => `<option value="${esc(p.id)}" ${c?.owner_id === p.id ? "selected" : ""}>${esc(p.username)}</option>`).join("")}</select></label>
  <label>HP<input name="hp" type="number" min="0" value="${c?.hp || 1}"></label><label>Energia<input name="energia" type="number" min="0" value="${c?.energia || 0}"></label>
  <label>Imagem (URL ou caminho)<input name="image_url" value="${esc(c?.image_url || "")}"></label></div>
  <h3>ATRIBUTOS</h3><div class="attr-editor">${Object.entries(attrs).map(([k,n]) => `<label>${n}<input name="attr_${k}" type="number" min="0" value="${a[k] ?? 0}"></label>`).join("")}</div>
  <div class="form-grid"><label>ATAQUES <textarea name="attacks" placeholder="Mordida | Porte + Força">${esc(jsonArrayText(c?.attacks))}</textarea></label><label>PERÍCIAS <textarea name="perks" placeholder="Camuflagem | 2">${esc(jsonPerksText(c?.perks))}</textarea></label><label>PERÍCIAS ESPECIAIS <textarea name="specials" placeholder="Camuflagem II">${esc(jsonArrayText(c?.specials))}</textarea></label><label>LOOT <textarea name="loot" placeholder="Presa\nCouro">${esc(jsonArrayText(c?.loot))}</textarea></label></div>
  <label>Observações<textarea name="notes">${esc(c?.notes || "")}</textarea></label><div class="editor-actions"><button type="submit" class="btn primary">SALVAR NO BANCO</button><button type="button" class="btn" id="cancelEdit">CANCELAR</button></div><p id="editorMsg" class="message"></p></form>`;
  $("modal").classList.remove("hidden");
  $("cancelEdit").onclick = () => $("modal").classList.add("hidden");
  $("creatureForm").onsubmit = async e => { e.preventDefault(); await saveCreature(c?.id || null, new FormData(e.target)); };
}

function lines(text){ return String(text || "").split(/\n/).map(x => x.trim()).filter(Boolean); }
function parseAttacks(t){ return lines(t).map(x => { const p = x.split("|"); return [p[0].trim(), (p.slice(1).join("|") || "").trim()]; }); }
function parsePerks(t){ const o = {}; lines(t).forEach(x => { const p = x.split("|"); if(p[0]) o[p[0].trim()] = Number(p[1] || 0); }); return o; }

async function saveCreature(id, fd){
  const attrsObj = {forca:+fd.get("attr_forca"),robustez:+fd.get("attr_robustez"),agilidade:+fd.get("attr_agilidade"),instinto:+fd.get("attr_instinto"),afinidade:+fd.get("attr_afinidade"),presenca:+fd.get("attr_presenca")};
  const porte = fd.get("porte");
  const payload = {name:fd.get("name"),species:fd.get("species"),level:+fd.get("level"),porte,porte_key:porteKey(porte),tipo:fd.get("tipo"),habitat:fd.get("habitat"),category:fd.get("category"),hp:+fd.get("hp"),energia:+fd.get("energia"),attrs:attrsObj,attacks:parseAttacks(fd.get("attacks")),perks:parsePerks(fd.get("perks")),specials:lines(fd.get("specials")),loot:lines(fd.get("loot")),image_url:fd.get("image_url"),notes:fd.get("notes"),owner_id:fd.get("owner_id") || null};
  const result = id ? await sb.from("creatures").update(payload).eq("id",id) : await sb.from("creatures").insert(payload);
  if(result.error){ $("editorMsg").textContent = "Erro: " + result.error.message; return; }
  await load(); $("modal").classList.add("hidden"); render();
}

async function deleteCreature(id){
  if(!confirm("Excluir este registro permanentemente?")) return;
  const {error} = await sb.from("creatures").delete().eq("id",id);
  if(error) alert(error.message); else { await load(); renderManage(); }
}

async function importSeed(){
  if(profile?.role !== "master"){ alert("Apenas o Mestre pode importar os dados."); return; }
  if(!window.CRX_SEED){ const ok = await ensureSeedLoaded(); if(!ok){ alert("Não foi possível carregar seed.js."); return; } }

  const common = window.CRX_SEED.common || [];
  const players = window.CRX_SEED.players || [];
  const existingNames = new Set(allCreatures.map(c => c.name));
  let inserted = 0, skipped = 0, errors = [];

  for(const x of common){
    if(existingNames.has(x.name)){ skipped++; continue; }
    const {owner_username, ...rest} = x;
    const {error} = await sb.from("creatures").insert({...rest, category:"common"});
    if(error) errors.push(`${x.name}: ${error.message}`); else { inserted++; existingNames.add(x.name); }
  }

  for(const x of players){
    if(existingNames.has(x.name)){ skipped++; continue; }
    const {owner_username, ...rest} = x;
    let owner = null;
    if(owner_username){
      const {data} = await sb.from("profiles").select("id").eq("username", owner_username).maybeSingle();
      owner = data?.id || null;
    }
    const {error} = await sb.from("creatures").insert({...rest, owner_id:owner, category:"player"});
    if(error) errors.push(`${x.name}: ${error.message}`); else { inserted++; existingNames.add(x.name); }
  }

  await load(); renderManage();
  let msg = `IMPORTAÇÃO CONCLUÍDA.\n\nAdicionados: ${inserted}\nJá existentes: ${skipped}`;
  if(errors.length) msg += `\n\nERROS:\n${errors.join("\n")}`;
  alert(msg);
}

init();
