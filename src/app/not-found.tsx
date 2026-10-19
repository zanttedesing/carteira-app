import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-surface-2 px-4 py-16 text-center">
      <p className="text-sm font-medium text-stamp">Erro 404</p>
      <h1 className="text-2xl font-semibold text-ink">Página não encontrada</h1>
      <p className="max-w-sm text-sm text-ink-2">
        O endereço que você abriu não existe ou foi movido. Volte para o início
        e tente de novo.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-lg bg-stamp px-4 py-2 text-sm font-medium text-stamp-ink hover:bg-stamp/90"
        >
          Ir para o início
        </Link>
        <Link
          href="/ajuda"
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-surface"
        >
          Preciso de ajuda
        </Link>
      </div>
    </div>
  );
}
