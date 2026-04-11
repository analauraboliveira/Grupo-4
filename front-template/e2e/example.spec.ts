import { test, expect } from "@playwright/test";

test.describe("Aplicação Principal", () => {
	test.beforeEach(async ({ page }) => {
		// Navegar para a página principal antes de cada teste
		await page.goto("/");
	});

	test("deve carregar a página inicial corretamente", async ({ page }) => {
		// Verificar título da página
		await expect(page).toHaveTitle(/Boilerplate Frontend/);

		// Verificar se o header está presente
		const header = page.locator("header");
		await expect(header).toBeVisible();

		// Verificar se o título principal está presente
		const mainTitle = page.locator("h2", {
			hasText: "Bem-vindo ao Boilerplate Frontend",
		});
		await expect(mainTitle).toBeVisible();

		// Verificar se as cards das features estão presentes
		const reactQueryCard = page.locator(".card", { hasText: "React Query" });
		await expect(reactQueryCard).toBeVisible();

		const tailwindCard = page.locator(".card", { hasText: "Tailwind CSS" });
		await expect(tailwindCard).toBeVisible();
	});

	test("deve permitir mudança de idioma", async ({ page }) => {
		// Localizar o seletor de idioma
		const languageSelector = page.locator("select");
		await expect(languageSelector).toBeVisible();

		// Verificar idioma padrão (Português)
		await expect(languageSelector).toHaveValue("pt-BR");

		// Mudar para inglês
		await languageSelector.selectOption("en-US");

		// Aguardar a mudança ser aplicada
		await page.waitForTimeout(500);

		// Verificar se mudou para inglês
		await expect(languageSelector).toHaveValue("en-US");

		// Mudar para espanhol
		await languageSelector.selectOption("es-ES");
		await page.waitForTimeout(500);
		await expect(languageSelector).toHaveValue("es-ES");

		// Voltar para português
		await languageSelector.selectOption("pt-BR");
		await page.waitForTimeout(500);
		await expect(languageSelector).toHaveValue("pt-BR");
	});

	test("deve navegar entre as abas de exemplos", async ({ page }) => {
		// Aguardar a seção de exemplos carregar
		const examplesSection = page.locator("h2", { hasText: "Exemplos de Uso" });
		await expect(examplesSection).toBeVisible();

		// Verificar se a aba React Query está ativa por padrão
		const reactQueryTab = page.locator("button", { hasText: "React Query" });
		await expect(reactQueryTab).toHaveClass(/border-primary-500/);

		// Clicar na aba React Hook Form
		const formTab = page.locator("button", { hasText: "React Hook Form" });
		await formTab.click();

		// Verificar se a aba mudou
		await expect(formTab).toHaveClass(/border-primary-500/);
		await expect(reactQueryTab).not.toHaveClass(/border-primary-500/);

		// Verificar se o conteúdo do formulário está visível
		const formTitle = page.locator("h3", { hasText: "React Hook Form + Yup" });
		await expect(formTitle).toBeVisible();

		// Clicar na aba Radix Accordion
		const accordionTab = page.locator("button", { hasText: "Radix Accordion" });
		await accordionTab.click();

		// Verificar se a aba mudou
		await expect(accordionTab).toHaveClass(/border-primary-500/);

		// Verificar se o conteúdo do accordion está visível
		const accordionTitle = page.locator("h3", {
			hasText: "Radix UI Accordion",
		});
		await expect(accordionTitle).toBeVisible();
	});

	test("deve testar funcionalidade do exemplo React Query", async ({
		page,
	}) => {
		// Aguardar carregamento dos usuários
		await page.waitForSelector(".card", {
			hasText: "React Query - Exemplo de Usuários",
		});

		// Verificar se os usuários carregaram
		const usersList = page.locator(".card-body .space-y-4");
		await expect(usersList).toBeVisible();

		// Contar usuários iniciais
		const initialUsers = page.locator(".flex.items-center.justify-between");
		await expect(initialUsers).toHaveCount(3); // Baseado nos dados mock

		// Testar botão de criar usuário
		const createButton = page.locator("button", { hasText: "Criar Usuário" });
		await createButton.click();

		// Aguardar o novo usuário aparecer
		await page.waitForTimeout(1000);

		// Verificar se foi adicionado um novo usuário
		await expect(initialUsers).toHaveCount(4);

		// Testar botão de atualizar
		const refreshButton = page.locator("button", { hasText: "Atualizar" });
		await refreshButton.click();

		// Aguardar o refresh
		await page.waitForTimeout(1000);

		// Verificar se ainda há usuários
		await expect(initialUsers.first()).toBeVisible();
	});

	test("deve testar validação de formulário", async ({ page }) => {
		// Ir para a aba de formulário
		const formTab = page.locator("button", { hasText: "React Hook Form" });
		await formTab.click();

		// Tentar submeter formulário vazio
		const submitButton = page.locator('button[type="submit"]');
		await submitButton.click();

		// Verificar se aparecem mensagens de erro
		const errorMessages = page.locator(".error-text");
		await expect(errorMessages.first()).toBeVisible();

		// Preencher campos válidos
		await page.fill(
			'input[placeholder="Digite seu nome completo"]',
			"João da Silva",
		);
		await page.fill('input[placeholder="seu@email.com"]', "joao@teste.com");
		await page.fill(
			'input[placeholder="Digite uma senha segura"]',
			"MinhaSenh@123",
		);
		await page.fill('input[placeholder="Confirme sua senha"]', "MinhaSenh@123");

		// Aceitar termos
		await page.check('input[type="checkbox"]');

		// Submeter formulário
		await submitButton.click();

		// Aguardar processamento
		await page.waitForTimeout(1500);

		// Verificar se o formulário foi resetado (indicando sucesso)
		const nameInput = page.locator(
			'input[placeholder="Digite seu nome completo"]',
		);
		await expect(nameInput).toHaveValue("");
	});

	test("deve testar responsividade", async ({ page }) => {
		// Testar em viewport mobile
		await page.setViewportSize({ width: 375, height: 667 });

		// Verificar se o layout se adapta
		const header = page.locator("header");
		await expect(header).toBeVisible();

		// Verificar se o grid de features se adapta
		const featuresGrid = page.locator(
			".grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3",
		);
		await expect(featuresGrid).toBeVisible();

		// Testar em viewport tablet
		await page.setViewportSize({ width: 768, height: 1024 });
		await expect(header).toBeVisible();

		// Testar em viewport desktop
		await page.setViewportSize({ width: 1920, height: 1080 });
		await expect(header).toBeVisible();
	});
});
