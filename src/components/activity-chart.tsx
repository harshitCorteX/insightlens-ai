"use client";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
export default function ActivityChart({
  data,
}: {
  data: { day: string; count: number }[];
}) {
  return (
    <div
      className="activity-chart"
      role="img"
      aria-label={`Saved analyses by day: ${data.map((x) => `${x.day}: ${x.count}`).join(", ")}`}
    >
      <ResponsiveContainer width="100%" height={160}>
        <BarChart
          data={data}
          margin={{ left: -30, right: 5, top: 10, bottom: 0 }}
        >
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted)", fontSize: 9 }}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted)", fontSize: 9 }}
          />
          <Tooltip
            cursor={{ fill: "var(--accent-soft)" }}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              fontSize: 11,
              color: "var(--foreground)",
            }}
          />
          <Bar
            dataKey="count"
            name="Saved analyses"
            fill="var(--primary)"
            radius={[3, 3, 0, 0]}
            maxBarSize={22}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
