export const SERVICO_FORA_DO_AR =
  "Nosso sistema está temporariamente fora do ar. Tente de novo em alguns minutos — se continuar, use o link \"Fale com a gente\" aqui embaixo.";

export function isServicoForaDoAr(error: {
  name?: string;
  message?: string;
  status?: number;
}) {
  return (
    error.name === "AuthRetryableFetchError" ||
    error.message === "fetch failed" ||
    error.status === 0 ||
    (error.status !== undefined && error.status >= 500)
  );
}
