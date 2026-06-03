const stateKey = "atlas-athletique-state-v2";
const legacyStateKey = "atlas-athletique-state-v1";

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
    priorities: ["Tractions strictes", "Dips et anneaux", "Zone 2", "Hanches/epaules", "Course facile"]
  },
  {
    id: "skill",
    name: "Mois 4-6: Force + skills",
    short: "Controle et puissance",
    intent: "Passer de l entrainement brut a la maitrise: muscle-up, handstand, sauts, carries.",
    weeks: "Semaines 13 a 24",
    priorities: ["Transitions muscle-up", "Handstand", "Plyometrie", "Tempo runs", "Carries lourds"]
  },
  {
    id: "capacity",
    name: "Mois 7-9: Capacite hybride",
    short: "Moteur complet",
    intent: "Consolider force, explosivite et cardio sans tomber dans l epuisement permanent.",
    weeks: "Semaines 25 a 36",
    priorities: ["Complexes kettlebell", "Sled", "Rameur", "Tractions lestables", "Intervalles propres"]
  },
  {
    id: "expression",
    name: "Mois 10-12: Expression",
    short: "Performance durable",
    intent: "Transformer les acquis en capacites visibles: muscle-up, courses, sauts, portages, circuits.",
    weeks: "Semaines 37 a 52",
    priorities: ["Muscle-up complet", "5 km solide", "Sauts mesures", "Tests combines", "Mobilite maintenue"]
  }
];

const milestones = [
  ["Mois 1", "6-8 tractions strictes, 35 pompes propres, 30 min zone 2 confortable"],
  ["Mois 3", "8-10 tractions, dips propres, 5 km facile, squat goblet solide"],
  ["Mois 6", "Transitions muscle-up fluides, handstand mur 45 s, sauts controles"],
  ["Mois 9", "Tractions lestables, sled push fort, rameur 2 km teste, circuit hybride propre"],
  ["Mois 12", "Muscle-up probable ou tres proche, 5 km plus rapide, corps mobile et puissant"]
];

const weekTemplate = [
  ["A", "Skill + haut du corps", "Tractions, anneaux, dips, tirage haut, gainage actif."],
  ["B", "Jambes + puissance", "Sauts, hinge, squat unilateral, carries."],
  ["C", "Moteur aerobie + mobilite", "Zone 2, technique course/rameur, hanches et epaules."],
  ["D", "Hybride athletique", "Sled, kettlebell, force relative, conditioning court."]
];

const tests = [
  ["pullups", "Tractions strictes", "Max reps propres, menton au-dessus, extension controlee."],
  ["dips", "Dips stricts", "Max reps propres avec amplitude complete."],
  ["pushups", "Pompes propres", "Max reps avec gainage et amplitude homogene."],
  ["hang", "Suspension active", "Temps en secondes sans douleur aux epaules."],
  ["run5k", "Course 5 km", "Temps ou allure moyenne, effort soutenable."],
  ["row2k", "Rameur 2 km", "Temps total avec pacing stable."],
  ["jump", "Saut vertical", "Meilleur saut, meme methode de mesure a chaque fois."],
  ["broad", "Saut horizontal", "Distance max en cm ou m."],
  ["plank", "Planche", "Temps max en secondes, ligne neutre."],
  ["restingHr", "Frequence cardiaque repos", "Mesure au reveil, 3 jours de moyenne conseillee."],
  ["mobility", "Mobilite squat", "Note 1-10: profondeur, confort, controle."],
  ["mu", "Muscle-up", "Niveau: tirage haut, transition, negatif, complet."]
];

