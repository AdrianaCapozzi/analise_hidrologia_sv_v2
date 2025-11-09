document.addEventListener("DOMContentLoaded", async () => {
  const url = "Fakers_SQL_Dash.csv";
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);
  const workbook = XLSX.read(data, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  inicializarFiltros(jsonData);
  gerarGraficos(jsonData);

  document.getElementById("btnFiltrar").addEventListener("click", () => {
    const filtrado = aplicarFiltros(jsonData);
    gerarGraficos(filtrado);
  });
});

function inicializarFiltros(dados) {
  preencherSelect("filtroEvento", [...new Set(dados.map(d => d.Evento))]);
  preencherSelect("filtroLocal", [...new Set(dados.map(d => d.Local))]);
  preencherSelect("filtroIntensidade", [...new Set(dados.map(d => d.Intensidade))]);
}

function preencherSelect(id, valores) {
  const select = document.getElementById(id);
  select.innerHTML = '<option value="">Todos</option>';
  valores.forEach(v => select.innerHTML += `<option value="${v}">${v}</option>`);
}

function aplicarFiltros(dados) {
  const data = document.getElementById("filtroData").value;
  const evento = document.getElementById("filtroEvento").value;
  const local = document.getElementById("filtroLocal").value;
  const intensidade = document.getElementById("filtroIntensidade").value;

  return dados.filter(d => 
    (!data || new Date(d.Data).toISOString().split('T')[0] === data) &&
    (!evento || d.Evento === evento) &&
    (!local || d.Local === local) &&
    (!intensidade || d.Intensidade === intensidade)
  );
}

function gerarGraficos(dados) {
  document.querySelectorAll("canvas").forEach(c => c.getContext("2d").clearRect(0,0,c.width,c.height));

  const ctx = id => document.getElementById(id).getContext("2d");
  
  const eventos = contarPorCampo(dados, "Evento");
  const locais = contarPorCampo(dados, "Local");
  const intensidade = contarPorCampo(dados, "Intensidade");

  new Chart(ctx("grafico1"), criarGrafico("bar", "Eventos por Local", locais));
  new Chart(ctx("grafico2"), criarGrafico("pie", "Distribuição por Intensidade", intensidade));
  new Chart(ctx("grafico3"), criarGrafico("line", "Tendência de Eventos", eventos));
  new Chart(ctx("grafico4"), criarGrafico("bar", "Eventos por Intensidade", intensidade));
  new Chart(ctx("grafico5"), criarGrafico("doughnut", "Proporção de Locais", locais));
  new Chart(ctx("grafico6"), criarGrafico("bar", "Correlação Local × Intensidade", locais));
  new Chart(ctx("grafico7"), criarGrafico("line", "Evolução Temporal", eventos));
  new Chart(ctx("grafico8"), criarGrafico("bar", "Frequência de Ocorrências", eventos));
}

function contarPorCampo(dados, campo) {
  const contagem = {};
  dados.forEach(d => contagem[d[campo]] = (contagem[d[campo]] || 0) + 1);
  return contagem;
}

function criarGrafico(tipo, titulo, dados) {
  return {
    type: tipo,
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
      plugins: { title: { display: true, text: titulo } }
    }
  };
}
// TESTE DE LEITURA DO EXCEL
(async () => {
  try {
    const url = "Fakers_SQL_Dash.csv";
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erro ao baixar arquivo: " + response.status);
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    console.log("✅ Planilha lida com sucesso! Primeiras linhas:", jsonData.slice(0, 5));
  } catch (erro) {
    console.error("❌ Erro ao ler o Excel:", erro);
  }
})();
