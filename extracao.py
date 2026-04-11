from urllib.parse import quote_plus
from sqlalchemy import create_engine, text
import pandas as pd

# --- CREDENCIAIS (Preencha com os dados da imagem) ---
SERVIDOR = "database-visagio-talentos-2026-4.c3qiaao441if.us-east-1.rds.amazonaws.com"
PORTA = "5432"
BANCO = "visagio_talentos"
USUARIO = "talento_4"
SENHA = "mRaiKvD3xdkRoK" 

SCHEMA = "talentos_4"
TABELA = "chamados"

def montar_url() -> str:
    return (
        f"postgresql+psycopg2://{quote_plus(USUARIO)}:{quote_plus(SENHA)}"
        f"@{SERVIDOR}:{PORTA}/{BANCO}"
    )

def main():
    # 1. Conectar ao banco
    engine = create_engine(montar_url())
    
    # 2. Definir a Query (Vamos começar pegando tudo da tabela chamados)
    query = text(f'SELECT * FROM "{SCHEMA}"."{TABELA}"')
    
    # 3. Extrair os dados usando o Pandas (Mais rápido para análise)
    try:
        df = pd.read_sql(query, engine)
        
        # 4. Ver os dados
        print("--- Primeiras 5 linhas do Banco ---")
        print(df.head())
        
        # 5. Salvar em um CSV (Opcional, mas útil para o hackathon)
        df.to_csv("dados_extraidos.csv", index=False)
        print("\nSucesso! Arquivo 'dados_extraidos.csv' gerado.")
        
    except Exception as e:
        print(f"Erro ao conectar ou extrair: {e}")

if __name__ == "__main__":
    main()