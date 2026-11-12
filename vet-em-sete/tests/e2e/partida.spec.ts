import { expect, test } from "@playwright/test";

test("partida completa do caso de exemplo", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /^Jogar/ }).click();
  const campo = page.getByPlaceholder("Digite o diagnóstico");
  await expect(campo).toBeVisible();

  // Só o paciente e a queixa no início
  await expect(page.getByText("Histórico", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("2ª tentativa")).toBeVisible();

  const palpite = async (termo: string, nome: RegExp) => {
    await campo.fill(termo);
    await page.getByRole("option", { name: nome }).first().click();
    await page.getByRole("button", { name: "Enviar palpite" }).click();
  };

  // Erro: etiquetas de proximidade e nova camada
  await palpite("babes", /Babesiose canina/);
  await expect(page.getByText("Muito perto")).toBeVisible();
  await expect(page.getByText("3ª tentativa")).toBeVisible();

  await page.getByRole("button", { name: "Pular" }).click();
  await palpite("drc", /Doença renal crônica/);
  await palpite("cinom", /Cinomose/);

  // Cada camada do caso aparece uma única vez (sem duplicar a cada tentativa)
  for (const nome of ["Paciente e queixa principal", "Histórico", "Anamnese", "Exame físico"])
    await expect(page.getByRole("button", { name: new RegExp(`^${nome}`) })).toHaveCount(1);

  // 5ª tentativa: exame antes do palpite
  await page.getByLabel(/Hemograma completo/).check();
  await page.getByRole("button", { name: "Pedir exame" }).click();
  await expect(page.getByText("Plaquetas")).toBeVisible();

  await palpite("erliq", /Erliquiose monocítica/);
  await expect(page.getByText("Acertou na 5ª tentativa")).toBeVisible();

  // Tratamento e fim
  await page.getByLabel(/Doxiciclina/).check();
  await page.getByLabel(/Ectoparasiticida/).check();
  await page.getByLabel(/Hemograma de controle/).check();
  await page.getByRole("button", { name: "Confirmar tratamento" }).click();
  await expect(page.getByRole("heading", { name: "Pontuação" })).toBeVisible();
  // 300 (5ª tentativa) + 40 (exame relevante) + 200 (tratamento completo)
  await expect(page.locator("tfoot")).toContainText("540");
  await expect(page.getByRole("heading", { name: "Fisiopatologia" })).toBeVisible();

  // Retoma o estado ao recarregar
  await page.reload();
  await expect(page.getByRole("heading", { name: "Pontuação" })).toBeVisible();
});

test("o gabarito não aparece no navegador antes do fim", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /^Jogar/ }).click();
  await expect(page.getByPlaceholder("Digite o diagnóstico")).toBeVisible();
  const html = await page.content();
  expect(html).not.toContain("erliquiose");
  expect(html).not.toContain("Erliquiose monocítica");
});
