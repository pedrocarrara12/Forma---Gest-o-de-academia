import { test, expect } from "@playwright/test";
async function login(page) {
  await page.goto("/login");
  await page.getByLabel("E-mail", { exact: true }).fill("gestor@forma.local");
  await page.getByLabel("Senha", { exact: true }).fill("forma123");
  await page.getByRole("button", { name: "Entrar no painel" }).click();
  await expect(page).toHaveURL("/");
}
test("sessionStorage não permite acesso; logout funciona no mobile", async ({
  page,
}) => {
  await page.goto("/login");
  await page.evaluate(() => sessionStorage.setItem("forma-user", "Gestor"));
  await page.goto("/alunos");
  await expect(page).toHaveURL(/login/);
  await login(page);
  await page.setViewportSize({ width: 390, height: 844 });
  const exit = page.getByRole("button", { name: "Sair", exact: true });
  await expect(exit).toBeVisible();
  await exit.focus();
  await expect(exit).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/login/);
  await page.goto("/alunos");
  await expect(page).toHaveURL(/login/);
});
test("CRUD de planos confirma sucesso; erro mantém formulário", async ({
  page,
}) => {
  await login(page);
  await page.getByRole("link", { name: "Planos", exact: true }).click();
  await page.getByRole("button", { name: "Novo plano" }).click();
  await page.getByLabel("Nome", { exact: true }).fill("Plano fictício");
  await page.getByLabel("Valor total (R$)").fill("100");
  await page.getByRole("button", { name: "Salvar plano" }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Plano cadastrado com sucesso.",
  );
  const card = page.locator("article").filter({ hasText: "Plano fictício" });
  await card.getByRole("button", { name: "Editar", exact: true }).click();
  await page
    .getByLabel("Nome", { exact: true })
    .fill("Plano fictício atualizado");
  await page.getByRole("button", { name: "Salvar plano" }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Plano atualizado com sucesso.",
  );
  page.on("dialog", (d) => d.accept());
  await page
    .locator("article")
    .filter({ hasText: "Plano fictício atualizado" })
    .getByRole("button", { name: "Excluir" })
    .click();
  await expect(page.getByRole("status")).toHaveText(
    "Plano excluído com sucesso.",
  );
  await page.goto("/alunos/novo");
  await page.getByLabel("Nome completo").fill("Teste de falha");
  await page.getByLabel("E-mail", { exact: true }).fill("falha@example.com");
  await page.getByLabel("Telefone com DDD").fill("65999999999");
  await page.route("**/api/students", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ message: "Falha de teste. Tente novamente." }),
    }),
  );
  await page.getByRole("button", { name: "Salvar aluno" }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "Falha de teste. Tente novamente.",
  );
  await expect(page.getByLabel("Nome completo")).toHaveValue("Teste de falha");
});
test("CEP inválido e resposta obsoleta preservam edição manual", async ({
  page,
}) => {
  await login(page);
  await page.goto("/alunos/novo");
  let release;
  await page.route("https://viacep.com.br/ws/01001000/json/", async (route) => {
    await new Promise((resolve) => {
      release = resolve;
    });
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        logradouro: "Endereço antigo",
        localidade: "São Paulo",
        uf: "SP",
      }),
    });
  });
  await page.getByLabel("CEP (opcional)", { exact: true }).fill("01001-000");
  await page.getByRole("button", { name: "Consultar" }).click();
  await expect.poll(() => !!release).toBeTruthy();
  await page.getByLabel("CEP (opcional)", { exact: true }).fill("99999999");
  await page
    .getByLabel("Endereço (opcional)", { exact: true })
    .fill("Endereço manual");
  release();
  await expect(page.getByRole("button", { name: "Consultar" })).toBeEnabled();
  await expect(
    page.getByLabel("Endereço (opcional)", { exact: true }),
  ).toHaveValue("Endereço manual");
  await page.route("https://viacep.com.br/ws/99999999/json/", (route) =>
    route.fulfill({ contentType: "application/json", body: '{"erro":true}' }),
  );
  await page.getByRole("button", { name: "Consultar" }).click();
  await expect(page.getByRole("alert")).toContainText("CEP não encontrado");
  await expect(
    page.getByLabel("Endereço (opcional)", { exact: true }),
  ).toHaveValue("Endereço manual");
});
test("ViaCEP real preenche endereço no navegador", async ({ page }) => {
  await login(page);
  await page.goto("/alunos/novo");
  await page.getByLabel("CEP (opcional)", { exact: true }).fill("01001-000");
  await page.getByRole("button", { name: "Consultar" }).click();
  await expect(
    page.getByLabel("Endereço (opcional)", { exact: true }),
  ).toHaveValue(/São Paulo/, { timeout: 25000 });
  await page.screenshot({ path: test.info().outputPath("cep.png"), fullPage: true });
});
