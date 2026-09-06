import { createClient } from "@/lib/supabase/server";
import { requireAccountId } from "@/lib/account";
import {
  createProperty,
  deleteProperty,
  createUnit,
  deleteUnit,
} from "./actions";

type Unit = { id: string; label: string };
type Property = {
  id: string;
  endereco: string;
  comissao_percent: number;
  client_id: string | null;
  units: Unit[];
};

export default async function ImoveisPage() {
  const supabase = await createClient();
  const accountId = await requireAccountId(supabase);

  const [{ data: properties }, { data: clients }, { data: account }] =
    await Promise.all([
      supabase
        .from("properties")
        .select("id, endereco, comissao_percent, client_id, units(id, label)")
        .order("created_at", { ascending: false }),
      supabase.from("clients").select("id, nome").order("nome"),
      supabase.from("accounts").select("modo").eq("id", accountId).single(),
    ]);

  const isProfissional = account?.modo === "profissional";
  const propertyList = (properties ?? []) as unknown as Property[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Imóveis</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Cadastre os imóveis e as unidades dentro de cada um (casas têm 1
          unidade; prédios podem ter várias).
        </p>
      </div>

      <form
        action={createProperty}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 bg-white p-4"
      >
        <label className="flex min-w-[240px] flex-1 flex-col gap-1 text-sm text-zinc-700">
          Endereço
          <input
            name="endereco"
            required
            placeholder="Rua Exemplo, 123"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          />
        </label>

        {isProfissional && (
          <>
            <label className="flex flex-col gap-1 text-sm text-zinc-700">
              Cliente dono do imóvel
              <select
                name="client_id"
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
              >
                <option value="">Imóvel próprio</option>
                {(clients ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-zinc-700">
              Comissão (%)
              <input
                name="comissao_percent"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
                className="w-28 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
              />
            </label>
          </>
        )}

        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Adicionar imóvel
        </button>
      </form>

      {propertyList.length === 0 && (
        <p className="text-sm text-zinc-500">
          Nenhum imóvel cadastrado ainda.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {propertyList.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-zinc-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-medium text-zinc-900">{p.endereco}</h3>
                {isProfissional && (
                  <p className="text-xs text-zinc-500">
                    Comissão: {p.comissao_percent}%
                  </p>
                )}
              </div>
              <form action={deleteProperty}>
                <input type="hidden" name="id" value={p.id} />
                <button
                  type="submit"
                  className="text-xs text-red-600 hover:underline"
                >
                  Excluir imóvel
                </button>
              </form>
            </div>

            <ul className="mt-3 flex flex-col gap-1">
              {p.units.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-1.5 text-sm text-zinc-700"
                >
                  {u.label}
                  <form action={deleteUnit}>
                    <input type="hidden" name="id" value={u.id} />
                    <button
                      type="submit"
                      className="text-xs text-red-600 hover:underline"
                    >
                      remover
                    </button>
                  </form>
                </li>
              ))}
              {p.units.length === 0 && (
                <li className="text-sm text-zinc-400">Sem unidades ainda.</li>
              )}
            </ul>

            <form action={createUnit} className="mt-3 flex gap-2">
              <input type="hidden" name="property_id" value={p.id} />
              <input
                name="label"
                required
                placeholder="Nome da unidade (ex: Apto 101, Casa dos fundos)"
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-zinc-900"
              />
              <button
                type="submit"
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
              >
                Adicionar unidade
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
