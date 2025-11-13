
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Droplets, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import type { WaterSource } from "../../../server/storage";

export default function WaterSourcesPage() {
  const { data: sources = [], isLoading } = useQuery<WaterSource[]>({
    queryKey: ['/api/water-sources'],
    queryFn: api.getWaterSources,
  });

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
      <div>
        <h1 className="text-3xl font-bold">Water Sources</h1>
        <p className="text-muted-foreground mt-1">Monitor all water sources feeding the distribution network</p>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
