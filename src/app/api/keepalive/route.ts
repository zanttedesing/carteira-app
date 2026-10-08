import { createClient } from "@/lib/supabase/server";

// Chamado todo dia pelo cron do Vercel (vercel.json). O plano gratuito do
// Supabase pausa o projeto após ~7 dias sem requisições, e uma leitura simples
// já conta como atividade.
export async function GET() {
  const supabase = await createClient();
  const { error } = await supabase
    .from("accounts")
    .select("id", { count: "exact", head: true });

  return Response.json({ ok: !error });
}
