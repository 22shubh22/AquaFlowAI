
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Droplets, Activity, AlertTriangle } from "lucide-react";

export default function ZonesPage() {
  const zones = [
    { id: "RAI-1", name: "Civil Lines", status: "optimal", flowRate: "520 L/h", pressure: "50 PSI", population: "45,000", pumps: 3 },
    { id: "RAI-2", name: "Shankar Nagar", status: "optimal", flowRate: "480 L/h", pressure: "48 PSI", population: "38,000", pumps: 2 },
    { id: "RAI-3", name: "Devendra Nagar", status: "low-pressure", flowRate: "320 L/h", pressure: "35 PSI", population: "52,000", pumps: 2 },
    { id: "RAI-4", name: "Pandri", status: "optimal", flowRate: "450 L/h", pressure: "46 PSI", population: "41,000", pumps: 3 },
    { id: "RAI-5", name: "Mowa", status: "high-demand", flowRate: "580 L/h", pressure: "42 PSI", population: "67,000", pumps: 4 },
    { id: "RAI-6", name: "Tatibandh", status: "optimal", flowRate: "410 L/h", pressure: "47 PSI", population: "35,000", pumps: 2 },
    { id: "RAI-7", name: "Gudhiyari", status: "low-pressure", flowRate: "340 L/h", pressure: "36 PSI", population: "44,000", pumps: 2 },
    { id: "RAI-8", name: "Kota", status: "high-demand", flowRate: "620 L/h", pressure: "40 PSI", population: "71,000", pumps: 4 },
    { id: "RAI-9", name: "Sunder Nagar", status: "optimal", flowRate: "490 L/h", pressure: "49 PSI", population: "39,000", pumps: 3 },
    { id: "RAI-10", name: "Urla", status: "high-demand", flowRate: "720 L/h", pressure: "38 PSI", population: "85,000", pumps: 5 },
    { id: "RAI-11", name: "Amanaka", status: "optimal", flowRate: "460 L/h", pressure: "47 PSI", population: "33,000", pumps: 2 },
    { id: "RAI-12", name: "Telibandha", status: "optimal", flowRate: "500 L/h", pressure: "48 PSI", population: "42,000", pumps: 3 },
  ];

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

  const totalFlow = zones.reduce((sum, zone) => sum + parseFloat(zone.flowRate), 0);
  const avgPressure = zones.reduce((sum, zone) => sum + parseFloat(zone.pressure), 0) / zones.length;
  const totalPumps = zones.reduce((sum, zone) => sum + zone.pumps, 0);

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
            <div className="text-2xl font-bold">{totalPumps}</div>
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
                <TableHead>Population</TableHead>
                <TableHead>Pumps</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium">{zone.id}</TableCell>
                  <TableCell>{zone.name}</TableCell>
                  <TableCell>{getStatusBadge(zone.status)}</TableCell>
                  <TableCell>{zone.flowRate}</TableCell>
                  <TableCell>{zone.pressure}</TableCell>
                  <TableCell>{zone.population}</TableCell>
                  <TableCell>{zone.pumps}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
