import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sqlalchemy import create_engine, text
from urllib.parse import quote_plus
import unicodedata

# --- 1. CONFIGURAÇÕES E CREDENCIAIS ---
SERVIDOR = "database-visagio-talentos-2026-4.c3qiaao441if.us-east-1.rds.amazonaws.com"
PORTA = "5432"
BANCO = "visagio_talentos"
USUARIO = "talento_4"
SENHA = "mRaiKvD3xdkRoK"  # <--- Coloque sua senha real aqui
SCHEMA = "talentos_4"         # O padrão do Postgres é 'public'

def remover_acentos(texto):
    if not isinstance(texto, str):
        return texto
    # Normaliza a string para decompor caracteres acentuados (ex: 'ã' vira 'a' + '~')
    nfkd_form = unicodedata.normalize('NFKD', texto)
    # Filtra apenas caracteres que não são marcas de acentuação
    return "".join([c for c in nfkd_form if not unicodedata.combining(c)])

def montar_url() -> str:
    # O strip() remove espaços acidentais que podem causar o erro de 'host name'
    return (
        f"postgresql+psycopg2://{quote_plus(USUARIO)}:{quote_plus(SENHA)}"
        f"@{SERVIDOR.strip()}:{PORTA}/{quote_plus(BANCO)}"
    )

# --- 2. FUNÇÕES DE ANÁLISE ---


def gerar_grafico_chamados_por_dia(engine):
    print("Extraindo dados para o gráfico...")
    
    # Adicionado o SCHEMA (public) e aspas duplas para evitar erros de sintaxe
    query = text(f"""
        SELECT DATE("data_abertura") as data, COUNT(*) as total
        FROM "{SCHEMA}"."chamados"
        WHERE "data_abertura" >= CURRENT_DATE - INTERVAL '1 month'
        GROUP BY DATE("data_abertura")
        ORDER BY data;
    """)
    
    try:
        df = pd.read_sql(query, engine)
        
        if df.empty:
            print("A consulta não retornou dados. Verifique se a tabela tem registros.")
            return

        df['data'] = pd.to_datetime(df['data'])

        # Criar o gráfico
        plt.figure(figsize=(12, 6))
        sns.set_theme(style="whitegrid") # Deixa o gráfico mais bonito
        
        sns.lineplot(data=df, x='data', y='total', marker='o', color='teal', linewidth=2.5)
        
        plt.title('Volume Total de Chamados por Dia', fontsize=14, fontweight='bold')
        plt.xlabel('Data de Abertura', fontsize=12)
        plt.ylabel('Quantidade de Chamados', fontsize=12)
        plt.xticks(rotation=45)
        plt.tight_layout()
        
        print("Exibindo gráfico...")
        plt.show()

    except Exception as e:
        print(f"Erro específico na análise: {e}")


def gerar_grafico_chamados_por_semana(engine):
    print("Extraindo dados das últimas semanas (3 meses)...")
    
    # DATE_TRUNC('week', ...) agrupa tudo na segunda-feira daquela semana
    query = text(f"""
        SELECT 
            DATE_TRUNC('week', "data_abertura") as semana, 
            COUNT(*) as total
        FROM "{SCHEMA}"."chamados"
        WHERE "data_abertura" >= CURRENT_DATE - INTERVAL '3 months'
        GROUP BY semana
        ORDER BY semana;
    """)
    
    try:
        df = pd.read_sql(query, engine)
        
        if df.empty:
            print("Nenhum dado encontrado para os últimos 3 meses.")
            return

        # Formatação da data para exibir "Semana de DD/MM" no gráfico
        df['semana_label'] = df['semana'].dt.strftime('%d/%m')

        plt.figure(figsize=(12, 6))
        sns.set_theme(style="whitegrid")
        
        # Gráfico de barras para destacar o volume semanal
        ax = sns.barplot(data=df, x='semana_label', y='total', color='darkorange')
        
        # Adiciona os números em cima das barras para facilitar a leitura no hackathon
        for p in ax.patches:
            ax.annotate(f'{int(p.get_height())}', 
                        (p.get_x() + p.get_width() / 2., p.get_height()), 
                        ha='center', va='baseline', fontsize=10, fontweight='bold', xytext=(0, 5),
                        textcoords='offset points')

        plt.title('Volume Semanal de Chamados (Últimos 3 Meses)', fontsize=14, fontweight='bold')
        plt.xlabel('Início da Semana (Segunda-feira)', fontsize=12)
        plt.ylabel('Total de Chamados', fontsize=12)
        plt.tight_layout()
        
        print("Exibindo gráfico semanal...")
        plt.show()

    except Exception as e:
        print(f"Erro na análise semanal: {e}")


