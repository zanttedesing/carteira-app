import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-surface-2 px-4 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/login"
          className="mb-4 inline-flex items-center gap-1 text-sm text-ink-2 hover:text-ink"
        >
          ← Voltar para o login
        </Link>

        <div className="rounded-2xl border border-line bg-surface p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink-2">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        <p className="mt-4 text-center text-xs text-ink-3">
          Deu algum problema?{" "}
          <Link href="/ajuda" className="underline hover:text-ink-2">
            Fale com a gente
          </Link>
        </p>
      </div>

      <p className="text-xs text-ink-3">
        Produzido por{" "}
        <a
          href="https://zantte.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-ink-2"
        >
          ZantteBR
        </a>
      </p>
    </div>
  );
}
