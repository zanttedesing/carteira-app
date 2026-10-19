import Link from "next/link";

export function LegalPage({
  title,
  atualizado,
  children,
}: {
  title: string;
  atualizado: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center bg-surface-2 px-4 py-12">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="mb-4 inline-flex text-sm text-ink-2 hover:text-ink"
        >
          ← Voltar para o site
        </Link>
        <article className="rounded-2xl border border-line bg-surface p-8 text-sm leading-relaxed text-ink-2 [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-3 [&_ul]:mb-3">
          <h1 className="text-2xl font-semibold text-ink">{title}</h1>
          <p className="mt-1 text-xs text-ink-3">Última atualização: {atualizado}</p>
          {children}
        </article>
        <p className="mt-4 text-center text-xs text-ink-3">
          Dúvidas?{" "}
          <Link href="/ajuda" className="underline hover:text-ink-2">
            Fale com a gente
          </Link>{" "}
          · Produzido por ZantteBR
        </p>
      </div>
    </div>
  );
}
