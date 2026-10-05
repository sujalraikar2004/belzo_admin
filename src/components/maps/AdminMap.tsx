import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export interface MapPoint {
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  type: 'RESTAURANT' | 'DELIVERY_PARTNER' | 'CUSTOMER';
  speedKmH?: number;
  etaMinutes?: number;
  iconText?: string;
}

export interface AdminMapProps {
  center?: [number, number];
  zoom?: number;
  restaurant?: MapPoint;
  courier?: MapPoint;
  customer?: MapPoint;
  otherCouriers?: MapPoint[];
  showRoute?: boolean;
  className?: string;
  height?: string;
  onSelectPoint?: (point: MapPoint) => void;
}

export const AdminMap: React.FC<AdminMapProps> = ({
  center = [12.9716, 77.6412], // Bengaluru default
  zoom = 13,
  restaurant,
  courier,
  customer,
  otherCouriers = [],
  showRoute = true,
  className = '',
  height = '320px',
  onSelectPoint,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy prior map instance if existing
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(center, zoom);

    // OpenStreetMap Standard Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    const boundsPoints: [number, number][] = [];

    // Helper for custom HTML markers
    const createMarkerIcon = (point: MapPoint) => {
      let bg = '#b51c00';
      let icon = 'restaurant';
      if (point.type === 'DELIVERY_PARTNER') {
        bg = '#0058be';
        icon = 'two_wheeler';
      } else if (point.type === 'CUSTOMER') {
        bg = '#006947';
        icon = 'home';
      }

      const html = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          ${point.speedKmH !== undefined ? `
            <div style="background: #ba1a1a; color: #fff; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 9999px; margin-bottom: 2px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
              ${point.speedKmH} km/h
            </div>
          ` : ''}
          <div style="width: 32px; height: 32px; border-radius: 9999px; background: ${bg}; color: #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.25); border: 2px solid #ffffff;">
            <span class="material-symbols-outlined" style="font-size: 18px;">${icon}</span>
          </div>
        </div>
      `;

      return L.divIcon({
        className: 'custom-map-pin',
        html,
        iconSize: [36, 48],
        iconAnchor: [18, 40],
        popupAnchor: [0, -36],
      });
    };

    // Add Restaurant Marker
    if (restaurant) {
      boundsPoints.push([restaurant.lat, restaurant.lng]);
      const marker = L.marker([restaurant.lat, restaurant.lng], { icon: createMarkerIcon(restaurant) }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px;">
          <strong style="color: #b51c00;">${restaurant.title}</strong><br/>
          <span>${restaurant.subtitle || 'Merchant Outlet'}</span>
        </div>
      `);
      if (onSelectPoint) marker.on('click', () => onSelectPoint(restaurant));
    }

    // Add Courier Marker
    if (courier) {
      boundsPoints.push([courier.lat, courier.lng]);
      const marker = L.marker([courier.lat, courier.lng], { icon: createMarkerIcon(courier) }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px;">
          <strong style="color: #0058be;">${courier.title}</strong><br/>
          <span>${courier.subtitle || 'Assigned Courier'}</span><br/>
          <span>Speed: ${courier.speedKmH || 0} km/h</span>
        </div>
      `);
      if (onSelectPoint) marker.on('click', () => onSelectPoint(courier));
    }

    // Add Customer Marker
    if (customer) {
      boundsPoints.push([customer.lat, customer.lng]);
      const marker = L.marker([customer.lat, customer.lng], { icon: createMarkerIcon(customer) }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px;">
          <strong style="color: #006947;">${customer.title}</strong><br/>
          <span>${customer.subtitle || 'Delivery Destination'}</span>
        </div>
      `);
      if (onSelectPoint) marker.on('click', () => onSelectPoint(customer));
    }

    // Add Other Nearby Couriers
    otherCouriers.forEach((c) => {
      const marker = L.marker([c.lat, c.lng], { icon: createMarkerIcon(c) }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px;">
          <strong>${c.title}</strong><br/>
          <span>${c.subtitle || 'Fleet Partner'}</span>
        </div>
      `);
    });

    // Draw Route Polyline
    if (showRoute && restaurant && customer) {
      const latlngs: [number, number][] = [];
      latlngs.push([restaurant.lat, restaurant.lng]);
      if (courier) {
        latlngs.push([courier.lat, courier.lng]);
      }
      latlngs.push([customer.lat, customer.lng]);

      L.polyline(latlngs, {
        color: '#b51c00',
        weight: 4,
        opacity: 0.85,
        dashArray: '6, 6',
      }).addTo(map);
    }

    // Fit Bounds if multiple points
    if (boundsPoints.length > 1) {
      map.fitBounds(L.latLngBounds(boundsPoints), { padding: [40, 40], maxZoom: 15 });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, restaurant, courier, customer, otherCouriers, showRoute, onSelectPoint]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    if (courier) {
      mapInstanceRef.current.setView([courier.lat, courier.lng], 15);
    } else if (restaurant) {
      mapInstanceRef.current.setView([restaurant.lat, restaurant.lng], 14);
    } else {
      mapInstanceRef.current.setView(center, zoom);
    }
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  return (
    <div className={`relative w-full overflow-hidden rounded-xl bg-surface-container-high ${className}`} style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Tactical Map Controls */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 bg-surface-container-lowest/90 backdrop-blur-md rounded-lg p-1 shadow-md border border-surface-container-high/60">
        <button
          onClick={handleZoomIn}
          type="button"
          title="Zoom In"
          className="w-7 h-7 rounded flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
        </button>
        <div className="h-px bg-surface-container-high" />
        <button
          onClick={handleZoomOut}
          type="button"
          title="Zoom Out"
          className="w-7 h-7 rounded flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">remove</span>
        </button>
        <div className="h-px bg-surface-container-high" />
        <button
          onClick={handleRecenter}
          type="button"
          title="Recenter Route"
          className="w-7 h-7 rounded flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">my_location</span>
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute top-2.5 right-2.5 z-10 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md border border-surface-container-high/60 flex items-center gap-3 font-label-sm text-label-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="text-on-surface font-medium">Merchant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
          <span className="text-on-surface font-medium">Courier</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-tertiary" />
          <span className="text-on-surface font-medium">Customer</span>
        </div>
      </div>
    </div>
  );
};
