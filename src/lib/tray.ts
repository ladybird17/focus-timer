import { invoke } from "@tauri-apps/api/core";

/** 트레이 툴팁(호버 시 보이는 작은 텍스트)을 업데이트. */
export async function setTrayTooltip(text: string): Promise<void> {
  try {
    await invoke("set_tray_tooltip", { text });
  } catch {
    // 트레이가 아직 없거나 환경이 web 미리보기인 경우 무음 실패
  }
}
