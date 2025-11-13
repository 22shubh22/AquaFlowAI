import { ZoneMap } from "../ZoneMap";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ZoneMapExample() {
  const { toast } = useToast();
  
  const zones = [
    { id: "Z1", name: "North Zone", status: "optimal" as const, flowRate: "450 L/h", pressure: "48 PSI", x: 30, y: 20 },
    { id: "Z2", name: "East Zone", status: "low-pressure" as const, flowRate: "320 L/h", pressure: "35 PSI", x: 70, y: 35 },
    { id: "Z3", name: "South Zone", status: "high-demand" as const, flowRate: "580 L/h", pressure: "42 PSI", x: 50, y: 70 },
    { id: "Z4", name: "West Zone", status: "optimal" as const, flowRate: "410 L/h", pressure: "46 PSI", x: 20, y: 50 },
    { id: "Z5", name: "Central Zone", status: "optimal" as const, flowRate: "520 L/h", pressure: "50 PSI", x: 50, y: 40 },
    { id: "Z6", name: "Industrial", status: "high-demand" as const, flowRate: "720 L/h", pressure: "44 PSI", x: 80, y: 65 },
  ];

  return (
    <div className="p-6">
      <ZoneMap 
        zones={zones} 
        onZoneClick={(zone) => {
          toast({
            title: zone.name,
            description: `Flow: ${zone.flowRate} | Pressure: ${zone.pressure}`,
          });
        }}
      />
    </div>
  );
}
