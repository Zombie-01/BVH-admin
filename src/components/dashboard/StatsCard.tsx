import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, subtitle, icon, trend }: StatsCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            {trend && (
              <p className={`text-xs ${trend.isPositive ? 'text-green-500' : 'text-destructive'}`}>
                {trend.isPositive ? '+' : ''}
                {trend.value}% өмнөх 7 хоногоос
              </p>
            )}
          </div>
          <div className="p-3 rounded-lg bg-muted">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
