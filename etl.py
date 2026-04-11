import pandas as pd
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

def montar_url() -> str:
    # O strip() remove espaços acidentais que podem causar o erro de 'host name'
    return (
        f"postgresql+psycopg2://{quote_plus(USUARIO)}:{quote_plus(SENHA)}"
        f"@{SERVIDOR.strip()}:{PORTA}/{quote_plus(BANCO)}"
    )


def padronizar_dados(df, colunas_capitalizar=None):
    """Aplica limpeza de strings mantendo valores nulos (NULL)."""
    if df.empty:
        return df
    
    # Função auxiliar para limpar mantendo o nulo
    def clean_val(val, mode):
        if pd.isna(val): # Verifica se é NaN ou None
            return val
        
        val = str(val).strip()
        
        if mode == 'cap':
            return val.capitalize()
        if mode == 'lower':
            return val.lower()
        return val

    # Aplica nas colunas de capitalização
    if colunas_capitalizar:
        for col in colunas_capitalizar:
            if col in df.columns:
                df[col] = df[col].apply(lambda x: clean_val(x, 'cap'))
                
    return df

def executar_etl_e_atualizar_banco(engine):
    with engine.connect() as conn:
        print("--- Iniciando Processo de Atualização (ETL) ---")

        # Configurações de colunas para cada tabela
        tabelas_config = {
            "chamados": {
                "capitalizar": ['tipo', 'categoria', 'prioridade', 'impacto', 'urgencia', 'status']
            },
            "historico_status": {
                "capitalizar": ['status_anterior', 'status_novo']
            },
            "usuarios": {
                "capitalizar": ['perfil']
                
            },
            "sla_config": {
                "capitalizar": ['prioridade']
            }
        }

        for nome_tabela, config in tabelas_config.items():
            try:
                print(f"Limpando e atualizando: {nome_tabela}...")
                
                # 1. Extração
                df = pd.read_sql(text(f'SELECT * FROM "{SCHEMA}"."{nome_tabela}"'), conn)
                
                # 2. Transformação
                df_limpo = padronizar_dados(
                    df, 
                    colunas_capitalizar=config['capitalizar']
                )

                # 3. Carga (Update no Banco)
                # Usamos method='multi' para acelerar a inserção no Postgres
                df_limpo.to_sql(
                    name=nome_tabela, 
                    con=engine, 
                    schema=SCHEMA, 
                    if_exists='replace', 
                    index=False,
                    method='multi'
                )
                print(f"Tabela {nome_tabela} atualizada com sucesso!")

            except Exception as e:
                print(f"Erro ao processar {nome_tabela}: {e}")

def main():
    # 1. Conectar ao banco
    engine = create_engine(montar_url())

    # 2. Executar o processo de ETL e atualizar o banco
    executar_etl_e_atualizar_banco(engine)

if __name__ == "__main__":
    main()