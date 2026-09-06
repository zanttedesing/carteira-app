import { createClient } from "@/lib/supabase/server";
import { requireAccountId } from "@/lib/account";
import { fmtDate, fmtMoney } from "@/lib/calc";
import {
  createMaintenance,
  updateMaintenanceStatus,
  deleteMaintenance,
  createItem,
  updateItemStatus,
  deleteItem,
} from "./actions";

type Item = {
  id: string;
  tipo: string;
  responsavel: string;
  contato: string;
  custo: number;
  status: string;
};
type Maintenance = {
  id: string;
  descricao: string;
  data_solicitacao: string;
  data_prevista_fim: string | null;
  status: string;
  custo: number;
  obs: string;
  units: { label: string; properties: { endereco: string } | null } | null;
  maintenance_items: Item[];
};
type Unit = {
  id: string;
  label: string;
  properties: { endereco: string } | null;
};

const inputClass =
  "rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-zinc-900";
const STATUS_OPCOES = ["Planejada", "Em andamento", "Concluída"];
const ITEM_STATUS_OPCOES = ["Pendente", "Contratado", "Concluído"];

export default async function ManutencaoPage() {
  const supabase = await createClient();
  await requireAccountId(supabase);

  const [{ data: units }, { data: maintenance }] = await Promise.all([
    supabase.from("units").select("id, label, properties(endereco)").order("label"),
    supabase
      .from("maintenance")
      .select(
        "id, descricao, data_solicitacao, data_prevista_fim, status, custo, obs, units(label, properties(endereco)), maintenance_items(id, tipo, responsavel, contato, custo, status)"
      )
      .order("data_solicitacao", { ascending: false }),
  ]);

  const unitList = (units ?? []) as unknown as Unit[];
  const maintenanceList = (maintenance ?? []) as unknown as Maintenance[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Manutenção</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Reformas e reparos por unidade, com os itens e fornecedores de cada
          um.
        </p>
      </div>

      {unitList.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Cadastre um imóvel e uma unidade primeiro, na aba Imóveis.
        </p>
      ) : (
        <form
          action={createMaintenance}
          className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 bg-white p-4"
        >
          <label className="flex flex-col gap-1 text-sm text-zinc-700">
            Unidade
            <select name="unit_id" required className={inputClass}>
              {unitList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.properties?.endereco} — {u.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-sm text-zinc-700">
            Descrição
            <input name="descricao" required className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-700">
            Data da solicitação
            <input
              name="data_solicitacao"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-700">
            Previsão de término
            <input name="data_prevista_fim" type="date" className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-700">
            Custo total (R$)
            <input
              name="custo"
              type="number"
              step="0.01"
              min="0"
              defaultValue="0"
              className={inputClass}
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Criar
          </button>
        </form>
      )}

      <div className="flex flex-col gap-4">
        {maintenanceList.map((m) => (
          <div
            key={m.id}
            className="rounded-xl border border-zinc-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-medium text-zinc-900">{m.descricao}</h3>
                <p className="text-xs text-zinc-500">
                  {m.units?.properties?.endereco} — {m.units?.label}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <form action={updateMaintenanceStatus} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={m.id} />
                  <select
                    name="status"
                    defaultValue={m.status}
                    className={inputClass}
                  >
                    {STATUS_OPCOES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-lg border border-zinc-300 px-2 py-1.5 text-xs font-medium hover:bg-zinc-100"
                  >
                    Atualizar
                  </button>
                </form>
                <form action={deleteMaintenance}>
                  <input type="hidden" name="id" value={m.id} />
                  <button
                    type="submit"
                    className="text-xs text-red-600 hover:underline"
                  >
                    excluir
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-600">
              <span>Solicitada em: {fmtDate(m.data_solicitacao)}</span>
              <span>Previsão: {fmtDate(m.data_prevista_fim)}</span>
              <span>Custo total: {fmtMoney(m.custo)}</span>
            </div>

            <div className="mt-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
                Itens / fornecedores
              </p>
              <ul className="flex flex-col gap-1">
                {m.maintenance_items.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-zinc-50 px-3 py-1.5 text-sm text-zinc-700"
                  >
                    <span>
                      {item.tipo}
                      {item.responsavel ? ` · ${item.responsavel}` : ""}
                      {item.contato ? ` · ${item.contato}` : ""} —{" "}
                      {fmtMoney(item.custo)}
                    </span>
                    <span className="flex items-center gap-2">
                      <form action={updateItemStatus} className="flex items-center gap-1">
                        <input type="hidden" name="id" value={item.id} />
                        <select
                          name="status"
                          defaultValue={item.status}
                          className="rounded border border-zinc-300 px-1.5 py-1 text-xs"
                        >
                          {ITEM_STATUS_OPCOES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="text-xs text-zinc-500 hover:underline"
                        >
                          ok
                        </button>
                      </form>
                      <form action={deleteItem}>
                        <input type="hidden" name="id" value={item.id} />
                        <button
                          type="submit"
                          className="text-xs text-red-600 hover:underline"
                        >
                          remover
                        </button>
                      </form>
                    </span>
                  </li>
                ))}
                {m.maintenance_items.length === 0 && (
                  <li className="text-sm text-zinc-400">
                    Nenhum item cadastrado.
                  </li>
                )}
              </ul>

              <form action={createItem} className="mt-2 flex flex-wrap gap-2">
                <input type="hidden" name="maintenance_id" value={m.id} />
                <input
                  name="tipo"
                  required
                  placeholder="Tipo (ex: Pintura)"
                  className={inputClass}
                />
                <input
                  name="responsavel"
                  placeholder="Responsável"
                  className={inputClass}
                />
                <input name="contato" placeholder="Contato" className={inputClass} />
                <input
                  name="custo"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Custo"
                  className={`${inputClass} w-28`}
                />
                <button
                  type="submit"
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
                >
                  Adicionar item
                </button>
              </form>
            </div>
          </div>
        ))}
        {maintenanceList.length === 0 && (
          <p className="text-sm text-zinc-500">
            Nenhuma manutenção cadastrada ainda.
          </p>
        )}
      </div>
    </div>
  );
}
