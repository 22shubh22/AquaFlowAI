
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplets, TrendingDown, TrendingUp, AlertCircle, Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import type { WaterSource } from "../../../server/storage";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationPicker({ position, onLocationChange }: { position: [number, number]; onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return <Marker position={position} />;
}

export default function WaterSourcesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<WaterSource | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "river" as const,
    location: "",
    lat: 21.25,
    lng: 81.63,
    capacity: 1000000,
    currentLevel: 75,
    quality: "good" as const,
    status: "active" as const,
  });

  const { data: sources = [], isLoading } = useQuery<WaterSource[]>({
    queryKey: ['/api/water-sources'],
    queryFn: api.getWaterSources,
  });

  const createMutation = useMutation({
    mutationFn: api.createWaterSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/water-sources'] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Water source created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create water source", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WaterSource> }) =>
      api.updateWaterSource(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/water-sources'] });
      setIsDialogOpen(false);
      setEditingSource(null);
      resetForm();
      toast({ title: "Water source updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update water source", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteWaterSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/water-sources'] });
      toast({ title: "Water source deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete water source", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      type: "river",
      location: "",
      lat: 21.25,
      lng: 81.63,
      capacity: 1000000,
      currentLevel: 75,
      quality: "good",
      status: "active",
    });
  };

  const handleEdit = (source: WaterSource) => {
    setEditingSource(source);
    setFormData({
      name: source.name,
      type: source.type,
      location: source.location,
      lat: source.geoLocation.lat,
      lng: source.geoLocation.lng,
      capacity: source.capacity,
      currentLevel: source.currentLevel,
      quality: source.quality,
      status: source.status,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sourceData = {
      name: formData.name,
      type: formData.type,
      location: formData.location,
      geoLocation: { lat: formData.lat, lng: formData.lng },
      capacity: formData.capacity,
      currentLevel: formData.currentLevel,
      quality: formData.quality,
      status: formData.status,
      lastTested: new Date(),
    };

    if (editingSource) {
      updateMutation.mutate({ id: editingSource.id, data: sourceData });
    } else {
      createMutation.mutate(sourceData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this water source?")) {
      deleteMutation.mutate(id);
    }
  };

  const getSourceTypeBadge = (type: string) => {
    const colors = {
      river: "bg-blue-500",
      lake: "bg-cyan-500",
      borewell: "bg-amber-500",
      reservoir: "bg-indigo-500",
    };
    return <Badge className={colors[type as keyof typeof colors] || "bg-gray-500"}>{type}</Badge>;
  };

  const getQualityBadge = (quality: string) => {
    const colors = {
      excellent: "bg-green-500",
      good: "bg-blue-500",
      fair: "bg-yellow-500",
      poor: "bg-red-500",
    };
    return <Badge className={colors[quality as keyof typeof colors]}>{quality}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-500",
      inactive: "bg-gray-500",
      maintenance: "bg-orange-500",
    };
    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>;
  };

  const totalCapacity = sources.reduce((sum, s) => sum + s.capacity, 0);
  const avgLevel = sources.length > 0 ? sources.reduce((sum, s) => sum + s.currentLevel, 0) / sources.length : 0;
  const activeSources = sources.filter(s => s.status === "active").length;

  if (isLoading) {
    return <div>Loading water sources...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Water Sources</h1>
          <p className="text-muted-foreground mt-1">Monitor all water sources feeding the distribution network</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingSource(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Water Source
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSource ? "Edit Water Source" : "Add New Water Source"}</DialogTitle>
              <DialogDescription>
                {editingSource ? "Update the water source details" : "Add a new water source to the network"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">Type</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="river">River</SelectItem>
                      <SelectItem value="lake">Lake</SelectItem>
                      <SelectItem value="borewell">Borewell</SelectItem>
                      <SelectItem value="reservoir">Reservoir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="col-span-4">
                  <Label className="mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Select Location on Map (Click to set coordinates)
                  </Label>
                  <div className="h-[300px] rounded-lg overflow-hidden border-2 border-border mt-2">
                    <MapContainer
                      center={[formData.lat, formData.lng]}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={true}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationPicker
                        position={[formData.lat, formData.lng]}
                        onLocationChange={(lat, lng) => {
                          setFormData({ ...formData, lat, lng });
                        }}
                      />
                    </MapContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <Label htmlFor="lat" className="text-sm">Latitude</Label>
                      <Input
                        id="lat"
                        type="number"
                        step="0.0001"
                        value={formData.lat}
                        onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) || 21.25 })}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lng" className="text-sm">Longitude</Label>
                      <Input
                        id="lng"
                        type="number"
                        step="0.0001"
                        value={formData.lng}
                        onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) || 81.63 })}
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="capacity" className="text-right">Capacity (L)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="currentLevel" className="text-right">Current Level (%)</Label>
                  <Input
                    id="currentLevel"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.currentLevel}
                    onChange={(e) => setFormData({ ...formData, currentLevel: parseInt(e.target.value) })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quality" className="text-right">Quality</Label>
                  <Select value={formData.quality} onValueChange={(value: any) => setFormData({ ...formData, quality: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingSource ? "Update" : "Create"} Water Source
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalCapacity / 1000000).toFixed(1)}M L</div>
            <p className="text-xs text-muted-foreground">Million liters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Level</CardTitle>
            {avgLevel > 70 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-yellow-500" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgLevel.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Current water level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSources}/{sources.length}</div>
            <p className="text-xs text-muted-foreground">Operational sources</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Water Sources</CardTitle>
          <CardDescription>Detailed information about each water source</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Current Level</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell className="font-medium">{source.id}</TableCell>
                  <TableCell>{source.name}</TableCell>
                  <TableCell>{getSourceTypeBadge(source.type)}</TableCell>
                  <TableCell>{source.location}</TableCell>
                  <TableCell>{(source.capacity / 1000).toFixed(0)}K L</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${source.currentLevel > 70 ? 'bg-green-500' : source.currentLevel > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${source.currentLevel}%` }}
                        />
                      </div>
                      <span className="text-sm">{source.currentLevel}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{getQualityBadge(source.quality)}</TableCell>
                  <TableCell>{getStatusBadge(source.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(source)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(source.id)}
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
