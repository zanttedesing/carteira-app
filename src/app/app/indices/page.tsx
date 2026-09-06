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
  "rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-zinc-900";

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
        <h1 className="text-2xl font-semibold text-zinc-900">Índices</h1>
        <p className="mt-1 text-sm text-zinc-500">
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
                ? "bg-zinc-900 text-white"
                : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            {tipo}
          </Link>
        ))}
      </div>

      <form
        action={addIndice}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 bg-white p-4"
      >
        <input type="hidden" name="tipo" value={tipoAtivo} />
        <label className="flex flex-col gap-1 text-sm text-zinc-700">
          Mês de referência
          <input name="mes_referencia" type="month" required className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700">
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
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Salvar {tipoAtivo}
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-400">
              <th className="px-4 py-2">Mês</th>
              <th className="px-4 py-2">Valor (%)</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {indiceList.map((i) => (
              <tr key={i.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-2 text-zinc-700">
                  {fmtMesReferencia(i.mes_referencia)}
                </td>
                <td className="px-4 py-2 text-zinc-700">{i.valor_percent}%</td>
                <td className="px-4 py-2 text-right">
                  <form action={deleteIndice}>
                    <input type="hidden" name="id" value={i.id} />
                    <button
                      type="submit"
                      className="text-xs text-red-600 hover:underline"
                    >
                      remover
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {indiceList.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-zinc-400">
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
