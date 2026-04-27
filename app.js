const $ = (id) => document.getElementById(id);

const form = $("videoForm");
const result = $("result");
const tabs = document.querySelectorAll(".tab");
const copyBtn = $("copyBtn");
const downloadTxtBtn = $("downloadTxtBtn");
const downloadJsonBtn = $("downloadJsonBtn");
const savedList = $("savedList");
const demoBtn = $("demoBtn");
const clearBtn = $("clearBtn");
const installBtn = $("installBtn");

let deferredPrompt = null;
let currentProject = null;
let currentTab = "script";

const sceneTemplates = [
  {
    title: "Apertura d’impatto",
    visual: "inquadratura forte, ritmo veloce, problema o bisogno mostrato subito",
    text: "Hai mai pensato che un piccolo gesto può cambiare la tua città?",
    purpose: "agganciare l’attenzione nei primi 3 secondi"
  },
  {
    title: "Il problema",
    visual: "strada, quartiere, cittadino che osserva una criticità o un bisogno reale",
    text: "Ogni giorno vediamo cose da migliorare, ma spesso non sappiamo da dove cominciare.",
    purpose: "creare identificazione"
  },
  {
    title: "La soluzione",
    visual: "smartphone in mano, interfaccia moderna, gesto semplice e immediato",
    text: "Con questa app puoi segnalare, recensire e partecipare in modo semplice.",
    purpose: "presentare il valore"
  },
  {
    title: "Funzioni principali",
    visual: "sequenza dinamica di schermate: segnalazioni, recensioni, luoghi, attività",
    text: "Segnala problemi, scopri locali, aggiungi recensioni e valorizza i luoghi da visitare.",
    purpose: "spiegare cosa fa"
  },
  {
    title: "Comunità",
    visual: "persone diverse, cittadini uniti, città più curata, luce calda e positiva",
    text: "Quando una comunità partecipa, ogni voce diventa utile.",
    purpose: "dare emozione"
  },
  {
    title: "Invito finale",
    visual: "logo, smartphone, pulsante download, sfondo luminoso e moderno",
    text: "Scarica l’app e diventa parte del cambiamento.",
    purpose: "spingere all’azione"
  },
  {
    title: "Prima e dopo",
    visual: "split screen: situazione trascurata a sinistra, luogo curato e vivo a destra",
    text: "Dalla segnalazione alla soluzione: il cambiamento parte da chi osserva.",
    purpose: "rendere visibile il beneficio"
  },
  {
    title: "Chiusura memorabile",
    visual: "titolo grande, logo centrale, slogan breve, effetto luce cinematografico",
    text: "La città migliora quando le persone decidono di esserci.",
    purpose: "lasciare una frase ricordabile"
  }
];

function sanitize(value, fallback = "") {
  return (value || fallback).toString().trim();
}

function buildProject(data) {
  const title = sanitize(data.title, "Il tuo progetto");
  const goal = sanitize(data.goal, "Promuovere un servizio utile per le persone.");
  const platform = sanitize(data.platform, "TikTok / Reel verticale");
  const duration = sanitize(data.duration, "30 secondi");
  const style = sanitize(data.style, "virale ed emozionale");
  const audience = sanitize(data.audience, "cittadini e utenti social");
  const cta = sanitize(data.cta, "Scarica l’app e partecipa anche tu");
  const scenesCount = Number(data.scenesCount || 6);
  const selectedScenes = sceneTemplates.slice(0, scenesCount);

  const hook = createHook(title, style);
  const script = createScript({ title, goal, platform, duration, style, audience, cta });
  const storyboard = selectedScenes.map((scene, index) => ({
    number: index + 1,
    title: scene.title,
    visual: personalizeVisual(scene.visual, title, style),
    screenText: personalizeText(scene.text, title, cta),
    purpose: scene.purpose,
    duration: estimateSceneDuration(duration, selectedScenes.length)
  }));

  const prompts = storyboard.map(scene => ({
    scene: scene.number,
    title: scene.title,
    prompt: createScenePrompt({ title, goal, style, platform, scene })
  }));

  const coverPrompt = createCoverPrompt({ title, goal, style, platform, cta });
  const social = createSocialKit({ title, goal, platform, style, audience, cta });

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    createdAt: new Date().toISOString(),
    title,
    goal,
    platform,
    duration,
    style,
    audience,
    cta,
    hook,
    script,
    storyboard,
    prompts,
    coverPrompt,
    social
  };
}

