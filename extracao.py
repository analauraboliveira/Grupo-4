from urllib.parse import quote_plus
from sqlalchemy import create_engine, text
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# --- CREDENCIAIS (Preencha com os dados da imagem) ---
SERVIDOR = "database-visagio-talentos-2026-4.c3qiaao441if.us-east-1.rds.amazonaws.com"
PORTA = "5432"
BANCO = "visagio_talentos"
USUARIO = "talento_4"
SENHA = "mRaiKvD3xdkRoK" 

SCHEMA = "talentos_4"
TABELAS = ["chamados", "historico_status"]

def montar_url() -> str:
    return (
        f"postgresql+psycopg2://{quote_plus(USUARIO)}:{quote_plus(SENHA)}"
        f"@{SERVIDOR}:{PORTA}/{BANCO}"
    )

def rodar_analise_sla(engine):
    print("\nIniciando análise de SLA...")
    
    # Query ajustada para PostgreSQL (uso de ::timestamp e EXTRACT EPOCH)
    query_sla = text(f"""
    WITH StatusIntervals AS (
        SELECT 
            h.chamado_id,
            c.prioridade,
            c.categoria,
            h.status_anterior,
            h.status_novo,
            -- Usamos diretamente a coluna alterado_em que já é timestamp
            h.alterado_em as momento_evento,
            LEAD(h.alterado_em) 
                OVER (PARTITION BY h.chamado_id ORDER BY h.alterado_em) as proximo_evento
        FROM "{SCHEMA}"."{TABELAS[1]}" h
        JOIN "{SCHEMA}"."{TABELAS[0]}" c ON h.chamado_id = c.id
    )
    SELECT 
        chamado_id,
        prioridade,
        categoria,
        status_novo as status_durante_intervalo,
        -- Cálculo de diferença de tempo em horas
        EXTRACT(EPOCH FROM (proximo_evento - momento_evento)) / 3600.0 as duracao_horas
    FROM StatusIntervals
    WHERE proximo_evento IS NOT NULL
    """)

    # Uso do 'with engine.connect()' resolve o erro de immutabledict
    with engine.connect() as conn:
        df_historico = pd.read_sql(query_sla, conn)

    if df_historico.empty:
        print("Aviso: Nenhum dado de histórico encontrado para processar.")
        return None

    # --- PROCESSAMENTO DE DADOS ---
    status_pausa = ['Pausado', 'Aguardando Cliente', 'Pendente Terceiro']
    
    # Cálculo do SLA Líquido (Removendo tempos de pausa)
    sla_resumo = df_historico.groupby(['chamado_id', 'prioridade']).apply(
        lambda x: pd.Series({
            'tempo_total': x['duracao_horas'].sum(),
            'tempo_liquido': x[~x['status_durante_intervalo'].isin(status_pausa)]['duracao_horas'].sum()
        }),
        include_groups=False
    ).reset_index()

    # Metas de SLA (Ajuste conforme sua necessidade)
    metas = {'Alta': 4, 'Media': 12, 'Baixa': 24}
    sla_resumo['meta_horas'] = sla_resumo['prioridade'].map(metas)
    sla_resumo['dentro_sla'] = sla_resumo['tempo_liquido'] <= sla_resumo['meta_horas']

    # --- MAPEAMENTO GRÁFICO ---
    plt.figure(figsize=(14, 6))
    sns.set_theme(style="whitegrid")

    # Gráfico 1: Boxplot de tempo líquido
    plt.subplot(1, 2, 1)
    sns.boxplot(data=sla_resumo, x='prioridade', y='tempo_liquido', hue='prioridade', palette='viridis', legend=False)
    plt.title('Distribuição de Tempo Líquido (Horas)')
    plt.ylabel('Horas Trabalhadas')

    # Gráfico 2: Taxa de Sucesso (%)
    plt.subplot(1, 2, 2)
    taxa_sucesso = sla_resumo.groupby('prioridade')['dentro_sla'].mean() * 100
    colors = ['#e74c3c' if x < 80 else '#2ecc71' for x in taxa_sucesso]
    taxa_sucesso.plot(kind='bar', color=colors)
    plt.axhline(80, color='grey', linestyle='--', label='Meta 80%')
    plt.title('% de Cumprimento do SLA')
    plt.ylabel('% de Sucesso')
    plt.ylim(0, 110)

    plt.tight_layout()
    plt.savefig('analise_sla_chamados.png')
    print("Gráfico 'analise_sla_chamados.png' gerado com sucesso.")
    
    return sla_resumo
def main():
    # 1. Conectar ao banco
    engine = create_engine(montar_url())
    
    # 2. Definir a Query (Vamos começar pegando tudo da tabela chamados)
    query = text(f'SELECT * FROM "{SCHEMA}"."{TABELAS[0]}"')
    
    # 3. Extrair os dados usando o Pandas (Mais rápido para análise)
    try:
        df = pd.read_sql(query, engine)
        
        # 4. Ver os dados
        print("--- Primeiras 5 linhas do Banco ---")
        print(df.head())
        
        # 5. Salvar em um CSV (Opcional, mas útil para o hackathon)
        df.to_csv("dados_extraidos.csv", index=False)
        print("\nSucesso! Arquivo 'dados_extraidos.csv' gerado.")
        # 6. Rodar a análise de SLA
        df_sla = rodar_analise_sla(engine)
        print(df_sla.head())
        
    except Exception as e:
        print(f"Erro ao conectar ou extrair: {e}")

if __name__ == "__main__":
    main()