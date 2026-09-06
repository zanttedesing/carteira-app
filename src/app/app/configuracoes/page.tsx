import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { requireAccountId } from "@/lib/account";
import { setModo } from "./actions";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const accountId = await requireAccountId(supabase);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: account }, { data: membros }] = await Promise.all([
    supabase.from("accounts").select("nome, modo").eq("id", accountId).single(),
    supabase.from("profiles").select("id, nome").order("nome"),
  ]);

  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocolo = host.startsWith("localhost") ? "http" : "https";
  const linkConvite = `${protocolo}://${host}/signup?conta=${accountId}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Configurações</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Dados da sua carteira e do seu acesso.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <h3 className="font-medium text-zinc-900">Conta</h3>
        <p className="mt-1 text-sm text-zinc-600">{account?.nome}</p>
        <p className="text-sm text-zinc-500">{user?.email}</p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <h3 className="font-medium text-zinc-900">Como você usa a carteira?</h3>
        <p className="mt-1 text-sm text-zinc-500">
          No modo profissional aparece a aba Clientes, com comissão de
          administração e repasse de cada imóvel de terceiros.
        </p>
        <form action={setModo} className="mt-3 flex flex-col gap-2">
          <label className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700">
            <input
              type="radio"
              name="modo"
              value="pessoal"
              defaultChecked={account?.modo === "pessoal"}
            />
            Imóveis próprios e da família
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700">
            <input
              type="radio"
              name="modo"
              value="profissional"
              defaultChecked={account?.modo === "profissional"}
            />
            Administro imóveis de clientes/terceiros
          </label>
          <button
            type="submit"
            className="mt-2 w-fit rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Salvar
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <h3 className="font-medium text-zinc-900">Quem tem acesso</h3>
        <ul className="mt-2 flex flex-col gap-1">
          {(membros ?? []).map((m) => (
            <li key={m.id} className="text-sm text-zinc-600">
              {m.nome}
            </li>
          ))}
        </ul>

        <p className="mt-4 text-sm text-zinc-500">
          Para dar acesso a mais uma pessoa (sócio, familiar, funcionário),
          mande este link para ela. Ao criar a conta por esse link, ela entra
          direto na mesma carteira que você.
        </p>
        <div className="mt-2 flex items-center gap-2">
          <input
            readOnly
            value={linkConvite}
            className="flex-1 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-600"
          />
        </div>
      </div>
    </div>
  );
}