function createHook(title, style) {
  const hooks = {
    "virale ed emozionale": `E se bastasse un gesto per far sentire davvero la tua voce?`,
    "cinematografico": `Ogni città ha una storia. Ora è il momento di raccontare quella del cambiamento.`,
    "istituzionale e professionale": `Uno strumento semplice per rendere più efficace la partecipazione dei cittadini.`,
    "urban moderno": `La città parla. Ora ha bisogno di qualcuno che la ascolti.`,
    "familiare e rassicurante": `Le cose belle iniziano quando qualcuno decide di prendersi cura del proprio posto.`
  };
  return hooks[style] || `Scopri ${title}: semplice, utile, immediato.`;
}

function createScript({ title, goal, platform, duration, style, audience, cta }) {
  const intro = createHook(title, style);
  return [
    intro,
    `Con ${title}, ogni persona può trasformare un’idea, una segnalazione o un’esperienza in qualcosa di utile per tutti.`,
    `L’obiettivo è chiaro: ${goal}`,
    `In pochi passaggi puoi creare contenuti, raccontare ciò che vedi, valorizzare i luoghi, dare spazio alle attività e rendere più forte la partecipazione della comunità.`,
    `È pensato per ${audience}, con uno stile ${style}, perfetto per ${platform} e per un video di circa ${duration}.`,
    `${cta}. Oggi non restare spettatore: partecipa, racconta, condividi.`
  ].join("\n\n");
}

function personalizeVisual(text, title, style) {
  return `${text}, atmosfera ${style}, riferimento visivo a “${title}”`;
}

function personalizeText(text, title, cta) {
  return text
    .replace("questa app", title)
    .replace("Scarica l’app e diventa parte del cambiamento.", cta || "Scarica l’app e partecipa anche tu.");
}

function estimateSceneDuration(duration, count) {
  const seconds = Number((duration.match(/\d+/) || ["30"])[0]);
  return `${Math.max(3, Math.round(seconds / count))} sec. circa`;
}

function createScenePrompt({ title, goal, style, platform, scene }) {
  const vertical = platform.toLowerCase().includes("tiktok") || platform.toLowerCase().includes("short") || platform.toLowerCase().includes("reel");
  return `Crea una scena video ${vertical ? "verticale 9:16" : "16:9"} in stile ${style}. Tema: ${title}. Obiettivo del video: ${goal}. Scena ${scene.number}: ${scene.title}. Visual: ${scene.visual}. Testo in sovrimpressione: "${scene.screenText}". Qualità alta, luce cinematografica, dettagli realistici, movimento camera fluido, atmosfera moderna, emozionale e professionale.`;
}

function createCoverPrompt({ title, goal, style, platform, cta }) {
  const vertical = platform.toLowerCase().includes("tiktok") || platform.toLowerCase().includes("short") || platform.toLowerCase().includes("reel");
  return `Crea una copertina ${vertical ? "verticale 9:16" : "orizzontale 16:9"} molto d’impatto per il video "${title}". Stile ${style}, atmosfera moderna, luminosa e virale. Deve comunicare: ${goal}. Inserire titolo grande: "${title}". Inserire invito breve: "${cta}". Composizione pulita, forte contrasto, effetto social professionale, adatta a Facebook, TikTok e Instagram.`;
}

function createSocialKit({ title, goal, platform, style, audience, cta }) {
  const hashtags = [
    "#VideoFacileAI",
    "#SocialVideo",
    "#Comunicazione",
    "#App",
    "#Innovazione",
    "#CittadiniAttivi",
    "#Promozione",
    "#Reels",
    "#TikTokItalia",
    "#FacebookItalia"
  ];

  const description = `🎬 ${title}\n\n${goal}\n\nUn video in stile ${style}, pensato per ${platform} e rivolto a ${audience}.\n\n👉 ${cta}\n\n${hashtags.slice(0, 8).join(" ")}`;

  const shortCaption = `🎥 ${title}: semplice, utile, immediato. ${cta} ${hashtags.slice(0, 5).join(" ")}`;

  return { description, shortCaption, hashtags };
}

