// ====================================================
//  1. IMPORTS E CONFIGURAÇÃO
// ====================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// ----------------------------------------------------
//  CONFIG. DO FIREBASE
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
//  2. ESTADO E ELEMENTOS
// ====================================================
let dadosCompletos = []; // Guarda tudo pra não ir no banco toda hora
const tbody = document.getElementById("tbodyRelatorio");
const filtroSelect = document.getElementById("filtroRelatorio");
const dataGeracao = document.getElementById("dataGeracao");

// ====================================================
//  3. LÓGICA DE DADOS
// ====================================================

async function carregarRelatorio() {
  tbody.innerHTML =
    '<tr><td colspan="5" style="text-align:center; padding: 20px;">Carregando dados...</td></tr>';

  const agora = new Date();
  dataGeracao.innerText = `Gerado em: ${agora.toLocaleString("pt-BR")}`;

  try {
    const snapshot = await getDocs(dbCollection);
    dadosCompletos = [];
    snapshot.forEach((doc) => dadosCompletos.push(doc.data()));

    aplicarFiltro();
  } catch (error) {
    console.error("Erro:", error);
    tbody.innerHTML =
      '<tr><td colspan="5" style="color:red; text-align:center;">Erro ao carregar dados.</td></tr>';
  }
}

function aplicarFiltro() {
  const tipo = filtroSelect.value;
  const hoje = new Date();

  let dadosFiltrados = dadosCompletos;

  if (tipo === "vencidos") {
    dadosFiltrados = dadosCompletos.filter((a) => {
      const validade = new Date(a.validade);
      const diff = (validade - hoje) / (1000 * 60 * 60 * 24);
      return diff <= 30;
    });
  } else if (tipo === "manutencao") {
    dadosFiltrados = dadosCompletos.filter(
      (a) => a.status === "Em Manutenção" || a.status === "Aguardando Peças"
    );
  } else if (tipo === "disponivel") {
    dadosFiltrados = dadosCompletos.filter(
      (a) => a.status === "Finalizada" || a.status === "Inspeção"
    );
  }

  renderizarTabela(dadosFiltrados);
}

function renderizarTabela(lista) {
  tbody.innerHTML = "";

  if (lista.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align:center; padding: 20px;">Nenhum registro encontrado para este filtro.</td></tr>';
    return;
  }

  lista.sort((a, b) => new Date(a.validade) - new Date(b.validade));

  lista.forEach((a) => {
    const tr = document.createElement("tr");

    const partes = a.validade.split("-");
    const dataBR = `${partes[2]}/${partes[1]}/${partes[0]}`;

    const validadeDate = new Date(a.validade);
    const hoje = new Date();
    const isVencido = validadeDate < hoje;

    const statusStyle = isVencido ? "font-weight:bold; color:#ef4444;" : "";

    tr.innerHTML = `
            <td><strong>${a.matricula}</strong></td>
            <td>${a.modelo}</td>
            <td>${a.status}</td>
            <td>${a.cva}</td>
            <td style="${statusStyle}">${dataBR} ${
      isVencido ? "(VENCIDO)" : ""
    }</td>
        `;
    tbody.appendChild(tr);
  });
}

// ====================================================
//  4. EVENTOS
// ====================================================

filtroSelect.addEventListener("change", aplicarFiltro);

document.getElementById("btnImprimir").addEventListener("click", () => {
  window.print();
});

carregarRelatorio();
