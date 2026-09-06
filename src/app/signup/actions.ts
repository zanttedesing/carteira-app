"use server";

import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/account";
import { redirect } from "next/navigation";

export async function signup(formData: FormData) {
  const nome = String(formData.get("nome") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const senha = String(formData.get("senha") || "");
  const modo = String(formData.get("modo") || "pessoal");
  const contaId = String(formData.get("conta_id") || "") || undefined;

  if (!nome || !email || !senha) {
    redirect("/signup?erro=" + encodeURIComponent("Preencha todos os campos."));
  }

  const supabase = await createClient();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { nome, modo, ...(contaId ? { conta_id: contaId } : {}) } },
  });

  if (signUpError) {
    redirect("/signup?erro=" + encodeURIComponent(signUpError.message));
  }

  if (!signUpData.user) {
    redirect("/signup?erro=" + encodeURIComponent("Não foi possível criar sua conta."));
  }

  if (!signUpData.session) {
    redirect(
      "/login?aviso=" +
        encodeURIComponent("Conta criada! Confirme seu e-mail e depois faça login.")
    );
  }

  const profile = await ensureProfile(supabase, signUpData.user);

  if (!profile) {
    redirect(
      "/login?erro=" +
        encodeURIComponent(
          "Conta criada, mas houve um erro ao configurar sua carteira. Fale com o suporte."
        )
    );
  }

  redirect("/app");
}
