/**
 * 사용자가 입력한 HEX 색을 소문자 #rrggbb 로 정규화한다.
 * #rgb / #rrggbb 를 받고 # 는 없어도 된다. 형식이 틀리면 null.
 */
export function normalizeHex(input: string): string | null {
  let s = input.trim().replace(/^#/, "").toLowerCase();
  if (/^[0-9a-f]{3}$/.test(s)) {
    s = s
      .split("")
      .map((ch) => ch + ch)
      .join("");
  }
  return /^[0-9a-f]{6}$/.test(s) ? `#${s}` : null;
}

/** WCAG 상대 휘도 (0 = 검정, 1 = 흰색). 형식이 틀리면 0. */
export function relativeLuminance(hex: string): number {
  const n = normalizeHex(hex);
  if (!n) return 0;
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(n.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** 이 색을 배경으로 쓸 때 읽히는 글자색 — 밝은 배경이면 zinc-900, 아니면 흰색. */
export function textOnColor(hex: string): string {
  return relativeLuminance(hex) > 0.55 ? "#18181b" : "#ffffff";
}
