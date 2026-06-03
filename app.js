const stateKey = "atlas-athletique-state-v1";

const state = loadState();
let deferredInstallPrompt = null;
let currentSession = null;
let generatedSession = null;
let currentFilter = "Tous";

const phases = [
  {
    id: "foundation",
    name: "Mois 1-3: Base athletique",
    short: "Construction generale",
    intent: "Force relative, technique propre, endurance fondamentale et mobilite utilisable.",
    weeks: "Semaines 1 a 12",
    priorities: ["Tractions strictes", "Dips et anneaux", "Zone 2", "Hanches/epaules", "Course facile"],
    rules: ["RPE 6-8", "Volume moderé", "Une technique par seance"],
    current: true
  },
  {
    id: "skill",
    name: "Mois 4-6: Force + skills",
    short: "Controle et puissance",
    intent: "Passer du simple entrainement a la maitrise: muscle-up, handstand, sauts, carries.",
    weeks: "Semaines 13 a 24",
    priorities: ["Transitions muscle-up", "Handstand", "Plyometrie", "Tempo runs", "Carries lourds"],
    rules: ["Qualite avant fatigue", "2 expositions muscle-up/semaine", "Sprints courts sans piste"]
  },
  {
    id: "capacity",
    name: "Mois 7-9: Capacite hybride",
    short: "Moteur complet",
    intent: "Consolider force, explosivite et cardio sans tomber dans l'epuisement permanent.",
    weeks: "Semaines 25 a 36",
    priorities: ["Complexes kettlebell", "Sled", "Rameur", "Tractions lestables", "Intervalles propres"],
    rules: ["Densite progressive", "Finir en controle", "Deload toutes les 4 semaines"]
  },
  {
    id: "expression",
    name: "Mois 10-12: Expression",
    short: "Performance durable",
    intent: "Transformer les acquis en capacites visibles: muscle-up, courses, sauts, portés, circuits.",
    weeks: "Semaines 37 a 52",
    priorities: ["Muscle-up complet", "5 km solide", "Sauts mesures", "Tests combines", "Mobilite maintenue"],
    rules: ["Tests toutes les 4 semaines", "Plus de specificite", "Moins de bruit"]
  }
];

const milestones = [
  ["Mois 1", "6-8 tractions strictes, 35 pompes propres, 30 min zone 2 confortable"],
  ["Mois 3", "8-10 tractions, dips propres, 5 km facile, squat goblet solide"],
  ["Mois 6", "Premieres transitions muscle-up fluides, handstand mur 45 s, sauts controles"],
  ["Mois 9", "Tractions lestables, sled push fort, rameur 2 km teste, circuit hybride propre"],
  ["Mois 12", "Muscle-up probable ou tres proche, 5 km nettement plus rapide, corps mobile et puissant"]
];

const weekTemplate = [
  ["A", "Skill muscle-up + haut du corps", "Tractions, anneaux, dips, tirage haut, gainage."],
  ["B", "Jambes + puissance", "Sauts, hinge, squat unilateral, carries."],
  ["C", "Moteur aerobie + mobilite", "Zone 2, technique course/rameur, hanches et epaules."],
  ["D", "Hybride athletique", "Sled, kettlebell, force relative, conditioning court."]
];

const tests = [
  ["pullups", "Tractions strictes", "Max reps propres, menton au-dessus, extension controlee."],
  ["pushups", "Pompes propres", "Max reps avec gainage, poitrine proche du sol."],
  ["hang", "Suspension active", "Temps en secondes sans douleur aux epaules."],
  ["run5k", "Course 5 km", "Temps ou allure moyenne, effort soutenable."],
  ["row2k", "Rameur 2 km", "Temps total avec pacing stable."],
  ["jump", "Saut vertical", "Meilleur saut, meme methode de mesure a chaque fois."],
  ["mobility", "Mobilite squat", "Note 1-10: profondeur, confort, controle."],
  ["mu", "Muscle-up", "Niveau: tirage haut, transition, negatif, complet."]
];

