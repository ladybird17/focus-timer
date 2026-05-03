interface Props {
  label: string;
  value: string;
  hint?: string;
}

export function KpiCard({ label, value, hint }: Props) {
  return (
    <div className="flex-1 min-w-[120px] p-4 rounded-xl bg-white border border-zinc-200">
      <div className="text-xs font-medium text-zinc-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-zinc-900 tabular-nums">
        {value}
      </div>
      {hint && (
        <div className="mt-0.5 text-xs text-zinc-500 tabular-nums">{hint}</div>
      )}
    </div>
  );
}
