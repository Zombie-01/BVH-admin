'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import type { ReportData } from '@/data/mockData';

interface Props {
  data: ReportData[];
}

export default function RevenueAreaChart({ data }: Props) {
  const formatCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat('mn-MN', {
        maximumFractionDigits: 0,
      }).format(amount) + '₮'
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          tickFormatter={(value) => `${((value as number) / 1000000).toFixed(1)}M`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
          }}
          formatter={(value: number) => [formatCurrency(value), 'Орлого']}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary) / 0.2)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
