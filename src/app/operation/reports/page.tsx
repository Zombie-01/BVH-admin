'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ShoppingCart, DollarSign, Truck, Wrench, TrendingUp, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import React from 'react';
import OrdersBarChart from '@/components/operation/charts/OrdersBarChart';
import ProductSalesChart from '@/components/operation/charts/ProductSalesChart';
import OrderTypePie from '@/components/operation/charts/OrderTypePie';
import RevenueAreaChart from '@/components/operation/charts/RevenueAreaChart';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted-foreground))'];
const PRODUCT_COLORS = [
  'hsl(var(--primary))',
  'hsl(215 70% 50%)',
  'hsl(142 70% 45%)',
  'hsl(38 92% 50%)',
  'hsl(280 65% 55%)',
  'hsl(0 72% 51%)',
];

export default function Reports() {
  const [reportData, setReportData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [productSales, setProductSales] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalOrders: 0, totalRevenue: 0 });

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

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/api/operation/reports');
        const body = await res.json();
        if (!mounted) return;
        if (res.ok) {
          setReportData(body.reportData || []);
          setRecentOrders(body.recentOrders || []);
          setProductSales(body.productSales || []);
          setStats(body.stats || { totalOrders: 0, totalRevenue: 0 });
        } else console.error('Failed to load reports', body);
      } catch (e) {
        console.error(e);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const deliveryCount = recentOrders.filter((o) => o.type === 'delivery').length;
  const serviceCount = recentOrders.filter((o) => o.type === 'service').length;

  const pieData = [
    { name: 'Хүргэлт', value: deliveryCount },
    { name: 'Үйлчилгээ', value: serviceCount },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Тайлан</h2>
          <p className="text-muted-foreground">Бизнесийн гүйцэтгэлийн тойм</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Нийт захиалга"
            value={stats?.totalOrders ?? 0}
            icon={<ShoppingCart className="w-5 h-5 text-muted-foreground" />}
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatsCard
            title="Нийт орлого"
            value={formatCurrency(stats?.totalRevenue ?? 0)}
            icon={<DollarSign className="w-5 h-5 text-green-500" />}
            trend={{ value: 8.3, isPositive: true }}
          />
          <StatsCard
            title="Хүргэлт"
            value={deliveryCount}
            icon={<Truck className="w-5 h-5 text-muted-foreground" />}
          />
          <StatsCard
            title="Үйлчилгээ"
            value={serviceCount}
            icon={<Wrench className="w-5 h-5 text-muted-foreground" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <TrendingUp className="w-5 h-5" />
                Орлогын график
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <RevenueAreaChart data={reportData} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <ShoppingCart className="w-5 h-5" />
                Захиалгын статистик
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <OrdersBarChart data={reportData} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Sales Chart - NEW */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Package className="w-5 h-5" />
              Бүтээгдэхүүний борлуулалт
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ProductSalesChart data={productSales} />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Захиалгын төрөл</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <OrderTypePie data={pieData} />
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {entry.name}: {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-foreground">Сүүлийн захиалгууд</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.slice(0, 4).map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {order.user_id || order.user_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.type === 'delivery'
                          ? order.store_id || order.store_name
                          : order.worker_id || order.worker_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        {formatCurrency(order.total_amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">{order.created_at}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
