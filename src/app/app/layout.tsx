import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/account";
import { logout } from "../login/actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await ensureProfile(supabase, user);
  const account = profile?.accounts ?? undefined;
  const isProfissional = account?.modo === "profissional";

  const navItems = [
    { href: "/app", label: "Visão geral" },
    { href: "/app/imoveis", label: "Imóveis" },
    { href: "/app/inquilinos", label: "Inquilinos" },
    { href: "/app/pagamentos", label: "Pagamentos" },
    { href: "/app/manutencao", label: "Manutenção" },
    { href: "/app/indices", label: "Índices" },
    ...(isProfissional ? [{ href: "/app/clientes", label: "Clientes" }] : []),
    { href: "/app/configuracoes", label: "Configurações" },
  ];

  return (
    <div className="flex flex-1 bg-paper">
      <aside className="flex w-64 shrink-0 flex-col bg-chrome px-5 py-6 text-chrome-fg">
        <div className="mb-8 px-1">
          <p className="font-serif text-lg font-semibold leading-tight">
            {account?.nome ?? "Carteira"}
          </p>
          <p className="mt-0.5 text-xs text-chrome-fg-muted">
            {profile?.nome ?? user.email}
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-3 py-2 text-sm text-chrome-fg-muted transition-colors hover:bg-chrome-line hover:text-chrome-fg"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded px-3 py-2 text-left text-sm text-chrome-fg-muted transition-colors hover:bg-chrome-line hover:text-chrome-fg"
          >
            Sair
          </button>
        </form>
      </aside>

      <main className="flex-1 overflow-y-auto px-10 py-8">{children}</main>
    </div>
  );
}
