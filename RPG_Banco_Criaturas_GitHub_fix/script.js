const session = JSON.parse(localStorage.getItem("crx_session") || "null");
if(!session){ location.replace("login.html"); }

const creatures = [
  {name:"Lobissilva",level:3,porte:"Médio",porteKey:"medio",tipo:"Carnívoro",habitat:"Florestas",hp:40,energia:23,
   attrs:{forca:5,robustez:5,agilidade:7,instinto:6,afinidade:1,presenca:2},
   attacks:[["Mordida","Porte + Força"],["Garras","Porte + Força - 1"]],
   perks:["Caça III","Rastreamento II","Esquiva II","Sobrevivência I"],loot:["Presas","Couro","Garras","Carne"]},
  {name:"Pedracasco",level:5,porte:"Grande",porteKey:"grande",tipo:"Herbívoro",habitat:"Montanhas",hp:65,energia:19,
   attrs:{forca:7,robustez:10,agilidade:2,instinto:5,afinidade:2,presenca:3},
   attacks:[["Investida","Porte + Força"],["Chifrada","Porte + Força"]],
   perks:["Casco Rígido III","Resistência II","Suportar Dor II","Territorialismo I"],loot:["Placas Rochosas","Chifre","Couro Espesso","Minério Preso ao Casco"]},
  {name:"Plumáurea",level:4,porte:"Pequeno",porteKey:"pequeno",tipo:"Onívoro",habitat:"Campos",hp:30,energia:30,
   attrs:{forca:2,robustez:3,agilidade:8,instinto:7,afinidade:3,presenca:3},
   attacks:[["Bicada","Porte + Força"],["Rajada de Penas","Porte + Afinidade"]],
   perks:["Voo III","Esquiva II","Percepção II","Camuflagem I"],loot:["Penas Luminosas","Bico","Ovos","Plumas"]},
  {name:"Lamalume",level:2,porte:"Médio",porteKey:"medio",tipo:"Onívoro",habitat:"Brejos",hp:35,energia:28,
   attrs:{forca:4,robustez:5,agilidade:4,instinto:5,afinidade:3,presenca:1},
   attacks:[["Mordida","Porte + Força"],["Cuspe Lodoso","Porte + Afinidade"]],
   perks:["Camuflagem II","Natação II","Sobrevivência II"],loot:["Muco Pegajoso","Pele Úmida","Glândula Viscosa"]},
  {name:"Escaravulcão",level:6,porte:"Pequeno",porteKey:"pequeno",tipo:"Inseto",habitat:"Vulcões",hp:42,energia:34,
   attrs:{forca:5,robustez:6,agilidade:5,instinto:5,afinidade:6,presenca:2},
   attacks:[["Pinças","Porte + Força"],["Bola de Magma","Porte + Afinidade"]],
   perks:["Casco Rígido II","Resistência ao Calor III","Escalada II","Sobrevivência I"],loot:["Carapaça Vulcânica","Núcleo Magmático","Pinças","Cristal de Enxofre"]},
  {name:"Fruticervo",level:4,porte:"Médio",porteKey:"medio",tipo:"Herbívoro",habitat:"Bosques e Pomares",hp:48,energia:38,
   attrs:{forca:6,robustez:8,agilidade:6,instinto:9,afinidade:7,presenca:8},
   attacks:[["Chifrada Frutífera","Porte + Força"],["Investida","Porte + Força"],["Sementes Espirituais","Porte + Afinidade"]],
   perks:["Fotossíntese III","Camuflagem II","Sobrevivência III"],loot:["Fruto Espiritual","Casca Reforçada","Sementes Luminosas","Galho Ancião"]},
  {name:"Colosso Montanhoso",level:7,porte:"Colossal",porteKey:"colossal",tipo:"Mineral",habitat:"Cordilheiras",hp:110,energia:30,
   attrs:{forca:12,robustez:15,agilidade:1,instinto:5,afinidade:4,presenca:7},
   attacks:[["Pisoteio","Porte + Força"],["Punho de Pedra","Porte + Força"]],
   perks:["Casca Dura IV","Resistência IV","Suportar Dor III"],loot:["Fragmento de Pedra Viva","Minério Raro","Núcleo Mineral"]},
];

