/**
 * 스티커 꾸미기 — 시계 본체(TimerDisplay 의 320px 카드) 위에 붙이는 이미지.
 * 크기·좌표는 모두 320px 본체 기준 값이고, 본체가 줄어들면(미니 모드) 같은 비율로 줄어든다.
 */
export const STICKER = {
  /** 좌표 기준이 되는 본체 한 변 */
  card: 320,
  defaultSize: 56,
  minSize: 32,
  maxSize: 96,
  /** 회전 한계(±도) */
  maxRotate: 45,
  /** 한 번에 붙일 수 있는 개수 */
  maxCount: 12,
  /** 등록할 수 있는 파일 최대 용량 */
  maxBytes: 512 * 1024,
  /** 등록할 때 긴 변을 이 크기로 줄여서 보관한다 (SVG·GIF 제외) */
  storePx: 256,
} as const;

const MIME_BY_EXT: Record<string, string> = {
  png: "image/png",
  webp: "image/webp",
  svg: "image/svg+xml",
  gif: "image/gif",
};
const ALLOWED_MIME = Object.values(MIME_BY_EXT);
/** 파일 선택 창의 accept 값 */
export const STICKER_ACCEPT = ".png,.webp,.svg,.gif," + ALLOWED_MIME.join(",");

/** 사용자가 등록한 스티커 (DB 의 stickers 테이블) */
export interface UserSticker {
  id: number;
  name: string;
  mime: string;
  /** data URL */
  data: string;
}

/** 서랍에 보이는 스티커 한 칸 — 기본 스티커와 등록한 스티커를 같은 모양으로 다룬다 */
export interface StickerItem {
  /** "builtin:clover" | "user:12" */
  ref: string;
  name: string;
  src: string;
  /** 등록한 스티커일 때만 — 서랍에서 삭제할 때 쓴다 */
  userId?: number;
}

/** 본체에 붙인 스티커 하나 */
export interface Placement {
  id: number;
  ref: string;
  /** 스티커 중심 좌표 (320px 본체 기준) */
  x: number;
  y: number;
  /** 한 변 길이 (320px 본체 기준) */
  size: number;
  /** 회전 각도(도) */
  rot: number;
}

export type StickerErrorCode =
  | "BAD_FORMAT"
  | "TOO_LARGE"
  | "DECODE_FAILED"
  | "LIMIT";

export class StickerError extends Error {
  constructor(public code: StickerErrorCode) {
    super(code);
    this.name = "StickerError";
  }
}

// ── 기본 스티커 3종 ──

const svgUrl = (body: string) =>
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" stroke-linejoin="round" stroke-linecap="round">${body}</svg>`,
  );

const CLOVER_LEAVES = [
  [32, 19],
  [19, 32],
  [45, 32],
  [32, 45],
];
const cloverLeaves = (attrs: string) =>
  CLOVER_LEAVES.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" ${attrs}/>`).join("");

export type BuiltinStickerKey = "clover" | "star" | "coffee";

export const BUILTIN_STICKERS: { key: BuiltinStickerKey; src: string }[] = [
  {
    key: "clover",
    src: svgUrl(
      `<path d="M34 40q3 12 12 17" fill="none" stroke="#15803d" stroke-width="3.5"/>` +
        cloverLeaves('fill="#15803d" stroke="#15803d" stroke-width="5"') +
        cloverLeaves('fill="#4ade80"') +
        `<path d="M32 22v20M22 32h20" stroke="#22a05a" stroke-width="1.5"/>`,
    ),
  },
  {
    key: "star",
    src: svgUrl(
      `<path d="M32 6l7.6 16.2 17.7 2.2-13 12.2 3.4 17.5L32 45.6 16.3 54.1l3.4-17.5-13-12.2 17.7-2.2z" fill="#fbbf24" stroke="#b45309" stroke-width="2.5"/>` +
        `<circle cx="26.5" cy="30" r="1.9" fill="#7c2d12"/><circle cx="37.5" cy="30" r="1.9" fill="#7c2d12"/>` +
        `<path d="M27.5 36q4.5 3.5 9 0" fill="none" stroke="#7c2d12" stroke-width="2"/>`,
    ),
  },
  {
    key: "coffee",
    src: svgUrl(
      `<path d="M24 19q-3-4 0-8M34 19q-3-4 0-8" fill="none" stroke="#a8a29e" stroke-width="2.5"/>` +
        `<path d="M44 31h4a6 6 0 0 1 0 12h-5" fill="none" stroke="#78350f" stroke-width="2.5"/>` +
        `<path d="M13 26h32v14a13 13 0 0 1-13 13h-6a13 13 0 0 1-13-13z" fill="#fffbeb" stroke="#78350f" stroke-width="2.5"/>` +
        `<path d="M14.3 27.3h29.4v4.5H14.3z" fill="#92400e"/>`,
    ),
  },
];

