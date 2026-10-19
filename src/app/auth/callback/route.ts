import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Destino do link enviado por e-mail (recuperação de senha): troca o código
// por uma sessão e leva a pessoa para a tela seguinte.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app";
  const destino = next.startsWith("/") && !next.startsWith("//") ? next : "/app";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${destino}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/esqueci-senha?erro=${encodeURIComponent(
      "Esse link expirou ou já foi usado. Peça um novo."
    )}`
  );
}
