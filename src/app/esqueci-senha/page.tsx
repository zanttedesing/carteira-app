import { AuthShell } from "@/components/AuthShell";
import { requestPasswordReset } from "./actions";

export const metadata = { title: "Esqueci minha senha" };

const inputClass =
  "rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-stamp";

export default async function EsqueciSenhaPage(props: {
  searchParams: Promise<{ erro?: string; aviso?: string }>;
}) {
  const params = await props.searchParams;

  return (
    <AuthShell
      title="Esqueci minha senha"
      subtitle="Digite o e-mail da sua conta e enviamos um link para criar uma nova senha."
    >
      {params.aviso && (
        <p className="mb-4 rounded-lg bg-stamp-soft px-3 py-2 text-sm text-stamp">
          {params.aviso}
        </p>
      )}
      {params.erro && (
        <p className="mb-4 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
          {params.erro}
        </p>
      )}

      <form action={requestPasswordReset} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-ink">
          E-mail
          <input name="email" type="email" required className={inputClass} />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-stamp px-4 py-2 text-sm font-medium text-stamp-ink hover:bg-stamp/90"
        >
          Enviar link
        </button>
      </form>
    </AuthShell>
  );
}
