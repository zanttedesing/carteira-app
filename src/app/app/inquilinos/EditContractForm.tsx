import { updateTenant } from "./actions";

type Props = {
  tenant: {
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
  };
};

const inputClass =
  "rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-stamp";
const labelClass = "flex flex-col gap-1 text-sm text-ink";

export function EditContractForm({ tenant }: Props) {
  return (
    <details className="rounded-lg border border-line bg-surface">
      <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-ink">
        Editar contrato
      </summary>
      <form
        action={updateTenant}
        className="grid grid-cols-2 gap-3 border-t border-line p-3 sm:grid-cols-3"
      >
        <input type="hidden" name="id" value={tenant.id} />
        <label className={labelClass}>
          Valor do aluguel (R$)
          <input
            name="valor_aluguel"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={tenant.valor_aluguel}
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
            required
            defaultValue={tenant.dia_vencimento}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Início do contrato
          <input
            name="data_inicio"
            type="date"
            required
            defaultValue={tenant.data_inicio}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Fim do contrato
          <input
            name="data_fim"
            type="date"
            defaultValue={tenant.data_fim ?? ""}
            className={inputClass}
          />
        </label>
        <label className="mt-6 flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="prazo_indeterminado"
            defaultChecked={tenant.prazo_indeterminado}
          />
          Prazo indeterminado
        </label>
        <label className={labelClass}>
          Multa por atraso (%)
          <input
            name="multa_percent"
            type="number"
            step="0.01"
            min="0"
            defaultValue={tenant.multa_percent}
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
            defaultValue={tenant.juros_mes_percent}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Índice de correção
          <select
            name="indice_correcao"
            defaultValue={tenant.indice_correcao}
            className={inputClass}
          >
            <option value="Nenhum">Nenhum</option>
            <option value="IPCA">IPCA</option>
            <option value="IGP-M">IGP-M</option>
            <option value="INPC">INPC</option>
          </select>
        </label>
        <label className="mt-6 flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="contrato_assinado"
            defaultChecked={tenant.contrato_assinado}
          />
          Contrato assinado
        </label>
        <label className={`${labelClass} col-span-full`}>
          Observações do contrato
          <textarea
            name="obs_contrato"
            rows={2}
            defaultValue={tenant.obs_contrato}
            className={inputClass}
          />
        </label>
        <div className="col-span-full">
          <button
            type="submit"
            className="rounded-lg bg-stamp px-4 py-2 text-sm font-medium text-stamp-ink hover:bg-stamp/90"
          >
            Salvar alterações
          </button>
        </div>
      </form>
    </details>
  );
}
