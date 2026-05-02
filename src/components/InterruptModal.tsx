import type { InterruptReason } from "../types";

interface Props {
  open: boolean;
  reasons: { key: InterruptReason; label: string }[];
  onSelect: (reason: InterruptReason) => void;
  onCancel: () => void;
}

export function InterruptModal({ open, reasons, onSelect, onCancel }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[360px] rounded-xl bg-white border border-zinc-200 p-5 shadow-2xl">
        <h2 className="text-lg font-semibold text-zinc-900">중단 사유</h2>
        <p className="mt-1 text-sm text-zinc-500">왜 세션이 끊겼나요?</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {reasons.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => onSelect(r.key)}
              className="px-3 py-2.5 text-sm rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-left"
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-800"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