const exerciseLibrary = [
  ex("Traction stricte", "Force relative", "Barre", "Pull", "Intermediaire", "Base traction et muscle-up.", "3-5x3-6, 1-2 reps reserve", "Traction assistee", "Traction lestee"),
  ex("Traction tempo", "Force relative", "Barre", "Pull", "Intermediaire", "Controle de ligne et vitesse.", "4x4 tempo 31X1", "Eccentriques seules", "Tempo plus lent"),
  ex("Chest-to-bar", "Skill muscle-up", "Barre", "Pull explosif", "Avance", "Pont entre traction et muscle-up.", "6x2 reps propres", "Traction haute bande", "Chest-to-bar lestee"),
  ex("False grip hang", "Skill muscle-up", "Anneaux", "Grip", "Intermediaire", "Renforce prise specifique.", "6-8x10-15 s", "False grip assiste", "False grip pull-up"),
  ex("Transition anneaux basse", "Skill muscle-up", "Anneaux", "Technique", "Debutant", "Automatise la transition sans ego.", "5-6x3 transitions", "Pieds assistes", "Transition stricte lente"),
  ex("Negatif muscle-up", "Skill muscle-up", "Anneaux", "Technique", "Avance", "Controle du passage haut vers bas.", "5x1-2 reps lentes", "Negatif partiel", "Tempo plus long"),
  ex("Dip anneaux", "Force relative", "Anneaux", "Push", "Intermediaire", "Stabilite epaule et verrouillage.", "4-5x4-8", "Dip barres", "Dip lestee"),
  ex("Ring support hold", "Skill", "Anneaux", "Stabilite", "Debutant", "Tension globale et alignement.", "6x15-25 s", "Support assiste", "Support lestee"),
  ex("Pompes deficit", "Force", "Poids du corps", "Push", "Debutant", "Amplitude et force horizontale.", "4x8-15", "Pompes inclinees", "Pompes tempo/lest"),
  ex("Pike push-up", "Force relative", "Poids du corps", "Push vertical", "Intermediaire", "Preparation handstand push.", "4x5-10", "Pike incline", "Pike deficit"),
  ex("Handstand mur", "Skill", "Mur", "Inversion", "Intermediaire", "Controle epaules et gainage.", "6x20-40 s", "Crow hold", "Handstand libre"),
  ex("Wall walk", "Skill", "Mur", "Inversion", "Intermediaire", "Coordination inversion active.", "4x2-4", "Bear crawl pike", "Wall walk pause"),
  ex("Goblet squat", "Force", "Kettlebell", "Squat", "Debutant", "Squat stable et mobile.", "4x6-10", "Box squat goblet", "Double KB front squat"),
  ex("Bulgarian split squat", "Force", "Halteres", "Unilateral", "Intermediaire", "Force jambe et controle bassin.", "3-4x6-10/cote", "Split squat", "Bulgarian lestee lourde"),
  ex("Romanian deadlift", "Force", "Barre/Halteres", "Hinge", "Intermediaire", "Ischios et dos fort.", "4x6-10", "Hip hinge au baton", "RDL tempo/lest"),
  ex("Hip thrust", "Force", "Barre", "Hinge", "Intermediaire", "Force extension hanche.", "4x8-12", "Glute bridge", "Hip thrust pause"),
  ex("Step-up charge", "Force", "Halteres", "Unilateral", "Debutant", "Transfert course et stabilite genou.", "3x8-12/cote", "Step-up bas", "Step-up haut charge"),
  ex("Sled push", "Condition physique", "Sled", "Puissance", "Debutant", "Puissance jambes sans impact.", "8x15-25 m", "Sled leger", "Sled lourd"),
  ex("Sled drag arriere", "Condition physique", "Sled", "Genou", "Debutant", "Renfort quadriceps faible impact.", "6x20 m", "Traction elastique", "Charge plus lourde"),
  ex("Farmer carry", "Condition physique", "Halteres/Kettlebells", "Carry", "Debutant", "Gainage et grip utile partout.", "5-8x20-40 m", "Carry leger", "Carry unilateraux lourds"),
  ex("Suitcase carry", "Core", "Kettlebell", "Anti-rotation", "Intermediaire", "Stabilite tronc asymetrique.", "4x30 m/cote", "Hold statique", "Marche lente lourde"),
  ex("Turkish get-up", "Skill", "Kettlebell", "Coordination", "Intermediaire", "Mobilite active + controle.", "6-10 singles/cote", "Half get-up", "Get-up lourd"),
  ex("Kettlebell swing", "Puissance", "Kettlebell", "Hinge explosif", "Debutant", "Explosivite hanche et moteur.", "10x10 EMOM", "Swing russe leger", "Swing chargee"),
  ex("Kettlebell clean", "Puissance", "Kettlebell", "Hinge + pull", "Intermediaire", "Transfert vers complexes hybrides.", "5x3/cote", "High pull", "Clean + press"),
  ex("Box jump", "Explosivite", "Box", "Plyo", "Debutant", "Puissance avec impact modere.", "6x3", "Low box jump", "Depth jump"),
  ex("Broad jump", "Explosivite", "Sol", "Plyo", "Debutant", "Puissance horizontale mesurable.", "8x2", "Saut sans elan", "Boundings"),
  ex("Med ball slam", "Explosivite", "Med ball", "Puissance", "Debutant", "Expression force rapide sans technique complexe.", "6x6", "Slam leger", "Slam reactif"),
  ex("Rameur zone 2", "Cardio", "Rameur", "Aerobie", "Debutant", "Base cardio durable.", "25-45 min", "20 min facile", "60 min progressif"),
  ex("Rameur intervalles", "Cardio", "Rameur", "Intervalles", "Intermediaire", "Travail du pacing propre.", "8x250 m / 75 s", "6x200 m", "10x300 m"),
  ex("Assault bike intervals", "Cardio", "Assault bike", "Intervalles", "Intermediaire", "Puissant et mesurable.", "10x30 s fort/90 s facile", "8 rounds", "12 rounds"),
  ex("Tempo run", "Cardio", "Course", "Tempo", "Intermediaire", "Ameliore vitesse soutenable.", "3x6 min / 2 min facile", "2x6 min", "4x8 min"),
  ex("Fartlek simple", "Cardio", "Course", "Variation allure", "Debutant", "Cardio sans rigidite chrono.", "30 min alternance 1 min vite/2 min lent", "20 min", "40 min"),
  ex("Zone 2 marche inclinee", "Cardio", "Tapis", "Aerobie", "Debutant", "Faible impact, haute adherence.", "30-40 min", "20 min", "45-60 min"),
  ex("Dead bug", "Core", "Sol", "Anti-extension", "Debutant", "Controle bassin et cage thoracique.", "3x8-10/cote", "Bras seuls", "Charge legere"),
  ex("Hollow hold", "Core", "Sol", "Anti-extension", "Intermediaire", "Position cle pour gymnastique.", "5x20-30 s", "Tuck hold", "Hollow rocks"),
  ex("Side plank", "Core", "Sol", "Anti-flexion laterale", "Debutant", "Stabilite oblique.", "4x25-40 s/cote", "Genoux au sol", "Side plank row"),
  ex("Pallof press", "Core", "Cable/Elastique", "Anti-rotation", "Debutant", "Controle rotation tronc.", "3x10/cote", "Isometrie courte", "Press en fente"),
  ex("Cossack squat", "Mobilite", "Sol", "Hanche", "Debutant", "Mobilite active adducteurs.", "3x6/cote", "Amplitude partielle", "Charge goblet"),
  ex("Jefferson curl leger", "Mobilite", "Haltere leger", "Chaine posterieure", "Intermediaire", "Progression douce posterior chain.", "3x6 lentes", "Sans charge", "Charge progressive"),
  ex("90/90 transitions", "Mobilite", "Sol", "Hanche", "Debutant", "Rotation hanche utile squat/course.", "3x8 alternances", "Maintien statique", "Sans appui mains"),
  ex("Shoulder CARs", "Mobilite", "Sol", "Epaule", "Debutant", "Sante articulaire epaule.", "2x5/cote", "Amplitude reduite", "Lent sans compensation"),
  ex("Ankle dorsiflexion drill", "Mobilite", "Mur", "Cheville", "Debutant", "Ameliore squat et course.", "3x10/cote", "Distance faible", "Charge genou avant"),
  ex("Respiration box", "Recuperation", "Sol", "Recovery", "Debutant", "Baisse stress et retour au calme.", "4-8 min", "2 min", "10 min"),
  ex("Marche de recuperation", "Recuperation", "Exterieur", "Recovery", "Debutant", "Recup active bas impact.", "20-35 min", "15 min", "45 min")
];

