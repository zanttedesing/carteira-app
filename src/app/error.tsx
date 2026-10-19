"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-surface-2 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-ink">Algo deu errado</h1>
      <p className="max-w-sm text-sm text-ink-2">
        Não foi possível carregar esta tela. Tente de novo; se o problema
        continuar, fale com a gente.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-stamp px-4 py-2 text-sm font-medium text-stamp-ink hover:bg-stamp/90"
        >
          Tentar de novo
        </button>
        <Link
          href="/ajuda"
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-surface"
        >
          Falar com a gente
        </Link>
      </div>
    </div>
  );
}
