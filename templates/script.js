async function carregarCSV(url) {
  const resposta = await fetch(url);
  const texto = await resposta.text();
  const linhas = texto.split("\n").map(l => l.split(","));
  const cabecalho = linhas[0].map(c => c.trim());
  const dados = linhas.slice(1).filter(l => l.length === cabecalho.length);
  return dados.map(linha => {
    let obj = {};
    cabecalho.forEach((col, i) => obj[col] = linha[i]);
    return obj;
  });
}

async function carregarGraficos() {
  const localFiltro = document.getElementById("filtroLocal").value.toLowerCase();
  const eventoFiltro = document.getElementById("filtroEvento").value.toLowerCase();

  const dados = await carregarCSV("dados.csv");

  // Aplica filtros simples
  const filtrados = dados.filter(d =>
    (!localFiltro || d.Local?.toLowerCase().includes(localFiltro)) &&
    (!eventoFiltro || d.Evento?.toLowerCase().includes(eventoFiltro))
  );

  // Agrupamentos por colunas
  function agruparPor(coluna) {
    const contagem = {};
    filtrados.forEach(l => {
      const chave = l[coluna] || "Não informado";
      contagem[chave] = (contagem[chave] || 0) + 1;
    });
    return {
      labels: Object.keys(contagem),
      valores: Object.values(contagem)
    };
  }

  // Gera gráficos
  criarGrafico('grafico1', 'bar', 'Ocorrências por Local', agruparPor('Local'));
  criarGrafico('grafico2', 'pie', 'Distribuição por Evento', agruparPor('Evento'));
  criarGrafico('grafico3', 'doughnut', 'Intensidade das Chuvas', agruparPor('Intensidade'));
  criarGrafico('grafico4', 'line', 'Evolução Temporal', agruparPor('Data'));
}

function criarGrafico(id, tipo, titulo, dados) {
  const ctx = document.getElementById(id).getContext('2d');
  if (window[id]) window[id].destroy();
  window[id] = new Chart(ctx, {
    type: tipo,
    data: {
      labels: dados.labels,
      datasets: [{
        label: titulo,
        data: dados.valores,
        backgroundColor: [
          "#4ab1ff", "#61ff85", "#ffb347", "#ff6384", "#c56fff", "#47ffe3"
        ],
        borderColor: "#222",
        borderWidth: 1
      }]
    },
    options: {
      plugins: { legend: { labels: { color: "#ddd" } } },
      scales: {
        x: { ticks: { color: "#ccc" } },
        y: { ticks: { color: "#ccc" } }
      }
    }
  });
}

window.onload = carregarGraficos;