def gerar_grafico_chamados_por_mes(engine):
    print("Extraindo dados mensais do último ano...")
    
    # DATE_TRUNC('month', ...) agrupa tudo no dia 1 de cada mês
    query = text(f"""
        SELECT 
            DATE_TRUNC('month', "data_abertura") as mes, 
            COUNT(*) as total
        FROM "{SCHEMA}"."chamados"
        WHERE "data_abertura" >= CURRENT_DATE - INTERVAL '1 year'
        GROUP BY mes
        ORDER BY mes;
    """)
    
    try:
        df = pd.read_sql(query, engine)
        
        if df.empty:
            print("Nenhum dado encontrado para o último ano.")
            return

        # Formatação para exibir "Jan/26", "Fev/26", etc.
        # %b traz o nome abreviado do mês e %y o ano
        df['mes_label'] = df['mes'].dt.strftime('%b/%y')

        plt.figure(figsize=(12, 6))
        sns.set_theme(style="whitegrid")
        
        # Gráfico de barras
        ax = sns.barplot(data=df, x='mes_label', y='total', color='darkblue')
        
        # Adiciona os valores acima das barras
        for p in ax.patches:
            ax.annotate(f'{int(p.get_height())}', 
                        (p.get_x() + p.get_width() / 2., p.get_height()), 
                        ha='center', va='baseline', fontsize=10, fontweight='bold', xytext=(0, 5),
                        textcoords='offset points')

        plt.title('Volume de Chamados por Mês (Último Ano)', fontsize=14, fontweight='bold')
        plt.xlabel('Mês/Ano', fontsize=12)
        plt.ylabel('Total de Chamados', fontsize=12)
        plt.tight_layout()
        
        print("Exibindo gráfico mensal...")
        plt.show()

    except Exception as e:
        print(f"Erro na análise mensal: {e}")


def analisar_medias_tempo(engine, periodo_label, intervalo_sql):
    print(f"\n--- Analisando Médias: {periodo_label} ---")
    
    # Query explicada:
    # 1. Calculamos a diferença total para todos (Atendimento)
    # 2. Usamos CASE para calcular a diferença apenas se for 'Resolvido' (Resolução)
    query = text(f"""
        SELECT 
            AVG("ultima_atualizacao" - "data_abertura") AS media_atendimento,
            AVG(CASE WHEN "status" = 'Resolvido' THEN ("ultima_atualizacao" - "data_abertura") END) AS media_resolucao
        FROM "{SCHEMA}"."chamados"
        WHERE "data_abertura" >= CURRENT_DATE - INTERVAL '{intervalo_sql}';
    """)
    
    try:
        with engine.connect() as conn:
            result = conn.execute(query).fetchone()
            
            # Formatando a saída para algo legível
            atendimento = result[0] if result[0] else "N/A"
            resolucao = result[1] if result[1] else "N/A"
            
            print(f"Tempo Médio de Atendimento: {atendimento}")
            print(f"Tempo Médio de Resolução:   {resolucao}")
            
    except Exception as e:
        print(f"Erro na análise de médias ({periodo_label}): {e}")


