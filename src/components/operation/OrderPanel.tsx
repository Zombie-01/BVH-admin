'use client';
import { type Order, type ServiceWorker } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Package, Truck, Wrench, MapPin, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

interface OrderPanelProps {
  orders: Order[];
  workers: ServiceWorker[];
  selectedOrder: Order | null;
  onSelectOrder: (order: Order | null) => void;
  onAssignWorker: (orderId: string, workerId: string) => void;
}

export function OrderPanel({
  orders,
  workers,
  selectedOrder,
  onSelectOrder,
  onAssignWorker,
}: OrderPanelProps) {
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');

  const availableWorkers = workers.filter((w) => w.is_available);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="destructive" className="text-xs">
            Хүлээгдэж байна
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge variant="default" className="text-xs">
            Баталгаажсан
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="secondary" className="text-xs">
            Явагдаж байна
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="text-xs">
            Дууссан
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive" className="text-xs">
            Цуцалсан
          </Badge>
        );
    }
  };

  const handleAssign = (orderId: string) => {
    if (selectedWorkerId) {
      onAssignWorker(orderId, selectedWorkerId);
      setAssigningOrderId(null);
      setSelectedWorkerId('');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('mn-MN').format(amount) + '₮';
  };

  // Sort orders: pending first, then by date
  const sortedOrders = [...orders].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3">
        {sortedOrders.map((order) => (
          <div
            key={order.id}
            className={`p-4 rounded-lg border transition-all cursor-pointer ${
              selectedOrder?.id === order.id
                ? 'border-primary bg-primary/5'
                : 'border-border bg-muted/30 hover:bg-muted/50'
            }`}
            onClick={() => onSelectOrder(selectedOrder?.id === order.id ? null : order)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {order.type === 'delivery' ? (
                  <Truck className="w-4 h-4 text-blue-500" />
                ) : (
                  <Wrench className="w-4 h-4 text-purple-500" />
                )}
                <span className="font-medium text-foreground text-sm">
                  #{order.id.toUpperCase()}
                </span>
              </div>
              {getStatusBadge(order.status)}
            </div>

            {/* Customer info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-3.5 h-3.5" />
                <span>{order.user_name}</span>
              </div>

              {order.delivery_address && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{order.delivery_address}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>{order.created_at}</span>
              </div>
            </div>

            {/* Amount and provider */}
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">
                  {formatCurrency(order.total_amount)}
                </span>
                {order.store_name && (
                  <span className="text-xs text-muted-foreground">{order.store_name}</span>
                )}
              </div>
            </div>

            {/* Worker assignment */}
            {order.worker_id ? (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-foreground">
                    Оноогдсон: <strong>{order.worker_name}</strong>
                  </span>
                </div>
              </div>
            ) : (
              order.status === 'pending' && (
                <div className="mt-3 pt-3 border-t border-border">
                  {assigningOrderId === order.id ? (
                    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                      <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Ажилтан сонгох" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableWorkers.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">
                              Боломжтой ажилтан байхгүй
                            </div>
                          ) : (
                            availableWorkers.map((worker) => (
                              <SelectItem key={worker.id} value={worker.id}>
                                <div className="flex items-center gap-2">
                                  <span>{worker.profile_name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({worker.specialty})
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          disabled={!selectedWorkerId}
                          onClick={() => handleAssign(order.id)}
                        >
                          Оноох
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAssigningOrderId(null);
                            setSelectedWorkerId('');
                          }}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAssigningOrderId(order.id);
                      }}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Ажилтан оноох
                    </Button>
                  )}
                </div>
              )
            )}
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Захиалга байхгүй байна</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
