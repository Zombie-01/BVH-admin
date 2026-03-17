'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface StoreLocationMapProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
}

// Custom marker icon for store location
const createStoreIcon = () => {
  return new L.Icon({
    iconUrl:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIgZmlsbD0iIzAwNDFiMiIvPjwvc3ZnPg==',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Component to handle map clicks
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to handle marker dragging
function DraggableMarker({
  lat,
  lng,
  onLocationChange,
}: {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);
  const map = useMap();

  useEffect(() => {
    if (markerRef.current) {
      const latLng = new L.LatLng(lat, lng);
      markerRef.current.setLatLng(latLng);
      // Center map on marker
      map.setView(latLng, map.getZoom());
    }
  }, [lat, lng, map]);

  return (
    <Marker
      ref={markerRef}
      position={[lat, lng]}
      icon={createStoreIcon()}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const position = marker.getLatLng();
          onLocationChange(position.lat, position.lng);
        },
      }}
    >
      <Popup>
        <div className="text-sm">
          <p className="font-medium">Дэлгүүрийн байршил</p>
          <p className="text-muted-foreground">
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

export function StoreLocationMap({
  onLocationSelect,
  initialLat = 47.9184,
  initialLng = 106.9177,
}: StoreLocationMapProps) {
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);
  const [address, setAddress] = useState<string>('');

  const handleMapClick = async (clickLat: number, clickLng: number) => {
    setLat(clickLat);
    setLng(clickLng);

    // Try to get address from coordinates (optional - can be removed)
    // Using OpenStreetMap Nominatim API
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${clickLat}&lon=${clickLng}`
      );
      const data = await response.json();
      const addressText =
        data.address?.city_district ||
        data.address?.suburb ||
        data.address?.neighbourhood ||
        `${clickLat.toFixed(6)}, ${clickLng.toFixed(6)}`;
      setAddress(addressText);
    } catch (_error) {
      // If reverse geocoding fails, use coordinates as fallback
      setAddress(`${clickLat.toFixed(6)}, ${clickLng.toFixed(6)}`);
    }
  };

  const handleLocationChange = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    // Update address from nominatim
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}`)
      .then((res) => res.json())
      .then((data) => {
        const addressText =
          data.address?.city_district ||
          data.address?.suburb ||
          data.address?.neighbourhood ||
          `${newLat.toFixed(6)}, ${newLng.toFixed(6)}`;
        setAddress(addressText);
      })
      .catch((_error) => {
        setAddress(`${newLat.toFixed(6)}, ${newLng.toFixed(6)}`);
      });
  };

  const handleConfirmLocation = () => {
    onLocationSelect(lat, lng, address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  };

  return (
    <div className="space-y-3">
      <div className="relative w-full h-80 rounded-lg border border-input overflow-hidden">
        <MapContainer
          center={[lat, lng]}
          zoom={13}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onMapClick={handleMapClick} />
          <DraggableMarker lat={lat} lng={lng} onLocationChange={handleLocationChange} />
        </MapContainer>
      </div>

      <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Өргөн (Latitude)</p>
            <p className="text-sm font-medium">{lat.toFixed(6)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Урт (Longitude)</p>
            <p className="text-sm font-medium">{lng.toFixed(6)}</p>
          </div>
        </div>
        {address && (
          <div>
            <p className="text-xs text-muted-foreground">Хаяг</p>
            <p className="text-sm text-foreground">{address}</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleConfirmLocation}
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium text-sm"
        >
          Энэ байршилыг сонгох
        </button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Газрын зурагыг цэгцлэхийн тулд дарна уу эсвэл маркерыг чирнэ үү
      </p>
    </div>
  );
}