def analisar_taxa_reabertura(engine):
    print("\n--- Analisando Taxa de Reabertura ---")
    
    # Lógica: Contamos chamados onde o status_anterior era 'Resolvido' 
    # e o status_novo é qualquer um que indique retorno ao trabalho.
    query = text(f"""
        WITH ChamadosReabertos AS (
            SELECT DISTINCT "chamado_id"
            FROM "{SCHEMA}"."historico_status"
            WHERE "status_anterior" = 'Resolvido' 
              AND "status_novo" IN ('Aberto', 'Em Atendimento', 'Em progresso')
        )
        SELECT 
            (SELECT COUNT(*) FROM "{SCHEMA}"."chamados") as total_geral,
            (SELECT COUNT(*) FROM ChamadosReabertos) as total_reabertos
    """)
    
    try:
        with engine.connect() as conn:
            res = conn.execute(query).fetchone()
            total = res[0]
            reabertos = res[1]
            
            taxa = (reabertos / total * 100) if total > 0 else 0
            
            print(f"Total de Chamados Únicos: {total}")
            print(f"Total de Chamados que Reabriram: {reabertos}")
            print(f"Taxa de Reabertura: {taxa:.2f}%")
            
            # Insight para a apresentação
            if taxa > 10:
                print("Aviso: Taxa alta! Indica problemas na qualidade da resolução.")
            else:
                print("Taxa saudável: As resoluções parecem ser efetivas.")
                
    except Exception as e:
        print(f"Erro ao calcular reabertura: {e}")

def gerar_painel_distribuicao(engine):
    print("\n--- Gerando Painel de Distribuição (Limpeza de Acentos e Espaços) ---")
    
    query = text(f"""
        SELECT 
            TRIM(LOWER("categoria")) as categoria, 
            TRIM(LOWER("tipo")) as tipo, 
            TRIM("prioridade") as prioridade 
        FROM "{SCHEMA}"."chamados";
    """)
    
    try:
        df = pd.read_sql(query, engine)
        
        if df.empty:
            print("Banco vazio.")
            return

        # 1. Remove acentos de tudo no Python
        df['categoria'] = df['categoria'].apply(remover_acentos)
        df['tipo'] = df['tipo'].apply(remover_acentos)
        
        # 2. Padroniza a primeira letra maiúscula
        df['categoria'] = df['categoria'].str.capitalize()
        df['tipo'] = df['tipo'].str.capitalize()
        df['prioridade'] = df['prioridade'].str.strip().str.capitalize()

        # Visualização
        fig, axes = plt.subplots(1, 3, figsize=(20, 6))
        sns.set_theme(style="whitegrid")

        # Categoria
        sns.countplot(data=df, y='categoria', ax=axes[0], palette='viridis', 
                      order=df['categoria'].value_counts().index)
        axes[0].set_title('Categoria (Sem Acentos)', fontsize=14, fontweight='bold')

        # Tipo
        sns.countplot(data=df, x='tipo', ax=axes[1], palette='magma',
                      order=df['tipo'].value_counts().index)
        axes[1].set_title('Tipo (Sem Acentos)', fontsize=14, fontweight='bold')

        # Prioridade
        ordem_prio = ['Baixa', 'Media', 'Alta', 'Urgente'] # Note que tirei o acento de 'Média' aqui
        sns.countplot(data=df, x='prioridade', ax=axes[2], palette='Reds',
                      order=[p for p in ordem_prio if p in df['prioridade'].unique()])
        axes[2].set_title('Prioridade', fontsize=14, fontweight='bold')

        plt.tight_layout()
        plt.show()

    except Exception as e:
        print(f"Erro na limpeza definitiva: {e}")

def identificar_gargalos(engine):
    print("\n--- Identificando Gargalos e Filas por Categoria ---")
    
    # Query para calcular o tempo de 'vida' de chamados não resolvidos
    # e contar quantos estão pendentes.
    query = text(f"""
        SELECT 
            TRIM(LOWER("categoria")) as categoria,
            COUNT(*) as total_pendentes,
            -- Forçamos a diferença para ser um Interval para o EXTRACT funcionar
            AVG(ABS(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - "data_abertura"::timestamp))) / 3600) as media_espera_horas
        FROM "{SCHEMA}"."chamados"
        WHERE "status" NOT IN ('Resolvido', 'Fechado')
        GROUP BY 1 -- Agrupa pela primeira coluna (categoria)
        ORDER BY media_espera_horas DESC;
    """)
    
    try:
        df = pd.read_sql(query, engine)
        
        if df.empty:
            print("Nenhum chamado pendente encontrado! A fila está zerada.")
            return

        # Limpeza de acentos e capitalização (mantendo o padrão anterior)
        df['categoria'] = df['categoria'].apply(remover_acentos).str.capitalize()

        # Visualização dupla: Volume vs Tempo
        fig, ax1 = plt.subplots(figsize=(12, 6))
        sns.set_theme(style="white")

        # Barras: Média de Espera
        sns.barplot(data=df, x='categoria', y='media_espera_horas', alpha=0.6, ax=ax1, color='red')
        ax1.set_ylabel('Média de Espera (Horas)', color='red', fontsize=12, fontweight='bold')
        ax1.set_title('Identificação de Gargalos: Volume vs. Tempo de Espera', fontsize=14, fontweight='bold')
        plt.xticks(rotation=45)

        # Linha: Total de Pendentes (Eixo secundário)
        ax2 = ax1.twinx()
        sns.lineplot(data=df, x='categoria', y='total_pendentes', marker='o', color='black', ax=ax2, linewidth=2)
        ax2.set_ylabel('Total de Chamados na Fila', color='black', fontsize=12, fontweight='bold')

        plt.tight_layout()
        plt.show()

        # Print dos Top 3 Gargalos
        print("\nTOP 3 GARGALOS (MAIOR TEMPO DE ESPERA):")
        print(df[['categoria', 'media_espera_horas', 'total_pendentes']].head(3))

    except Exception as e:
        print(f"Erro ao identificar gargalos: {e}")

