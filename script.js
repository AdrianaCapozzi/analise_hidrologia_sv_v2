// Configuração da planilha Google Sheets
const SHEET_ID = "1NfzrLVc_MoepVM3021fRWOis-fuwJBq9ocqA0u2sEDQ";
const SHEET_NAME = "dados";
const API_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;

// Função principal
async function carregarGraficos() {
  const response = await fetch(API_URL);
  const csvData = await response.text();

  // Parse do CSV
  const data = Papa.parse(csvData, { header: true }).data;

  // Filtros
  const filtroLocal = document.getElementById("filtroLocal").value.toLowerCase();
  const filtroEvento = document.getElementById("filtroEvento").value.toLowerCase();

  const dadosFiltrados = data.filter(row =>
    (!filtroLocal || row.municipio?.toLowerCase().includes(filtroLocal) || row.bairro?.toLowerCase().includes(filtroLocal)) &&
    (!filtroEvento || row.tipo_evento?.toLowerCase().includes(filtroEvento))
  );

  // --- 1️⃣ Pizza: tipo_evento x intensidade_evento ---
  const tipoEventoLabels = [...new Set(dadosFiltrados.map(d => d.tipo_evento))];
  const intensidadeContagem = tipoEventoLabels.map(tipo =>
    dadosFiltrados.filter(d => d.tipo_evento === tipo).length
  );
  criarGraficoPizza("grafico1", tipoEventoLabels, intensidadeContagem, "Tipo de Evento x Quantidade");

  // --- 2️⃣ Barras: média duração_horas por tipo_evento ---
  const duracaoPorTipo = tipoEventoLabels.map(tipo => {
    const eventos = dadosFiltrados.filter(d => d.tipo_evento === tipo);
    const media = eventos.reduce((acc, d) => acc + parseFloat(d.duracao_horas || 0), 0) / eventos.length;
    return media.toFixed(1);
  });
  criarGraficoBarras("grafico2", tipoEventoLabels, duracaoPorTipo, "Média de duração (h) por Tipo de Evento");

  // --- 3️⃣ Barras: umidade_relativa x tipo_evento ---
  const umidadeMedia = tipoEventoLabels.map(tipo => {
    const eventos = dadosFiltrados.filter(d => d.tipo_evento === tipo);
    const media = eventos.reduce((acc, d) => acc + parseFloat(d.umidade_relativa || 0), 0) / eventos.length;
    return media.toFixed(1);
  });
  criarGraficoBarras("grafico3", tipoEventoLabels, umidadeMedia, "Umidade Relativa Média x Tipo de Evento");

  // --- 4️⃣ Linha temporal: tipo_evento x data_evento ---
  const eventosOrdenados = dadosFiltrados.sort((a, b) => new Date(a.data_evento) - new Date(b.data_evento));
  const datas = eventosOrdenados.map(d => d.data_evento);
  const tipos = eventosOrdenados.map(d => d.tipo_evento);
  criarGraficoLinha("grafico4", datas, tipos, "Ocorrência Temporal de Eventos");

  // --- 5️⃣ Colunas: área_afetada_m2 x evento ---
  const areaLabels = dadosFiltrados.map(d => d.tipo_evento);
  const areaValores = dadosFiltrados.map(d => parseFloat(d.area_afetada_m2 || 0));
  criarGraficoBarras("grafico5", areaLabels, areaValores, "Área Afetada (m²) por Evento");

  // --- 6️⃣ Barras: nível_alerta x tipo_evento ---
  const alertaLabels = [...new Set(dadosFiltrados.map(d => d.nivel_alerta))];
  const alertaCount = alertaLabels.map(alerta =>
    dadosFiltrados.filter(d => d.nivel_alerta === alerta).length
  );
  criarGraficoBarras("grafico6", alertaLabels, alertaCount, "Nível de Alerta x Tipo de Evento");

  // --- 7️⃣ Barras: % de habitantes atingidos ---
  const populacaoTotal = 1867558;
  const porMunicipio = {};
  dadosFiltrados.forEach(d => {
    const mun = d.municipio;
    const afetados = parseInt(d.populacao_afetada || 0);
    porMunicipio[mun] = (porMunicipio[mun] || 0) + afetados;
  });
  const municipios = Object.keys(porMunicipio);
  const percentuais = Object.values(porMunicipio).map(v => ((v / populacaoTotal) * 100).toFixed(3));
  criarGraficoBarras("grafico7", municipios, percentuais, "% População Atingida por Município");

  // --- 8️⃣ Pizza: órgão responsável x status_atendimento ---
  const orgaos = [...new Set(dadosFiltrados.map(d => d.orgao_responsavel))];
  const statusCount = orgaos.map(org =>
    dadosFiltrados.filter(d => d.orgao_responsavel === org).length
  );
  criarGraficoPizza("grafico8", orgaos, statusCount, "Órgão Responsável x Ocorrências");

  // --- 9️⃣ Barras: custo estimado médio x evento ---
  const custoMedio = tipoEventoLabels.map(tipo => {
    const eventos = dadosFiltrados.filter(d => d.tipo_evento === tipo);
    const media = eventos.reduce((acc, d) => acc + parseFloat(d.custo_estimado_reais || 0), 0) / eventos.length;
    return media.toFixed(0);
  });
  criarGraficoBarras("grafico9", tipoEventoLabels, custoMedio, "Custo Estimado Médio (R$) por Evento");

  // --- 🔟 Linha: evento x precipitação_mare ---
  const mareLabels = dadosFiltrados.map(d => d.tipo_evento);
  const mareValores = dadosFiltrados.map(d => parseFloat(d.precipitacao_mm || 0));
  criarGraficoLinha("grafico10", mareLabels, mareValores, "Precipitação (mm) por Evento");
}

// Funções de criação de gráficos
function criarGraficoPizza(id, labels, data, titulo) {
  new Chart(document.getElementById(id), {
    type: "pie",
    data: { labels, datasets: [{ data }] },
    options: { plugins: { title: { display: true, text: titulo } } }
  });
}

function criarGraficoBarras(id, labels, data, titulo) {
  new Chart(document.getElementById(id), {
    type: "bar",
    data: { labels, datasets: [{ data }] },
    options: { plugins: { title: { display: true, text: titulo } } }
  });
}

function criarGraficoLinha(id, labels, data, titulo) {
  new Chart(document.getElementById(id), {
    type: "line",
    data: { labels, datasets: [{ data }] },
    options: { plugins: { title: { display: true, text: titulo } } }
  });
}

// Carrega automaticamente ao abrir
window.onload = carregarGraficos;
