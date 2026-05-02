import type { SelfReview } from "../types";

interface Props {
  open: boolean;
  onSelect: (review: SelfReview) => void;
}

export function ReviewModal({ open, onSelect }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[360px] rounded-xl bg-white border border-zinc-200 p-5 shadow-2xl">
        <h2 className="text-lg font-semibold text-zinc-900">세션 완료</h2>
        <p className="mt-1 text-sm text-zinc-500">이번 세션, 어땠나요?</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onSelect("focused")}
            className="px-3 py-3 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            집중 잘됨
          </button>
          <button
            type="button"
            onClick={() => onSelect("distracted")}
            className="px-3 py-3 text-sm font-medium rounded-lg bg-amber-500 hover:bg-amber-400 text-white"
          >
            흐트러짐
          </button>
        </div>
      </div>
    </div>
  );
}
