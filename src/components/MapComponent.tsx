"use client";

import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon issue with Webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Using custom HTML markers to match the exact UI look
const createCustomIcon = (status: string) => {
  const color = status === 'Normal' ? '#10B981' : status === 'Warning' ? '#F59E0B' : '#EF4444';
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;">
        <div style="position: absolute; inset: -8px; border-radius: 9999px; background-color: ${color}; opacity: 0.3;" class="animate-ping"></div>
        <div style="position: relative; width: 24px; height: 24px; border-radius: 9999px; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); background-color: ${color}; display: flex; align-items: center; justify-content: center; z-index: 10;">
          <span style="width: 6px; height: 6px; background-color: white; border-radius: 9999px;"></span>
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

export default function MapComponent({ plants, onSelectPlant }: { plants: any[], onSelectPlant: (id: string) => void }) {
  // Center of Tamil Nadu roughly
  const center = [10.8505, 78.5];
  
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-border shadow-inner relative z-0">
      <MapContainer 
        center={center as any} 
        zoom={7} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {plants.map((plant) => (
          <Marker 
            key={plant.id} 
            position={[plant.lat, plant.lng]}
            icon={createCustomIcon(plant.status)}
            eventHandlers={{
              click: () => onSelectPlant(plant.id),
            }}
          >
            <Tooltip direction="top" offset={[0, -12]} opacity={1} permanent={false}>
              <div className="font-bold text-gray-900 text-sm mb-0.5">{plant.name}</div>
              <div className="text-xs text-gray-500 mb-1.5">{plant.location}</div>
              <div className="text-[10px] font-bold text-emerald-600 flex items-center justify-between">
                <span>{plant.panels.length} Panels</span>
                <span>Click to view →</span>
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-container { background: #eef2f6; }
        .leaflet-tooltip { border: none; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); padding: 12px; }
      `}} />
    </div>
  );
}
