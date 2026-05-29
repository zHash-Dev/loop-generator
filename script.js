// Base de dados da Wiki
const wikiDATA = [
  {
    objetivo: "Index (starts at 0)",
    exemplo: "ID: [[$flag]]",
    resultado: "ID: 0"
  },
  {
    objetivo: "Index (starts at 1)",
    exemplo: "Line: [[$flag + 1]]",
    resultado: "Line: 1"
  },
  {
    objetivo: "Calculations",
    exemplo: "Result: [[($flag + 1) * 10]]",
    resultado: "Result: 10"
  },
  {
    objetivo: "Minecraft Component Group",
    exemplo: `"health.[[$flag + 20]]": {\n  "minecraft:health": {\n    "value": [[$flag + 20]],\n    "max": [[$flag + 20]]\n  }\n},`,
    resultado: `"health.20": {\n  "minecraft:health": {\n    "value": 20,\n    "max": 20\n  }\n},`
  },
  {
    objetivo: "Minecraft Event",
    exemplo: `"health.[[$flag + 20]]": {\n  "add": {\n    "component_groups": [\n      "health.[[$flag + 20]]"\n    ]\n  }\n},`,
    resultado: `"health.20": {\n "add": {\n "component_groups": [\n "health.20"\n ]\n },`
  },
];

// Carregar itens da Wiki se a tabela existir na página atual
function renderWiki() {
  const tbody = document.getElementById("wiki-body");
  if (!tbody) return; // Segurança caso não esteja na página wiki

  tbody.innerHTML = "";
  wikiDATA.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.objetivo}</td>
      <td>
        <code class="clickable-example" onclick="loadExample(this)">${escapeHtml(item.exemplo)}</code>
      </td>
      <td>
        <pre class="result-preview">${escapeHtml(item.resultado)}</pre>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Alterado para suportar links entre páginas reais
function switchPage(pageId) {
  if (pageId === 'main') {
    window.location.href = 'index.html';
  } else if (pageId === 'wiki') {
    window.location.href = 'wiki.html';
  }
}

// Sistema de Toast
let toastTimeOut;
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeOut);
  toastTimeOut = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// Ao clicar no exemplo da Wiki, guarda no localStorage e redireciona
function loadExample(element) {
  localStorage.setItem("loadedExample", element.textContent);
  window.location.href = 'index.html';
}

// Verifica se veio algum exemplo da Wiki ao carregar a página principal
function checkLoadedExample() {
  const inputTextArea = document.getElementById("input");
  if (!inputTextArea) return;

  const savedExample = localStorage.getItem("loadedExample");
  if (savedExample) {
    inputTextArea.value = savedExample;
    localStorage.removeItem("loadedExample"); // Limpa para não carregar toda vez
    updateEditor();
    showToast("Exemplo carregado com sucesso!");
  }
}