const pools = {
  warmup: [
    "5 min rameur facile + mobilite chevilles/hanches/epaules",
    "2 tours: bear crawl 10 m, squat pry 30 s, scap pull-up x8, dead bug x8/cote",
    "Assault bike 4 min facile + Cossack squat x5/cote + hollow rocks x12",
    "Course facile 6 min + ouverture hanches + suspension active",
    "Marche inclinee 6 min + 90/90 transitions + shoulder CARs",
    "Saut corde 4 min + mobilite cheville + activation fessiers",
    "Rameur 5 min + wall slides + fente rotation thoracique",
    "Bike 5 min + isometrie split squat 20 s/cote + dead hang doux"
  ],
  skill: {
    balanced: ["Handstand mur 5x20-30 s", "False grip hang 6x10 s", "Transitions anneaux basses 5x3"],
    muscleup: [
      "False grip hang 8x10-15 s + transitions anneaux basses 6x3",
      "Traction explosive chest-to-bar 6x2",
      "Negatifs muscle-up anneaux 5x1"
    ],
    engine: ["Technique course: 6 accelerations de 12 s", "Rameur: 8 min cadence propre", "Respiration nasale zone 2 10 min"],
    power: ["Broad jump 8x2", "Box jump 6x3", "Med ball slam 6x6"],
    strength: ["Tractions strictes 5x3-5", "Dips anneaux 5x3-5", "Isometrie traction haute 5x8 s"],
    mobility: ["Flow hanches/epaules 12 min", "Squat profond assiste 5x45 s", "Jefferson curl leger 3x8"]
  },
  strength: {
    full: ["Romanian deadlift 4x6-8", "Bulgarian split squat 3x8/cote", "Row halteres 4x8", "Farmer carry 5x30 m", "Hip thrust 4x8"],
    rings: ["Tractions 5x3-6", "Dips anneaux 4x4-8", "Ring row tempo 4x8", "Hollow hold 4x25 s", "Ring support hold 6x15 s"],
    kb: ["Goblet squat pause 4x8", "Kettlebell clean 5x3/cote", "Swing 6x12", "Suitcase carry 4x30 m/cote", "Turkish get-up 6 singles/cote"],
    engine: ["Sled push 8x20 m", "Farmer carry 6x30 m", "Step-up charge 3x10/cote", "Sled drag arriere 6x20 m", "Core anti-rotation 3x10/cote"],
    bodyweight: ["Tractions 5xmax-2", "Pompes deficit 4x8-15", "Pike push-up 4x6-10", "Split squat tempo 3x10/cote", "Side plank 4x30 s/cote"]
  },
  accessory: {
    hybrid: ["Pallof press 3x10/cote", "Cossack squat 3x6/cote", "Dead bug 3x10/cote", "Shoulder CARs 2x5/cote"],
    strength: ["Hip thrust 3x10", "Isometrie traction haute 4x8 s", "Split squat hold 3x20 s/cote"],
    engine: ["Rameur technique 10 min", "Marche inclinee 15 min zone 2", "Respiration box 5 min"],
    skill: ["Handstand mur 6x20 s", "Transition anneaux 4x3", "Ring support hold 4x20 s"],
    recovery: ["Mobilite flow 15 min", "Respiration box 6 min", "Marche 20 min"]
  },
  conditioning: {
    easy: [
      "Zone 2: 25-35 min course, velo, marche inclinee ou rameur",
      "Sled facile: 10x20 m, respiration controlee",
      "Bike easy 30 min en conversation"
    ],
    normal: [
      "Rameur: 6x500 m a RPE 7, repos 90 s",
      "Assault bike: 10x30 s fort / 90 s facile",
      "Course: 3x6 min tempo / 2 min facile"
    ],
    hard: [
      "Sled push: 10x20 m fort, repos complet",
      "Rameur: 8x250 m vif / 75 s facile",
      "Circuit 14 min: 8 swings, 6 pompes, 8 goblet squats, en controle"
    ],
    lowimpact: [
      "Rameur: 5x4 min RPE 7 / 2 min facile",
      "Bike: 12x20 s fort / 100 s facile",
      "Sled push moderes 12x15 m"
    ]
  },
  mobility: [
    "Epaules: dislocates elastique, pec stretch, dead hang doux 8 min",
    "Hanches: couch stretch, 90/90, Cossack squat 10 min",
    "Colonne et ischios: Jefferson curl leger, child pose, respiration 8 min",
    "Chevilles + squat profond: 10 min, finir par 2 tenues de 60 s",
    "Recuperation nerveuse: respiration box 6 min + marche 10 min"
  ],
  constraints: {
    none: [],
    lowimpact: ["Remplacer sauts/sprints par rameur, bike, sled ou carries."],
    shoulder: ["Limiter volume overhead, prioriser tirages horizontaux et stabilite scapulaire."],
    knee: ["Limiter amplitudes douloureuses, prioriser hinge, sled drag arriere, split squat controle."],
    lowback: ["Reduire charges axiales, prioriser gainage anti-extension et patterns techniques propres."]
  }
};

