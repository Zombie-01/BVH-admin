'use client';
import { type ServiceWorker, type Order } from '@/data/mockData';
import { useState, useEffect } from 'react';

interface LiveMapProps {
  workers: ServiceWorker[];
  orders: Order[];
  selectedWorker: ServiceWorker | null;
  selectedOrder: Order | null;
  onSelectWorker: (worker: ServiceWorker | null) => void;
}

// Simple canvas-based map for UB coordinates
export function LiveMap({ workers, orders, selectedWorker, onSelectWorker }: LiveMapProps) {
  const [hoveredWorker, setHoveredWorker] = useState<string | null>(null);

  // Convert lat/lng to percentage position on map (simplified UB bounds)
  const latMin = 47.88;
  const latMax = 47.96;
  const lngMin = 106.85;
  const lngMax = 106.99;

  const toPosition = (lat: number, lng: number) => {
    const x = ((lng - lngMin) / (lngMax - lngMin)) * 100;
    const y = ((latMax - lat) / (latMax - latMin)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  // Generate random positions for pending orders
  const orderPositions = orders
    .filter((o) => o.status === 'pending')
    .map((order, index) => ({
      ...order,
      lat: 47.9184 + Math.sin(index * 1.5) * 0.02,
      lng: 106.9177 + Math.cos(index * 1.5) * 0.04,
    }));

  return (
    <div className="h-full w-full relative bg-muted/30 overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Map title */}
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-lg font-semibold text-foreground">Улаанбаатар</h3>
        <p className="text-xs text-muted-foreground">Live газрын зураг</p>
      </div>

      {/* Order markers */}
      {orderPositions.map((order) => {
        const pos = toPosition(order.lat, order.lng);
        return (
          <div
            key={order.id}
            className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div className="relative group">
              <div className="w-6 h-6 rounded-full bg-destructive border-2 border-background flex items-center justify-center shadow-lg animate-pulse">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                </svg>
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-popover border border-border rounded-lg p-2 shadow-lg whitespace-nowrap">
                  <p className="text-xs font-medium text-foreground">Захиалга #{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.user_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.total_amount.toLocaleString()}₮
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Worker markers */}
      {workers.map((worker) => {
        if (!worker.lat || !worker.lng) return null;
        const pos = toPosition(worker.lat, worker.lng);
        const isSelected = selectedWorker?.id === worker.id;
        const isHovered = hoveredWorker === worker.id;

        return (
          <div
            key={worker.id}
            className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            onClick={() => onSelectWorker(isSelected ? null : worker)}
            onMouseEnter={() => setHoveredWorker(worker.id)}
            onMouseLeave={() => setHoveredWorker(null)}
          >
            <div className="relative">
              <div
                className={`
                  w-10 h-10 rounded-full border-3 flex items-center justify-center shadow-lg transition-all
                  ${worker.is_available ? 'bg-green-500' : 'bg-yellow-500'}
                  ${isSelected ? 'ring-4 ring-primary scale-110' : ''}
                `}
                style={{ borderWidth: '3px', borderColor: 'white' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>

              {/* Tooltip */}
              {(isHovered || isSelected) && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2">
                  <div className="bg-popover border border-border rounded-lg p-3 shadow-lg whitespace-nowrap">
                    <p className="text-sm font-medium text-foreground">{worker.profile_name}</p>
                    <p className="text-xs text-muted-foreground">{worker.specialty}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span
                        className={`w-2 h-2 rounded-full ${worker.is_available ? 'bg-green-500' : 'bg-yellow-500'}`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {worker.is_available ? 'Боломжтой' : worker.current_task || 'Завгүй'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur border border-border rounded-lg p-3 z-30">
        <p className="text-xs font-medium text-foreground mb-2">Тайлбар</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Боломжтой ажилтан</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-xs text-muted-foreground">Ажил дээр</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-xs text-muted-foreground">Хүлээгдэж буй захиалга</span>
          </div>
        </div>
      </div>

      {/* Stats overlay */}
      <div className="absolute top-4 right-4 bg-card/95 backdrop-blur border border-border rounded-lg p-3 z-30">
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">
            {workers.filter((w) => w.is_available).length}
          </p>
          <p className="text-xs text-muted-foreground">Боломжтой</p>
        </div>
      </div>
    </div>
  );
}
