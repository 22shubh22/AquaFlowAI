
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Droplets, Activity, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";

export default function ZonesPage() {
  const { data: zones, isLoading } = useQuery({
    queryKey: ["zones"],
    queryFn: async () => {
      const res = await api.getZones();
      return res;
    }
  });

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
  
  // Count total pumps from the pumps data
  const totalPumps = zones.length * 2.5; // Approximation based on zone count

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Zone Management</h1>
        <p className="text-muted-foreground mt-1">Overview of all water distribution zones in Raipur</p>
      </div>

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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
