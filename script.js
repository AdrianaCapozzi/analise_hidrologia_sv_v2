a// URL do CSV hospedado no GitHub Pages
const CSV_URL = "https://adrianacapozzi.github.io/analise_hidrologia_sv_v2/dados.csv";

let dados = [];

function carregarCSV() {
  Papa.parse(CSV_URL, {
    download: true,
    header: true,
    complete: function(results) {
      dados = results.data;
      carregarGraficos();
    }
  });
}

function carregarGraficos() {
  const filtroLocal = document.getElementById('filtroLocal').value.toLowerCase();
  const filtroEvento = document.getElementById('filtroEvento').value.toLowerCase();

  const filtrados = dados.filter(d =>
    (!filtroLocal || (d.Local && d.Local.toLowerCase().includes(filtroLocal))) &&
    (!filtroEvento || (d.Evento && d.Evento.toLowerCase().includes(filtroEvento)))
  );

  gerarGraficos(filtrados);
}

function gerarGraficos(data) {
  const ctx1 = document.getElementById('grafico1');
  const ctx2 = document.getElementById('grafico2');
  const ctx3 = document.getElementById('grafico3');
  const ctx4 = document.getElementById('grafico4');

  const porLocal = agrupar(data, 'Local', 'Intensidade');
  const porEvento = agrupar(data, 'Evento', 'Intensidade');
  const porTecnico = agrupar(data, 'Responsavel', 'Intensidade');
  const porData = agrupar(data, 'Data', 'Intensidade');

  new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: Object.keys(porLocal),
      datasets: [{ label: 'Intensidade por Local', data: Object.values(porLocal), backgroundColor: '#00bfff' }]
    }
  });

  new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: Object.keys(porEvento),
      datasets: [{ label: 'Eventos', data: Object.values(porEvento) }]
    }
  });

  new Chart(ctx3, {
    type: 'bar',
    data: {
      labels: Object.keys(porTecnico),
      datasets: [{ label: 'Atendimentos por Responsável', data: Object.values(porTecnico), backgroundColor: '#32cd32' }]
    }
  });

  new Chart(ctx4, {
    type: 'line',
    data: {
      labels: Object.keys(porData),
      datasets: [{ label: 'Intensidade ao longo do tempo', data: Object.values(porData), borderColor: '#ffcc00' }]
    }
  });
}

function agrupar(data, chave, valor) {
  return data.reduce((acc, item) => {
    if (item[chave] && item[valor]) {
      acc[item[chave]] = (acc[item[chave]] || 0) + parseFloat(item[valor]);
    }
    return acc;
  }, {});
}

// Gera os gráficos automaticamente ao carregar a página
carregarCSV();