const players = [
 {id:"erebus",name:"Erebus",species:"Lupus Australis",image:"erebus.png",hp:30,energia:20,
  attrs:{forca:1,robustez:1,agilidade:1,instinto:2,afinidade:2,presenca:3},
  perks:{mordida:1,garras:0,chifradas:0,investida:0,resistencia:0,folego:0,regeneracao:0,suportar:2,corrida:0,escalada:0,natacao:0,voo:0,esquiva:1,caca:1,rastreamento:0,percepcao:0,camuflagem:0,sobrevivencia:0,mental:0,canalizacao:0,cura:0,energia:0,intimidacao:0,comunicacao:0,lideranca:1,territorialismo:0},
  specials:["Camuflagem I"]},
 {id:"rudy",name:"Rudy",species:"Ragal",image:"rudy.png",hp:35,energia:10,
  attrs:{forca:2,robustez:2,agilidade:2,instinto:2,afinidade:0,presenca:2},
  perks:{mordida:1,garras:1,chifradas:0,investida:0,resistencia:1,folego:0,regeneracao:1,suportar:0,corrida:1,escalada:0,natacao:1,voo:0,esquiva:0,caca:1,rastreamento:0,percepcao:0,camuflagem:0,sobrevivencia:0,mental:0,canalizacao:0,cura:0,energia:0,intimidacao:1,comunicacao:0,lideranca:0,territorialismo:0},
  specials:[]},
 {id:"plataus",name:"Plataus",species:"Guerreiro Valente",image:"plataus.png",hp:35,energia:10,
  attrs:{forca:3,robustez:2,agilidade:2,instinto:2,afinidade:0,presenca:1},
  perks:{mordida:0,garras:0,chifradas:0,investida:0,resistencia:0,folego:0,regeneracao:0,suportar:0,corrida:0,escalada:0,natacao:0,voo:0,esquiva:0,caca:0,rastreamento:0,percepcao:0,camuflagem:0,sobrevivencia:0,mental:0,canalizacao:0,cura:0,energia:0,intimidacao:0,comunicacao:0,lideranca:0,territorialismo:0},
  specials:[]}
];

// The exact seasonal stat sheets were not present in the attached material available here.
// The Master panel keeps their records separated and ready to be filled without inventing values.
const seasonal = [
 {name:"Lumiorbe",event:"Sazonal",status:"ARQUIVO RESERVADO"},
 {name:"Espantalma",event:"Sazonal",status:"ARQUIVO RESERVADO"},
 {name:"Chrisbell",event:"Sazonal",status:"ARQUIVO RESERVADO"},
 {name:"Sazonal IV",event:"Nome ainda não registrado nesta versão",status:"ARQUIVO RESERVADO"},
 {name:"Sazonal V",event:"Nome ainda não registrado nesta versão",status:"ARQUIVO RESERVADO"}
];

const attrNames={forca:"Força",robustez:"Robustez",agilidade:"Agilidade",instinto:"Instinto",afinidade:"Afinidade",presenca:"Presença"};
const perkNames={mordida:"Mordida",garras:"Garras",chifradas:"Chifradas",investida:"Investida",resistencia:"Resistência",folego:"Fôlego",regeneracao:"Regeneração",suportar:"Suportar Dor",corrida:"Corrida",escalada:"Escalada",natacao:"Natação",voo:"Voo",esquiva:"Esquiva",caca:"Caça",rastreamento:"Rastreamento",percepcao:"Percepção",camuflagem:"Camuflagem",sobrevivencia:"Sobrevivência",mental:"Controle Mental",canalizacao:"Canalização",cura:"Cura",energia:"Manipulação de energia",intimidacao:"Intimidação",comunicacao:"Comunicação",lideranca:"Liderança",territorialismo:"Territorialismo"};

let currentSection="catalog", currentFilter="all";
const grid=document.getElementById("contentGrid"), search=document.getElementById("search"), sort=document.getElementById("sort");

document.getElementById("userBadge").textContent=`${session.role==="master"?"MESTRE":"PLAYER"} // ${session.name}`;
document.getElementById("accessLabel").textContent=session.role==="master"?"ARQUIVO BIOLÓGICO — ACESSO DO MESTRE":"ARQUIVO BIOLÓGICO — ACESSO PLAYER";
if(session.role!=="master") document.querySelectorAll(".master-only").forEach(x=>x.style.display="none");

