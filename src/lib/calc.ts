export type IndiceTipo = "Nenhum" | "IPCA" | "IGP-M" | "INPC";

export type TenantForCalc = {
  valor_aluguel: number;
  dia_vencimento: number;
  multa_percent: number;
  juros_mes_percent: number;
  indice_correcao: string;
};

export type CalcResult = {
  diasAtraso: number;
  multa: number;
  juros: number;
  correcao: number;
  total: number;
  correcaoMissing: boolean;
};

// Mesma lógica validada no protótipo (Artifact): multa fixa sobre o
// aluguel, juros e correção pró-rata pelos dias de atraso (base 30).
export function calcPayment(
  tenant: TenantForCalc,
  mesReferencia: string,
  dataPagamento: string | null,
  indiceValorPercent: number | null
): CalcResult {
  const [ano, mes] = mesReferencia.split("-").map(Number);
  const vencimento = new Date(ano, mes - 1, tenant.dia_vencimento);
  const referencia = dataPagamento
    ? new Date(dataPagamento + "T00:00:00")
    : new Date();
  const diasAtraso = Math.max(
    0,
    Math.floor((referencia.getTime() - vencimento.getTime()) / 86400000)
  );

  if (diasAtraso === 0) {
    return {
      diasAtraso: 0,
      multa: 0,
      juros: 0,
      correcao: 0,
      total: tenant.valor_aluguel,
      correcaoMissing: false,
    };
  }

  const multa = tenant.valor_aluguel * (tenant.multa_percent / 100);
  const juros =
    tenant.valor_aluguel * (tenant.juros_mes_percent / 100) * (diasAtraso / 30);

  let correcao = 0;
  let correcaoMissing = false;
  if (tenant.indice_correcao !== "Nenhum") {
    if (indiceValorPercent != null) {
      correcao =
        tenant.valor_aluguel * (indiceValorPercent / 100) * (diasAtraso / 30);
    } else {
      correcaoMissing = true;
    }
  }

  return {
    diasAtraso,
    multa,
    juros,
    correcao,
    total: tenant.valor_aluguel + multa + juros + correcao,
    correcaoMissing,
  };
}

export function fmtMoney(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function fmtDate(d: string | null | undefined) {
  if (!d) return "-";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

export function currentMesReferencia() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function shiftMesReferencia(mesReferencia: string, delta: number) {
  const [ano, mes] = mesReferencia.split("-").map(Number);
  const date = new Date(ano, mes - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function fmtMesReferencia(mesReferencia: string) {
  const [ano, mes] = mesReferencia.split("-").map(Number);
  const date = new Date(ano, mes - 1, 1);
  const texto = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
