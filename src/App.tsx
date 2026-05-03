import { useEffect, useState } from "react";
import Timer from "./pages/Timer";
import Today from "./pages/Today";

export type View = "timer" | "today";

const DAY_START_KEY = "focus-timer.dayStartHour";

function loadDayStartHour(): number {
  const raw = localStorage.getItem(DAY_START_KEY);
  if (raw == null) return 0;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > 23) return 0;
  return Math.floor(n);
}

export default function App() {
  const [view, setView] = useState<View>("timer");
  const [dayStartHour, setDayStartHour] = useState<number>(loadDayStartHour);

  useEffect(() => {
    localStorage.setItem(DAY_START_KEY, String(dayStartHour));
  }, [dayStartHour]);

  if (view === "today") {
    return (
      <Today
        view={view}
        onChangeView={setView}
        dayStartHour={dayStartHour}
      />
    );
  }
  return (
    <Timer
      view={view}
      onChangeView={setView}
      dayStartHour={dayStartHour}
      onChangeDayStartHour={setDayStartHour}
    />
  );
}