def identificar_gargalos_2_anos(engine):
    print("\n--- Analisando Gargalos e Filas (Últimos 2 Anos) ---")
    
    # Adicionamos o filtro de data para garantir o período solicitado
    query = text(f"""
        SELECT 
            TRIM(LOWER("categoria")) as categoria_limpa,
            COUNT(*) as total_pendentes,
            AVG(ABS(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - "data_abertura"::timestamp))) / 3600) as media_espera_horas
        FROM "{SCHEMA}"."chamados"
        WHERE "status" NOT IN ('Resolvido', 'Fechado')
          AND "data_abertura" >= CURRENT_DATE - INTERVAL '2 years'
        GROUP BY 1
        ORDER BY media_espera_horas DESC;
    """)
    
    try:
        df = pd.read_sql(query, engine)
        
        if df.empty:
            print("Nenhum chamado pendente encontrado no período de 2 anos.")
            return

        # Aplicando a limpeza de acentos e capitalização no DataFrame
        df['categoria'] = df['categoria_limpa'].apply(remover_acentos).str.capitalize()

        # Plotagem do gráfico de gargalos
        fig, ax1 = plt.subplots(figsize=(12, 6))
        sns.set_theme(style="white")

        # Barras: Tempo de espera
        sns.barplot(data=df, x='categoria', y='media_espera_horas', palette='Reds_r', ax=ax1, alpha=0.7)
        ax1.set_ylabel('Média de Espera (Horas)', color='darkred', fontsize=12, fontweight='bold')
        ax1.set_title('Gargalos de Atendimento: Últimos 2 Anos', fontsize=14, fontweight='bold')
        plt.xticks(rotation=45)

        # Linha: Volume de chamados acumulados na fila
        ax2 = ax1.twinx()
        sns.lineplot(data=df, x='categoria', y='total_pendentes', marker='s', color='black', ax=ax2, linewidth=3)
        ax2.set_ylabel('Total de Chamados na Fila', color='black', fontsize=12, fontweight='bold')

        plt.tight_layout()
        plt.show()

        # Resumo estatístico para o seu relatório
        print(df[['categoria', 'media_espera_horas', 'total_pendentes']].to_string(index=False))

    except Exception as e:
        print(f"Erro na análise de gargalos: {e}")

