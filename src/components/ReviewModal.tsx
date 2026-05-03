import type { SelfReview } from "../types";
import { useLang } from "../lib/lang";

interface Props {
  open: boolean;
  onSelect: (review: SelfReview) => void;
}

export function ReviewModal({ open, onSelect }: Props) {
  const { t } = useLang();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[360px] rounded-xl bg-white border border-zinc-200 p-5 shadow-2xl">
        <h2 className="text-lg font-semibold text-zinc-900">{t.reviewTitle}</h2>
        <p className="mt-1 text-sm text-zinc-500">{t.reviewDesc}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onSelect("focused")}
            className="px-3 py-3 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            {t.reviewFocused}
          </button>
          <button
            type="button"
            onClick={() => onSelect("distracted")}
            className="px-3 py-3 text-sm font-medium rounded-lg bg-amber-500 hover:bg-amber-400 text-white"
          >
            {t.reviewDistracted}
          </button>
        </div>
      </div>
    </div>
  );
}