function renderCatalog(){
 document.getElementById("catalogToolbar").style.display="flex";
 const term=search.value.trim().toLowerCase();
 let list=creatures.filter(c=>(currentFilter==="all"||c.porteKey===currentFilter) &&
   [c.name,c.tipo,c.habitat,c.porte,...c.perks].join(" ").toLowerCase().includes(term));
 if(sort.value==="level") list.sort((a,b)=>a.level-b.level);
 if(sort.value==="hp") list.sort((a,b)=>b.hp-a.hp);
 if(sort.value==="name") list.sort((a,b)=>a.name.localeCompare(b.name,"pt-BR"));
 document.getElementById("count").textContent=list.length;
 grid.innerHTML=list.map((c,i)=>`
 <article class="creature" data-kind="creature" data-index="${creatures.indexOf(c)}">
  <div class="record-code">REG // ${String(creatures.indexOf(c)+1).padStart(3,"0")}</div>
  <h2>◈ ${c.name.toUpperCase()}</h2>
  <div class="meta">NÍVEL ${c.level} • ${c.porte.toUpperCase()} • ${c.tipo.toUpperCase()} • ${c.habitat.toUpperCase()}</div>
  <div class="stats"><div class="stat"><span>HP</span><b>${c.hp}</b></div><div class="stat"><span>ENERGIA</span><b>${c.energia}</b></div><div class="stat"><span>DEFESA</span><b>${10+c.attrs.agilidade}</b></div></div>
  <div class="perks"><b>PERÍCIAS:</b> ${c.perks.join(" • ")}</div>
 </article>`).join("");
 document.querySelectorAll("[data-kind='creature']").forEach(x=>x.onclick=()=>openCreature(+x.dataset.index));
}

function renderPlayers(){
 document.getElementById("catalogToolbar").style.display="none";
 document.getElementById("count").textContent=players.length;
 const visible = session.role==="master" ? players : players.filter(p=>p.id===session.user);
 grid.innerHTML=visible.map(p=>`
 <article class="player-card" data-player="${p.id}">
  <img src="${p.image}" alt="${p.name}">
  <div><div class="record-code">PLAYER // ${p.id.toUpperCase()}</div><h2>${p.name.toUpperCase()}</h2>
  <div class="meta">${p.species}</div><div class="stats"><div class="stat"><span>HP</span><b>${p.hp}</b></div><div class="stat"><span>ENERGIA</span><b>${p.energia}</b></div><div class="stat"><span>DEFESA</span><b>${10+p.attrs.agilidade}</b></div></div>
  <p class="muted">Abrir ficha completa →</p></div>
 </article>`).join("");
 document.querySelectorAll("[data-player]").forEach(x=>x.onclick=()=>openPlayer(x.dataset.player));
}

function renderSeasonal(){
 if(session.role!=="master") return;
 document.getElementById("catalogToolbar").style.display="none";
 document.getElementById("count").textContent=seasonal.length;
 grid.innerHTML=seasonal.map((s,i)=>`
 <article class="seasonal-card" data-season="${i}">
   <div class="lock">◆ MESTRE ONLY</div><div class="record-code">SAZONAL // ${String(i+1).padStart(2,"0")}</div>
   <h2>${s.name.toUpperCase()}</h2><div class="meta">${s.event}</div>
   <div class="restricted">${s.status}<br><small>FICHA FORA DO CATÁLOGO DOS PLAYERS</small></div>
 </article>`).join("");
 document.querySelectorAll("[data-season]").forEach(x=>x.onclick=()=>openSeasonal(+x.dataset.season));
}

function openCreature(i){
 const c=creatures[i];
 document.getElementById("modalContent").innerHTML=`
 <div class="detail-head"><p class="eyebrow">SPECIMEN // ${String(i+1).padStart(3,"0")}</p><h2>◈ ${c.name.toUpperCase()}</h2><p class="muted">Nível ${c.level} • ${c.porte} • ${c.tipo} • ${c.habitat}</p></div>
 <div class="detail-grid">
  <div class="detail-box"><h3>STATUS</h3><p>❤️ HP: ${c.hp}</p><p>⚡ Energia: ${c.energia}</p><p>🛡 Defesa: ${10+c.attrs.agilidade} <span class="muted">(10 + Agilidade)</span></p></div>
  <div class="detail-box"><h3>ATRIBUTOS</h3>${Object.entries(c.attrs).map(([k,v])=>`<p>${attrNames[k]}: <b>${v}</b></p>`).join("")}</div>
  <div class="detail-box"><h3>ATAQUES</h3><ul>${c.attacks.map(a=>`<li><b>${a[0]}</b> — Dano: ${a[1]}</li>`).join("")}</ul></div>
  <div class="detail-box"><h3>PERÍCIAS ESPECIAIS</h3><ul>${c.perks.map(p=>`<li>${p}</li>`).join("")}</ul></div>
  <div class="detail-box"><h3>LOOT</h3><ul>${c.loot.map(x=>`<li>${x}</li>`).join("")}</ul></div>
 </div>`;
 document.getElementById("modal").classList.remove("hidden");
}

