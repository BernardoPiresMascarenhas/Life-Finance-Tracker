"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatBRL } from "@/lib/format";

export type CashflowPoint = {
  label: string;
  receitas: number;
  despesas: number;
};

const chartConfig = {
  receitas: { label: "Receitas", color: "var(--chart-2)" },
  despesas: { label: "Despesas", color: "var(--chart-5)" },
} satisfies ChartConfig;

const compact = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function CashflowChart({ data }: { data: CashflowPoint[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <BarChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={52}
          fontSize={12}
          tickFormatter={(v) => `R$ ${compact.format(v)}`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <span className="flex w-full justify-between gap-3">
                  <span className="text-muted-foreground">
                    {chartConfig[name as keyof typeof chartConfig]?.label}
                  </span>
                  <span className="tabular-nums">
                    {formatBRL(value as number)}
                  </span>
                </span>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="receitas" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="despesas" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
