'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import type { ReportData } from '@/data/mockData';

interface Props {
  data: ReportData[];
}

export default function OrdersBarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
        <YAxis stroke="hsl(var(--muted-foreground))" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
          }}
        />
        <Bar dataKey="deliveries" fill="hsl(var(--primary))" name="Хүргэлт" />
        <Bar dataKey="services" fill="hsl(var(--muted-foreground))" name="Үйлчилгээ" />
      </BarChart>
    </ResponsiveContainer>
  );
}
