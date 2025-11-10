// 🔗 Conectando à planilha Google Sheets
const SHEET_ID = "1NfzrLVc_MoepVM3021fRWOis-fuwJBq9ocqA0u2sEDQ";
const SHEET_NAME = "dados";
const API_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;

// 🔹 Elementos HTML
const filtroLocal = document.getElementById("filtroLocal");
const filtroEvento = document.getElementById("filtroEvento");
const filtroData = document.getElementById("filtroData");

let dadosPlanilha = [];

// 🔹 Carregar dados da planilha
async function carregarDados() {
  try {
    const response = await fetch(API_URL);
    const csvText = await response.text();

    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        dadosPlanilha = results.data;
        preencherFiltros(dadosPlanilha);
        gerarGraficos(dadosPlanilha);
      },
    });
  } catch (erro) {
    console.error("Erro ao carregar planilha:", erro);
  }
}

// 🔹 Preencher os filtros com valores únicos
function preencherFiltros(dados) {
  const bairros = [...new Set(dados.map(l => l.bairro).filter(Boolean))];
  const eventos = [...new Set(dados.map(l => l.tipo_evento).filter(Boolean))];
  const datas = [...new Set(dados.map(l => l.data_evento).filter(Boolean))];

  preencherSelect(filtroLocal, bairros);
  preencherSelect(filtroEvento, eventos);
  preencherSelect(filtroData, datas);
}

function preencherSelect(select, valores) {
  select.innerHTML = `<option value="">Todos</option>`;
  valores.forEach(valor => {
    const option = document.createElement("option");
    option.value = valor;
    option.textContent = valor;
    select.appendChild(option);
  });
}

// 🔹 Aplicar filtros
function aplicarFiltros() {
  const local = filtroLocal.value;
  const evento = filtroEvento.value;
  const data = filtroData.value;

  const filtrados = dadosPlanilha.filter(linha => {
    return (
      (local === "" || linha.bairro === local) &&
      (evento === "" || linha.tipo_evento === evento) &&
      (data === "" || linha.data_evento === data)
    );
  });

  gerarGraficos(filtrados);
}

// 🔹 Gerar gráficos
function gerarGraficos(dados) {
  // Limpa gráficos anteriores
  document.querySelectorAll("canvas").forEach(c => {
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
  });

  if (dados.length === 0) return;

  // Exemplo 1: Quantidade por tipo de evento
  const porTipo = agruparContagem(dados, "tipo_evento");
  criarGrafico("grafico1", "Eventos por Tipo", porTipo);

  // Exemplo 2: Quantidade por bairro
  const porBairro = agruparContagem(dados, "bairro");
  criarGrafico("grafico2", "Eventos por Bairro", porBairro);

  // Exemplo 3: Intensidade de evento
  const porIntensidade = agruparContagem(dados, "intensidade_evento");
  criarGrafico("grafico3", "Eventos por Intensidade", porIntensidade);
}

// 🔹 Função de contagem agrupada
function agruparContagem(dados, coluna) {
  return dados.reduce((acc, linha) => {
    acc[linha[coluna]] = (acc[linha[coluna]] || 0) + 1;
    return acc;
  }, {});
}

// 🔹 Criar gráfico
function criarGrafico(idCanvas, titulo, dados) {
  const ctx = document.getElementById(idCanvas).getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(dados),
      datasets: [{
        label: titulo,
        data: Object.values(dados),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false }, title: { display: true, text: titulo } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

// 🔹 Inicializa
carregarDados();

