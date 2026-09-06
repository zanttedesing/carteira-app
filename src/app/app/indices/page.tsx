import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAccountId } from "@/lib/account";
import { fmtMesReferencia } from "@/lib/calc";
import { addIndice, deleteIndice } from "./actions";

type Indice = {
  id: string;
  tipo: string;
  mes_referencia: string;
  valor_percent: number;
};

const TIPOS = ["IPCA", "IGP-M", "INPC"] as const;

const inputClass =
  "rounded-lg border border-line px-2 py-1.5 text-sm outline-none focus:border-stamp";

export default async function IndicesPage(props: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const params = await props.searchParams;
  const tipoAtivo = TIPOS.includes(params.tipo as (typeof TIPOS)[number])
    ? (params.tipo as (typeof TIPOS)[number])
    : "IPCA";

  const supabase = await createClient();
  await requireAccountId(supabase);

  const { data: indices } = await supabase
    .from("indices")
    .select("id, tipo, mes_referencia, valor_percent")
    .eq("tipo", tipoAtivo)
    .order("mes_referencia", { ascending: false });

  const indiceList = (indices ?? []) as Indice[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Índices</h1>
        <p className="mt-1 text-sm text-ink-2">
          Cadastre aqui os valores mensais de cada índice, conforme a tabela
          do seu contrato. Quando um pagamento estiver atrasado, o sistema usa
          esse valor automaticamente para calcular a correção.
        </p>
      </div>

      <div className="flex gap-2">
        {TIPOS.map((tipo) => (
          <Link
            key={tipo}
            href={`/app/indices?tipo=${tipo}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              tipo === tipoAtivo
                ? "bg-stamp text-stamp-ink"
                : "border border-line text-ink hover:bg-surface-2"
            }`}
          >
            {tipo}
          </Link>
        ))}
      </div>

      <form
        action={addIndice}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-surface p-4"
      >
        <input type="hidden" name="tipo" value={tipoAtivo} />
        <label className="flex flex-col gap-1 text-sm text-ink">
          Mês de referência
          <input name="mes_referencia" type="month" required className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink">
          Valor do mês (%)
          <input
            name="valor_percent"
            type="number"
            step="0.0001"
            required
            placeholder="ex: 0.45"
            className={inputClass}
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-stamp px-4 py-2 text-sm font-medium text-stamp-ink hover:bg-stamp/90"
        >
          Salvar {tipoAtivo}
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-3">
              <th className="px-4 py-2">Mês</th>
              <th className="px-4 py-2">Valor (%)</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {indiceList.map((i) => (
              <tr key={i.id} className="border-b border-line last:border-0">
                <td className="px-4 py-2 text-ink">
                  {fmtMesReferencia(i.mes_referencia)}
                </td>
                <td className="px-4 py-2 text-ink">{i.valor_percent}%</td>
                <td className="px-4 py-2 text-right">
                  <form action={deleteIndice}>
                    <input type="hidden" name="id" value={i.id} />
                    <button
                      type="submit"
                      className="text-xs text-danger hover:underline"
                    >
                      remover
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {indiceList.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-ink-3">
                  Nenhum valor de {tipoAtivo} cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
