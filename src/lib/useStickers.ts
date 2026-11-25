import { useEffect, useMemo, useState } from "react";
import { addSticker, deleteSticker, listStickers } from "./db";
import {
  BUILTIN_STICKERS,
  STICKER,
  StickerError,
  builtinRef,
  clampPlacement,
  loadPlacements,
  pickFreeSpot,
  prepareStickerFile,
  savePlacements,
  userRef,
  type BuiltinStickerKey,
  type Placement,
  type StickerItem,
  type UserSticker,
} from "./stickers";

/**
 * 스티커 서랍(기본 3종 + 등록한 스티커)과 본체에 붙인 스티커 상태.
 * 등록한 이미지는 DB 에, 붙인 위치는 localStorage 에 둔다.
 */
export function useStickers(builtinName: Record<BuiltinStickerKey, string>) {
  const [userStickers, setUserStickers] = useState<UserSticker[]>([]);
  /** DB 조회가 성공했는지 — 실패했을 때 붙여 둔 스티커를 지워 버리지 않으려고 구분한다 */
  const [loaded, setLoaded] = useState(false);
  const [placements, setPlacements] = useState<Placement[]>(loadPlacements);

  useEffect(() => {
    listStickers()
      .then((rows) => {
        setUserStickers(rows);
        setLoaded(true);
      })
      .catch((e) => console.error("listStickers failed", e));
  }, []);

  useEffect(() => {
    savePlacements(placements);
  }, [placements]);

  const items = useMemo<StickerItem[]>(
    () => [
      ...BUILTIN_STICKERS.map((b) => ({
        ref: builtinRef(b.key),
        name: builtinName[b.key],
        src: b.src,
      })),
      ...userStickers.map((u) => ({
        ref: userRef(u.id),
        name: u.name,
        src: u.data,
        userId: u.id,
      })),
    ],
    [userStickers, builtinName],
  );

  const srcByRef = useMemo(
    () => new Map(items.map((it) => [it.ref, it.src])),
    [items],
  );

  // 서랍에서 지워진 스티커는 본체에서도 뗀다
  useEffect(() => {
    if (!loaded) return;
    setPlacements((ps) => {
      const next = ps.filter((p) => srcByRef.has(p.ref));
      return next.length === ps.length ? ps : next;
    });
  }, [loaded, srcByRef]);

  /** 본체에 붙인다. 새 스티커의 id 를 돌려준다. */
  function place(ref: string): number {
    if (placements.length >= STICKER.maxCount) throw new StickerError("LIMIT");
    const [x, y] = pickFreeSpot(placements);
    const id = placements.reduce((m, p) => Math.max(m, p.id), 0) + 1;
    setPlacements([
      ...placements,
      { id, ref, x, y, size: STICKER.defaultSize, rot: 0 },
    ]);
    return id;
  }

  function update(id: number, patch: Partial<Omit<Placement, "id" | "ref">>) {
    setPlacements((ps) =>
      ps.map((p) => (p.id === id ? clampPlacement({ ...p, ...patch }) : p)),
    );
  }

  /** 맨 위로 올린다 (배열 뒤쪽일수록 위에 그려진다) */
  function bringToFront(id: number) {
    setPlacements((ps) => {
      const target = ps.find((p) => p.id === id);
      if (!target || ps[ps.length - 1] === target) return ps;
      return [...ps.filter((p) => p !== target), target];
    });
  }

  function remove(id: number) {
    setPlacements((ps) => ps.filter((p) => p.id !== id));
  }

  function clear() {
    setPlacements([]);
  }

  /** 이미지 파일을 서랍에 등록한다. 규칙에 안 맞으면 StickerError 를 던진다. */
  async function register(file: File): Promise<StickerItem> {
    const prepared = await prepareStickerFile(file);
    const saved = await addSticker(prepared);
    setUserStickers((us) => [...us, saved]);
    return {
      ref: userRef(saved.id),
      name: saved.name,
      src: saved.data,
      userId: saved.id,
    };
  }

  async function unregister(userId: number): Promise<void> {
    await deleteSticker(userId);
    setUserStickers((us) => us.filter((u) => u.id !== userId));
  }

  return {
    items,
    srcByRef,
    placements,
    place,
    update,
    bringToFront,
    remove,
    clear,
    register,
    unregister,
  };
}
