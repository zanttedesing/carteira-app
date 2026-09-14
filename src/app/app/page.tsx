import { createClient } from "@/lib/supabase/server";
import { requireAccountId } from "@/lib/account";
import {
  calcPayment,
  currentMesReferencia,
  shiftMesReferencia,
  fmtMoney,
} from "@/lib/calc";
import { PropertyMap, type MapProperty } from "./PropertyMap";
import { RevenueChart } from "./RevenueChart";
import {
  BuildingIcon,
  FileTextIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  CalendarIcon,
  ArrowUpRightIcon,
} from "@/components/icons";
import Link from "next/link";

type TenantCalcFields = {
  id: string;
  valor_aluguel: number;
  dia_vencimento: number;
  multa_percent: number;
  juros_mes_percent: number;
  indice_correcao: string;
};

type TenantAtivo = TenantCalcFields & {
  units: { label: string; properties: { endereco: string } | null } | null;
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function VisaoGeralPage() {
  const supabase = await createClient();
  const accountId = await requireAccountId(supabase);

  const mesAtual = currentMesReferencia();
  const mesAnterior = shiftMesReferencia(mesAtual, -1);
  const meses6: string[] = [];
  for (let i = 5; i >= 0; i--) meses6.push(shiftMesReferencia(mesAtual, -i));

  const [ano, mesNum] = mesAtual.split("-").map(Number);
  const mesInicio = `${mesAtual}-01`;
  const ultimoDia = new Date(ano, mesNum, 0).getDate();
  const mesFim = `${mesAtual}-${String(ultimoDia).padStart(2, "0")}`;

  const [
    { data: properties },
    { count: unitCount },
    { data: tenantsAtivos },
    { data: paymentsRange },
    { data: allTenants },
  ] = await Promise.all([
    supabase.from("properties").select("id, endereco, latitude, longitude"),
    supabase.from("units").select("id", { count: "exact", head: true }),
    supabase
      .from("tenants")
      .select(
        "id, valor_aluguel, dia_vencimento, multa_percent, juros_mes_percent, indice_correcao, units(label, properties(endereco))"
      )
      .eq("ativo", true)
      .lte("data_inicio", mesFim)
      .or(`data_fim.is.null,data_fim.gte.${mesInicio}`),
    supabase
      .from("payments")
      .select("tenant_id, mes_referencia, data_pagamento")
      .in("mes_referencia", meses6)
      .not("data_pagamento", "is", null),
    supabase
      .from("tenants")
      .select(
        "id, valor_aluguel, dia_vencimento, multa_percent, juros_mes_percent, indice_correcao"
      ),
  ]);

  const propertyList = properties ?? [];
  const tenantAtivoList = (tenantsAtivos ?? []) as unknown as TenantAtivo[];
  const paymentList = paymentsRange ?? [];
  const tenantById = new Map(
    ((allTenants ?? []) as TenantCalcFields[]).map((t) => [t.id, t])
  );

  const indicesNecessarios = Array.from(
    new Set(
      ((allTenants ?? []) as TenantCalcFields[])
        .map((t) => t.indice_correcao)
        .filter((i) => i && i !== "Nenhum")
    )
  );
  const indiceValores = new Map<string, number>();
  if (indicesNecessarios.length > 0) {
    const { data: indices } = await supabase
      .from("indices")
      .select("tipo, mes_referencia, valor_percent")
      .in("mes_referencia", meses6)
      .in("tipo", indicesNecessarios);
    for (const i of (indices ?? []) as {
      tipo: string;
      mes_referencia: string;
      valor_percent: number;
    }[]) {
      indiceValores.set(`${i.tipo}|${i.mes_referencia}`, i.valor_percent);
    }
  }

  const receitaPorMes = new Map(meses6.map((m) => [m, 0]));
  for (const p of paymentList) {
    const tenant = tenantById.get(p.tenant_id);
    if (!tenant || !p.data_pagamento) continue;
    const indiceValor =
      tenant.indice_correcao !== "Nenhum"
        ? indiceValores.get(`${tenant.indice_correcao}|${p.mes_referencia}`) ??
          null
        : null;
    const calc = calcPayment(tenant, p.mes_referencia, p.data_pagamento, indiceValor);
    receitaPorMes.set(
      p.mes_referencia,
      (receitaPorMes.get(p.mes_referencia) ?? 0) + calc.total
    );
  }

  const chartData = meses6.map((m) => {
    const [, mm] = m.split("-").map(Number);
    const label = capitalize(
      new Date(2000, mm - 1, 1).toLocaleDateString("pt-BR", { month: "short" })
    ).replace(".", "");
    return { label, valor: receitaPorMes.get(m) ?? 0 };
  });
  const receitaMesAtual = receitaPorMes.get(mesAtual) ?? 0;
  const receitaMesAnterior = receitaPorMes.get(mesAnterior) ?? 0;
  const variacaoPercent =
    receitaMesAnterior > 0
      ? ((receitaMesAtual - receitaMesAnterior) / receitaMesAnterior) * 100
      : receitaMesAtual > 0
        ? 100
        : 0;

  const paymentsMesAtual = new Set(
    paymentList.filter((p) => p.mes_referencia === mesAtual).map((p) => p.tenant_id)
  );

  type Pendente = TenantAtivo & { diasAtraso: number };
  const pendentes: Pendente[] = tenantAtivoList
    .filter((t) => !paymentsMesAtual.has(t.id))
    .map((t) => ({
      ...t,
      diasAtraso: calcPayment(t, mesAtual, null, null).diasAtraso,
    }));

  const emAtraso = pendentes.filter((p) => p.diasAtraso > 0).length;
  const emDia = tenantAtivoList.length - emAtraso;

  const proximosVencimentos = pendentes
    .sort((a, b) => a.dia_vencimento - b.dia_vencimento)
    .slice(0, 5);

  const hoje = capitalize(
    new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">
            Olá, bem-vindo(a)!
          </h1>
          <p className="mt-1 text-sm text-ink-2">
            Aqui está o resumo da sua carteira de imóveis.
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink-2">
          <CalendarIcon className="h-3.5 w-3.5" />
          Hoje, {hoje}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-stamp-soft text-stamp">
            <BuildingIcon className="h-[18px] w-[18px]" />
          </span>
          <p className="mt-3 text-xs text-ink-2">Total de imóveis</p>
          <p className="mt-0.5 text-2xl font-semibold text-ink">
            {unitCount ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-stamp-soft text-stamp">
            <FileTextIcon className="h-[18px] w-[18px]" />
          </span>
          <p className="mt-3 text-xs text-ink-2">Contratos ativos</p>
          <p className="mt-0.5 text-2xl font-semibold text-ink">
            {tenantAtivoList.length}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-stamp-soft text-stamp">
            <CheckCircleIcon className="h-[18px] w-[18px]" />
          </span>
          <p className="mt-3 text-xs text-ink-2">Pagamentos em dia</p>
          <p className="mt-0.5 text-2xl font-semibold text-ink">{emDia}</p>
        </div>
        <div className="rounded-2xl border border-danger/30 bg-surface p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-danger-soft text-danger">
            <AlertTriangleIcon className="h-[18px] w-[18px]" />
          </span>
          <p className="mt-3 text-xs text-ink-2">Em atraso</p>
          <p className="mt-0.5 text-2xl font-semibold text-danger">
            {emAtraso}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-line bg-surface p-4 lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">
              Próximos vencimentos
            </h2>
            <Link
              href="/app/pagamentos"
              className="text-xs font-medium text-stamp hover:underline"
            >
              Ver todos →
            </Link>
          </div>
          <div className="flex flex-col gap-1">
            {proximosVencimentos.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 text-sm hover:bg-surface-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${t.diasAtraso > 0 ? "bg-danger" : "bg-warn"}`}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-ink">
                      {t.units?.properties?.endereco} — {t.units?.label}
                    </p>
                    <p className="text-xs text-ink-3">Aluguel</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-ink-2">
                    dia {t.dia_vencimento}
                  </p>
                  <p className="font-medium text-ink">
                    {fmtMoney(t.valor_aluguel)}
                  </p>
                </div>
              </div>
            ))}
            {proximosVencimentos.length === 0 && (
              <p className="px-2 py-4 text-sm text-ink-3">
                Nenhum pagamento pendente este mês.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink">Receita do mês</h2>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {fmtMoney(receitaMesAtual)}
          </p>
          <p
            className={`mt-1 flex items-center gap-1 text-xs ${variacaoPercent >= 0 ? "text-stamp" : "text-danger"}`}
          >
            <ArrowUpRightIcon
              className={`h-3.5 w-3.5 ${variacaoPercent < 0 ? "rotate-90" : ""}`}
            />
            {variacaoPercent >= 0 ? "+" : ""}
            {variacaoPercent.toFixed(0)}% em relação ao mês anterior
          </p>
          <div className="mt-4">
            <RevenueChart data={chartData} />
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-3">
          Seus imóveis no mapa
        </p>
        <PropertyMap
          properties={propertyList
            .filter(
              (p): p is typeof p & { latitude: number; longitude: number } =>
                p.latitude != null && p.longitude != null
            )
            .map(
              (p): MapProperty => ({
                id: p.id,
                endereco: p.endereco,
                latitude: p.latitude,
                longitude: p.longitude,
              })
            )}
        />
        {propertyList.length -
          propertyList.filter((p) => p.latitude != null && p.longitude != null)
            .length >
          0 && (
          <p className="mt-2 text-xs text-ink-3">
            Alguns imóveis não aparecem no mapa porque o endereço não foi
            localizado.
          </p>
        )}
      </div>
    </div>
  );
}
