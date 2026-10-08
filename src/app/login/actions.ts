"use server";

import { createClient } from "@/lib/supabase/server";
import { SERVICO_FORA_DO_AR, isServicoForaDoAr } from "@/lib/auth-errors";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const senha = String(formData.get("senha") || "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    const mensagem = isServicoForaDoAr(error)
      ? SERVICO_FORA_DO_AR
      : "E-mail ou senha incorretos.";
    redirect("/login?erro=" + encodeURIComponent(mensagem));
  }

  redirect("/app");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
