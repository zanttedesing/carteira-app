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

  const groupOrder: string[] = [];
  const groupMap = new Map<string, Property[]>();
  for (const p of propertyList) {
    const key = p.endereco.trim().toLowerCase();
    if (!groupMap.has(key)) {
      groupMap.set(key, []);
      groupOrder.push(key);
    }
    groupMap.get(key)!.push(p);
  }
  const addressGroups = groupOrder.map((key) => {
    const group = groupMap.get(key)!;
    const casas = group.reduce((sum, p) => sum + p.units.length, 0);
    return { endereco: group[0].endereco, properties: group, casas };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Imóveis</h1>
        <p className="mt-1 text-sm text-ink-2">
          Cadastre o endereço e adicione as casas/unidades dentro dele.
          Endereços iguais ficam agrupados automaticamente.
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
        {addressGroups.map((group) => {
          const clientNames = Array.from(
            new Set(group.properties.map((p) => p.clients?.nome ?? null))
          );
          return (
            <details
              key={group.endereco.toLowerCase()}
              open
              className="group rounded-xl border border-line bg-surface"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:content-none">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-ink-3 transition-transform group-open:rotate-90">
                    ▸
                  </span>
                  <h3 className="font-medium text-ink">{group.endereco}</h3>
                  {isProfissional &&
                    clientNames.map((nome, i) => (
                      <span
                        key={i}
                        className={
                          nome
                            ? "rounded-full bg-stamp-soft px-2 py-0.5 text-xs font-medium text-stamp"
                            : "rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-ink-2"
                        }
                      >
                        {nome ? `Cliente: ${nome}` : "Imóvel próprio"}
                      </span>
                    ))}
                </div>
                <span className="text-xs text-ink-2">
                  {group.casas} casa{group.casas === 1 ? "" : "s"}
                </span>
              </summary>

              <div className="flex flex-col gap-3 border-t border-line px-4 py-3">
                {group.properties.map((p) => (
                  <div key={p.id} className="rounded-lg bg-surface-2 p-3">
                    <div className="flex items-start justify-between gap-4">
                      {isProfissional && (
                        <p className="text-xs text-ink-2">
                          Comissão: {p.comissao_percent}%
                        </p>
                      )}
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

                    <ul className="mt-2 flex flex-col gap-1">
                      {p.units.map((u) => (
                        <li
                          key={u.id}
                          className="flex items-center justify-between rounded-lg bg-surface px-3 py-1.5 text-sm text-ink"
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
                        <li className="text-sm text-ink-3">
                          Sem unidades ainda.
                        </li>
                      )}
                    </ul>

                    <form action={createUnit} className="mt-2 flex gap-2">
                      <input type="hidden" name="property_id" value={p.id} />
                      <input
                        name="label"
                        required
                        placeholder="Nome da casa/unidade (ex: Casa 1, Apto 101)"
                        className="flex-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm outline-none focus:border-stamp"
                      />
                      <button
                        type="submit"
                        className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface"
                      >
                        Adicionar casa/unidade
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
