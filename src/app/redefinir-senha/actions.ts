"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SERVICO_FORA_DO_AR, isServicoForaDoAr } from "@/lib/auth-errors";

export async function updatePassword(formData: FormData) {
  const senha = String(formData.get("senha") || "");
  if (senha.length < 6) {
    redirect(
      "/redefinir-senha?erro=" +
        encodeURIComponent("A senha precisa ter pelo menos 6 caracteres.")
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: senha });

  if (error) {
    const mensagem = isServicoForaDoAr(error) ? SERVICO_FORA_DO_AR : error.message;
    redirect("/redefinir-senha?erro=" + encodeURIComponent(mensagem));
  }

  redirect("/app");
}
