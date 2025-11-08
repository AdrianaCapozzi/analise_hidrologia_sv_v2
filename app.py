from flask import Flask, render_template
import pandas as pd
import plotly.express as px
import plotly.io as pio

app = Flask(__name__)

# Caminho do arquivo Excel (deixe na mesma pasta)
EXCEL_PATH = "dados.xlsx"

@app.route('/')
def index():
    # Lê a planilha
    df = pd.read_excel(EXCEL_PATH)

    # Exemplo: garante que as colunas existam
    # Ajuste os nomes abaixo conforme sua planilha
    col_area = 'Área'
    col_data = 'Data'
    col_responsavel = 'Responsável'

    # Gráfico 1: quantidade de solicitações por área
    grafico_area = px.pie(df, names=col_area, title="Solicitações por Área")
    grafico_area_html = pio.to_html(grafico_area, full_html=False)

    # Gráfico 2: solicitações por data
    df[col_data] = pd.to_datetime(df[col_data])
    grafico_data = px.bar(df.groupby(df[col_data].dt.date).size().reset_index(name='Quantidade'),
                          x=col_data, y='Quantidade', title="Solicitações por Data")
    grafico_data_html = pio.to_html(grafico_data, full_html=False)

    # Gráfico 3: atendimentos por responsável
    grafico_resp = px.bar(df[col_responsavel].value_counts().reset_index(),
                          x='index', y=col_responsavel, title="Atendimentos por Responsável")
    grafico_resp_html = pio.to_html(grafico_resp, full_html=False)

    return render_template('index.html',
                           grafico_area=grafico_area_html,
                           grafico_data=grafico_data_html,
                           grafico_resp=grafico_resp_html)

if __name__ == '__main__':
    app.run(debug=True)
