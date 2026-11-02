"use client";
import { ThemeProvider } from "next-themes";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { preferencesSchema, type Preferences } from "@/lib/schema";
import { api } from "@/lib/utils";
type User = { id: string; email?: string };
const defaultPreferences = preferencesSchema.parse({});
const AppContext = createContext<{
  preferences: Preferences;
  update: (v: Partial<Preferences>) => void;
  user: User | null;
  authReady: boolean;
  refreshUser: () => Promise<void>;
}>({
  preferences: defaultPreferences,
  update: () => {},
  user: null,
  authReady: false,
  refreshUser: async () => {},
});
export const useApp = () => useContext(AppContext);
export function Providers({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const refreshUser = useCallback(async () => {
    try {
      const data = await api<{ user: User | null }>("/api/auth");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setAuthReady(true);
    }
  }, []);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("insightlens-preferences-v1");
      if (saved) {
        const value = preferencesSchema.safeParse(JSON.parse(saved));
        if (value.success) setPreferences(value.data);
      }
    } catch {
      /* Storage can be disabled. */
    }
    void refreshUser();
  }, [refreshUser]);
  useEffect(() => {
    document.documentElement.dataset.accent = preferences.accent;
  }, [preferences.accent]);
  const update = (value: Partial<Preferences>) =>
    setPreferences((previous) => {
      const next = preferencesSchema.parse({ ...previous, ...value });
      try {
        localStorage.setItem(
          "insightlens-preferences-v1",
          JSON.stringify(next),
        );
      } catch {
        /* Preferences still work for this visit. */
      }
      return next;
    });
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AppContext.Provider
        value={{ preferences, update, user, authReady, refreshUser }}
      >
        {children}
      </AppContext.Provider>
    </ThemeProvider>
  );
}