export const builtinRef = (key: BuiltinStickerKey) => `builtin:${key}`;
export const userRef = (id: number) => `user:${id}`;

// ── 배치 ──

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/**
 * 규칙에 맞게 다듬는다.
 * 본체 밖으로는 스티커의 절반까지 나갈 수 있다 = 중심이 본체 안에 있으면 된다.
 */
export function clampPlacement(p: Placement): Placement {
  return {
    ...p,
    x: clamp(p.x, 0, STICKER.card),
    y: clamp(p.y, 0, STICKER.card),
    size: Math.round(clamp(p.size, STICKER.minSize, STICKER.maxSize)),
    rot: Math.round(clamp(p.rot, -STICKER.maxRotate, STICKER.maxRotate)),
  };
}

/** 새 스티커를 놓을 자리 후보 — 모서리부터 채운다 */
const SPOTS: [number, number][] = [
  [42, 42],
  [278, 42],
  [278, 278],
  [42, 278],
  [160, 22],
  [298, 160],
  [160, 298],
  [22, 160],
  [100, 28],
  [220, 292],
  [220, 28],
  [100, 292],
];

export function pickFreeSpot(placements: Placement[]): [number, number] {
  return (
    SPOTS.find(
      ([x, y]) => !placements.some((p) => Math.hypot(p.x - x, p.y - y) < 30),
    ) ?? SPOTS[0]
  );
}

const PLACEMENTS_STORAGE_KEY = "focus-timer.stickers";

export function loadPlacements(): Placement[] {
  try {
    const raw = JSON.parse(localStorage.getItem(PLACEMENTS_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .filter(
        (p): p is Placement =>
          !!p &&
          typeof p.ref === "string" &&
          [p.id, p.x, p.y, p.size, p.rot].every(Number.isFinite),
      )
      .slice(0, STICKER.maxCount)
      .map(clampPlacement);
  } catch {
    return [];
  }
}

export function savePlacements(placements: Placement[]): void {
  localStorage.setItem(PLACEMENTS_STORAGE_KEY, JSON.stringify(placements));
}

// ── 등록 ──

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new StickerError("DECODE_FAILED"));
    reader.readAsDataURL(blob);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new StickerError("DECODE_FAILED"));
    img.src = src;
  });
}

/**
 * 등록할 파일을 검사하고 보관용 data URL 로 바꾼다.
 * - PNG·WebP 는 긴 변이 storePx 를 넘으면 그 크기로 줄인다 (원본 비율 유지)
 * - SVG 는 그대로, GIF 도 움직임이 사라지지 않게 그대로 둔다
 */
export async function prepareStickerFile(
  file: File,
): Promise<Omit<UserSticker, "id">> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mime = file.type || MIME_BY_EXT[ext] || "";
  if (!ALLOWED_MIME.includes(mime)) throw new StickerError("BAD_FORMAT");
  if (file.size > STICKER.maxBytes) throw new StickerError("TOO_LARGE");

  let data = await readAsDataUrl(file);
  // 깨진 파일은 여기서 걸러진다
  const img = await loadImage(data);

  if (mime === "image/png" || mime === "image/webp") {
    const longSide = Math.max(img.naturalWidth, img.naturalHeight);
    if (longSide > STICKER.storePx) {
      const scale = STICKER.storePx / longSide;
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new StickerError("DECODE_FAILED");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      data = canvas.toDataURL(mime);
    }
  }

  return { name: file.name, mime, data };
}
