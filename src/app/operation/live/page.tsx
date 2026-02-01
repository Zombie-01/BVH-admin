'use client';
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LiveMap } from '@/components/operation/LiveMap';
import { OrderPanel } from '@/components/operation/OrderPanel';
import { WorkerPanel } from '@/components/operation/WorkerPanel';
import type { ServiceWorker, Order } from '@/data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, Users } from 'lucide-react';

// Fallback coordinates (Ulaanbaatar) and helper to ensure we have lat/lng for the map
const UB_LAT = 47.9184;
const UB_LNG = 106.9177;
const jitter = (scale = 0.03) => (Math.random() - 0.5) * scale;

function normalizeWorkers(raw: any[]): ServiceWorker[] {
  return (raw || []).map((w, i) => ({
    id: String(w.id ?? `w-${i}`),
    profile_name: w.profile?.name ?? w.profile_name ?? w.name ?? 'Ажилчин',
    is_available: !!w.is_available,
    lat: w.lat ?? w.location?.lat ?? UB_LAT + jitter(0.05),
    lng: w.lng ?? w.location?.lng ?? UB_LNG + jitter(0.08),
    specialty: w.specialty ?? null,
    rating: w.rating ?? 0,
    completed_jobs: w.completed_jobs ?? 0,
    current_task: w.is_available ? undefined : (w.current_task ?? 'Ажил гүйцэтгэж байна'),
    ...w,
  }));
}

function normalizeOrders(raw: any[]): Order[] {
  return (raw || []).map((o: any) => ({
    id: String(o.id),
    user_id: o.user_id ?? o.customer_id ?? null,
    user_name: o.customer_name ?? o.user_name ?? 'Хэрэглэгч',
    store_id: o.store_id ?? null,
    store_name: o.store_name ?? o.merchant_name ?? null,
    worker_id: o.worker_id ?? null,
    worker_name: o.worker_name ?? null,
    type: (o.type as Order['type']) ?? (o.service_type as any) ?? 'delivery',
    status: (o.status as Order['status']) ?? 'pending',
    total_amount: o.total_amount ?? o.amount ?? 0,
    delivery_address: o.delivery_address ?? o.address ?? null,
    created_at: o.created_at ?? o.created_at,
    delivery_lat: o.delivery_lat ?? o.delivery_lat,
    delivery_lng: o.delivery_lng ?? o.delivery_lng,
    ...o,
  }));
}

export default function LiveOperations() {
  const [workers, setWorkers] = useState<ServiceWorker[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<ServiceWorker | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch workers + pending orders from server APIs
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [wRes, oRes] = await Promise.all([
          fetch('/api/operation/workers'),
          fetch('/api/v1/orders?status=pending&limit=50'),
        ]);

        const wJson = await wRes.json();
        const oJson = await oRes.json();

        if (!mounted) return;
        setWorkers(normalizeWorkers(wJson?.workers ?? []));
        setOrders(normalizeOrders(oJson?.orders ?? []));
      } catch (err) {
        console.error('Failed to load live data', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Small client-side simulation to make the map feel alive (no DB changes)
  useEffect(() => {
    const interval = setInterval(() => {
      setWorkers((prev) =>
        prev.map((worker) => ({
          ...worker,
          lat: (worker.lat ?? UB_LAT) + (Math.random() - 0.5) * 0.002,
          lng: (worker.lng ?? UB_LNG) + (Math.random() - 0.5) * 0.002,
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleAssignWorker = async (orderId: string, workerId: string) => {
    // optimistic UI update
    const worker = workers.find((w) => w.id === workerId) ?? null;
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              worker_id: workerId,
              worker_name: worker?.profile_name ?? null,
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

    try {
      const res = await fetch('/api/operation/assign', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderId, workerId }),
      });
      if (!res.ok) throw new Error('Assign request failed');
      // refresh a subset to reconcile any server-side changes
      const [wRes, oRes] = await Promise.all([
        fetch('/api/operation/workers'),
        fetch('/api/v1/orders?status=pending&limit=50'),
      ]);
      const wJson = await wRes.json();
      const oJson = await oRes.json();
      setWorkers(normalizeWorkers(wJson?.workers ?? []));
      setOrders(normalizeOrders(oJson?.orders ?? []));
    } catch (err) {
      console.error('Assign failed, rolling back optimistic update', err);
      // rollback: refetch
      const [wRes, oRes] = await Promise.all([
        fetch('/api/operation/workers'),
        fetch('/api/v1/orders?limit=50'),
      ]);
      const wJson = await wRes.json();
      const oJson = await oRes.json();
      setWorkers(normalizeWorkers(wJson?.workers ?? []));
      setOrders(normalizeOrders(oJson?.orders ?? []));
    }
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
          <div className="lg:col-span-2 rounded-lg border border-border overflow-hidden bg-card min-h-[300px] flex items-center justify-center">
            {loading ? (
              <div className="text-sm text-muted-foreground">Live data — ачаалж байна...</div>
            ) : (
              <LiveMap
                workers={workers}
                orders={orders}
                selectedWorker={selectedWorker}
                selectedOrder={selectedOrder}
                onSelectWorker={setSelectedWorker}
              />
            )}
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