function openPlayer(id){
 const p=players.find(x=>x.id===id); if(!p)return;
 const perkRows=Object.entries(p.perks).map(([k,v])=>`<p>${perkNames[k]}: <b>${v}</b></p>`).join("");
 document.getElementById("modalContent").innerHTML=`
 <div class="player-detail">
  <img src="${p.image}" alt="${p.name}"><div><p class="eyebrow">PLAYER SPECIMEN // ${p.id.toUpperCase()}</p><h2>${p.name.toUpperCase()}</h2><p class="muted">Raça / espécie: ${p.species}</p></div>
 </div>
 <div class="detail-grid">
  <div class="detail-box"><h3>STATUS</h3><p>❤️ HP: ${p.hp}</p><p>⚡ Energia: ${p.energia}</p><p>🛡 Defesa: ${10+p.attrs.agilidade}</p></div>
  <div class="detail-box"><h3>ATRIBUTOS</h3>${Object.entries(p.attrs).map(([k,v])=>`<p>${attrNames[k]}: <b>${v}</b></p>`).join("")}</div>
  <div class="detail-box"><h3>PERÍCIAS</h3>${perkRows}</div>
  <div class="detail-box"><h3>PERÍCIAS ESPECIAIS</h3><ul>${p.specials.length?p.specials.map(x=>`<li>${x}</li>`).join(""):"<li>Bloqueadas / não registradas</li>"}</ul></div>
 </div>`;
 document.getElementById("modal").classList.remove("hidden");
}

function openSeasonal(i){
 const s=seasonal[i];
 document.getElementById("modalContent").innerHTML=`
 <p class="eyebrow">MASTER ARCHIVE // SAZONAL ${String(i+1).padStart(2,"0")}</p>
 <h2>◆ ${s.name.toUpperCase()}</h2>
 <div class="restricted large">${s.status}</div>
 <div class="detail-box"><h3>REGISTRO</h3><p>Evento: ${s.event}</p><p>Este arquivo está separado do catálogo público e só é exibido para a conta do Mestre.</p><p class="muted">As fichas estatísticas exatas devem ser preenchidas aqui quando seus valores forem definidos no material da campanha.</p></div>`;
 document.getElementById("modal").classList.remove("hidden");
}

function switchSection(section){
 currentSection=section;
 document.querySelectorAll(".nav").forEach(x=>x.classList.toggle("active",x.dataset.section===section));
 document.getElementById("sectionEyebrow").textContent=section==="catalog"?"DATABASE / WILDLIFE":section==="players"?"DATABASE / PLAYERS":"DATABASE / RESTRICTED";
 document.getElementById("sectionTitle").textContent=section==="catalog"?"CATÁLOGO DE ESPÉCIES":section==="players"?"ESPÉCIES DOS PLAYERS":"ARQUIVOS SAZONAIS";
 document.getElementById("sectionSubtitle").textContent=section==="catalog"?"Registro simplificado das criaturas conhecidas do mundo.":section==="players"?"Fichas dos personagens registrados na campanha.":"Área exclusiva do Mestre.";
 document.querySelector(".side-box").style.display=section==="catalog"?"block":"none";
 if(section==="catalog") renderCatalog();
 if(section==="players") renderPlayers();
 if(section==="seasonal") renderSeasonal();
}

document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>switchSection(b.dataset.section));
document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");currentFilter=b.dataset.filter;renderCatalog();});
search.oninput=()=>currentSection==="catalog"&&renderCatalog();
sort.onchange=()=>currentSection==="catalog"&&renderCatalog();
document.getElementById("closeModal").onclick=()=>document.getElementById("modal").classList.add("hidden");
document.getElementById("modal").onclick=e=>{if(e.target.id==="modal")e.target.classList.add("hidden")};
document.getElementById("logoutBtn").onclick=()=>{localStorage.removeItem("crx_session");location.href="login.html";};

switchSection("catalog");
