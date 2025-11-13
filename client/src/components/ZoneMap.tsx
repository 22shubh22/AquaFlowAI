import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

interface Zone {
  id: string;
  name: string;
  status: "optimal" | "low-pressure" | "high-demand" | "offline";
  flowRate: string;
  pressure: string;
  x: number;
  y: number;
}

interface ZoneMapProps {
  zones: Zone[];
  onZoneClick?: (zone: Zone) => void;
}

export function ZoneMap({ zones, onZoneClick }: ZoneMapProps) {
  const statusConfig = {
    optimal: { color: "bg-chart-2", label: "Optimal", dotColor: "bg-green-500" },
    "low-pressure": { color: "bg-yellow-500", label: "Low Pressure", dotColor: "bg-yellow-500" },
    "high-demand": { color: "bg-orange-500", label: "High Demand", dotColor: "bg-orange-500" },
    offline: { color: "bg-destructive", label: "Offline", dotColor: "bg-red-500" },
  };

  return (
    <Card className="p-6" data-testid="card-zone-map">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Raipur City Water Distribution Map</h3>
          <div className="flex gap-3">
            {Object.entries(statusConfig).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${config.dotColor}`} />
                <span className="text-sm text-muted-foreground">{config.label}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative h-[400px] md:h-[500px] bg-muted/30 rounded-lg border-2 border-border overflow-hidden">
          {zones.map((zone) => (
            <button
              key={zone.id}
              onClick={() => onZoneClick?.(zone)}
              className="absolute hover-elevate active-elevate-2 transition-transform hover:scale-110"
              style={{ left: `${zone.x}%`, top: `${zone.y}%`, transform: 'translate(-50%, -50%)' }}
              data-testid={`button-zone-${zone.id}`}
            >
              <div className="flex flex-col items-center gap-1">
                <div className={`h-4 w-4 rounded-full ${statusConfig[zone.status].dotColor} animate-pulse`} />
                <MapPin className={`h-6 w-6 ${statusConfig[zone.status].color.replace('bg-', 'text-')}`} />
                <Badge variant="secondary" className="text-xs whitespace-nowrap">
                  {zone.name}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
