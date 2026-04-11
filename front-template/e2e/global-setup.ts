import { chromium, FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
	console.log("🚀 Starting global setup for E2E tests...");

	// Configurações globais que devem ser executadas antes de todos os testes

	// Exemplo: Setup de autenticação para testes que precisam de login
	const browser = await chromium.launch();
	const page = await browser.newPage();

	try {
		// Navegar para a aplicação
		await page.goto(config.projects[0].use.baseURL || "http://localhost:5173");

		// Aguardar carregamento da aplicação
		await page.waitForSelector("header", { timeout: 10000 });

		console.log("✅ Application is ready for testing");

		// Salvar estado de autenticação se necessário
		// await page.context().storageState({ path: 'e2e/auth.json' });
	} catch (error) {
		console.error("❌ Global setup failed:", error);
		throw error;
	} finally {
		await browser.close();
	}

	console.log("✅ Global setup completed");
}

export default globalSetup;