function ex(name, category, equipment, pattern, level, why, dosage, regression, progression) {
  return { name, category, equipment, pattern, level, why, dosage, regression, progression };
}

function defaultState() {
  return {
    version: 2,
    logs: [],
    tests: [],
    settings: {
      focus: "balanced",
      duration: "55",
      intensity: "normal",
      equipment: "full",
      dayType: "hybrid",
      constraint: "none"
    }
  };
}

function loadState() {
  const base = defaultState();
  try {
    const saved = JSON.parse(localStorage.getItem(stateKey));
    if (saved && typeof saved === "object") {
      return {
        ...base,
        ...saved,
        settings: { ...base.settings, ...(saved.settings || {}) },
        logs: Array.isArray(saved.logs) ? saved.logs : [],
        tests: Array.isArray(saved.tests) ? saved.tests : []
      };
    }
  } catch {}

  try {
    const legacy = JSON.parse(localStorage.getItem(legacyStateKey));
    if (legacy && typeof legacy === "object") {
      return {
        ...base,
        logs: Array.isArray(legacy.logs) ? legacy.logs : [],
        tests: Array.isArray(legacy.tests) ? legacy.tests : []
      };
    }
  } catch {}

  return base;
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
  const focus = options.focus || state.settings.focus || "balanced";
  const duration = Number(options.duration || state.settings.duration || 55);
  const intensity = options.intensity || state.settings.intensity || "normal";
  const equipment = options.equipment || state.settings.equipment || "full";
  const dayType = options.dayType || state.settings.dayType || "hybrid";
  const constraint = options.constraint || state.settings.constraint || "none";
  const seed = options.seed || seedFromDate();
  const deload = currentWeek() % 4 === 0;

  const titleBits = [focusLabel(focus), dayTypeLabel(dayType)];
  if (constraint !== "none") titleBits.push("adaptation");
  const title = titleBits.join(" - ") + (deload ? " - semaine allegee" : ` - ${duration} min`);

  const strengthPool = pools.strength[equipment] || pools.strength.full;
  const skillPool = pools.skill[focus] || pools.skill.balanced;
  const conditioningKey = constraint === "lowimpact" ? "lowimpact" : (deload ? "easy" : intensity);
  const conditioningPool = pools.conditioning[conditioningKey] || pools.conditioning.normal;

  const blocks = [
    { name: "Preparation", items: [pick(pools.warmup, seed)] },
    { name: "Skill prioritaire", items: buildSkillItems(skillPool, dayType, seed) },
    { name: "Force / capacite", items: buildStrengthItems(strengthPool, dayType, seed + 9, deload) },
    { name: "Conditioning", items: [pick(conditioningPool, seed + 17)] }
  ];

  if (duration >= 55) {
    const accessoryPool = pools.accessory[dayType] || pools.accessory.hybrid;
    blocks.push({ name: "Accessory intelligent", items: [pick(accessoryPool, seed + 31)] });
  }

  blocks.push({ name: "Mobilite de sortie", items: [pick(pools.mobility, seed + 23)] });

  if (constraint !== "none") {
    blocks.push({
      name: "Contrainte active",
      items: pools.constraints[constraint].length ? pools.constraints[constraint] : ["Aucune contrainte particuliere."]
    });
  }

  return {
    title,
    deload,
    focus,
    dayType,
    constraint,
    duration,
    estimatedLoad: estimateSessionLoad(duration, intensity, dayType),
    blocks,
    note: deload
      ? "Semaine allegee: garder le geste, reduire volume 30-40%, aucune serie a l echec."
      : "Objectif: finir propre avec marge de progression. La regularite bat la seance heroique."
  };
}

