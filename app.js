const STORE_KEY = "nexus.messages.v1";
const SETTINGS_KEY = "nexus.settings.v1";
const messagesEl = document.getElementById("messages");
const input = document.getElementById("messageInput");
let history = loadHistory();

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); }
  catch { return []; }
}
function saveHistory() {
  localStorage.setItem(STORE_KEY, JSON.stringify(history.slice(-150)));
}
function addMessage(role, text, persist=true) {
  const article = document.createElement("article");
  article.className = `message ${role}`;
  if (role === "assistant") {
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = "N";
    article.appendChild(avatar);
  }
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  article.appendChild(bubble);
  messagesEl.appendChild(article);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  if (persist) {
    history.push({role, text, at: new Date().toISOString()});
    saveHistory();
  }
}
function renderHistory() {
  messagesEl.innerHTML = "";
  if (!history.length) {
    addMessage("assistant", "Hola, soy NEXUS. Esta es tu primera versión móvil.", false);
    return;
  }
  history.forEach(m => addMessage(m.role, m.text, false));
}
function localReply(text) {
  const s = text.toLowerCase();
  if (s.includes("minecraft") || s.includes("addon") || s.includes("add-on")) {
    return "Puedo ayudarte a estructurar ese proyecto. En esta versión todavía no tengo conectado un modelo de IA ni herramientas para generar archivos. Mi siguiente módulo será el espacio de proyectos y el inspector de addons Bedrock.";
  }
  if (s.includes("hola") || s.includes("buenas")) {
    return "¡Hola! NEXUS está funcionando en modo local. La memoria de esta conversación se guarda en este dispositivo.";
  }
  return "He recibido tu mensaje y puedo conservarlo en la memoria local. Para generar respuestas inteligentes de forma real necesitamos conectar NEXUS a un servidor de IA seguro. Esta respuesta es una demostración local, no una respuesta generada por un modelo.";
}
async function sendMessage(text) {
  const clean = text.trim();
  if (!clean) return;
  addMessage("user", clean);
  const settings = getSettings();
  if (settings.backendUrl) {
    try {
      const base = settings.backendUrl.replace(/\/+$/, "");
      const response = await fetch(`${base}/chat`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({message: clean, conversation_id: "mobile-default"})
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      addMessage("assistant", data.reply || "El servidor respondió sin texto.");
      return;
    } catch (err) {
      addMessage("assistant", `No pude conectar con el servidor configurado (${err.message}). Comprueba la dirección y que el backend permita conexiones desde esta app. No he enviado el mensaje a otro proveedor.`);
      return;
    }
  }
  addMessage("assistant", localReply(clean));
}
document.getElementById("composer").addEventListener("submit", e => {
  e.preventDefault();
  const value = input.value;
  input.value = "";
  input.style.height = "auto";
  sendMessage(value);
});
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
});
document.querySelectorAll(".suggestion").forEach(btn => btn.addEventListener("click", () => {
  input.value = btn.dataset.prompt;
  input.focus();
}));
document.getElementById("clearChat").addEventListener("click", () => {
  if (!confirm("¿Limpiar la conversación guardada en este dispositivo?")) return;
  history = [];
  saveHistory();
  renderHistory();
});
function openDialog(id) { document.getElementById(id).showModal(); }
document.getElementById("settingsOpen").addEventListener("click", () => {
  const s = getSettings();
  document.getElementById("assistantName").value = s.name;
  document.getElementById("personality").value = s.personality;
  document.getElementById("backendUrl").value = s.backendUrl;
  openDialog("settingsDialog");
});
document.getElementById("memoryOpen").addEventListener("click", () => {
  document.getElementById("memorySummary").textContent = `${history.length} mensajes guardados en este navegador.`;
  openDialog("memoryDialog");
});
document.getElementById("aboutOpen").addEventListener("click", () => openDialog("aboutDialog"));
document.querySelectorAll(".close-dialog").forEach(b => b.addEventListener("click", () => b.closest("dialog").close()));
function getSettings() {
  try { return {...{name:"NEXUS AI",personality:"Adaptativa",backendUrl:""}, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)||"{}")}; }
  catch { return {name:"NEXUS AI",personality:"Adaptativa",backendUrl:""}; }
}
document.getElementById("saveSettings").addEventListener("click", () => {
  const settings = {
    name: document.getElementById("assistantName").value.trim() || "NEXUS AI",
    personality: document.getElementById("personality").value,
    backendUrl: document.getElementById("backendUrl").value.trim()
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  document.getElementById("settingsDialog").close();
  document.getElementById("connectionLabel").textContent = settings.backendUrl ? "Servidor configurado · conexión al enviar" : "Modo local · memoria en este dispositivo";
});
document.getElementById("exportMemory").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(history, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download="nexus-memory.json"; a.click();
  URL.revokeObjectURL(url);
});
document.getElementById("eraseMemory").addEventListener("click", () => {
  if (!confirm("¿Borrar permanentemente la memoria local de NEXUS en este navegador?")) return;
  history=[]; saveHistory(); renderHistory();
  document.getElementById("memorySummary").textContent="Memoria local vacía.";
});
renderHistory();
const savedSettings = getSettings();
document.getElementById("connectionLabel").textContent = savedSettings.backendUrl ? "Servidor configurado · conexión al enviar" : "Modo local · memoria en este dispositivo";