function renderProject(tab = currentTab) {
  currentTab = tab;
  if (!currentProject) {
    result.className = "result empty-state";
    result.innerHTML = `<h3>Nessun progetto ancora creato</h3><p>Compila i dati a sinistra e genera il tuo primo video.</p>`;
    return;
  }

  result.className = "result";
  let html = "";

  if (tab === "script") {
    html = `
      <div class="generated-section">
        <h3>Copione parlato</h3>
        <div class="copy-block"><strong>Apertura:</strong><p>${escapeHtml(currentProject.hook)}</p></div>
        <div class="copy-block"><strong>Testo completo:</strong><p>${escapeHtml(currentProject.script).replace(/\n/g, "<br>")}</p></div>
      </div>`;
  }

  if (tab === "storyboard") {
    html = `
      <div class="generated-section">
        <h3>Storyboard scene</h3>
        ${currentProject.storyboard.map(scene => `
          <article class="scene-card">
            <h4>${scene.number}. ${escapeHtml(scene.title)} <small>(${escapeHtml(scene.duration)})</small></h4>
            <p><strong>Visual:</strong> ${escapeHtml(scene.visual)}</p>
            <p><strong>Testo sullo schermo:</strong> ${escapeHtml(scene.screenText)}</p>
            <p><strong>Scopo:</strong> ${escapeHtml(scene.purpose)}</p>
          </article>
        `).join("")}
      </div>`;
  }

  if (tab === "prompts") {
    html = `
      <div class="generated-section">
        <h3>Prompt per generare clip o immagini</h3>
        ${currentProject.prompts.map(item => `
          <div class="copy-block">
            <strong>Prompt scena ${item.scene}: ${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.prompt)}</p>
          </div>
        `).join("")}
      </div>`;
  }

  if (tab === "cover") {
    html = `
      <div class="generated-section">
        <h3>Prompt copertina</h3>
        <div class="copy-block"><p>${escapeHtml(currentProject.coverPrompt)}</p></div>
        <h3>Consiglio grafico</h3>
        <ul>
          <li>Usa titolo grande e leggibile.</li>
          <li>Inserisci logo o icona dell’app se disponibile.</li>
          <li>Usa un volto, uno smartphone o una scena cittadina per aumentare l’impatto.</li>
          <li>Formato consigliato: 1080×1920 per TikTok/Reels, 1280×720 per YouTube/Facebook orizzontale.</li>
        </ul>
      </div>`;
  }

  if (tab === "social") {
    html = `
      <div class="generated-section">
        <h3>Descrizione social</h3>
        <div class="copy-block"><p>${escapeHtml(currentProject.social.description).replace(/\n/g, "<br>")}</p></div>
        <h3>Caption breve</h3>
        <div class="copy-block"><p>${escapeHtml(currentProject.social.shortCaption)}</p></div>
        <h3>Hashtag</h3>
        <div class="copy-block"><p>${currentProject.social.hashtags.map(escapeHtml).join(" ")}</p></div>
      </div>`;
  }

  result.innerHTML = html;
}

function getCurrentSectionText() {
  if (!currentProject) return "";
  if (currentTab === "script") return `COPIONE\n\n${currentProject.script}`;
  if (currentTab === "storyboard") {
    return "STORYBOARD\n\n" + currentProject.storyboard.map(s =>
      `${s.number}. ${s.title}\nDurata: ${s.duration}\nVisual: ${s.visual}\nTesto: ${s.screenText}\nScopo: ${s.purpose}`
    ).join("\n\n");
  }
  if (currentTab === "prompts") {
    return "PROMPT SCENE\n\n" + currentProject.prompts.map(p =>
      `Scena ${p.scene} - ${p.title}\n${p.prompt}`
    ).join("\n\n");
  }
  if (currentTab === "cover") return `PROMPT COPERTINA\n\n${currentProject.coverPrompt}`;
  if (currentTab === "social") {
    return `DESCRIZIONE SOCIAL\n\n${currentProject.social.description}\n\nCAPTION BREVE\n${currentProject.social.shortCaption}\n\nHASHTAG\n${currentProject.social.hashtags.join(" ")}`;
  }
  return "";
}

function saveProject(project) {
  const items = getSavedProjects();
  const updated = [project, ...items.filter(item => item.id !== project.id)].slice(0, 20);
  localStorage.setItem("videofacile_projects", JSON.stringify(updated));
  renderSaved();
}

function getSavedProjects() {
  try {
    return JSON.parse(localStorage.getItem("videofacile_projects") || "[]");
  } catch {
    return [];
  }
}