const exerciseLibrary = [
  e("Traction stricte", "Force relative", "Barre", "Base du muscle-up. Garde les cotes basses, tire les coudes vers les poches.", "3-5 series de 3-6 reps, 1-2 reps en reserve."),
  e("Traction scapulaire", "Skill muscle-up", "Barre", "Apprend a initier le tirage par les omoplates sans plier les bras.", "2-3 series de 8-12 reps lentes."),
  e("Chest-to-bar", "Skill muscle-up", "Barre", "Pont entre traction classique et muscle-up. Vise la barre vers le bas du sternum.", "Singles ou doubles propres, repos complet."),
  e("Transition muscle-up basse", "Skill muscle-up", "Anneaux", "Travail technique sans ego. Les anneaux bas permettent de repeter sans te cramer.", "4-6 series de 3 transitions fluides."),
  e("Dip aux anneaux", "Force relative", "Anneaux", "Stabilite, verrouillage et force de poussee pour finir le muscle-up.", "3-5 series de 3-8 reps."),
  e("False grip hang", "Skill muscle-up", "Anneaux", "Renforce poignets et prise specifique. Court, frequent, propre.", "5-8 tenues de 8-15 s."),
  e("Handstand mur", "Skill", "Mur", "Controle des epaules et gainage. Ne chasse pas la fatigue, chasse la ligne.", "4-8 tentatives de 15-40 s."),
  e("Pike push-up", "Force relative", "Poids du corps", "Preparation epaules et poussée verticale.", "3-4 series de 5-10 reps."),
  e("Box jump", "Explosivite", "Box", "Puissance sans impact excessif. Redescends au lieu de sauter en bas.", "4-6 series de 3 reps."),
  e("Broad jump", "Explosivite", "Sol", "Mesure simple de puissance horizontale.", "5-8 sauts, repos long."),
  e("Kettlebell swing", "Puissance", "Kettlebell", "Hinge explosif, cardio et posterior chain.", "EMOM 10 min de 10 reps ou 5x15."),
  e("Goblet squat", "Force", "Kettlebell", "Squat solide, mobile, facile a charger sans ego.", "4x6-10 avec pause en bas."),
  e("Romanian deadlift", "Force", "Halteres/barre", "Charniere, ischios, dos solide. Garde la colonne neutre.", "3-5x6-10."),
  e("Bulgarian split squat", "Force", "Halteres", "Force unilateral utile pour courir, sauter, skier.", "3-4x6-10 par jambe."),
  e("Farmer carry", "Condition physique", "Halteres/Kettlebells", "Gainage, prise, posture, capacite a porter lourd.", "4-8 trajets de 20-40 m."),
  e("Sled push", "Condition physique", "Sled", "Puissance jambes et cardio sans impact ni technique compliquee.", "6-10 poussees de 15-25 m."),
  e("Rameur zone 2", "Cardio", "Rameur", "Base aerobie. Tu dois pouvoir parler en phrases courtes.", "20-40 min facile."),
  e("Assault bike intervalles", "Cardio", "Assault bike", "Intervalles intenses mais propres, sans finir detruit.", "8-12 x 30 s fort / 90 s facile."),
  e("Tempo run", "Cardio", "Course", "Allure soutenue controlable, utile pour progresser sans sprint.", "3x6 min avec 2 min facile."),
  e("Cossack squat", "Mobilite", "Sol", "Hanches, adducteurs, controle lateral.", "2-4x5 par cote, lent."),
  e("Jefferson curl leger", "Mobilite", "Halteres leger", "Mobilite posterieure progressive. Charge tres moderee.", "2-3x6-8 reps lentes."),
  e("Dead bug", "Core", "Sol", "Anti-extension simple et transferable.", "3x8 par cote."),
  e("Hollow hold", "Core", "Sol", "Position clef pour traction, muscle-up et handstand.", "4 tenues de 15-30 s."),
  e("Turkish get-up", "Skill", "Kettlebell", "Coordination, epaules, hanches, controle complet.", "5-10 singles par cote.")
];