// Atualização Dinâmica do Editor (Contador + Highlights)
function updateEditor() {
  const inputTextArea = document.getElementById("input");
  const backdrop = document.getElementById("backdrop");
  const inputCounter = document.getElementById("inputLineCounter");

  if (!inputTextArea || !backdrop || !inputCounter) return;

  let text = inputTextArea.value;
  const lines = text.split('\n');
  const totalLines = lines.length || 1;
  let counterText = "";
  for (let i = 1; i <= totalLines; i++) {
    counterText += i + "\n";
  }
  inputCounter.textContent = counterText;

  let highlighted = escapeHtml(text);
  highlighted = highlighted
    .replace(/(['"])(.*?)\1/g, '<span class="hl-string">$1$2$1</span>')
    .replace(/(\[\[|\]\])/g, '<span class="hl-bracket">$1</span>')
    .replace(/(\$flag)/g, '<span class="hl-flag">$1</span>')
    .replace(/\b(\d+)\b(?![^<>]*>)/g, '<span class="hl-number">$1</span>');

  backdrop.innerHTML = highlighted + (text.endsWith('\n') ? '\n' : '');
  backdrop.scrollTop = inputTextArea.scrollTop;
  backdrop.scrollLeft = inputTextArea.scrollLeft;
}

// Listener de scroll para o editor (se ele existir na página)
const inputModf = document.getElementById("input");
if (inputModf) {
  inputModf.addEventListener('scroll', function () {
    const backdrop = document.getElementById("backdrop");
    if (backdrop) {
      backdrop.scrollTop = this.scrollTop;
      backdrop.scrollLeft = this.scrollLeft;
    }
  });
}

function resolveExpression(text, i) {
  const regex = /\[\[(.+?)\]\]/g;
  return text.replace(regex, (match, expression) => {
    try {
      const txt = document.createElement("textarea");
      txt.innerHTML = expression;
      const cleanExpr = txt.value.replace(/\$flag/g, i);
      const val = eval(cleanExpr);
      return val !== undefined ? val : "";
    } catch (err) {
      return "[Erro]";
    }
  });
}

function generate() {
  const repeatEl = document.getElementById("repeat");
  const inputEl = document.getElementById("input");
  const outputElement = document.getElementById("output");
  const outputCounter = document.getElementById("outputLineCounter");
  const statsEl = document.getElementById("output-stats");

  if (!repeatEl || !inputEl || !outputElement || !outputCounter || !statsEl) return;

  const repeat = parseInt(repeatEl.value);
  const input = inputEl.value;

  if (repeat > 10000) {
    showToast("Safety limit: 10k repetitions.");
    return;
  }
  
  if (input.trim().length <= 0) {
    showToast("Type something before generating.");
    
    const editorWrapper = document.querySelector(".editor-wrapper");
    
    if (editorWrapper) {
      editorWrapper.classList.remove("shake-error");
      void editorWrapper.offsetWidth; 
      editorWrapper.classList.add("shake-error");
      setTimeout(() => {
        editorWrapper.classList.remove("shake-error");
      }, 400);
    }
    
    inputEl.focus();
    return;
  }
  
  if (repeatEl.value.trim().length <= 0 || repeat <= 0) {
    showToast("This value is not valid here.");
    
    const editorWrapper = document.getElementById("repeat");
    
    if (editorWrapper) {
      editorWrapper.classList.remove("shake-error");
      void editorWrapper.offsetWidth; 
      editorWrapper.classList.add("shake-error");
      setTimeout(() => {
        editorWrapper.classList.remove("shake-error");
      }, 400);
    }
    
    repeatEl.focus();
    return;
  }

  outputElement.textContent = "Generating...";

  setTimeout(() => {
    let resultArr = [];
    for (let i = 0; i < repeat; i++) {
      resultArr.push(resolveExpression(input, i));
    }

    const finalOutput = resultArr.join("\n");
    outputElement.textContent = finalOutput;
    

    const outLines = finalOutput.split('\n');
    const totalOutLines = outLines.length || 1;
    let counterText = "";
    for (let i = 1; i <= totalOutLines; i++) {
      counterText += i + "\n";
    }
    outputCounter.textContent = counterText;
    
    // Atualiza a linha de estatísticas
    const charCount = finalOutput.length;
    statsEl.textContent = `${charCount.toLocaleString('pt-BR')} characters | ${totalOutLines} lines`;

    showToast("List generated.");
  }, 50);
}

function clearInput() {
  const inputTextArea = document.getElementById("input");
  const outputElement = document.getElementById("output");      
  const outputCounter = document.getElementById("outputLineCounter");
  const backdrop = document.getElementById("backdrop");
  const inputCounter = document.getElementById("inputLineCounter");
  const statsEl = document.getElementById("output-stats");

  if (!inputTextArea || !outputElement || !outputCounter || !statsEl) return;

  inputTextArea.value = "";
  outputElement.textContent = "";
  outputCounter.textContent = "1";
  statsEl.textContent = "0 characters | 0 lines";
  
  updateEditor(); 
  
  inputTextArea.focus();
  
  showToast("Clean input.");
}

function copyOutput() {
  const outputEl = document.getElementById("output");
  if (!outputEl) return;
  const text = outputEl.textContent;
  if (!text || text === "Gerando...") return;
  navigator.clipboard.writeText(text).then(() => {
    showToast("Copied to clipboard.");
  });
}

function downloadOutput() {
  const text = document.getElementById("output").textContent;
  
  if (text.trim().length <= 0) {
    showToast("The output cannot be empty.");
    return;
  }
  
  const blob = new Blob([text], { type: "text/plain" });
  const anchor = document.createElement("a");
  anchor.download = "loop-output.txt";
  anchor.href = window.URL.createObjectURL(blob);
  anchor.click();
}

// Inicializadores globais baseados na página ativa
document.addEventListener("DOMContentLoaded", () => {
  renderWiki();
  checkLoadedExample();
  updateEditor();
  
  // Lógica para salvar e recuperar o valor de repetições
  const repeatEl = document.getElementById("repeat");
  if (repeatEl) {
    // 1. Verifica se já existe um valor salvo e aplica
    const savedRepeat = localStorage.getItem("repeatValue");
    if (savedRepeat) {
      repeatEl.value = savedRepeat;
    }
    
    // 2. Sempre que o usuário digitar um número, salva automaticamente
    repeatEl.addEventListener("input", (e) => {
      localStorage.setItem("repeatValue", e.target.value);
    });
  }
});