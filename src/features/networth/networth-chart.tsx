"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatBRL } from "@/lib/format";
import type { NetWorthPoint } from "./types";

const chartConfig = {
  total: { label: "Patrimônio", color: "var(--chart-2)" },
} satisfies ChartConfig;

const compact = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function NetWorthChart({ data }: { data: NetWorthPoint[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[260px] w-full">
      <LineChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
          fontSize={12}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          fontSize={12}
          tickFormatter={(v) => `R$ ${compact.format(v)}`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatBRL(value as number)}
            />
          }
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="var(--chart-2)"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ChartContainer>
  );
}
