// O armazenamento recusa nomes com acento, espaço e símbolos; deixa só o seguro.
export function safeFileName(name: string) {
  const limpo = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return limpo.slice(-80) || "arquivo";
}
