import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

export async function ensureNotificationPermission(): Promise<boolean> {
  let granted = await isPermissionGranted();
  if (!granted) {
    const result = await requestPermission();
    granted = result === "granted";
  }
  return granted;
}

export async function notifySessionDone(tagLabel: string): Promise<void> {
  const granted = await ensureNotificationPermission();
  if (!granted) return;
  sendNotification({
    title: "집중 세션 완료",
    body: `${tagLabel} 세션이 끝났습니다. 자기평가를 남겨주세요.`,
  });
}
