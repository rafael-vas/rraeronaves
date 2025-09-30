// ----------------------------------------------------
//  ELEMENTOS DO DOM
// ----------------------------------------------------
const modal = document.getElementById("modalAeronave");
const fecharModalBtn = document.getElementById("fecharModal");
const form = document.getElementById("formAeronave");
const tituloModal = document.getElementById("tituloModal");
const tbody = document.getElementById("tabela");

// ----------------------------------------------------
//  ESTADO DA APLICAÇÃO E DADOS
// ----------------------------------------------------

const dadosSalvos = localStorage.getItem("db_aeronaves");
const dadosPadrao = [
  {
    matricula: "PT-ABC",
    modelo: "Cessna 172",
    status: "Em Manutenção",
    cva: "CVA-2024-001",
    validade: "2024-12-14",
  },
  {
    matricula: "PT-DEF",
    modelo: "Piper Cherokee",
    status: "Aguardando Peças",
    cva: "CVA-2024-002",
    validade: "2024-11-19",
  },
  {
    matricula: "PT-GHI",
    modelo: "Beechcraft Baron",
    status: "Inspeção",
    cva: "CVA-2024-003",
    validade: "2025-01-09",
  },
  {
    matricula: "PT-MNO",
    modelo: "Cessna 210",
    status: "Finalizada",
    cva: "CVA-2024-005",
    validade: "2025-03-14",
  },
];
let aeronaves = dadosSalvos ? JSON.parse(dadosSalvos) : dadosPadrao;

// ----------------------------------------------------
//  FUNÇÕES AUXILIARES (Helpers)
// ----------------------------------------------------

function salvarDados() {
  localStorage.setItem("db_aeronaves", JSON.stringify(aeronaves));
}

function showToast(mensagem, tipo = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.textContent = mensagem;
  Object.assign(toast.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "15px 20px",
    borderRadius: "8px",
    color: "white",
    backgroundColor: tipo === "success" ? "#10b981" : "#ef4444",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    zIndex: "1500",
    opacity: "0",
    transform: "translateX(100%)",
    transition: "all 0.4s ease",
  });
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(0)";
  }, 10);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

function showConfirmationModal(mensagem, onConfirm) {
  const overlay = document.createElement("div");
  overlay.className = "confirmation-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    backgroundColor: "rgba(43, 41, 48, 0.6)",
    zIndex: "1200",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    opacity: "0",
    transition: "opacity 0.3s ease",
  });
  const content = document.createElement("div");
  content.className = "confirmation-content";
  Object.assign(content.style, {
    background: "white",
    padding: "28px 32px",
    borderRadius: "16px",
    textAlign: "center",
    width: "350px",
    boxShadow: "var(--shadow-lg)",
    transform: "scale(0.9)",
    transition: "transform 0.3s ease",
  });
  setTimeout(() => {
    overlay.style.opacity = "1";
    content.style.transform = "scale(1)";
  }, 10);
  const p = document.createElement("p");
  p.textContent = mensagem;
  Object.assign(p.style, {
    fontSize: "1.1rem",
    marginBottom: "24px",
    fontFamily: "var(--font-family-display)",
  });
  const btnContainer = document.createElement("div");
  Object.assign(btnContainer.style, { display: "flex", gap: "12px" });
  const btnCancel = document.createElement("button");
  btnCancel.textContent = "Cancelar";
  Object.assign(btnCancel.style, {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    background: "#eee",
    cursor: "pointer",
    fontWeight: "600",
  });
  btnCancel.onclick = () => overlay.remove();
  const btnConfirm = document.createElement("button");
  btnConfirm.textContent = "Confirmar";
  Object.assign(btnConfirm.style, {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "var(--status-danger)",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
  });
  btnConfirm.onclick = () => {
    onConfirm();
    overlay.remove();
  };
  btnContainer.append(btnCancel, btnConfirm);
  content.append(p, btnContainer);
  overlay.appendChild(content);
  document.body.appendChild(overlay);
}

// ----------------------------------------------------
//  LÓGICA PRINCIPAL DA APLICAÇÃO
// ----------------------------------------------------

/**
 * Retorna a classe CSS correta para um determinado status de aeronave.
 * @param {string} status - O texto do status.
 * @returns {string} - A classe CSS correspondente.
 */
function getStatusClass(status) {
  const statusMap = {
    "Em Manutenção": "em-manutencao",
    "Aguardando Peças": "aguardando",
    Inspeção: "inspecao",
    Finalizada: "finalizada",
  };
  return statusMap[status] || ""; // Retorna a classe do mapa ou uma string vazia
}

