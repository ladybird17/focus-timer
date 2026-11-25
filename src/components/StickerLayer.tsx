import { useEffect, useRef } from "react";
import { STICKER, type Placement } from "../lib/stickers";

interface Props {
  placements: Placement[];
  srcByRef: Map<string, string>;
  /** true 일 때만 끌어서 옮길 수 있다. 평소에는 클릭이 그대로 통과한다. */
  editing: boolean;
  selectedId: number | null;
  /** 스티커를 눌렀을 때 (고르기 + 맨 위로 올리기) */
  onGrab: (id: number) => void;
  /** 끌어서 옮기는 중 — 좌표는 320px 본체 기준 */
  onMove: (id: number, x: number, y: number) => void;
  /** 빈 곳을 눌렀을 때 */
  onDeselect: () => void;
}

/** 시계 본체 위에 붙인 스티커들. TimerDisplay 의 카드 안에 그려져서 카드와 함께 줄어든다. */
export function StickerLayer({
  placements,
  srcByRef,
  editing,
  selectedId,
  onGrab,
  onMove,
  onDeselect,
}: Props) {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: number; dx: number; dy: number } | null>(null);
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

  /** 화면 좌표 → 320px 본체 기준 좌표 (카드가 transform 으로 줄어든 경우도 맞춘다) */
  function toCard(e: { clientX: number; clientY: number }) {
    const rect = layerRef.current!.getBoundingClientRect();
    const scale = rect.width / STICKER.card || 1;
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
  }

  // 끌기는 window 에서 받는다 — 스티커가 맨 위로 올라가며 DOM 순서가 바뀌어도 끊기지 않게
  useEffect(() => {
    if (!editing) {
      dragRef.current = null;
      return;
    }
    function move(e: PointerEvent) {
      const d = dragRef.current;
      if (!d || !layerRef.current) return;
      const p = toCard(e);
      onMoveRef.current(d.id, p.x - d.dx, p.y - d.dy);
    }
    function up() {
      dragRef.current = null;
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [editing]);

  return (
    <div
      ref={layerRef}
      className="absolute inset-0 select-none"
      style={{ pointerEvents: editing ? "auto" : "none" }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onDeselect();
      }}
    >
      {placements.map((p) => {
        const src = srcByRef.get(p.ref);
        if (!src) return null;
        const selected = editing && p.id === selectedId;
        return (
          <div
            key={p.id}
            className="absolute"
            style={{
              left: p.x - p.size / 2,
              top: p.y - p.size / 2,
              width: p.size,
              height: p.size,
              transform: `rotate(${p.rot}deg)`,
              cursor: editing ? "grab" : undefined,
              touchAction: "none",
              outline: selected ? "1.5px dashed #2563eb" : undefined,
              outlineOffset: 3,
            }}
            onPointerDown={(e) => {
              if (!editing) return;
              e.preventDefault();
              const pt = toCard(e);
              dragRef.current = { id: p.id, dx: pt.x - p.x, dy: pt.y - p.y };
              onGrab(p.id);
            }}
          >
            <img
              src={src}
              alt=""
              draggable={false}
              className="w-full h-full object-contain pointer-events-none"
              style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.28))" }}
            />
          </div>
        );
      })}
    </div>
  );
}