const pools = {
  warmup: [
    "5 min rameur facile + mobilisation chevilles/hanches/epaules",
    "2 tours: bear crawl 10 m, squat pry 30 s, scap pull-up x8, dead bug x8/cote",
    "Assault bike 4 min facile + Cossack squat x5/cote + hollow rocks x12",
    "Course facile 6 min + skips bas + ouverture de hanches + suspension active"
  ],
  skill: {
    balanced: ["Handstand mur 5x20 s", "False grip hang 6x10 s", "Transitions anneaux basses 5x3"],
    muscleup: ["False grip hang 8x10 s + transitions anneaux basses 6x3", "Traction explosive chest-to-bar 6x2", "Negatifs muscle-up aux anneaux 5x1"],
    engine: ["Technique course: 6 accelerations de 12 s en cote douce", "Rameur: 8 min cadence propre", "Respiration nasale zone 2 10 min"],
    power: ["Broad jump 8x2", "Box jump 6x3", "Kettlebell swing lourd 8x8 EMOM"],
    strength: ["Tractions strictes 5x3-5", "Dips anneaux 5x3-5", "Isometrie traction haute 5x8 s"],
    mobility: ["Flow hanches/epaules 12 min", "Squat profond assiste 5x45 s", "Jefferson curl leger 3x8"]
  },
  strength: {
    full: ["Romanian deadlift 4x6-8", "Bulgarian split squat 3x8/cote", "Row haltères 4x8", "Farmer carry 5x30 m"],
    rings: ["Tractions 5x3-6", "Dips anneaux 4x4-8", "Ring row tempo 4x8", "Hollow hold 4x25 s"],
    kb: ["Goblet squat pause 4x8", "Kettlebell clean 5x3/cote", "Swing 6x12", "Suitcase carry 4x30 m/cote"],
    engine: ["Sled push 8x20 m", "Farmer carry 6x30 m", "Step-up charge 3x10/cote", "Core anti-rotation 3x10/cote"],
    bodyweight: ["Tractions 5xmax-2", "Pompes deficit 4x8-15", "Pike push-up 4x6-10", "Split squat tempo 3x10/cote"]
  },
  conditioning: {
    easy: ["Zone 2: 25-35 min course, velo ou rameur", "Sled facile: 10 x 20 m, respiration controlee"],
    normal: ["Rameur: 6 x 500 m a RPE 7, repos 90 s", "Assault bike: 10 x 30 s fort / 90 s facile", "Course: 3 x 6 min tempo / 2 min facile"],
    hard: ["Sled push: 10 x 20 m fort, repos complet", "Rameur: 8 x 250 m vif / 75 s facile", "Circuit 12 min: 8 swings, 6 pompes, 8 goblet squats, sans panique"]
  },
  mobility: [
    "Epaules: dislocates elastique, pec stretch, dead hang doux 6 min",
    "Hanches: couch stretch, 90/90, Cossack squat 8 min",
    "Colonne et ischios: Jefferson curl leger, child pose, respiration 8 min",
    "Chevilles + squat profond: 8 min, finir par 2 tenues de 60 s"
  ]
};

function e(name, category, equipment, why, dosage) {
  return { name, category, equipment, why, dosage };
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(stateKey)) || { logs: [], tests: [] };
  } catch {
    return { logs: [], tests: [] };
  }
}

function saveState() {
  localStorage.setItem(stateKey, JSON.stringify(state));
}

function seedFromDate(offset = 0) {
  const d = new Date();
  return Number(`${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}`) + offset;
}

function pick(list, seed) {
  return list[Math.abs(seed) % list.length];
}

function makeSession(options = {}) {
  const focus = options.focus || "balanced";
  const duration = Number(options.duration || 55);
  const intensity = options.intensity || "normal";
  const equipment = options.equipment || "full";
  const seed = options.seed || seedFromDate();
  const deload = currentWeek() % 4 === 0;
  const title = focusLabel(focus) + " - " + (deload ? "semaine allegee" : `${duration} min`);
  const strengthPool = equipment === "full" ? pools.strength.full : pools.strength[equipment] || pools.strength.full;
  const conditioningPool = pools.conditioning[deload ? "easy" : intensity] || pools.conditioning.normal;
  const skillPool = pools.skill[focus] || pools.skill.balanced;
  return {
    title,
    deload,
    focus,
    blocks: [
      { name: "Preparation", items: [pick(pools.warmup, seed)] },
      { name: "Skill prioritaire", items: [pick(skillPool, seed + 7), "Stopper si la technique se degrade deux series de suite."] },
      { name: "Force / capacite", items: buildStrengthItems(strengthPool, seed, deload) },
      { name: "Conditioning", items: [pick(conditioningPool, seed + 17)] },
      { name: "Mobilite de sortie", items: [pick(pools.mobility, seed + 23)] }
    ],
    note: deload
      ? "Semaine allegee: garde le geste, reduis le volume de 30 a 40 %, aucune serie a l'echec."
      : "Objectif: finir avec l'impression que tu aurais pu faire un peu plus. La regularite bat la seance heroique."
  };
}

function buildStrengthItems(pool, seed, deload) {
  const items = [];
  for (let i = 0; i < Math.min(3, pool.length); i += 1) {
    let item = pick(pool, seed + i * 5);
    if (!items.includes(item)) items.push(item);
  }
  if (deload) return items.map(item => item.replace(/\d+x|\d x/g, "2x") + " a RPE 6");
  return items;
}

