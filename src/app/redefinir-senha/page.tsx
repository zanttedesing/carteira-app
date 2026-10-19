import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { PasswordField } from "@/components/PasswordField";
import { createClient } from "@/lib/supabase/server";
import { updatePassword } from "./actions";

export const metadata = { title: "Criar nova senha" };

const inputClass =
  "rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-stamp";

export default async function RedefinirSenhaPage(props: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const params = await props.searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      "/esqueci-senha?erro=" +
        encodeURIComponent("Peça um novo link para criar sua senha.")
    );
  }

  return (
    <AuthShell title="Criar nova senha" subtitle="Escolha uma senha para entrar na sua carteira.">
      {params.erro && (
        <p className="mb-4 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
          {params.erro}
        </p>
      )}

      <form action={updatePassword} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-ink">
          Nova senha
          <PasswordField
            name="senha"
            required
            minLength={6}
            showStrength
            className={inputClass}
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-stamp px-4 py-2 text-sm font-medium text-stamp-ink hover:bg-stamp/90"
        >
          Salvar nova senha
        </button>
      </form>
    </AuthShell>
  );
}
