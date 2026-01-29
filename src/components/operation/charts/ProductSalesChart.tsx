'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import type { ProductSalesData } from '@/data/mockData';

const PRODUCT_COLORS = [
  'hsl(var(--primary))',
  'hsl(215 70% 50%)',
  'hsl(142 70% 45%)',
  'hsl(38 92% 50%)',
  'hsl(280 65% 55%)',
  'hsl(0 72% 51%)',
];

interface Props {
  data: ProductSalesData[];
}

export default function ProductSalesChart({ data }: Props) {
  const formatCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat('mn-MN', {
        maximumFractionDigits: 0,
      }).format(amount) + '₮'
    );
  };

  const formatLargeCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(1) + 'B₮';
    }
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(0) + 'M₮';
    }
    return formatCurrency(amount);
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          type="number"
          stroke="hsl(var(--muted-foreground))"
          tickFormatter={(v) => formatLargeCurrency(v as number)}
        />
        <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" width={140} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
          }}
          formatter={(value: number, name: string) => [
            name === 'revenue' ? formatCurrency(value) : value,
            name === 'revenue' ? 'Орлого' : 'Борлуулалт',
          ]}
        />
        <Legend />
        <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Орлого" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
