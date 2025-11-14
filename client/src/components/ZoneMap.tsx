import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Fix for default marker icons in Leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Zone {
  id: string;
  name: string;
  status: "optimal" | "low-pressure" | "high-demand" | "offline";
  flowRate: string;
  pressure: string;
  lat: number;
  lng: number;
}

interface ZoneMapProps {
  zones: Zone[];
  onZoneClick?: (zone: Zone) => void;
}

export function ZoneMap({ zones, onZoneClick }: ZoneMapProps) {
  const statusConfig = {
    optimal: { color: "#22c55e", label: "Optimal", fillColor: "rgba(34, 197, 94, 0.2)" },
    "low-pressure": { color: "#eab308", label: "Low Pressure", fillColor: "rgba(234, 179, 8, 0.2)" },
    "high-demand": { color: "#f97316", label: "High Demand", fillColor: "rgba(249, 115, 22, 0.2)" },
    offline: { color: "#ef4444", label: "Offline", fillColor: "rgba(239, 68, 68, 0.2)" },
  };

  // Raipur city center coordinates
  const raipurCenter: [number, number] = [21.2514, 81.6296];

  const createCustomIcon = (status: Zone['status']) => {
    const config = statusConfig[status];
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="position: relative;">
          <div style="
            width: 24px;
            height: 24px;
            background-color: ${config.color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            position: absolute;
            top: -12px;
            left: -12px;
            animation: pulse 2s infinite;
          "></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  return (
    <Card className="p-6" data-testid="card-zone-map">
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-lg font-semibold">Raipur City Water Distribution Map</h3>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(statusConfig).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-sm text-muted-foreground">{config.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden border-2 border-border">
          <MapContainer
            center={raipurCenter}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {zones.map((zone) => {
              const config = statusConfig[zone.status];
              return (
                <div key={zone.id}>
                  <Circle
                    center={[zone.lat, zone.lng]}
                    radius={800}
                    pathOptions={{
                      color: config.color,
                      fillColor: config.fillColor,
                      fillOpacity: 0.3,
                      weight: 2,
                    }}
                  />
                  <Marker
                    position={[zone.lat, zone.lng]}
                    icon={createCustomIcon(zone.status)}
                    eventHandlers={{
                      click: () => {
                        onZoneClick?.(zone);
                      },
                    }}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <div className="font-semibold text-base mb-2">{zone.name}</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant="secondary" className="text-xs">
                              {config.label}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Consumption:</span>
                            <span className="font-medium">{zone.flowRate} L/h</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pressure:</span>
                            <span className="font-medium">{zone.pressure}</span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </div>
              );
            })}
          </MapContainer>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
      `}</style>
    </Card>
  );
}