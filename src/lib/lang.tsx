import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { MESSAGES, type Lang, type Messages } from "./i18n";

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Messages;
}

const LangContext = createContext<LangContextValue | null>(null);

const STORAGE_KEY = "focus-timer.lang";

function loadLang(): Lang {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === "en" || saved === "ko" ? saved : "ko";
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(loadLang);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t: MESSAGES[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
