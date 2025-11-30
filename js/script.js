// ====================================================
//  1. CONFIGURAÇÃO E IMPORTS (FIREBASE)
// ====================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// ----------------------------------------------------
//  SUA CONFIGURAÇÃO (JÁ ESTÁ CERTA)
// ----------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCnQ3SFRZqOZIIkNLFD-y14XWmqvGFv4s0",
  authDomain: "rr-manutencoes-bd.firebaseapp.com",
  projectId: "rr-manutencoes-bd",
  storageBucket: "rr-manutencoes-bd.firebasestorage.app",
  messagingSenderId: "693245558224",
  appId: "1:693245558224:web:686556d07ce773e4670dd5",
  measurementId: "G-3BHPCQYHVB",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const dbCollection = collection(db, "aeronaves");

// ====================================================
//  2. ELEMENTOS DO DOM
// ====================================================
const modal = document.getElementById("modalAeronave");
const fecharModalBtn = document.getElementById("fecharModal");
const form = document.getElementById("formAeronave");
const tituloModal = document.getElementById("tituloModal");
const tbody = document.getElementById("tabela");
const btnAdicionar = document.getElementById("btnAdicionar");

let aeronaves = [];

// ====================================================
//  3. FUNÇÕES VISUAIS (ESTILO DO CÓDIGO ANTIGO)
// ====================================================

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

function getStatusClass(status) {
  const statusMap = {
    "Em Manutenção": "em-manutencao",
    "Aguardando Peças": "aguardando",
    Inspeção: "inspecao",
    Finalizada: "finalizada",
  };
  return statusMap[status] || "";
}

// ====================================================
//  4. FUNÇÕES DE BANCO DE DADOS (CRUD)
// ====================================================

async function carregarDados() {
  tbody.innerHTML =
    '<tr><td colspan="6" style="text-align:center">Carregando frota... ✈️</td></tr>';

  try {
    const querySnapshot = await getDocs(dbCollection);
    aeronaves = [];
    querySnapshot.forEach((doc) => {
      aeronaves.push({ id: doc.id, ...doc.data() });
    });
    renderTabela();
    atualizarCards();
  } catch (error) {
    console.error("Erro ao buscar:", error);
    showToast("Erro ao conectar com o servidor.", "danger");
  }
}

async function salvarAeronave(aeronave, id = null) {
  const btnSalvar = document.getElementById("btnSalvar");
  const textoOriginal = btnSalvar.textContent;
  btnSalvar.textContent = "Salvando...";
  btnSalvar.disabled = true;

  try {
    if (id) {
      const docRef = doc(db, "aeronaves", id);
      await updateDoc(docRef, aeronave);
      showToast("Aeronave atualizada com sucesso!");
    } else {
      await addDoc(dbCollection, aeronave);
      showToast("Aeronave cadastrada com sucesso!");
    }

    modal.style.display = "none";
    modal.classList.remove("show");
    await carregarDados();
  } catch (e) {
    console.error("Erro no save:", e);
    showToast("Erro ao salvar no banco.", "danger");
  } finally {
    btnSalvar.textContent = textoOriginal;
    btnSalvar.disabled = false;
  }
}

function confirmarExclusao(id) {
  showConfirmationModal("Deseja realmente excluir esta aeronave?", async () => {
    try {
      await deleteDoc(doc(db, "aeronaves", id));
      await carregarDados();
    } catch (e) {
      console.error(e);
      showToast("Erro ao excluir.", "danger");
    }
  });
}

// ====================================================
//  5. RENDERIZAÇÃO
// ====================================================

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
    return;
  }

  aeronaves.forEach((a) => {
    const tr = document.createElement("tr");
    const statusClassName = getStatusClass(a.status);

    tr.innerHTML = `
        <td data-label="Matrícula">${a.matricula}</td>
        <td data-label="Modelo">${a.modelo}</td>
        <td data-label="Status"><span class="status ${statusClassName}">${a.status}</span></td>
        <td data-label="CVA">${a.cva}</td>
    `;

    const tdValidade = document.createElement("td");
    tdValidade.setAttribute("data-label", "Validade"); // Importante pro mobile

    const partesData = a.validade.split("-");
    const dataFormatada = `${partesData[2]}/${partesData[1]}/${partesData[0]}`;
    tdValidade.textContent = dataFormatada;

    const hoje = new Date();
    const validadeObj = new Date(a.validade + "T00:00:00");

    if (validadeObj < hoje) {
      const spanVencido = document.createElement("span");
      spanVencido.className = "vencido";
      spanVencido.textContent = "Vencido";
      tdValidade.appendChild(spanVencido);
    }
    tr.appendChild(tdValidade);

    const tdAcoes = document.createElement("td");
    tdAcoes.className = "acoes";

    const btnEdit = document.createElement("a");
    btnEdit.textContent = "Editar";
    btnEdit.href = "#";
    btnEdit.onclick = (e) => {
      e.preventDefault();
      abrirModal(a);
    };

    const btnDel = document.createElement("a");
    btnDel.textContent = "Excluir";
    btnDel.className = "excluir";
    btnDel.href = "#";
    btnDel.onclick = (e) => {
      e.preventDefault();
      confirmarExclusao(a.id);
    };

    tdAcoes.append(btnEdit, btnDel);
    tr.appendChild(tdAcoes);
    tbody.appendChild(tr);
  });

  atualizarCards();
}

function atualizarCards() {
  document.getElementById("total").innerText = aeronaves.length;
  document.getElementById("manutencao").innerText = aeronaves.filter(
    (a) => a.status === "Em Manutenção"
  ).length;

  const hoje = new Date();
  document.getElementById("validos").innerText = aeronaves.filter(
    (a) => new Date(a.validade + "T00:00:00") >= hoje
  ).length;

  document.getElementById("vencendo").innerText = aeronaves.filter((a) => {
    const diff =
      (new Date(a.validade + "T00:00:00") - hoje) / (1000 * 60 * 60 * 24);
    return diff >= -1 && diff <= 30;
  }).length;
}

// ====================================================
//  6. MODAL E FORMULÁRIO
// ====================================================

function abrirModal(aeronave = null) {
  form.reset();
  if (aeronave) {
    tituloModal.innerText = "Editar Aeronave";
    document.getElementById("matricula").value = aeronave.matricula;
    document.getElementById("modelo").value = aeronave.modelo;
    document.getElementById("status").value = aeronave.status;
    document.getElementById("cva").value = aeronave.cva;
    document.getElementById("validade").value = aeronave.validade;
    document.getElementById("indice").value = aeronave.id;
  } else {
    tituloModal.innerText = "Adicionar Aeronave";
    document.getElementById("indice").value = "-1";
  }

  modal.style.display = "flex";
  setTimeout(() => {
    modal.classList.add("show");
  }, 10);
}

fecharModalBtn.onclick = function () {
  modal.style.display = "none";
  modal.classList.remove("show");
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
    modal.classList.remove("show");
  }
};

form.onsubmit = async function (event) {
  event.preventDefault();
  const id = document.getElementById("indice").value;

  const aeronave = {
    matricula: document.getElementById("matricula").value.trim().toUpperCase(),
    modelo: document.getElementById("modelo").value.trim(),
    status: document.getElementById("status").value,
    cva: document.getElementById("cva").value.trim(),
    validade: document.getElementById("validade").value,
  };

  await salvarAeronave(aeronave, id === "-1" ? null : id);
};

if (btnAdicionar) {
  btnAdicionar.addEventListener("click", () => abrirModal(null));
}

carregarDados();
