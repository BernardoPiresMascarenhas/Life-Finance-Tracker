"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatBRL } from "@/lib/format";
import type { ChartPoint } from "./types";

const chartConfig = {
  bankroll: { label: "Banca", color: "var(--chart-1)" },
} satisfies ChartConfig;

// formato compacto para o eixo Y (R$ 1,2 mil)
const compact = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function BankrollChart({ data }: { data: ChartPoint[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[260px] w-full">
      <AreaChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
        <defs>
          <linearGradient id="fillBankroll" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
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
          width={52}
          fontSize={12}
          tickFormatter={(v) => `R$ ${compact.format(v)}`}
        />
        <ReferenceLine y={0} stroke="var(--border)" />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatBRL(value as number)}
              labelFormatter={(label) => `Sessão de ${label}`}
            />
          }
        />
        <Area
          type="monotone"
          dataKey="bankroll"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#fillBankroll)"
          dot={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
