'use client';
import { type ServiceWorker, type Order } from '@/data/mockData';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const workerIcon = (isAvailable: boolean) =>
  new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="${isAvailable ? '#22c55e' : '#eab308'}" stroke="white" stroke-width="2"/>
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="white"/>
    </svg>
  `)}`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

const orderIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#ef4444"/>
    </svg>
  `)}`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

// Component to handle dynamic bounds fitting
function BoundsFitter({ workers, orders }: { workers: ServiceWorker[]; orders: Order[] }) {
  const map = useMap();

  useEffect(() => {
    const allPositions: [number, number][] = [];

    // Add worker positions
    workers.forEach((worker) => {
      if (worker.lat && worker.lng) {
        allPositions.push([worker.lat, worker.lng]);
      }
    });

    // Add order positions (using the generated positions)
    const orderPositions = orders
      .filter((o) => o.status === 'pending')
      .map((order, index) => ({
        lat: 47.8864 + Math.sin(index * 1.5) * 0.02,
        lng: 106.9057 + Math.cos(index * 1.5) * 0.04,
      }));

    orderPositions.forEach((order) => {
      allPositions.push([order.lat, order.lng]);
    });

    if (allPositions.length > 0) {
      const bounds = L.latLngBounds(allPositions);
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 15 });
    }
  }, [workers, orders, map]);

  return null;
}

interface LiveMapProps {
  workers: ServiceWorker[];
  orders: Order[];
  selectedWorker: ServiceWorker | null;
  selectedOrder: Order | null;
  onSelectWorker: (worker: ServiceWorker | null) => void;
}

export function LiveMap({ workers, orders, selectedWorker, onSelectWorker }: LiveMapProps) {
  const [hoveredWorker, setHoveredWorker] = useState<string | null>(null);

  // Use real order positions from delivery_lat/lng, fallback to generated positions for pending orders
  const orderPositions = orders
    .filter((o) => o.status === 'pending')
    .map((order, index) => ({
      ...order,
      lat: order.delivery_lat ?? 47.8864 + Math.sin(index * 1.5) * 0.02,
      lng: order.delivery_lng ?? 106.9057 + Math.cos(index * 1.5) * 0.04,
    }));

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={[47.8864, 106.9057]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <BoundsFitter workers={workers} orders={orders} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Order markers */}
        {orderPositions.map((order) => (
          <Marker key={order.id} position={[order.lat, order.lng]} icon={orderIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-medium">Захиалга #{order.id}</p>
                <p className="text-muted-foreground">{order.user_name}</p>
                <p className="text-muted-foreground">{order.total_amount.toLocaleString()}₮</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Worker markers */}
        {workers.map((worker) => {
          if (!worker.lat || !worker.lng) return null;
          const isSelected = selectedWorker?.id === worker.id;

          return (
            <Marker
              key={worker.id}
              position={[worker.lat, worker.lng]}
              icon={workerIcon(worker.is_available)}
              eventHandlers={{
                click: () => onSelectWorker(isSelected ? null : worker),
                mouseover: () => setHoveredWorker(worker.id),
                mouseout: () => setHoveredWorker(null),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-medium">{worker.profile_name}</p>
                  <p className="text-muted-foreground">{worker.specialty}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`w-2 h-2 rounded-full ${worker.is_available ? 'bg-green-500' : 'bg-yellow-500'}`}
                    />
                    <span className="text-xs">
                      {worker.is_available ? 'Боломжтой' : worker.current_task || 'Завгүй'}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map title */}
      <div className="absolute top-4 left-4 z-10 bg-card/95 backdrop-blur border border-border rounded-lg p-3">
        <h3 className="text-lg font-semibold text-foreground">Улаанбаатар</h3>
        <p className="text-xs text-muted-foreground">Live газрын зураг</p>
      </div>

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
            <div className="w-3 h-3 rounded-full bg-red-500" />
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
