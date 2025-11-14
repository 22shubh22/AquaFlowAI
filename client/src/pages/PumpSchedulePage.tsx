
import { PumpSchedule } from "@/components/PumpSchedule";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { Pump, Zone, WaterSource } from "../../../server/storage";

export default function PumpSchedulePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { role } = useAuth();

  const { data: pumps = [], isLoading: pumpsLoading } = useQuery<Pump[]>({
    queryKey: ['/api/pumps'],
  });

  const { data: zones = [] } = useQuery<Zone[]>({
    queryKey: ['/api/zones'],
  });

  const { data: sources = [] } = useQuery<WaterSource[]>({
    queryKey: ['/api/water-sources'],
  });

  const updatePumpMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Pump> }) => {
      const response = await fetch(`/api/pumps/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update pump');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pumps'] });
      toast({
        title: "Success",
        description: "Pump updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update pump",
        variant: "destructive",
      });
    },
  });

  const handleUpdatePump = (id: string, data: Partial<Pump>) => {
    updatePumpMutation.mutate({ id, data });
  };

  if (pumpsLoading) {
    return <div>Loading...</div>;
  }

  const pumpData = pumps.map(pump => {
    const zone = zones.find(z => z.id === pump.zoneId);
    const source = sources.find(s => s.id === pump.sourceId);
    
    return {
      id: pump.id,
      pumpId: pump.id,
      zone: zone?.name || 'Unknown Zone',
      zoneId: pump.zoneId,
      status: pump.status,
      schedule: pump.schedule,
      flowRate: `${pump.flowRate} L/h`,
      flowRateValue: pump.flowRate,
      sourceId: pump.sourceId,
      sourceName: source?.name || 'Unknown Source',
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pump Schedule</h1>
        <p className="text-muted-foreground mt-1">Monitor and manage pump operations across all zones in Raipur</p>
      </div>

      <PumpSchedule 
        pumps={pumpData} 
        zones={zones}
        sources={sources}
        onUpdate={handleUpdatePump}
        isReadOnly={role === "citizen"}
      />
    </div>
  );
}