function focusLabel(focus) {
  return {
    balanced: "Equilibre",
    muscleup: "Muscle-up",
    engine: "Cardio",
    power: "Explosivite",
    strength: "Force relative",
    mobility: "Mobilite"
  }[focus] || "Equilibre";
}

function currentWeek() {
  const start = new Date(new Date().getFullYear(), 0, 1);
  const today = new Date();
  return Math.max(1, Math.ceil(((today - start) / 86400000 + start.getDay() + 1) / 7));
}

function currentPhase() {
  const week = currentWeek();
  if (week <= 12) return phases[0];
  if (week <= 24) return phases[1];
  if (week <= 36) return phases[2];
  return phases[3];
}

function renderSession(session, target) {
  target.innerHTML = session.blocks.map(block => `
    <article class="session-block">
      <h3>${block.name}</h3>
      <ul>${block.items.map(item => `<li>${item}</li>`).join("")}</ul>
    </article>
  `).join("") + `<div class="session-note">${session.note}</div>`;
}

function renderToday() {
  const phase = currentPhase();
  document.querySelector("#blockName").textContent = phase.short;
  document.querySelector("#blockIntent").textContent = phase.intent;
  document.querySelector("#dailyTitle").textContent = currentSession.title;
  document.querySelector("#heroMetrics").innerHTML = [
    [`S${currentWeek()}`, "Semaine du cycle"],
    [phase.weeks, "Fenetre annuelle"],
    [`${state.logs.length}`, "Seances journalisees"],
    [`${state.tests.length}`, "Batteries de tests"]
  ].map(([a, b]) => `<div class="metric"><strong>${a}</strong><span>${b}</span></div>`).join("");
  renderSession(currentSession, document.querySelector("#dailySession"));
}

function renderRoadmap() {
  const phase = currentPhase();
  document.querySelector("#timeline").innerHTML = phases.map(p => `
    <article class="phase ${p.id === phase.id ? "current" : ""}">
      <span class="tag">${p.weeks}</span>
      <h2>${p.name}</h2>
      <p>${p.intent}</p>
      <ul>${p.priorities.map(x => `<li>${x}</li>`).join("")}</ul>
    </article>
  `).join("");
  document.querySelector("#milestones").innerHTML = milestones.map(([when, text]) => `
    <div class="milestone"><strong>${when}</strong><span>${text}</span></div>
  `).join("");
  document.querySelector("#weekGrid").innerHTML = weekTemplate.map(([day, title, text]) => `
    <article class="week-day">
      <span class="tag">Jour ${day}</span>
      <h3>${title}</h3>
      <p>${text}</p>
    </article>
  `).join("");
}

function renderLibrary() {
  const categories = ["Tous", ...Array.from(new Set(exerciseLibrary.map(x => x.category)))];
  document.querySelector("#libraryFilters").innerHTML = categories.map(cat => `
    <button type="button" class="filter-btn ${cat === currentFilter ? "active" : ""}" data-filter="${cat}">${cat}</button>
  `).join("");
  const visible = currentFilter === "Tous" ? exerciseLibrary : exerciseLibrary.filter(x => x.category === currentFilter);
  document.querySelector("#exerciseGrid").innerHTML = visible.map(ex => `
    <article class="exercise-card">
      <h3>${ex.name}</h3>
      <p>${ex.why}</p>
      <strong>${ex.dosage}</strong>
      <div class="card-meta">
        <span class="tag">${ex.category}</span>
        <span class="tag">${ex.equipment}</span>
      </div>
    </article>
  `).join("");
}

function renderTests() {
  const last = state.tests[state.tests.length - 1]?.values || {};
  document.querySelector("#testGrid").innerHTML = tests.map(([id, name, desc]) => `
    <article class="test-card">
      <h3>${name}</h3>
      <p>${desc}</p>
      <input id="test-${id}" value="${last[id] || ""}" placeholder="Resultat">
    </article>
  `).join("");
  renderTestHistory();
}

function renderTestHistory() {
  const rows = state.tests.slice().reverse().map(entry => {
    const summary = tests.map(([id, name]) => entry.values[id] ? `${name}: ${entry.values[id]}` : "").filter(Boolean).slice(0, 4).join(" | ");
    return `<div class="history-row"><strong>${entry.date}</strong><span>${summary || "Aucune valeur"}</span></div>`;
  });
  document.querySelector("#testHistory").innerHTML = rows.join("") || `<p>Aucun test enregistre pour le moment.</p>`;
}