function buildSkillItems(skillPool, dayType, seed) {
  const items = [pick(skillPool, seed + 1)];
  if (dayType === "skill") items.push(pick(skillPool, seed + 13));
  items.push("Stopper si la technique se degrade sur deux series consecutives.");
  return Array.from(new Set(items));
}

function buildStrengthItems(pool, dayType, seed, deload) {
  const countByDayType = { recovery: 1, engine: 2, hybrid: 3, strength: 4, skill: 2 };
  const target = countByDayType[dayType] || 3;
  const items = [];
  for (let i = 0; i < pool.length && items.length < target; i += 1) {
    const item = pick(pool, seed + i * 7);
    if (!items.includes(item)) items.push(item);
  }
  if (!deload) return items;
  return items.map(item => `${item} en version allegee (2 series, RPE 6)`);
}

function estimateSessionLoad(duration, intensity, dayType) {
  const intensityFactor = { easy: 4.5, normal: 6, hard: 7.5 };
  const dayFactor = { recovery: 0.65, engine: 1.05, hybrid: 1, strength: 1.1, skill: 0.9 };
  return Math.round(duration * (intensityFactor[intensity] || 6) * (dayFactor[dayType] || 1));
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

function dayTypeLabel(dayType) {
  return {
    hybrid: "Jour hybride",
    strength: "Jour force",
    engine: "Jour cardio",
    skill: "Jour skill",
    recovery: "Recuperation"
  }[dayType] || "Jour hybride";
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
  `).join("") + `<div class="session-note">${session.note}<br>Charge theorique: ${session.estimatedLoad}</div>`;
}

function renderToday() {
  const phase = currentPhase();
  const insights = computeInsights(state.logs);
  document.querySelector("#blockName").textContent = phase.short;
  document.querySelector("#blockIntent").textContent = phase.intent;
  document.querySelector("#dailyTitle").textContent = currentSession.title;
  document.querySelector("#heroMetrics").innerHTML = [
    [`S${currentWeek()}`, "Semaine du cycle"],
    [phase.weeks, "Fenetre annuelle"],
    [`${state.logs.length}`, "Seances journalisees"],
    [`${state.tests.length}`, "Batteries de tests"],
    [`${insights.streak}`, "Jours de regularite"],
    [`${insights.avgRpe14.toFixed(1)}`, "RPE moyen 14j"],
    [`${insights.load7}`, "Charge 7j"],
    [`${insights.avgReadiness.toFixed(1)}`, "Readiness moyen 28j"]
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
  document.querySelector("#exerciseGrid").innerHTML = visible.map(item => `
    <article class="exercise-card">
      <h3>${item.name}</h3>
      <p>${item.why}</p>
      <strong>${item.dosage}</strong>
      <div class="card-meta">
        <span class="tag">${item.category}</span>
        <span class="tag">${item.equipment}</span>
        <span class="tag">${item.pattern}</span>
        <span class="tag">${item.level}</span>
      </div>
      <p>Regression: ${item.regression}</p>
      <p>Progression: ${item.progression}</p>
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
  const rows = state.tests.slice().reverse().map((entry, index, arr) => {
    const previous = arr[index + 1];
    const summary = tests
      .map(([id, name]) => formatTestCell(name, entry.values[id], previous?.values?.[id]))
      .filter(Boolean)
      .slice(0, 5)
      .join(" | ");
    return `<div class="history-row"><strong>${entry.date}</strong><span>${summary || "Aucune valeur"}</span></div>`;
  });
  document.querySelector("#testHistory").innerHTML = rows.join("") || "<p>Aucun test enregistre pour le moment.</p>";
}

function formatTestCell(name, currentValue, previousValue) {
  if (!currentValue) return "";
  const currentNumber = parseMaybeNumber(currentValue);
  const previousNumber = parseMaybeNumber(previousValue);
  if (Number.isFinite(currentNumber) && Number.isFinite(previousNumber)) {
    const delta = currentNumber - previousNumber;
    const sign = delta > 0 ? "+" : "";
    return `${name}: ${currentValue} (${sign}${delta})`;
  }
  return `${name}: ${currentValue}`;
}

function parseMaybeNumber(value) {
  if (value === null || value === undefined) return NaN;
  const normalized = String(value).replace(",", ".").replace(/[^\d.-]/g, "");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}

function renderLogbook() {
  const insights = computeInsights(state.logs);
  document.querySelector("#logbookInsights").innerHTML = [
    ["Charge 28j", `${insights.load28}`],
    ["Readiness moyen", insights.avgReadiness.toFixed(1)],
    ["Douleur moyenne", insights.avgPain.toFixed(1)],
    ["Sommeil moyen", `${insights.avgSleep.toFixed(1)} h`]
  ].map(([title, value]) => `<div class="insight-card"><strong>${value}</strong><span>${title}</span></div>`).join("");

  const rows = state.logs.slice().reverse().map(log => `
    <div class="log-row">
      <div>
        <strong>${log.date} - ${log.title}</strong>
        <p>${log.note || "Seance terminee."}</p>
        <p>Readiness ${log.readiness || "?"}/5 | Douleur ${log.pain || "?"}/10 | Duree ${log.durationActual || "?"} min | Charge ${log.loadScore || "?"}</p>
      </div>
      <span class="tag">RPE ${log.rpe || "?"}</span>
    </div>
  `);
  document.querySelector("#logbookList").innerHTML = rows.join("") || "<p>Journal vide. Sauve une seance apres l avoir faite.</p>";
}

function computeInsights(logs) {
  if (!logs.length) {
    return {
      streak: 0,
      avgRpe14: 0,
      load7: 0,
      load28: 0,
      avgReadiness: 0,
      avgPain: 0,
      avgSleep: 0
    };
  }

  const sorted = logs.slice().sort((a, b) => toDate(a) - toDate(b));
  const streak = computeStreak(sorted);
  const avgRpe14 = average(lastDays(sorted, 14).map(x => Number(x.rpe)).filter(Number.isFinite));
  const load7 = sum(lastDays(sorted, 7).map(x => Number(x.loadScore)).filter(Number.isFinite));
  const load28 = sum(lastDays(sorted, 28).map(x => Number(x.loadScore)).filter(Number.isFinite));
  const avgReadiness = average(lastDays(sorted, 28).map(x => Number(x.readiness)).filter(Number.isFinite));
  const avgPain = average(lastDays(sorted, 28).map(x => Number(x.pain)).filter(Number.isFinite));
  const avgSleep = average(lastDays(sorted, 28).map(x => Number(x.sleepHours)).filter(Number.isFinite));

  return { streak, avgRpe14, load7, load28, avgReadiness, avgPain, avgSleep };
}

function toDate(log) {
  if (log.isoDate) return new Date(log.isoDate);
  if (log.date && /^\d{2}\/\d{2}\/\d{4}$/.test(log.date)) {
    const [d, m, y] = log.date.split("/").map(Number);
    return new Date(y, m - 1, d);
  }
  const fallback = new Date(log.date || Date.now());
  return Number.isNaN(fallback.getTime()) ? new Date() : fallback;
}

function lastDays(logs, days) {
  const now = new Date();
  return logs.filter(entry => (now - toDate(entry)) <= days * 86400000);
}

function computeStreak(logsSorted) {
  const uniqueDays = Array.from(new Set(logsSorted.map(entry => toDate(entry).toISOString().slice(0, 10))));
  if (!uniqueDays.length) return 0;

  const todayKey = new Date().toISOString().slice(0, 10);
  const set = new Set(uniqueDays);
  let probe = new Date();

  if (!set.has(todayKey)) {
    probe = new Date(probe.getTime() - 86400000);
  }

  let streak = 0;
  while (set.has(probe.toISOString().slice(0, 10))) {
    streak += 1;
    probe = new Date(probe.getTime() - 86400000);
  }
  return streak;
}

function average(list) {
  if (!list.length) return 0;
  return sum(list) / list.length;
}

function sum(list) {
  return list.reduce((acc, value) => acc + value, 0);
}

function askNumber(message, fallback, min, max) {
  const answer = prompt(message, String(fallback));
  if (answer === null) return null;
  const value = Number(String(answer).replace(",", "."));
  if (!Number.isFinite(value)) return fallback;
  if (Number.isFinite(min) && value < min) return min;
  if (Number.isFinite(max) && value > max) return max;
  return value;
}

function saveSession(session) {
  const rpe = askNumber("RPE de la seance, de 1 a 10 ?", 7, 1, 10);
  if (rpe === null) return;
  const readiness = askNumber("Readiness avant seance (1 a 5) ?", 3, 1, 5);
  if (readiness === null) return;
  const pain = askNumber("Douleur maximale ressentie (0 a 10) ?", 2, 0, 10);
  if (pain === null) return;
  const sleepHours = askNumber("Sommeil de la nuit precedente (heures) ?", 7, 0, 12);
  if (sleepHours === null) return;
  const bodyweight = askNumber("Poids du jour en kg (optionnel, 0 pour ignorer)", 0, 0, 400);
  if (bodyweight === null) return;
  const durationActual = askNumber("Duree reelle en minutes ?", session.duration || 55, 10, 240);
  if (durationActual === null) return;

  const note = prompt("Note rapide: energie, technique, douleur, point fort ?", "") || "";
  const highlight = prompt("Exercice cle du jour ?", "") || "";
  const loadScore = Math.round(durationActual * rpe);

  state.logs.push({
    isoDate: new Date().toISOString(),
    date: new Date().toLocaleDateString("fr-FR"),
    title: session.title,
    focus: session.focus,
    dayType: session.dayType,
    constraint: session.constraint,
    rpe,
    readiness,
    pain,
    sleepHours,
    bodyweight: bodyweight || "",
    durationActual,
    loadScore,
    highlight,
    note,
    session
  });

  saveState();
  renderToday();
  renderLogbook();
  toast("Seance ajoutee au journal v2.");
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

function syncGeneratorForm() {
  document.querySelector("#focusSelect").value = state.settings.focus;
  document.querySelector("#durationSelect").value = state.settings.duration;
  document.querySelector("#intensitySelect").value = state.settings.intensity;
  document.querySelector("#equipmentSelect").value = state.settings.equipment;
  document.querySelector("#dayTypeSelect").value = state.settings.dayType;
  document.querySelector("#constraintSelect").value = state.settings.constraint;
}

function readGeneratorForm() {
  return {
    focus: document.querySelector("#focusSelect").value,
    duration: document.querySelector("#durationSelect").value,
    intensity: document.querySelector("#intensitySelect").value,
    equipment: document.querySelector("#equipmentSelect").value,
    dayType: document.querySelector("#dayTypeSelect").value,
    constraint: document.querySelector("#constraintSelect").value
  };
}

function initEvents() {
  document.querySelector("#nav").addEventListener("click", event => {
    const btn = event.target.closest("[data-view]");
    if (btn) setView(btn.dataset.view);
  });

  document.querySelector("#dailyGenerate").addEventListener("click", () => {
    currentSession = makeSession({ ...state.settings, seed: seedFromDate(Math.floor(Math.random() * 1000)) });
    renderToday();
  });

  document.querySelector("#dailySave").addEventListener("click", () => saveSession(currentSession));
  document.querySelector("#dailySession").addEventListener("dblclick", () => saveSession(currentSession));

  document.querySelector("#sessionForm").addEventListener("change", () => {
    state.settings = { ...state.settings, ...readGeneratorForm() };
    saveState();
  });

  document.querySelector("#makeSession").addEventListener("click", () => {
    const options = { ...readGeneratorForm(), seed: seedFromDate(Math.floor(Math.random() * 5000)) };
    state.settings = { ...state.settings, ...options };
    saveState();

    generatedSession = makeSession(options);
    document.querySelector("#generatedTitle").textContent = generatedSession.title;
    renderSession(generatedSession, document.querySelector("#generatedSession"));
  });

  document.querySelector("#saveGenerated").addEventListener("click", () => {
    if (!generatedSession) {
      toast("Cree d abord une seance.");
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
    tests.forEach(([id]) => {
      values[id] = document.querySelector(`#test-${id}`).value.trim();
    });

    state.tests.push({
      date: new Date().toLocaleDateString("fr-FR"),
      isoDate: new Date().toISOString(),
      values
    });

    saveState();
    renderToday();
    renderTestHistory();
    toast("Tests enregistres.");
  });

  document.querySelector("#exportData").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: "atlas-athletique-export-v2.json"
    });
    a.click();
    URL.revokeObjectURL(url);
  });

  document.querySelector("#resetBtn").addEventListener("click", () => {
    if (!confirm("Reinitialiser journal, tests et parametres ?")) return;
    localStorage.removeItem(stateKey);
    localStorage.removeItem(legacyStateKey);
    Object.assign(state, defaultState());
    saveState();
    syncGeneratorForm();
    renderAll();
    toast("Donnees reinitialisees.");
  });

  document.querySelector("#installBtn").addEventListener("click", () => {
    if (!deferredInstallPrompt) {
      toast("Sur iPhone: Partager puis Ajouter a l ecran d accueil.");
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

syncStateSettings();
currentSession = makeSession({ ...state.settings, seed: seedFromDate() });
generatedSession = makeSession({ ...state.settings, seed: seedFromDate(99) });

document.addEventListener("DOMContentLoaded", () => {
  syncGeneratorForm();
  initEvents();
  document.querySelector("#generatedTitle").textContent = generatedSession.title;
  renderSession(generatedSession, document.querySelector("#generatedSession"));
  renderAll();
});

function syncStateSettings() {
  const defaults = defaultState().settings;
  state.settings = { ...defaults, ...(state.settings || {}) };
}
