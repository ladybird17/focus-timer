import {
  currentMonitor,
  getCurrentWindow,
  LogicalPosition,
  LogicalSize,
} from "@tauri-apps/api/window";

/** 미니 모드 / 풀 모드 윈도우 크기 (논리 픽셀) */
export const MINI_SIZE = { width: 360, height: 520 };
export const FULL_SIZE = { width: 640, height: 720 };
/** 미니 모드일 때 화면 가장자리에서 띄울 여백 */
const MINI_PADDING = 12;

/** 현재 창의 항상 위에 표시(always-on-top) 상태만 설정한다. */
export async function setAlwaysOnTop(on: boolean): Promise<void> {
  try {
    await getCurrentWindow().setAlwaysOnTop(on);
  } catch (e) {
    console.warn("[setAlwaysOnTop] failed:", e);
  }
}

/**
 * 미니 모드 적용/해제:
 *  - on: 항상 위 + 작은 크기 + 현재 모니터 오른쪽 위 구석
 *  - off: 항상 위 해제 + 기본 크기 + 화면 가운데
 */
export async function applyMiniMode(on: boolean): Promise<void> {
  const win = getCurrentWindow();
  try {
    if (on) {
      await win.setAlwaysOnTop(true);
      await win.setSize(new LogicalSize(MINI_SIZE.width, MINI_SIZE.height));
      const monitor = await currentMonitor();
      if (monitor) {
        const scale = monitor.scaleFactor || 1;
        const monLogicalW = monitor.size.width / scale;
        const monLogicalX = monitor.position.x / scale;
        const monLogicalY = monitor.position.y / scale;
        const x = monLogicalX + monLogicalW - MINI_SIZE.width - MINI_PADDING;
        const y = monLogicalY + MINI_PADDING;
        await win.setPosition(new LogicalPosition(x, y));
      }
    } else {
      await win.setAlwaysOnTop(false);
      await win.setSize(new LogicalSize(FULL_SIZE.width, FULL_SIZE.height));
      await win.center();
    }
  } catch (e) {
    console.warn("[applyMiniMode] failed:", e);
  }
}
