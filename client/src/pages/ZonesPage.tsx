
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplets, Activity, AlertTriangle, Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from "@/lib/api";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Zone } from "@shared/schema";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DraggableMarkerProps {
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}

function DraggableMarker({ position, onPositionChange }: DraggableMarkerProps) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const pos = marker.getLatLng();
        onPositionChange(pos.lat, pos.lng);
      }
    },
  };

  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
}

export default function ZonesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    status: "optimal" as Zone['status'],
    flowRate: 0,
    pressure: 0,
    lat: 21.2514,
    lng: 81.6296
  });

  const { data: zones, isLoading } = useQuery({
    queryKey: ["zones"],
    queryFn: async () => {
      const res = await api.getZones();
      return res;
    }
  });

  const createMutation = useMutation({
    mutationFn: (newZone: typeof formData) => api.createZone(newZone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Zone created successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create zone",
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Zone> }) => 
      api.updateZone(id, data),
    onSuccess: () => {
      // Invalidate all zone-related queries to force refetch
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      queryClient.refetchQueries({ queryKey: ["zones"] });
      setIsEditDialogOpen(false);
      setEditingZone(null);
      toast({
        title: "Success",
        description: "Zone updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update zone",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteZone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      toast({
        title: "Success",
        description: "Zone deleted successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete zone",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      status: "optimal",
      flowRate: 0,
      pressure: 0,
      lat: 21.2514,
      lng: 81.6296
    });
  };

  const handleEdit = (zone: Zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      status: zone.status,
      flowRate: zone.flowRate,
      pressure: zone.pressure,
      lat: zone.lat,
      lng: zone.lng
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete zone "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingZone) {
      updateMutation.mutate({ id: editingZone.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleMarkerPositionChange = (lat: number, lng: number) => {
    setFormData({ ...formData, lat, lng });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "optimal":
        return <Badge className="bg-green-500">Optimal</Badge>;
      case "low-pressure":
        return <Badge className="bg-yellow-500">Low Pressure</Badge>;
      case "high-demand":
        return <Badge className="bg-orange-500">High Demand</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading || !zones) {
    return <div className="p-6">Loading zones data...</div>;
  }

  const totalFlow = zones.reduce((sum, zone) => sum + zone.flowRate, 0);
  const avgPressure = zones.reduce((sum, zone) => sum + zone.pressure, 0) / zones.length;
  const totalPumps = zones.length * 2.5;

  const renderZoneForm = (isEdit: boolean) => (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit Zone" : "Add New Zone"}</DialogTitle>
        <DialogDescription>
          {isEdit ? "Update zone information" : "Create a new water distribution zone"}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor={isEdit ? "edit-name" : "name"}>Zone Name</Label>
          <Input
            id={isEdit ? "edit-name" : "name"}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={isEdit ? "edit-status" : "status"}>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as Zone['status'] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="optimal">Optimal</SelectItem>
              <SelectItem value="low-pressure">Low Pressure</SelectItem>
              <SelectItem value="high-demand">High Demand</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor={isEdit ? "edit-flowRate" : "flowRate"}>Flow Rate (L/h)</Label>
            <Input
              id={isEdit ? "edit-flowRate" : "flowRate"}
              type="number"
              value={formData.flowRate}
              onChange={(e) => setFormData({ ...formData, flowRate: parseFloat(e.target.value) })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={isEdit ? "edit-pressure" : "pressure"}>Pressure (PSI)</Label>
            <Input
              id={isEdit ? "edit-pressure" : "pressure"}
              type="number"
              value={formData.pressure}
              onChange={(e) => setFormData({ ...formData, pressure: parseFloat(e.target.value) })}
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Zone Location (Drag marker or click on map)
          </Label>
          <div className="h-[300px] rounded-lg overflow-hidden border-2 border-border">
            <MapContainer
              center={[formData.lat, formData.lng]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <DraggableMarker
                position={[formData.lat, formData.lng]}
                onPositionChange={handleMarkerPositionChange}
              />
            </MapContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor={isEdit ? "edit-lat" : "lat"}>Latitude</Label>
            <Input
              id={isEdit ? "edit-lat" : "lat"}
              type="number"
              step="0.0001"
              value={formData.lat}
              onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={isEdit ? "edit-lng" : "lng"}>Longitude</Label>
            <Input
              id={isEdit ? "edit-lng" : "lng"}
              type="number"
              step="0.0001"
              value={formData.lng}
              onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
              required
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isEdit ? updateMutation.isPending : createMutation.isPending}>
          {isEdit 
            ? (updateMutation.isPending ? "Updating..." : "Update Zone")
            : (createMutation.isPending ? "Creating..." : "Create Zone")
          }
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Zone Management</h1>
          <p className="text-muted-foreground mt-1">Overview of all water distribution zones in Raipur</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Zone
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {renderZoneForm(false)}
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {renderZoneForm(true)}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flow Rate</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFlow.toFixed(0)} L/h</div>
            <p className="text-xs text-muted-foreground">Across {zones.length} zones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Pressure</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPressure.toFixed(1)} PSI</div>
            <p className="text-xs text-muted-foreground">System-wide average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pumps</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalPumps)}</div>
            <p className="text-xs text-muted-foreground">Total pumps deployed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Zones</CardTitle>
          <CardDescription>Detailed information for each water distribution zone</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zone ID</TableHead>
                <TableHead>Zone Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Flow Rate</TableHead>
                <TableHead>Pressure</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium">{zone.id}</TableCell>
                  <TableCell>{zone.name}</TableCell>
                  <TableCell>{getStatusBadge(zone.status)}</TableCell>
                  <TableCell>{zone.flowRate} L/h</TableCell>
                  <TableCell>{zone.pressure} PSI</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(zone)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(zone.id, zone.name)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
