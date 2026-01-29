'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface PieItem {
  name: string;
  value: number;
}

interface Props {
  data: PieItem[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted-foreground))'];

export default function OrderTypePie({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
