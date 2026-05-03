import { useState } from "react";

interface Props {
  open: boolean;
  beepCount: 1 | 3;
  onChangeBeepCount: (n: 1 | 3) => void;
  flashEnabled: boolean;
  onChangeFlashEnabled: (v: boolean) => void;
  dayStartHour: number;
  onChangeDayStartHour: (h: number) => void;
  onResetToday: () => Promise<number>;
  onClose: () => void;
}

export function SettingsModal({
  open,
  beepCount,
  onChangeBeepCount,
  flashEnabled,
  onChangeFlashEnabled,
  dayStartHour,
  onChangeDayStartHour,
  onResetToday,
  onClose,
}: Props) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  if (!open) return null;

  function close() {
    setConfirmReset(false);
    setResetMsg(null);
    onClose();
  }

  async function handleReset() {
    setResetting(true);
    try {
      const n = await onResetToday();
      setResetMsg(`${n}개 세션이 삭제되었습니다`);
      setConfirmReset(false);
    } catch (e) {
      setResetMsg(e instanceof Error ? `오류: ${e.message}` : "오류가 발생했습니다");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={close}
    >
      <div
        className="w-[380px] rounded-xl bg-white border border-zinc-200 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">설정</h2>
          <button
            type="button"
            onClick={close}
            aria-label="close"
            className="text-zinc-400 hover:text-zinc-700 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="mt-5 space-y-5">
          <div>
            <div className="text-sm font-medium text-zinc-800">알림음</div>
            <p className="text-xs text-zinc-500 mt-0.5">
              세션이 끝날 때 들리는 비프음 횟수
            </p>
            <div className="mt-2 inline-flex rounded-md bg-zinc-100 border border-zinc-200 p-0.5">
              {([1, 3] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChangeBeepCount(n)}
                  className={
                    "px-3 py-1 rounded text-sm font-medium transition-colors " +
                    (beepCount === n
                      ? "bg-zinc-800 text-zinc-50"
                      : "text-zinc-600 hover:text-zinc-900")
                  }
                >
                  {n}회
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-zinc-800">깜빡임</div>
            <p className="text-xs text-zinc-500 mt-0.5">
              알림음과 동시에 다이얼이 밝게 빛남
            </p>
            <div className="mt-2 inline-flex rounded-md bg-zinc-100 border border-zinc-200 p-0.5">
              <button
                type="button"
                onClick={() => onChangeFlashEnabled(false)}
                className={
                  "px-3 py-1 rounded text-sm font-medium transition-colors " +
                  (!flashEnabled
                    ? "bg-zinc-800 text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900")
                }
              >
                끄기
              </button>
              <button
                type="button"
                onClick={() => onChangeFlashEnabled(true)}
                className={
                  "px-3 py-1 rounded text-sm font-medium transition-colors " +
                  (flashEnabled
                    ? "bg-zinc-800 text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900")
                }
              >
                켜기
              </button>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-zinc-800">하루 시작 시각</div>
            <p className="text-xs text-zinc-500 mt-0.5">
              "오늘"의 기준 시각. 예: 5시 → 5월 3일은 5월 3일 5시 ~ 5월 4일 5시 직전
            </p>
            <div className="mt-2 flex items-center gap-2">
              <select
                value={dayStartHour}
                onChange={(e) => onChangeDayStartHour(Number(e.target.value))}
                className="px-2.5 py-1 text-sm rounded-md border border-zinc-300 bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-300"
              >
                {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
              <span className="text-xs text-zinc-500">기준</span>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-200">
            <div className="text-sm font-medium text-zinc-800">데이터</div>
            <p className="text-xs text-zinc-500 mt-0.5">
              오늘 시작된 모든 세션 기록을 삭제합니다. 되돌릴 수 없어요.
            </p>
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => {
                  setResetMsg(null);
                  setConfirmReset(true);
                }}
                className="mt-2 px-3 py-1.5 text-sm font-medium rounded-md text-red-700 bg-red-50 border border-red-200 hover:bg-red-100"
              >
                오늘 기록 초기화
              </button>
            ) : (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-zinc-700">정말 초기화할까요?</span>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  disabled={resetting}
                  className="px-3 py-1 text-sm rounded-md bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50 disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={resetting}
                  className="px-3 py-1 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
                >
                  {resetting ? "삭제중..." : "삭제"}
                </button>
              </div>
            )}
            {resetMsg && (
              <p className="mt-2 text-xs text-zinc-600">{resetMsg}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={close}
            className="px-4 py-1.5 text-sm font-medium rounded-md bg-zinc-800 text-white hover:bg-zinc-700"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}
