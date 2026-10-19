"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SERVICO_FORA_DO_AR, isServicoForaDoAr } from "@/lib/auth-errors";

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  if (!email) {
    redirect("/esqueci-senha?erro=" + encodeURIComponent("Digite seu e-mail."));
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${proto}://${host}/auth/callback?next=/redefinir-senha`,
  });

  if (error && isServicoForaDoAr(error)) {
    redirect("/esqueci-senha?erro=" + encodeURIComponent(SERVICO_FORA_DO_AR));
  }

  // Mesma resposta exista a conta ou não, para não revelar quem tem cadastro.
  redirect(
    "/esqueci-senha?aviso=" +
      encodeURIComponent(
        "Se esse e-mail tiver conta, enviamos um link para criar uma nova senha. Confira também a caixa de spam."
      )
  );
}
