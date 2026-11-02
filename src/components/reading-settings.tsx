"use client";
import { useApp } from "./providers";
import type { Preferences } from "@/lib/schema";
export function ReadingSettings() {
  const { preferences: p, update } = useApp();
  return (
    <div className="reading-settings">
      {(
        [
          {
            key: "fontSize",
            label: "Font size",
            options: [
              ["small", "Small"],
              ["standard", "Standard"],
              ["large", "Large"],
              ["extra", "Extra large"],
            ],
          },
          {
            key: "font",
            label: "Font family",
            options: [
              ["sans", "Modern sans-serif"],
              ["serif", "Editorial serif"],
            ],
          },
          {
            key: "width",
            label: "Reading width",
            options: [
              ["narrow", "Narrow"],
              ["comfortable", "Comfortable"],
              ["wide", "Wide"],
            ],
          },
          {
            key: "spacing",
            label: "Line spacing",
            options: [
              ["compact", "Compact"],
              ["comfortable", "Comfortable"],
              ["relaxed", "Relaxed"],
            ],
          },
          {
            key: "surface",
            label: "Reading surface",
            options: [
              ["standard", "Standard theme"],
              ["paper", "Warm paper"],
              ["low-glare", "Low-glare dark"],
            ],
          },
        ] as const
      ).map(({ key, label, options }) => (
        <label key={key}>
          {label}
          <select
            value={p[key]}
            onChange={(e) =>
              update({ [key]: e.target.value } as Partial<Preferences>)
            }
          >
            {options.map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </select>
        </label>
      ))}
      <p className="muted text-sm">
        Saved on this browser. Reading surface changes apply inside Focus Mode.
      </p>
    </div>
  );
}
