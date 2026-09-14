export function RevenueChart({
  data,
}: {
  data: { label: string; valor: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.valor));

  return (
    <div className="flex h-28 items-end gap-2.5">
      {data.map((d, i) => {
        const pct = Math.max(3, Math.round((d.valor / max) * 100));
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex h-24 w-full items-end">
              <div
                className="w-full rounded-t-md bg-stamp/80"
                style={{ height: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] text-ink-3">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
