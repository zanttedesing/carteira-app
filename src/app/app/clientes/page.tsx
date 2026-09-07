import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAccountId } from "@/lib/account";
import {
  calcPayment,
  currentMesReferencia,
  shiftMesReferencia,
  fmtMesReferencia,
  fmtMoney,
  fmtDate,
} from "@/lib/calc";
import { addCliente, deleteCliente, saveRepasse } from "./actions";

type Tenant = {
  id: string;
  valor_aluguel: number;
  dia_vencimento: number;
  multa_percent: number;
  juros_mes_percent: number;
  indice_correcao: string;
  ativo: boolean;
  data_inicio: string;
  data_fim: string | null;
  moradores: { nome: string }[];
};
type Unit = { id: string; label: string; tenants: Tenant[] };
type Property = {
  id: string;
  endereco: string;
  comissao_percent: number;
  client_id: string;
  units: Unit[];
};
type Cliente = {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  obs: string;
};
type Payment = { tenant_id: string; data_pagamento: string | null };
type Repasse = {
  client_id: string;
  data_repasse: string | null;
  valor: number;
  obs: string | null;
};

const inputClass =
  "rounded-lg border border-line px-2 py-1.5 text-sm outline-none focus:border-stamp";

export default async function ClientesPage(props: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const params = await props.searchParams;
  const mesReferencia = params.mes || currentMesReferencia();
  const mesInicio = `${mesReferencia}-01`;
  const [ano, mes] = mesReferencia.split("-").map(Number);
  const ultimoDia = new Date(ano, mes, 0).getDate();
  const mesFim = `${mesReferencia}-${String(ultimoDia).padStart(2, "0")}`;

  const supabase = await createClient();
  const accountId = await requireAccountId(supabase);

  const { data: account } = await supabase
    .from("accounts")
    .select("modo")
    .eq("id", accountId)
    .single();

  if (account?.modo !== "profissional") {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-ink">Clientes</h1>
        <p className="mt-2 text-sm text-ink-2">
          Essa área é só para quem administra imóveis de terceiros. Ative o
          modo profissional em Configurações para usá-la.
        </p>
      </div>
    );
  }

  const [{ data: clients }, { data: properties }, { data: payments }, { data: repasses }] =
    await Promise.all([
      supabase.from("clients").select("id, nome, telefone, email, obs").order("nome"),
      supabase
        .from("properties")
        .select(
          "id, endereco, comissao_percent, client_id, units(id, label, tenants(id, valor_aluguel, dia_vencimento, multa_percent, juros_mes_percent, indice_correcao, ativo, data_inicio, data_fim, moradores(nome)))"
        )
        .not("client_id", "is", null),
      supabase
        .from("payments")
        .select("tenant_id, data_pagamento")
        .eq("mes_referencia", mesReferencia),
      supabase
        .from("repasses")
        .select("client_id, data_repasse, valor, obs")
        .eq("mes_referencia", mesReferencia),
    ]);

  const clienteList = (clients ?? []) as Cliente[];
  const propertyList = (properties ?? []) as unknown as Property[];
  const paymentByTenant = new Map<string, Payment>();
  for (const p of (payments ?? []) as Payment[]) paymentByTenant.set(p.tenant_id, p);
  const repasseByClient = new Map<string, Repasse>();
  for (const r of (repasses ?? []) as Repasse[]) repasseByClient.set(r.client_id, r);

  const indicesNecessarios = Array.from(
    new Set(
      propertyList
        .flatMap((p) => p.units.flatMap((u) => u.tenants))
        .map((t) => t.indice_correcao)
        .filter((i) => i && i !== "Nenhum")
    )
  );
  const indiceValores = new Map<string, number>();
  if (indicesNecessarios.length > 0) {
    const { data: indices } = await supabase
      .from("indices")
      .select("tipo, valor_percent")
      .eq("mes_referencia", mesReferencia)
      .in("tipo", indicesNecessarios);
    for (const i of (indices ?? []) as { tipo: string; valor_percent: number }[]) {
      indiceValores.set(i.tipo, i.valor_percent);
    }
  }

  function tenantAtivoNoMes(t: Tenant) {
    return (
      t.ativo &&
      t.data_inicio <= mesFim &&
      (!t.data_fim || t.data_fim >= mesInicio)
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Clientes</h1>
          <p className="mt-1 text-sm text-ink-2">
            Comissão e repasse de {fmtMesReferencia(mesReferencia).toLowerCase()}.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/app/clientes?mes=${shiftMesReferencia(mesReferencia, -1)}`}
            className="rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-surface-2"
          >
            ← Mês anterior
          </Link>
          <Link
            href={`/app/clientes?mes=${shiftMesReferencia(mesReferencia, 1)}`}
            className="rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-surface-2"
          >
            Próximo mês →
          </Link>
        </div>
      </div>

      <form
        action={addCliente}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-surface p-4"
      >
        <label className="flex flex-col gap-1 text-sm text-ink">
          Nome
          <input name="nome" required className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink">
          Telefone
          <input name="telefone" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink">
          E-mail
          <input name="email" type="email" className={inputClass} />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-stamp px-4 py-2 text-sm font-medium text-stamp-ink hover:bg-stamp/90"
        >
          Adicionar cliente
        </button>
      </form>

      <div className="flex flex-col gap-4">
        {clienteList.map((cliente) => {
          const propsDoCliente = propertyList.filter(
            (p) => p.client_id === cliente.id
          );

          let recebido = 0;
          let comissao = 0;
          type Detalhe = {
            key: string;
            endereco: string;
            unidade: string;
            morador: string;
            diaVencimento: number;
            status: string;
            statusTipo: "ok" | "atraso" | "aberto";
          };
          const detalhes: Detalhe[] = [];

          for (const property of propsDoCliente) {
            for (const unit of property.units) {
              for (const tenant of unit.tenants) {
                if (!tenantAtivoNoMes(tenant)) continue;
                const payment = paymentByTenant.get(tenant.id);
                const indiceValor =
                  tenant.indice_correcao !== "Nenhum"
                    ? indiceValores.get(tenant.indice_correcao) ?? null
                    : null;
                const calc = calcPayment(
                  tenant,
                  mesReferencia,
                  payment?.data_pagamento ?? null,
                  indiceValor
                );

                if (payment?.data_pagamento) {
                  recebido += calc.total;
                  comissao += calc.total * (property.comissao_percent / 100);
                }

                detalhes.push({
                  key: tenant.id,
                  endereco: property.endereco,
                  unidade: unit.label,
                  morador: tenant.moradores[0]?.nome ?? "Sem morador cadastrado",
                  diaVencimento: tenant.dia_vencimento,
                  statusTipo: payment?.data_pagamento
                    ? "ok"
                    : calc.diasAtraso > 0
                      ? "atraso"
                      : "aberto",
                  status: payment?.data_pagamento
                    ? `Pago em ${fmtDate(payment.data_pagamento)}`
                    : calc.diasAtraso > 0
                      ? `Atrasado (${calc.diasAtraso}d) — vence dia ${tenant.dia_vencimento}`
                      : `Em aberto — vence dia ${tenant.dia_vencimento}`,
                });
              }
            }
          }
          const liquido = recebido - comissao;
          const repasse = repasseByClient.get(cliente.id);
          const statusStyle: Record<Detalhe["statusTipo"], string> = {
            ok: "bg-stamp-soft text-stamp",
            atraso: "bg-danger-soft text-danger",
            aberto: "bg-warn-soft text-warn",
          };

          return (
            <div
              key={cliente.id}
              className="rounded-xl border border-line bg-surface p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-ink">{cliente.nome}</h3>
                  <p className="text-xs text-ink-2">
                    {propsDoCliente.length} imóve
                    {propsDoCliente.length === 1 ? "l" : "is"}
                    {cliente.telefone ? ` · ${cliente.telefone}` : ""}
                  </p>
                </div>
                <form action={deleteCliente}>
                  <input type="hidden" name="id" value={cliente.id} />
                  <button
                    type="submit"
                    className="text-xs text-danger hover:underline"
                  >
                    excluir
                  </button>
                </form>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-2">
                <span>Recebido no mês: {fmtMoney(recebido)}</span>
                <span>Comissão: {fmtMoney(comissao)}</span>
                <span className="font-medium text-ink">
                  Líquido a repassar: {fmtMoney(liquido)}
                </span>
              </div>

              <div className="mt-3 flex flex-col gap-1.5">
                {detalhes.map((d) => (
                  <div
                    key={d.key}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-2 px-3 py-1.5 text-sm text-ink"
                  >
                    <span>
                      {d.endereco} — {d.unidade}
                      <span className="ml-2 font-normal text-ink-2">
                        {d.morador}
                      </span>
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[d.statusTipo]}`}
                    >
                      {d.status}
                    </span>
                  </div>
                ))}
                {detalhes.length === 0 && (
                  <p className="text-sm text-ink-3">
                    Nenhum contrato ativo neste mês.
                  </p>
                )}
              </div>

              <form
                action={saveRepasse}
                className="mt-3 flex flex-wrap items-end gap-3"
              >
                <input type="hidden" name="client_id" value={cliente.id} />
                <input type="hidden" name="mes_referencia" value={mesReferencia} />
                <label className="flex flex-col gap-1 text-xs text-ink-2">
                  Data do repasse
                  <input
                    name="data_repasse"
                    type="date"
                    defaultValue={repasse?.data_repasse ?? ""}
                    className={inputClass}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-ink-2">
                  Valor repassado (R$)
                  <input
                    name="valor"
                    type="number"
                    step="0.01"
                    defaultValue={repasse?.valor ?? liquido.toFixed(2)}
                    className={inputClass}
                  />
                </label>
                <label className="flex min-w-[160px] flex-1 flex-col gap-1 text-xs text-ink-2">
                  Observações
                  <input
                    name="obs"
                    defaultValue={repasse?.obs ?? ""}
                    className={inputClass}
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-lg bg-stamp px-3 py-1.5 text-sm font-medium text-stamp-ink hover:bg-stamp/90"
                >
                  Salvar repasse
                </button>
              </form>
              {repasse?.data_repasse && (
                <p className="mt-1 text-xs text-ink-3">
                  Último repasse registrado em {fmtDate(repasse.data_repasse)}.
                </p>
              )}
            </div>
          );
        })}
        {clienteList.length === 0 && (
          <p className="text-sm text-ink-2">Nenhum cliente cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}
