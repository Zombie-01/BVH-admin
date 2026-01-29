'use client';
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LiveMap } from '@/components/operation/LiveMap';
import { OrderPanel } from '@/components/operation/OrderPanel';
import { WorkerPanel } from '@/components/operation/WorkerPanel';
import { mockWorkers, mockOrders, type ServiceWorker, type Order } from '@/data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, Users } from 'lucide-react';

// Add location data to workers for the map (Ulaanbaatar coordinates)
const workersWithLocation: ServiceWorker[] = mockWorkers.map((worker, index) => ({
  ...worker,
  lat: 47.9184 + (Math.random() - 0.5) * 0.05,
  lng: 106.9177 + (Math.random() - 0.5) * 0.08,
  current_task: worker.is_available ? undefined : 'Ажил гүйцэтгэж байна',
}));

// Add more pending orders for demo
const pendingOrders: Order[] = [
  ...mockOrders,
  {
    id: 'o5',
    user_id: 'u5',
    user_name: 'Өлзий Б.',
    store_id: '1',
    store_name: 'Хүнсний Дэлгүүр №1',
    worker_id: null,
    worker_name: null,
    type: 'delivery',
    status: 'pending',
    total_amount: 85000,
    delivery_address: 'Баянгол, 7-р хороо',
    created_at: '2024-12-24',
  },
  {
    id: 'o6',
    user_id: 'u6',
    user_name: 'Нямаа С.',
    store_id: null,
    store_name: null,
    worker_id: null,
    worker_name: null,
    type: 'service',
    status: 'pending',
    total_amount: 50000,
    delivery_address: 'Сонгинохайрхан, 20-р хороо',
    created_at: '2024-12-24',
  },
];

export default function LiveOperations() {
  const [workers, setWorkers] = useState<ServiceWorker[]>(workersWithLocation);
  const [orders, setOrders] = useState<Order[]>(pendingOrders);
  const [selectedWorker, setSelectedWorker] = useState<ServiceWorker | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Simulate real-time worker movement
  useEffect(() => {
    const interval = setInterval(() => {
      setWorkers((prev) =>
        prev.map((worker) => ({
          ...worker,
          lat: (worker.lat || 47.9184) + (Math.random() - 0.5) * 0.002,
          lng: (worker.lng || 106.9177) + (Math.random() - 0.5) * 0.002,
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleAssignWorker = (orderId: string, workerId: string) => {
    const worker = workers.find((w) => w.id === workerId);
    if (!worker) return;

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              worker_id: workerId,
              worker_name: worker.profile_name,
              status: 'confirmed' as const,
            }
          : order
      )
    );

    setWorkers((prev) =>
      prev.map((w) =>
        w.id === workerId ? { ...w, is_available: false, current_task: `Захиалга #${orderId}` } : w
      )
    );

    setSelectedOrder(null);
  };

  const availableWorkers = workers.filter((w) => w.is_available);
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const activeOrdersCount = orders.filter((o) =>
    ['confirmed', 'in_progress'].includes(o.status)
  ).length;

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-7rem)] flex flex-col gap-4">
        {/* Stats bar */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
            <Users className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-foreground">
              Боломжтой ажилчид: {availableWorkers.length}
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
            <Package className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-foreground">
              Хүлээгдэж буй: {pendingOrdersCount}
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-foreground">
              Идэвхтэй: {activeOrdersCount}
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
          {/* Map */}
          <div className="lg:col-span-2 rounded-lg border border-border overflow-hidden bg-card">
            <LiveMap
              workers={workers}
              orders={orders}
              selectedWorker={selectedWorker}
              selectedOrder={selectedOrder}
              onSelectWorker={setSelectedWorker}
            />
          </div>

          {/* Side panel */}
          <div className="rounded-lg border border-border bg-card overflow-hidden flex flex-col">
            <Tabs defaultValue="orders" className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0">
                <TabsTrigger
                  value="orders"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Захиалгууд
                  {pendingOrdersCount > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 justify-center">
                      {pendingOrdersCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="workers"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Ажилчид
                  <Badge variant="secondary" className="ml-2">
                    {availableWorkers.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="flex-1 m-0 overflow-hidden">
                <OrderPanel
                  orders={orders}
                  workers={workers}
                  selectedOrder={selectedOrder}
                  onSelectOrder={setSelectedOrder}
                  onAssignWorker={handleAssignWorker}
                />
              </TabsContent>

              <TabsContent value="workers" className="flex-1 m-0 overflow-hidden">
                <WorkerPanel
                  workers={workers}
                  selectedWorker={selectedWorker}
                  onSelectWorker={setSelectedWorker}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
