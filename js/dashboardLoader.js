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
//  2. LÓGICA DE PROCESSAMENTO DE DADOS
// ====================================================

async function carregarDashboard() {
  try {
    const snapshot = await getDocs(dbCollection);
    const aeronaves = [];
    snapshot.forEach((doc) => aeronaves.push(doc.data()));

    // 1. Atualizar KPIs (Cards do Topo)
    atualizarKPIs(aeronaves);

    // 2. Gerar Gráficos
    gerarGraficoStatus(aeronaves);
    gerarGraficoModelos(aeronaves);
    gerarGraficoVencimentos(aeronaves);
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);
  }
}

function atualizarKPIs(dados) {
  document.getElementById("dash-total").innerText = dados.length;

  const disponiveis = dados.filter((a) => a.status === "Finalizada").length;
  document.getElementById("dash-disponivel").innerText = disponiveis;

  const hoje = new Date();
  const criticas = dados.filter((a) => {
    const validade = new Date(a.validade);
    const diff = (validade - hoje) / (1000 * 60 * 60 * 24);
    return diff <= 30;
  }).length;
  document.getElementById("dash-critical").innerText = criticas;
}

// ====================================================
//  3. CONFIGURAÇÃO DOS GRÁFICOS (CHART.JS)
// ====================================================

const colors = {
  primary: "#D67A35",
  success: "#10b981",
  warning: "#f59e0b",
  info: "#3b82f6",
  danger: "#ef4444",
  secondary: "#2B2930",
};

function gerarGraficoStatus(dados) {
  const ctx = document.getElementById("graficoStatus").getContext("2d");

  const contagem = {
    "Em Manutenção": 0,
    "Aguardando Peças": 0,
    Inspeção: 0,
    Finalizada: 0,
  };

  dados.forEach((a) => {
    if (contagem[a.status] !== undefined) contagem[a.status]++;
  });

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(contagem),
      datasets: [
        {
          data: Object.values(contagem),
          backgroundColor: [
            colors.primary,
            colors.warning,
            colors.info,
            colors.success,
          ],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });
}

function gerarGraficoModelos(dados) {
  const ctx = document.getElementById("graficoModelos").getContext("2d");

  const modelos = {};
  dados.forEach((a) => {
    modelos[a.modelo] = (modelos[a.modelo] || 0) + 1;
  });

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(modelos),
      datasets: [
        {
          label: "Qtd. Aeronaves",
          data: Object.values(modelos),
          backgroundColor: colors.secondary,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
      },
      plugins: {
        legend: { display: false },
      },
    },
  });
}

function gerarGraficoVencimentos(dados) {
  const ctx = document.getElementById("graficoVencimentos").getContext("2d");

  const meses = {};
  const hoje = new Date();

  const labelsMeses = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    const nomeMes = d.toLocaleDateString("pt-BR", {
      month: "short",
      year: "2-digit",
    });
    labelsMeses.push(nomeMes);
    meses[nomeMes] = 0;
  }

  dados.forEach((a) => {
    const dataVal = new Date(a.validade);
    const nomeMes = dataVal.toLocaleDateString("pt-BR", {
      month: "short",
      year: "2-digit",
    });

    if (meses.hasOwnProperty(nomeMes)) {
      meses[nomeMes]++;
    }
  });

  new Chart(ctx, {
    type: "line",
    data: {
      labels: labelsMeses,
      datasets: [
        {
          label: "Vencimentos Previstos",
          data: Object.values(meses),
          borderColor: colors.danger,
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
      },
    },
  });
}

carregarDashboard();