def rodar_analise_sla_avancada(engine):
    print("\nIniciando análise de SLA Líquido (Últimos 2 Anos)...")
    
    # Query que une Histórico, Chamados e as Metas da sla_config
    query_sla = text(f"""
    WITH StatusIntervals AS (
        SELECT 
            h.chamado_id,
            -- Normalizamos a prioridade para o JOIN não falhar por acento ou caixa
            TRIM(LOWER(c.prioridade)) as prioridade_limpa,
            h.status_novo,
            h.alterado_em as momento_evento,
            LEAD(h.alterado_em) OVER (PARTITION BY h.chamado_id ORDER BY h.alterado_em) as proximo_evento,
            s.prazo_resolucao_horas as meta_horas
        FROM "{SCHEMA}"."historico_status" h
        JOIN "{SCHEMA}"."chamados" c ON h.chamado_id = c.id
        LEFT JOIN "{SCHEMA}"."sla_config" s ON TRIM(LOWER(s.prioridade)) = TRIM(LOWER(c.prioridade))
        WHERE c.data_abertura >= CURRENT_DATE - INTERVAL '2 years'
    )
    SELECT 
        chamado_id,
        prioridade_limpa,
        status_novo as status_durante_intervalo,
        meta_horas,
        EXTRACT(EPOCH FROM (proximo_evento - momento_evento)) / 3600.0 as duracao_horas
    FROM StatusIntervals
    WHERE proximo_evento IS NOT NULL
    """)

    try:
        with engine.connect() as conn:
            df_historico = pd.read_sql(query_sla, conn)

        if df_historico.empty:
            print("Aviso: Nenhum dado encontrado.")
            return None

        # --- PROCESSAMENTO DE DADOS ---
        # Removendo acentos das strings para comparação segura no Python
        df_historico['prioridade_limpa'] = df_historico['prioridade_limpa'].apply(remover_acentos).str.capitalize()
        
        # Status que não devem contar tempo (Pausa do relógio)
        status_pausa = ['pausado', 'aguardando cliente', 'pendente terceiro', 'aguardando solicitante']
        df_historico['status_durante_intervalo'] = df_historico['status_durante_intervalo'].str.lower()

        # Cálculo do SLA Líquido
        sla_resumo = df_historico.groupby(['chamado_id', 'prioridade_limpa', 'meta_horas']).apply(
            lambda x: pd.Series({
                'tempo_total': x['duracao_horas'].sum(),
                'tempo_liquido': x[~x['status_durante_intervalo'].isin(status_pausa)]['duracao_horas'].sum()
            }),
            include_groups=False
        ).reset_index()

        # Define se está dentro da meta (meta_horas veio da tabela sla_config)
        sla_resumo['dentro_sla'] = sla_resumo['tempo_liquido'] <= sla_resumo['meta_horas']

        # --- MAPEAMENTO GRÁFICO ---
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))
        sns.set_theme(style="whitegrid")

        # Gráfico 1: Boxplot de tempo líquido (mostra a variabilidade e outliers)
        sns.boxplot(data=sla_resumo, x='prioridade_limpa', y='tempo_liquido', ax=ax1, palette='coolwarm')
        ax1.set_title('Distribuição de Tempo Líquido por Prioridade', fontweight='bold')
        ax1.set_ylabel('Horas Trabalhadas (Líquido)')

        # Gráfico 2: Taxa de Sucesso (%)
        taxa_sucesso = sla_resumo.groupby('prioridade_limpa')['dentro_sla'].mean() * 100
        taxa_sucesso.plot(kind='bar', ax=ax2, color=['#e74c3c' if x < 80 else '#2ecc71' for x in taxa_sucesso])
        ax2.axhline(80, color='black', linestyle='--', alpha=0.5)
        ax2.set_title('% de Cumprimento do SLA (Meta 80%)', fontweight='bold')
        ax2.set_ylabel('% de Sucesso')
        ax2.set_ylim(0, 110)

        plt.tight_layout()
        plt.show()
        
        return sla_resumo

    except Exception as e:
        print(f"Erro na análise avançada de SLA: {e}")
# --- 3. ORQUESTRAÇÃO PRINCIPAL ---

def main():
    # Cria o motor de conexão
    engine = create_engine(montar_url())
    
    
    # Passo 2: Gerar o gráfico de chamadas ao longo do tempo
    gerar_grafico_chamados_por_dia(engine)
    gerar_grafico_chamados_por_semana(engine)
    gerar_grafico_chamados_por_mes(engine)

    # Analisar tempo de atentimento e resolução
    analisar_medias_tempo(engine, "Últimos 5 Anos", "5 years")
    analisar_medias_tempo(engine, "Últimos 2 Anos", "2 years")

    # Taxa de reabertura
    analisar_taxa_reabertura(engine)

    # Distribuição
    gerar_painel_distribuicao(engine)

    # Gargalos
    identificar_gargalos(engine)
    identificar_gargalos_2_anos(engine)

    # SLA
    rodar_analise_sla_avancada(engine)
    
if __name__ == "__main__":
    main()