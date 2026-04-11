import { FullConfig } from "@playwright/test";

async function globalTeardown(config: FullConfig) {
	console.log("🧹 Starting global teardown for E2E tests...");

	// Limpeza global após todos os testes

	// Exemplo: Limpeza de dados de teste, arquivos temporários, etc.
	try {
		// Limpar arquivos de autenticação
		// await fs.unlink('e2e/auth.json').catch(() => {});

		// Outras limpezas necessárias
		console.log("✅ Cleanup completed");
	} catch (error) {
		console.warn("⚠️ Teardown warning:", error);
	}

	console.log("✅ Global teardown completed");
}

export default globalTeardown;
