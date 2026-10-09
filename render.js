const editor = document.getElementById("editor");
const lineNumbers = document.getElementById("lineNumbers");
const consoleOutput = document.getElementById("consoleOutput");
const savedList = document.getElementById("savedList");
let scripts = [];
let tabs = [{ name: "untitled.lua", code: editor.value }];
let activeTab = 0;

function updateLines() {
  const count = editor.value.split("\n").length;
  lineNumbers.textContent = Array.from({length: count}, (_, i) => i + 1).join("\n");
  const before = editor.value.slice(0, editor.selectionStart).split("\n");
  document.getElementById("cursorPos").textContent = `Ln ${before.length}, Col ${before[before.length - 1].length + 1}  •  UTF-8`;
}
function log(message, type = "") {
  const row = document.createElement("div");
  row.className = "console-line " + type;
  row.textContent = message;
  consoleOutput.appendChild(row);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}
function saveCurrent() {
  const name = prompt("Name this script:", tabs[activeTab].name.replace(/\.lua$/, ""));
  if (!name) return;
  const entry = { name: name.endsWith(".lua") ? name : name + ".lua", code: editor.value };
  const existing = scripts.findIndex(s => s.name === entry.name);
  if (existing >= 0) scripts[existing] = entry; else scripts.push(entry);
  tabs[activeTab] = { ...tabs[activeTab], name: entry.name, code: editor.value };
  renderTabs(); renderSaved();
  log(`Saved locally: ${entry.name}`);
}
function renderTabs() {
  const tabsEl = document.getElementById("tabs");
  tabsEl.replaceChildren();
  tabs.forEach((tab, i) => {
    const b = document.createElement("button");
    b.className = "tab" + (i === activeTab ? " selected" : "");
    b.textContent = "◈ " + tab.name + "  ×";
    b.addEventListener("click", () => {
      tabs[activeTab].code = editor.value;
      activeTab = i; editor.value = tabs[i].code;
      document.getElementById("activeFile").textContent = tabs[i].name;
      renderTabs(); updateLines();
    });
    tabsEl.appendChild(b);
  });
  document.getElementById("activeFile").textContent = tabs[activeTab].name;
}
function renderSaved() {
  savedList.replaceChildren();
  if (!scripts.length) {
    const empty = document.createElement("div"); empty.className = "empty-state";
    empty.textContent = "No saved scripts yet. Open the editor and choose Save script.";
    savedList.appendChild(empty); return;
  }
  scripts.forEach((script, i) => {
    const item = document.createElement("div"); item.className = "saved-item";
    const info = document.createElement("div");
    const title = document.createElement("strong"); title.textContent = script.name;
    const sub = document.createElement("small"); sub.textContent = `${script.code.split("\n").length} lines · saved in this session`;
    info.append(title, sub);
    const open = document.createElement("button"); open.textContent = "Open";
    open.addEventListener("click", () => {
      tabs[activeTab].code = editor.value;
      tabs.push({name: script.name, code: script.code}); activeTab = tabs.length - 1;
      editor.value = script.code; showPanel("editor"); renderTabs(); updateLines();
    });
    item.append(info, open); savedList.appendChild(item);
  });
}

// Deliberately limited demo interpreter: no eval(), no Roblox connection, no OS access.
function runDemo() {
  const code = editor.value;
  log("› Run demo started", "muted-line");
  const commands = code.split("\n").map(line => line.trim())
    .filter(line => line && !line.startsWith("--"));
  let ran = 0;
  for (const line of commands) {
    const printMatch = line.match(/^print\(\s*(['"])(.*?)\1\s*\)\s*;?$/);
    if (printMatch) { log(printMatch[2]); ran++; continue; }
    if (/^help\(\)\s*;?$/.test(line)) {
      log("Supported demo commands: print(\"your text\") and help()");
      ran++; continue;
    }
    if (/^$/.test(line)) continue;
    log(`Skipped unsupported command: ${line}`, "muted-line");
  }
  if (!ran) log("Nothing to run. Try print(\"Hello, Nexora!\") or help().", "muted-line");
  log("› Demo finished. This does not execute Luau or interact with Roblox.", "muted-line");
}
function showPanel(panel) {
  document.getElementById("editorPanel").classList.toggle("hidden", panel !== "editor");
  document.getElementById("scriptsPanel").classList.toggle("hidden", panel !== "scripts");
  document.getElementById("consolePanel").classList.toggle("hidden", panel !== "console");
  document.getElementById("crumb").textContent = panel === "scripts" ? "Saved scripts" : panel === "console" ? "Console" : "Editor";
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.panel === panel));
}
editor.addEventListener("input", updateLines);
editor.addEventListener("click", updateLines);
editor.addEventListener("keyup", updateLines);
editor.addEventListener("keydown", e => {
  if (e.key === "Tab") {
    e.preventDefault();
    const start = editor.selectionStart, end = editor.selectionEnd;
    editor.setRangeText("  ", start, end, "end"); updateLines();
  }
});
document.getElementById("execute").addEventListener("click", runDemo);
document.getElementById("clear").addEventListener("click", () => { editor.value = ""; updateLines(); });
document.getElementById("save").addEventListener("click", saveCurrent);
document.getElementById("saveTop").addEventListener("click", saveCurrent);
document.getElementById("newTab").addEventListener("click", () => {
  tabs[activeTab].code = editor.value;
  tabs.push({name: `script-${tabs.length + 1}.lua`, code: "-- New Nexora script\n"});
  activeTab = tabs.length - 1; editor.value = tabs[activeTab].code; renderTabs(); updateLines();
});
document.getElementById("createScript").addEventListener("click", () => { showPanel("editor"); document.getElementById("newTab").click(); });
document.getElementById("clearConsole").addEventListener("click", () => consoleOutput.replaceChildren());
document.querySelectorAll(".nav-item").forEach(b => b.addEventListener("click", () => showPanel(b.dataset.panel)));
updateLines(); renderTabs(); renderSaved();