function renderLogbook() {
  const rows = state.logs.slice().reverse().map(log => `
    <div class="log-row">
      <div>
        <strong>${log.date} - ${log.title}</strong>
        <p>${log.note || "Seance terminee."}</p>
      </div>
      <span class="tag">RPE ${log.rpe || "?"}</span>
    </div>
  `);
  document.querySelector("#logbookList").innerHTML = rows.join("") || `<p>Journal vide. Sauve une seance apres l'avoir faite.</p>`;
}

function saveSession(session) {
  const rpe = prompt("RPE de la seance, de 1 a 10 ?", "7");
  const note = prompt("Note rapide: energie, douleur, point fort ?", "");
  state.logs.push({
    date: new Date().toLocaleDateString("fr-FR"),
    title: session.title,
    focus: session.focus,
    rpe,
    note,
    session
  });
  saveState();
  renderToday();
  renderLogbook();
  toast("Seance ajoutee au journal.");
}

function toast(message) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 2600);
}

function setView(id) {
  document.querySelectorAll(".view").forEach(view => view.classList.toggle("active", view.id === id));
  document.querySelectorAll(".nav-item").forEach(item => item.classList.toggle("active", item.dataset.view === id));
  document.querySelector("#pageTitle").textContent = document.querySelector(`[data-view="${id}"]`).textContent;
}

function initEvents() {
  document.querySelector("#nav").addEventListener("click", event => {
    const btn = event.target.closest("[data-view]");
    if (btn) setView(btn.dataset.view);
  });
  document.querySelector("#dailyGenerate").addEventListener("click", () => {
    currentSession = makeSession({ seed: seedFromDate(Math.floor(Math.random() * 1000)) });
    renderToday();
  });
  document.querySelector("#dailySave").addEventListener("click", () => saveSession(currentSession));
  document.querySelector("#dailySession").addEventListener("dblclick", () => saveSession(currentSession));
  document.querySelector("#makeSession").addEventListener("click", () => {
    generatedSession = makeSession({
      focus: document.querySelector("#focusSelect").value,
      duration: document.querySelector("#durationSelect").value,
      intensity: document.querySelector("#intensitySelect").value,
      equipment: document.querySelector("#equipmentSelect").value,
      seed: seedFromDate(Math.floor(Math.random() * 5000))
    });
    document.querySelector("#generatedTitle").textContent = generatedSession.title;
    renderSession(generatedSession, document.querySelector("#generatedSession"));
  });
  document.querySelector("#saveGenerated").addEventListener("click", () => {
    if (!generatedSession) {
      toast("Cree d'abord une seance.");
      return;
    }
    saveSession(generatedSession);
  });
  document.querySelector("#libraryFilters").addEventListener("click", event => {
    const btn = event.target.closest("[data-filter]");
    if (!btn) return;
    currentFilter = btn.dataset.filter;
    renderLibrary();
  });
  document.querySelector("#saveTests").addEventListener("click", () => {
    const values = {};
    tests.forEach(([id]) => values[id] = document.querySelector(`#test-${id}`).value.trim());
    state.tests.push({ date: new Date().toLocaleDateString("fr-FR"), values });
    saveState();
    renderToday();
    renderTestHistory();
    toast("Tests enregistres.");
  });
  document.querySelector("#exportData").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: "atlas-athletique-export.json" });
    a.click();
    URL.revokeObjectURL(url);
  });
  document.querySelector("#resetBtn").addEventListener("click", () => {
    if (!confirm("Reinitialiser journal et tests ?")) return;
    localStorage.removeItem(stateKey);
    state.logs = [];
    state.tests = [];
    saveState();
    renderAll();
    toast("Donnees reinitialisees.");
  });
  document.querySelector("#installBtn").addEventListener("click", async () => {
    if (!deferredInstallPrompt) {
      toast("Sur iPhone: Partager puis Ajouter a l'ecran d'accueil.");
      return;
    }
    deferredInstallPrompt.prompt();
    deferredInstallPrompt = null;
  });
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstallPrompt = event;
  });
}

function renderAll() {
  renderToday();
  renderRoadmap();
  renderLibrary();
  renderTests();
  renderLogbook();
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

currentSession = makeSession({ seed: seedFromDate() });
generatedSession = makeSession({ focus: "muscleup", seed: seedFromDate(99) });
document.addEventListener("DOMContentLoaded", () => {
  initEvents();
  document.querySelector("#generatedTitle").textContent = generatedSession.title;
  renderSession(generatedSession, document.querySelector("#generatedSession"));
  renderAll();
});
