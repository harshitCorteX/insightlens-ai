"use client";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
export function ThemeControl({ full = false }: { full?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div
      className={full ? "theme-control full" : "theme-control"}
      role="group"
      aria-label="Appearance"
    >
      {(
        [
          ["light", Sun, "Light"],
          ["dark", Moon, "Dark"],
          ["system", Monitor, "System"],
        ] as const
      ).map(([value, Icon, label]) => (
        <button
          key={value}
          type="button"
          title={`${label} theme`}
          aria-label={`${label} theme`}
          aria-pressed={mounted && theme === value}
          className={mounted && theme === value ? "selected" : ""}
          onClick={() => setTheme(value)}
        >
          <Icon size={15} />
          {full && <span>{label}</span>}
        </button>
      ))}
    </div>
  );
}
