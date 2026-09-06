import { createClient } from "@/lib/supabase/server";
import { requireAccountId } from "@/lib/account";
import { PropertyMap, type MapProperty } from "./PropertyMap";

export default async function VisaoGeralPage() {
  const supabase = await createClient();
  await requireAccountId(supabase);

  const [{ data: properties }, { count: unitCount }, { count: tenantCount }] =
    await Promise.all([
      supabase.from("properties").select("id, endereco, latitude, longitude"),
      supabase.from("units").select("id", { count: "exact", head: true }),
      supabase
        .from("tenants")
        .select("id", { count: "exact", head: true })
        .eq("ativo", true),
    ]);

  const propertyList = properties ?? [];
  const mapProperties: MapProperty[] = propertyList
    .filter(
      (p): p is typeof p & { latitude: number; longitude: number } =>
        p.latitude != null && p.longitude != null
    )
    .map((p) => ({
      id: p.id,
      endereco: p.endereco,
      latitude: p.latitude,
      longitude: p.longitude,
    }));

  const semLocalizacao = propertyList.length - mapProperties.length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Visão geral</h1>
        <p className="mt-1 text-sm text-ink-2">
          Onde estão os seus imóveis e o tamanho da carteira.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-3">
            Imóveis
          </p>
          <p className="mt-1 font-serif text-2xl text-ink">
            {propertyList.length}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-3">
            Unidades
          </p>
          <p className="mt-1 font-serif text-2xl text-ink">
            {unitCount ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-3">
            Contratos ativos
          </p>
          <p className="mt-1 font-serif text-2xl text-ink">
            {tenantCount ?? 0}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-3">
          Seus imóveis no mapa
        </p>
        <PropertyMap properties={mapProperties} />
        {semLocalizacao > 0 && (
          <p className="mt-2 text-xs text-ink-3">
            {semLocalizacao === 1
              ? "1 imóvel não aparece no mapa porque o endereço não foi localizado."
              : `${semLocalizacao} imóveis não aparecem no mapa porque o endereço não foi localizado.`}
          </p>
        )}
      </div>
    </div>
  );
}
