import { createClient } from "@/lib/supabase/server";
import { requireAccountId } from "@/lib/account";
import { fmtDate } from "@/lib/calc";
import {
  createTenant,
  endTenant,
  addMorador,
  removeMorador,
  uploadDocument,
  deleteDocument,
} from "./actions";

type Morador = { id: string; nome: string; telefone: string; email: string };
type Documento = { id: string; nome: string; storage_path: string };
type Tenant = {
  id: string;
  valor_aluguel: number;
  dia_vencimento: number;
  data_inicio: string;
  data_fim: string | null;
  prazo_indeterminado: boolean;
  multa_percent: number;
  juros_mes_percent: number;
  indice_correcao: string;
  contrato_assinado: boolean;
  obs_contrato: string;
  ativo: boolean;
  moradores: Morador[];
  documents: Documento[];
};
type Unit = {
  id: string;
  label: string;
  properties: { endereco: string; clients: { nome: string } | null } | null;
  tenants: Tenant[];
};

const inputClass =
  "rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-stamp";
const labelClass = "flex flex-col gap-1 text-sm text-ink";

export default async function InquilinosPage() {
  const supabase = await createClient();
  const accountId = await requireAccountId(supabase);

  const [{ data: units }, { data: account }] = await Promise.all([
    supabase
      .from("units")
      .select(
        "id, label, properties(endereco, clients(nome)), tenants(id, valor_aluguel, dia_vencimento, data_inicio, data_fim, prazo_indeterminado, multa_percent, juros_mes_percent, indice_correcao, contrato_assinado, obs_contrato, ativo, moradores(id, nome, telefone, email), documents(id, nome, storage_path))"
      )
      .order("label"),
    supabase.from("accounts").select("modo").eq("id", accountId).single(),
  ]);

  const isProfissional = account?.modo === "profissional";
  const unitList = (units ?? []) as unknown as Unit[];

  const groupOrder: string[] = [];
  const groupMap = new Map<string, Unit[]>();
  for (const u of unitList) {
    const key = (u.properties?.endereco ?? "").trim().toLowerCase();
    if (!groupMap.has(key)) {
      groupMap.set(key, []);
      groupOrder.push(key);
    }
    groupMap.get(key)!.push(u);
  }
  const addressGroups = groupOrder.map((key) => {
    const group = groupMap.get(key)!;
    return { endereco: group[0].properties?.endereco ?? "", units: group };
  });

  const allDocuments = unitList.flatMap((u) =>
    u.tenants.flatMap((t) => t.documents)
  );
  const signedUrlEntries = await Promise.all(
    allDocuments.map(async (doc) => {
      const { data } = await supabase.storage
        .from("documents")
        .createSignedUrl(doc.storage_path, 60 * 60);
      return [doc.id, data?.signedUrl ?? null] as const;
    })
  );
  const signedUrls = new Map(signedUrlEntries);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Inquilinos</h1>
        <p className="mt-1 text-sm text-ink-2">
          Um contrato ativo por unidade. Cadastre o inquilino e os moradores da
          casa.
        </p>
      </div>

      {unitList.length === 0 && (
        <p className="text-sm text-ink-2">
          Cadastre um imóvel e uma unidade primeiro, na aba Imóveis.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {addressGroups.map((group) => (
          <details
            key={group.endereco.toLowerCase()}
            open
            className="group rounded-xl border border-line bg-surface"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:content-none">
              <div className="flex items-center gap-2">
                <span className="text-ink-3 transition-transform group-open:rotate-90">
                  ▸
                </span>
                <h3 className="font-medium text-ink">{group.endereco}</h3>
              </div>
              <span className="text-xs text-ink-2">
                {group.units.length} casa{group.units.length === 1 ? "" : "s"}
              </span>
            </summary>

            <div className="flex flex-col gap-4 border-t border-line px-4 py-3">
              {group.units.map((unit) => {
                const tenant = unit.tenants.find((t) => t.ativo);
                return (
                  <div
                    key={unit.id}
                    className="rounded-lg bg-surface-2 p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-medium text-ink">{unit.label}</h4>
                      {isProfissional && (
                        <span
                          className={
                            unit.properties?.clients
                              ? "rounded-full bg-stamp-soft px-2 py-0.5 text-xs font-medium text-stamp"
                              : "rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-ink-2"
                          }
                        >
                          {unit.properties?.clients
                            ? `Cliente: ${unit.properties.clients.nome}`
                            : "Imóvel próprio"}
                        </span>
                      )}
                    </div>

              {!tenant ? (
                <form
                  action={createTenant}
                  className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3"
                >
                  <input type="hidden" name="unit_id" value={unit.id} />
                  <label className={labelClass}>
                    Valor do aluguel (R$)
                    <input
                      name="valor_aluguel"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Dia do vencimento
                    <input
                      name="dia_vencimento"
                      type="number"
                      min="1"
                      max="28"
                      defaultValue="10"
                      required
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Início do contrato
                    <input
                      name="data_inicio"
                      type="date"
                      required
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Fim do contrato
                    <input name="data_fim" type="date" className={inputClass} />
                  </label>
                  <label className="mt-6 flex items-center gap-2 text-sm text-ink">
                    <input type="checkbox" name="prazo_indeterminado" />
                    Prazo indeterminado (sem data de fim)
                  </label>
                  <label className={labelClass}>
                    Multa por atraso (%)
                    <input
                      name="multa_percent"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue="2"
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Juros ao mês (%)
                    <input
                      name="juros_mes_percent"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue="1"
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Índice de correção
                    <select
                      name="indice_correcao"
                      className={`${inputClass} bg-surface text-ink`}
                    >
                      <option value="Nenhum">Nenhum</option>
                      <option value="IPCA">IPCA</option>
                      <option value="IGP-M">IGP-M</option>
                      <option value="INPC">INPC</option>
                    </select>
                  </label>
                  <label className="mt-6 flex items-center gap-2 text-sm text-ink">
                    <input type="checkbox" name="contrato_assinado" />
                    Contrato assinado
                  </label>
                  <label className={`${labelClass} col-span-full`}>
                    Observações do contrato
                    <textarea
                      name="obs_contrato"
                      rows={2}
                      className={inputClass}
                    />
                  </label>
                  <div className="col-span-full">
                    <button
                      type="submit"
                      className="rounded-lg bg-stamp px-4 py-2 text-sm font-medium text-stamp-ink hover:bg-stamp/90"
                    >
                      Criar contrato
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-3 flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-ink sm:grid-cols-4">
                    <p>
                      <span className="text-ink-3">Aluguel: </span>
                      {tenant.valor_aluguel.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                    <p>
                      <span className="text-ink-3">Vencimento: </span>
                      dia {tenant.dia_vencimento}
                    </p>
                    <p>
                      <span className="text-ink-3">Início: </span>
                      {fmtDate(tenant.data_inicio)}
                    </p>
                    <p>
                      <span className="text-ink-3">Fim: </span>
                      {tenant.prazo_indeterminado
                        ? "Prazo indeterminado"
                        : fmtDate(tenant.data_fim)}
                    </p>
                    <p>
                      <span className="text-ink-3">Multa: </span>
                      {tenant.multa_percent}%
                    </p>
                    <p>
                      <span className="text-ink-3">Juros: </span>
                      {tenant.juros_mes_percent}% a.m.
                    </p>
                    <p>
                      <span className="text-ink-3">Índice: </span>
                      {tenant.indice_correcao}
                    </p>
                    <p>
                      <span className="text-ink-3">Contrato: </span>
                      {tenant.contrato_assinado ? "Assinado" : "Não assinado"}
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-3">
                      Moradores
                    </p>
                    <ul className="flex flex-col gap-1">
                      {tenant.moradores.map((m) => (
                        <li
                          key={m.id}
                          className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-1.5 text-sm text-ink"
                        >
                          <span>
                            {m.nome}
                            {m.telefone ? ` · ${m.telefone}` : ""}
                          </span>
                          <form action={removeMorador}>
                            <input type="hidden" name="id" value={m.id} />
                            <button
                              type="submit"
                              className="text-xs text-danger hover:underline"
                            >
                              remover
                            </button>
                          </form>
                        </li>
                      ))}
                      {tenant.moradores.length === 0 && (
                        <li className="text-sm text-ink-3">
                          Nenhum morador cadastrado.
                        </li>
                      )}
                    </ul>

                    <form
                      action={addMorador}
                      className="mt-2 flex flex-wrap gap-2"
                    >
                      <input type="hidden" name="tenant_id" value={tenant.id} />
                      <input
                        name="nome"
                        required
                        placeholder="Nome do morador"
                        className={`${inputClass} flex-1`}
                      />
                      <input
                        name="telefone"
                        placeholder="Telefone"
                        className={inputClass}
                      />
                      <button
                        type="submit"
                        className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink hover:bg-surface-2"
                      >
                        Adicionar morador
                      </button>
                    </form>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-3">
                      Documentos
                    </p>
                    <ul className="flex flex-col gap-1">
                      {tenant.documents.map((doc) => {
                        const url = signedUrls.get(doc.id);
                        return (
                          <li
                            key={doc.id}
                            className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-1.5 text-sm text-ink"
                          >
                            {url ? (
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-ink underline"
                              >
                                {doc.nome}
                              </a>
                            ) : (
                              <span>{doc.nome}</span>
                            )}
                            <form action={deleteDocument}>
                              <input type="hidden" name="id" value={doc.id} />
                              <input
                                type="hidden"
                                name="storage_path"
                                value={doc.storage_path}
                              />
                              <button
                                type="submit"
                                className="text-xs text-danger hover:underline"
                              >
                                remover
                              </button>
                            </form>
                          </li>
                        );
                      })}
                      {tenant.documents.length === 0 && (
                        <li className="text-sm text-ink-3">
                          Nenhum documento enviado.
                        </li>
                      )}
                    </ul>

                    <form
                      action={uploadDocument}
                      className="mt-2 flex flex-wrap items-center gap-2"
                    >
                      <input type="hidden" name="tenant_id" value={tenant.id} />
                      <input
                        name="file"
                        type="file"
                        required
                        className="text-sm text-ink"
                      />
                      <button
                        type="submit"
                        className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface-2"
                      >
                        Enviar documento
                      </button>
                    </form>
                  </div>

                  <form action={endTenant}>
                    <input type="hidden" name="id" value={tenant.id} />
                    <button
                      type="submit"
                      className="text-xs text-danger hover:underline"
                    >
                      Encerrar contrato
                    </button>
                  </form>
                </div>
              )}
                  </div>
                );
              })}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
