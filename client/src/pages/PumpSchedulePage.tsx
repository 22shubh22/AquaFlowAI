
import { PumpSchedule } from "@/components/PumpSchedule";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { Pump, Zone, WaterSource } from "@shared/schema";

export default function PumpSchedulePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { role } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPump, setNewPump] = useState({
    id: "",
    zoneId: "",
    sourceId: "",
    status: "idle" as const,
    schedule: "00:00-00:00",
    flowRate: 0,
  });

  const { data: pumps = [], isLoading: pumpsLoading } = useQuery<Pump[]>({
    queryKey: ['/api/pumps'],
  });

  const { data: zones = [], isLoading: zonesLoading } = useQuery<Zone[]>({
    queryKey: ['/api/zones'],
  });

  const { data: sources = [], isLoading: sourcesLoading } = useQuery<WaterSource[]>({
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

  const createPumpMutation = useMutation({
    mutationFn: async (data: Omit<Pump, 'lastMaintenance'>) => {
      const response = await fetch('/api/pumps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create pump');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pumps'] });
      setIsCreateDialogOpen(false);
      setNewPump({
        id: "",
        zoneId: "",
        sourceId: "",
        status: "idle",
        schedule: "00:00-00:00",
        flowRate: 0,
      });
      toast({
        title: "Success",
        description: "Pump created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create pump",
        variant: "destructive",
      });
    },
  });

  const handleUpdatePump = (id: string, data: Partial<Pump>) => {
    updatePumpMutation.mutate({ id, data });
  };

  const handleCreatePump = () => {
    if (!newPump.id || !newPump.zoneId || !newPump.sourceId || !newPump.flowRate) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    createPumpMutation.mutate(newPump);
  };

  if (pumpsLoading || zonesLoading || sourcesLoading) {
    return <div>Loading...</div>;
  }

  console.log('Pumps:', pumps);
  console.log('Zones:', zones);
  console.log('Sources:', sources);

  const pumpData = pumps.map(pump => {
    console.log('Processing pump:', pump.id, 'zoneId:', pump.zoneId, 'sourceId:', pump.sourceId);
    const zone = zones.find(z => z.id === pump.zoneId);
    const source = sources.find(s => s.id === pump.sourceId);
    
    if (!zone) console.warn('Zone not found for pump', pump.id, 'with zoneId:', pump.zoneId);
    if (!source) console.warn('Source not found for pump', pump.id, 'with sourceId:', pump.sourceId);
    
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pump Schedule</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage pump operations across all zones in Raipur</p>
        </div>
        {role === "admin" && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Pump
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Pump</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pumpId">Pump ID</Label>
                  <Input
                    id="pumpId"
                    value={newPump.id}
                    onChange={(e) => setNewPump({ ...newPump, id: e.target.value })}
                    placeholder="e.g., pump-13"
                  />
                </div>
                <div>
                  <Label htmlFor="zone">Zone</Label>
                  <Select
                    value={newPump.zoneId}
                    onValueChange={(value) => setNewPump({ ...newPump, zoneId: value })}
                  >
                    <SelectTrigger id="zone">
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="source">Water Source</Label>
                  <Select
                    value={newPump.sourceId}
                    onValueChange={(value) => setNewPump({ ...newPump, sourceId: value })}
                  >
                    <SelectTrigger id="source">
                      <SelectValue placeholder="Select water source" />
                    </SelectTrigger>
                    <SelectContent>
                      {sources.map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          {source.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newPump.status}
                    onValueChange={(value: "active" | "idle" | "maintenance") => 
                      setNewPump({ ...newPump, status: value })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="idle">Idle</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="schedule">Schedule</Label>
                  <Input
                    id="schedule"
                    value={newPump.schedule}
                    onChange={(e) => setNewPump({ ...newPump, schedule: e.target.value })}
                    placeholder="e.g., 06:00-22:00"
                  />
                </div>
                <div>
                  <Label htmlFor="flowRate">Flow Rate (L/h)</Label>
                  <Input
                    id="flowRate"
                    type="number"
                    value={newPump.flowRate || ""}
                    onChange={(e) => setNewPump({ ...newPump, flowRate: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g., 6250"
                  />
                </div>
                <Button onClick={handleCreatePump} className="w-full">
                  Create Pump
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
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
