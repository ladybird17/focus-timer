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

export async function notifySessionDone(
  tagLabel: string,
  texts: { title: string; body: (tagLabel: string) => string },
): Promise<void> {
  const granted = await ensureNotificationPermission();
  if (!granted) return;
  sendNotification({
    title: texts.title,
    body: texts.body(tagLabel),
  });
}