function renderSaved() {
  const items = getSavedProjects();
  if (!items.length) {
    savedList.innerHTML = `<p style="color: var(--muted); margin: 0;">Non ci sono ancora progetti salvati.</p>`;
    return;
  }

  savedList.innerHTML = items.map(item => `
    <div class="saved-item">
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <span>${new Date(item.createdAt).toLocaleString("it-IT")} • ${escapeHtml(item.platform)} • ${escapeHtml(item.duration)}</span>
      </div>
      <div class="actions">
        <button class="small-btn" data-load="${item.id}">Apri</button>
        <button class="small-btn delete" data-delete="${item.id}">Elimina</button>
      </div>
    </div>
  `).join("");

  savedList.querySelectorAll("[data-load]").forEach(btn => {
    btn.addEventListener("click", () => {
      const project = getSavedProjects().find(item => item.id === btn.dataset.load);
      if (project) {
        currentProject = project;
        enableActions();
        renderProject("script");
        setActiveTab("script");
        window.scrollTo({ top: document.querySelector(".output-card").offsetTop - 20, behavior: "smooth" });
      }
    });
  });

  savedList.querySelectorAll("[data-delete]").forEach(btn => {
    btn.addEventListener("click", () => {
      const updated = getSavedProjects().filter(item => item.id !== btn.dataset.delete);
      localStorage.setItem("videofacile_projects", JSON.stringify(updated));
      renderSaved();
      toast("Progetto eliminato");
    });
  });
}

function setActiveTab(tab) {
  tabs.forEach(btn => btn.classList.toggle("active", btn.dataset.tab === tab));
}

function enableActions() {
  copyBtn.disabled = false;
  downloadTxtBtn.disabled = false;
  downloadJsonBtn.disabled = false;
}

function downloadFile(filename, content, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toast(message) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2200);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = {
    title: $("title").value,
    goal: $("goal").value,
    platform: $("platform").value,
    duration: $("duration").value,
    style: $("style").value,
    scenesCount: $("scenesCount").value,
    audience: $("audience").value,
    cta: $("cta").value
  };

  currentProject = buildProject(data);
  saveProject(currentProject);
  enableActions();
  setActiveTab("script");
  renderProject("script");
  toast("Progetto video generato e salvato");
});

tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    setActiveTab(btn.dataset.tab);
    renderProject(btn.dataset.tab);
  });
});

copyBtn.addEventListener("click", async () => {
  const text = getCurrentSectionText();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    toast("Testo copiato");
  } catch {
    toast("Copia non riuscita: seleziona e copia manualmente");
  }
});

downloadTxtBtn.addEventListener("click", () => {
  if (!currentProject) return;
  const content = [
    `VIDEOFACILE AI - ${currentProject.title}`,
    `Creato il: ${new Date(currentProject.createdAt).toLocaleString("it-IT")}`,
    `Piattaforma: ${currentProject.platform}`,
    `Durata: ${currentProject.duration}`,
    `Stile: ${currentProject.style}`,
    "",
    "=== COPIONE ===",
    currentProject.script,
    "",
    "=== STORYBOARD ===",
    ...currentProject.storyboard.map(s => `${s.number}. ${s.title}\nDurata: ${s.duration}\nVisual: ${s.visual}\nTesto: ${s.screenText}\nScopo: ${s.purpose}\n`),
    "",
    "=== PROMPT SCENE ===",
    ...currentProject.prompts.map(p => `Scena ${p.scene} - ${p.title}\n${p.prompt}\n`),
    "",
    "=== PROMPT COPERTINA ===",
    currentProject.coverPrompt,
    "",
    "=== SOCIAL ===",
    currentProject.social.description
  ].join("\n");
  downloadFile(`${currentProject.title.replace(/\s+/g, "_")}_progetto_video.txt`, content, "text/plain;charset=utf-8");
});

downloadJsonBtn.addEventListener("click", () => {
  if (!currentProject) return;
  downloadFile(`${currentProject.title.replace(/\s+/g, "_")}_progetto_video.json`, JSON.stringify(currentProject, null, 2), "application/json;charset=utf-8");
});

clearBtn.addEventListener("click", () => {
  form.reset();
  currentProject = null;
  copyBtn.disabled = true;
  downloadTxtBtn.disabled = true;
  downloadJsonBtn.disabled = true;
  setActiveTab("script");
  renderProject("script");
  toast("Schermata pulita");
});

demoBtn.addEventListener("click", () => {
  $("title").value = "Segnala Facile";
  $("goal").value = "Convincere i cittadini a scaricare l’app per inviare segnalazioni, recensire locali, aggiungere nuove attività e scoprire luoghi da visitare.";
  $("platform").value = "TikTok / Reel verticale";
  $("duration").value = "45 secondi";
  $("style").value = "virale ed emozionale";
  $("scenesCount").value = "6";
  $("audience").value = "cittadini, famiglie, giovani e attività locali";
  $("cta").value = "Scarica Segnala Facile e fai sentire la tua voce";
  document.querySelector("#creator").scrollIntoView({ behavior: "smooth" });
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  installBtn.classList.remove("hidden");
});

installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.classList.add("hidden");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}

renderSaved();