function renderTabela() {
  tbody.innerHTML = "";
  if (aeronaves.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 6;
    td.textContent =
      "Nenhuma aeronave cadastrada. Clique em 'Adicionar' para começar!";
    Object.assign(td.style, {
      textAlign: "center",
      padding: "40px 0",
      color: "var(--text-muted)",
    });
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    aeronaves.forEach((a, i) => {
      const tr = document.createElement("tr");

      // **** ESTA É A PARTE CORRIGIDA ****
      const statusClassName = getStatusClass(a.status);
      tr.innerHTML = `
                <td>${a.matricula}</td>
                <td>${a.modelo}</td>
                <td><span class="status ${statusClassName}">${a.status}</span></td>
                <td>${a.cva}</td>
            `;

        tr.innerHTML = `
                <td data-label="Matrícula">${a.matricula}</td>
                <td data-label="Modelo">${a.modelo}</td>
                <td data-label="Status"><span class="status ${statusClassName}">${a.status}</span></td>
                <td data-label="CVA">${a.cva}</td>
            `;

      const tdValidade = document.createElement("td");
      const hoje = new Date();
      const validade = new Date(a.validade + "T00:00:00-03:00");
      tdValidade.textContent = validade.toLocaleDateString("pt-BR");
      if (validade < hoje) {
        const spanVencido = document.createElement("span");
        spanVencido.className = "vencido";
        spanVencido.textContent = "Vencido";
        tdValidade.appendChild(spanVencido);
      }
      tr.appendChild(tdValidade);

      const tdAcoes = document.createElement("td");
      tdAcoes.className = "acoes";
      const editLink = document.createElement("a");
      editLink.textContent = "Editar";
      editLink.href = "#";
      editLink.onclick = (e) => {
        e.preventDefault();
        editarAeronave(i);
      };
      const deleteLink = document.createElement("a");
      deleteLink.textContent = "Excluir";
      deleteLink.className = "excluir";
      deleteLink.href = "#";
      deleteLink.onclick = (e) => {
        e.preventDefault();
        excluirAeronave(i);
      };
      tdAcoes.append(editLink, deleteLink);
      tr.appendChild(tdAcoes);
      tbody.appendChild(tr);
    });
  }
  atualizarCards();
}

function atualizarCards() {
  document.getElementById("total").innerText = aeronaves.length;
  document.getElementById("manutencao").innerText = aeronaves.filter(
    (a) => a.status === "Em Manutenção"
  ).length;
  document.getElementById("validos").innerText = aeronaves.filter(
    (a) => new Date(a.validade) >= new Date()
  ).length;
  document.getElementById("vencendo").innerText = aeronaves.filter((a) => {
    const diff = (new Date(a.validade) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }).length;
}

function abrirModal(indice = -1) {
  form.reset();
  if (indice === -1) {
    tituloModal.innerText = "Adicionar Aeronave";
    document.getElementById("indice").value = -1;
  } else {
    tituloModal.innerText = "Editar Aeronave";
    const a = aeronaves[indice];
    document.getElementById("matricula").value = a.matricula;
    document.getElementById("modelo").value = a.modelo;
    document.getElementById("status").value = a.status;
    document.getElementById("cva").value = a.cva;
    document.getElementById("validade").value = a.validade;
    document.getElementById("indice").value = indice;
  }
  modal.classList.add("show");
}

function adicionarAeronave() {
  abrirModal(-1);
}

function editarAeronave(i) {
  abrirModal(i);
}

function excluirAeronave(i) {
  showConfirmationModal("Deseja realmente excluir esta aeronave?", () => {
    aeronaves.splice(i, 1);
    salvarDados();
    renderTabela();
    showToast("Aeronave excluída com sucesso.", "danger");
  });
}

// ----------------------------------------------------
//  EVENT LISTENERS (Ouvintes de Eventos)
// ----------------------------------------------------

fecharModalBtn.onclick = function () {
  modal.classList.remove("show");
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.classList.remove("show");
  }
};

form.onsubmit = function (event) {
  event.preventDefault();
  const indice = parseInt(document.getElementById("indice").value);
  const aeronave = {
    matricula: document.getElementById("matricula").value.trim(),
    modelo: document.getElementById("modelo").value.trim(),
    status: document.getElementById("status").value,
    cva: document.getElementById("cva").value.trim(),
    validade: document.getElementById("validade").value,
  };
  if (indice === -1) {
    aeronaves.push(aeronave);
  } else {
    aeronaves[indice] = aeronave;
  }
  salvarDados();
  modal.classList.remove("show");
  renderTabela();
  showToast("Aeronave salva com sucesso!");
};

// ----------------------------------------------------
//  INICIALIZAÇÃO DA APLICAÇÃO
// ----------------------------------------------------
renderTabela();
