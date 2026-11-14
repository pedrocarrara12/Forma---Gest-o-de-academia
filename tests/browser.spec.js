import { test, expect } from "@playwright/test";
test("fluxo completo de aluno e telas responsivas", async ({ page }) => {
  const name = `Aluno fictício ${Date.now()}`;
  await page.goto("http://127.0.0.1:5175/alunos");
  await expect(page).toHaveURL(/login/);
  await page.getByLabel("E-mail", { exact: true }).fill("gestor@forma.local");
  await page.getByLabel("Senha", { exact: true }).fill("forma123");
  await page.getByRole("button", { name: /Entrar no painel/ }).click();
  await page.getByRole("link", { name: "Novo aluno" }).click();
  await page.getByLabel("Nome completo").fill(name);
  await page
    .getByLabel("E-mail", { exact: true })
    .fill(`teste-${Date.now()}@example.com`);
  await page.getByLabel("Telefone com DDD").fill("65999999999");
  await page.getByRole("button", { name: "Salvar aluno" }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Aluno cadastrado com sucesso.",
  );
  await page
    .getByRole("link", { name: new RegExp(name) })
    .first()
    .click();
  await expect(page.getByRole("heading", { name })).toBeVisible();
  await page.getByRole("link", { name: "Editar aluno" }).click();
  await page.getByLabel("Nome completo").fill(`${name} Editado`);
  await page.getByRole("button", { name: "Salvar aluno" }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Aluno atualizado com sucesso.",
  );
  await expect(page).toHaveURL("http://127.0.0.1:5175/alunos");
  await page.reload();
  await expect(
    page.getByText(`${name} Editado`, { exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: test.info().outputPath("desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("button", { name: "Sair", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({ path: test.info().outputPath("mobile.png"), fullPage: true });
  await page
    .getByRole("link", { name: new RegExp(`${name} Editado`) })
    .first()
    .click();
  page.on("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Excluir aluno" }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Aluno excluído com sucesso.",
  );
  await expect(page).toHaveURL("http://127.0.0.1:5175/alunos");
  await expect(page.getByText(`${name} Editado`, { exact: true })).toHaveCount(
    0,
  );
  await page.getByRole("link", { name: "Visão geral" }).click();
});
