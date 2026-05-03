import type { InterruptReason } from "../types";
import { useLang } from "../lib/lang";

interface Props {
  open: boolean;
  reasons: InterruptReason[];
  onSelect: (reason: InterruptReason) => void;
  onCancel: () => void;
}

export function InterruptModal({ open, reasons, onSelect, onCancel }: Props) {
  const { t } = useLang();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[360px] rounded-xl bg-white border border-zinc-200 p-5 shadow-2xl">
        <h2 className="text-lg font-semibold text-zinc-900">{t.interruptTitle}</h2>
        <p className="mt-1 text-sm text-zinc-500">{t.interruptDesc}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {reasons.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onSelect(r)}
              className="px-3 py-2.5 text-sm rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-left"
            >
              {t.reason[r]}
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-800"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}
