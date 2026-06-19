"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { format, subDays } from "date-fns";
import { Visitor } from "@/app/(dashboard)/visitors/list/page";

interface OverviewChartProps {
  visitors: Visitor[];
}

export function OverviewChart({ visitors }: OverviewChartProps) {
  const data = useMemo(() => {
    // Prepare last 7 days with AM/PM label
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        dateStr: format(date, "yyyy-MM-dd"),
        // Day abbreviation plus AM/PM of the date (midday)
        name: `${format(date, "EEE")} ${format(date, "a")}`,
        inside: 0,
        exited: 0,
      };
    });

    visitors.forEach((visitor) => {
      // Determine date string from createdAt if available, otherwise fallback to today
      let dateStr = "";
      if (visitor.createdAt) {
        try {
          const d = new Date(visitor.createdAt);
          dateStr = isNaN(d.getTime()) ? format(new Date(), "yyyy-MM-dd") : format(d, "yyyy-MM-dd");
        } catch {
          dateStr = format(new Date(), "yyyy-MM-dd");
        }
      } else {
        dateStr = format(new Date(), "yyyy-MM-dd");
      }
      const day = last7Days.find((d) => d.dateStr === dateStr);
      if (day) {
        if (visitor.status === "Inside") {
          day.inside += 1;
        } else if (visitor.status === "Exited") {
          day.exited += 1;
        }
      }
    });
    return last7Days;
  }, [visitors]);

  // If there are no visitors, render a friendly placeholder
  if (!visitors || visitors.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No visitor data available.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            borderColor: "hsl(var(--border))",
            color: "hsl(var(--popover-foreground))",
            borderRadius: "8px",
          }}
        />
        <Bar dataKey="inside" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
        <Bar dataKey="exited" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-destructive" />
      </BarChart>
    </ResponsiveContainer>
  );
}
