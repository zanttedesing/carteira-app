import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { MailIcon } from "@/components/icons";

const SUPORTE_EMAIL = "contato@zantte.com.br";

export default function AjudaPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-surface-2 px-4 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-ink-2 hover:text-ink"
        >
          ← Voltar para o site
        </Link>

        <div className="rounded-2xl border border-line bg-surface p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-ink">Precisa de ajuda?</h1>
          <p className="mt-1 text-sm text-ink-2">
            Conte o que está acontecendo que a gente responde por e-mail.
          </p>

          <div className="mt-6">
            <ContactForm />
          </div>

          <p className="mt-6 flex items-center gap-2 text-xs text-ink-3">
            <MailIcon className="h-4 w-4 shrink-0" />
            Prefere mandar direto?{" "}
            <a
              href={`mailto:${SUPORTE_EMAIL}`}
              className="underline hover:text-ink-2"
            >
              {SUPORTE_EMAIL}
            </a>
          </p>
        </div>
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
