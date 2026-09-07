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
  clients: { nome: string } | null;
  units: Unit[];
};

export default async function ImoveisPage() {
  const supabase = await createClient();
  const accountId = await requireAccountId(supabase);

  const [{ data: properties }, { data: clients }, { data: account }] =
    await Promise.all([
      supabase
        .from("properties")
        .select(
          "id, endereco, comissao_percent, client_id, clients(nome), units(id, label)"
        )
        .order("created_at", { ascending: false }),
      supabase.from("clients").select("id, nome").order("nome"),
      supabase.from("accounts").select("modo").eq("id", accountId).single(),
    ]);

  const isProfissional = account?.modo === "profissional";
  const propertyList = (properties ?? []) as unknown as Property[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Imóveis</h1>
        <p className="mt-1 text-sm text-ink-2">
          Cadastre os imóveis e as unidades dentro de cada um (casas têm 1
          unidade; prédios podem ter várias).
        </p>
      </div>

      <form
        action={createProperty}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-surface p-4"
      >
        <label className="flex min-w-[240px] flex-1 flex-col gap-1 text-sm text-ink">
          Endereço
          <input
            name="endereco"
            required
            placeholder="Rua Exemplo, 123"
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-stamp"
          />
        </label>

        {isProfissional && (
          <>
            <label className="flex flex-col gap-1 text-sm text-ink">
              Cliente dono do imóvel
              <select
                name="client_id"
                className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-stamp"
              >
                <option value="">Imóvel próprio</option>
                {(clients ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-ink">
              Comissão (%)
              <input
                name="comissao_percent"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
                className="w-28 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-stamp"
              />
            </label>
          </>
        )}

        <button
          type="submit"
          className="rounded-lg bg-stamp px-4 py-2 text-sm font-medium text-stamp-ink hover:bg-stamp/90"
        >
          Adicionar imóvel
        </button>
      </form>

      {propertyList.length === 0 && (
        <p className="text-sm text-ink-2">
          Nenhum imóvel cadastrado ainda.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {propertyList.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-line bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-ink">{p.endereco}</h3>
                  {isProfissional && (
                    <span
                      className={
                        p.clients
                          ? "rounded-full bg-stamp-soft px-2 py-0.5 text-xs font-medium text-stamp"
                          : "rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-ink-2"
                      }
                    >
                      {p.clients ? `Cliente: ${p.clients.nome}` : "Imóvel próprio"}
                    </span>
                  )}
                </div>
                {isProfissional && (
                  <p className="text-xs text-ink-2">
                    Comissão: {p.comissao_percent}%
                  </p>
                )}
              </div>
              <form action={deleteProperty}>
                <input type="hidden" name="id" value={p.id} />
                <button
                  type="submit"
                  className="text-xs text-danger hover:underline"
                >
                  Excluir imóvel
                </button>
              </form>
            </div>

            <ul className="mt-3 flex flex-col gap-1">
              {p.units.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-1.5 text-sm text-ink"
                >
                  {u.label}
                  <form action={deleteUnit}>
                    <input type="hidden" name="id" value={u.id} />
                    <button
                      type="submit"
                      className="text-xs text-danger hover:underline"
                    >
                      remover
                    </button>
                  </form>
                </li>
              ))}
              {p.units.length === 0 && (
                <li className="text-sm text-ink-3">Sem unidades ainda.</li>
              )}
            </ul>

            <form action={createUnit} className="mt-3 flex gap-2">
              <input type="hidden" name="property_id" value={p.id} />
              <input
                name="label"
                required
                placeholder="Nome da unidade (ex: Apto 101, Casa dos fundos)"
                className="flex-1 rounded-lg border border-line px-3 py-1.5 text-sm outline-none focus:border-stamp"
              />
              <button
                type="submit"
                className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface-2"
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
