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
    <div className="flex flex-1 bg-zinc-50">
      <aside className="flex w-60 shrink-0 flex-col border-r border-zinc-200 bg-white px-4 py-6">
        <div className="mb-8 px-2">
          <p className="text-sm font-semibold text-zinc-900">
            {account?.nome ?? "Carteira"}
          </p>
          <p className="text-xs text-zinc-500">{profile?.nome ?? user.email}</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-500 hover:bg-zinc-100"
          >
            Sair
          </button>
        </form>
      </aside>

      <main className="flex-1 px-8 py-6">{children}</main>
    </div>
  );
}
