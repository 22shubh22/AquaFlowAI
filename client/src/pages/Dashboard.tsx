import { MetricCard } from "@/components/MetricCard";
import { ZoneMap } from "@/components/ZoneMap";
import { AlertsList } from "@/components/AlertsList";
import { FlowChart } from "@/components/FlowChart";
import { AIInsights } from "@/components/AIInsights";
import { AIEquityDashboard } from "@/components/AIEquityDashboard";
import { Droplets, Gauge, Activity, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

export default function Dashboard() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [realTimeData, setRealTimeData] = useState<any[]>([]);

  // Real-time data fetching with 5-second intervals
  const { data: zones, refetch: refetchZones } = useQuery({
    queryKey: ["zones"],
    queryFn: async () => {
      const res = await api.get("/api/zones");
      return res.json();
    },
    refetchInterval: 5000
  });

  const { data: pumps, refetch: refetchPumps } = useQuery({
    queryKey: ["pumps"],
    queryFn: async () => {
      const res = await api.get("/api/pumps");
      return res.json();
    },
    refetchInterval: 5000
  });

  const { data: waterSources } = useQuery({
    queryKey: ["water-sources"],
    queryFn: async () => {
      const res = await api.get("/api/water-sources");
      return res.json();
    },
    refetchInterval: 5000
  });

  const { data: anomalies } = useQuery({
    queryKey: ["anomalies"],
    queryFn: api.getAnomalies,
    refetchInterval: 10000
  });

  // Calculate real-time metrics
  const metrics = {
    totalFlow: zones ? zones.reduce((sum: number, z: any) => sum + parseFloat(z.flowRate), 0) : 0,
    avgPressure: zones ? zones.reduce((sum: number, z: any) => sum + parseFloat(z.pressure), 0) / zones.length : 0,
    activePumps: pumps ? pumps.filter((p: any) => p.status === 'active').length : 0,
    totalPumps: pumps ? pumps.length : 0,
    criticalZones: zones ? zones.filter((z: any) => z.status === 'critical' || z.status === 'low-pressure').length : 0,
  };

  // Update alerts from anomalies
  useEffect(() => {
    if (anomalies) {
      const formattedAlerts = anomalies.map((anomaly: any, index: number) => ({
        id: `A${index + 1}`,
        type: anomaly.type,
        zone: anomaly.zoneName,
        severity: anomaly.severity,
        message: anomaly.message,
        timestamp: new Date(anomaly.detectedAt).toLocaleString()
      }));
      setAlerts(formattedAlerts);
    }
  }, [anomalies]);

  // Simulate real-time flow data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      setRealTimeData(prev => {
        const newData = [...prev, {
          time: timeStr,
          flow: metrics.totalFlow,
          pressure: metrics.avgPressure
        }];
        return newData.slice(-20); // Keep last 20 data points
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [metrics.totalFlow, metrics.avgPressure]);

  // Pipeline pressure distribution
  const pressureDistribution = zones ? zones.reduce((acc: any, zone: any) => {
    const pressure = parseFloat(zone.pressure);
    if (pressure >= 50) acc.high++;
    else if (pressure >= 40) acc.medium++;
    else acc.low++;
    return acc;
  }, { high: 0, medium: 0, low: 0 }) : { high: 0, medium: 0, low: 0 };

  const pressureChartData = [
    { name: 'High (≥50 PSI)', value: pressureDistribution.high, color: '#10b981' },
    { name: 'Medium (40-50 PSI)', value: pressureDistribution.medium, color: '#f59e0b' },
    { name: 'Low (<40 PSI)', value: pressureDistribution.low, color: '#ef4444' }
  ];

  // Pump usage statistics
  const pumpStats = pumps ? pumps.reduce((acc: any, pump: any) => {
    acc[pump.status] = (acc[pump.status] || 0) + 1;
    return acc;
  }, {}) : {};

  const pumpUsageData = [
    { status: 'Active', count: pumpStats.active || 0, color: '#10b981' },
    { status: 'Idle', count: pumpStats.idle || 0, color: '#6b7280' },
    { status: 'Maintenance', count: pumpStats.maintenance || 0, color: '#f59e0b' }
  ];

  // Zone status distribution
  const zoneStatusData = zones ? Object.entries(
    zones.reduce((acc: any, zone: any) => {
      acc[zone.status] = (acc[zone.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({
    status: status.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    count
  })) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Real-Time Monitoring Dashboard</h1>
        <p className="text-muted-foreground mt-1">Municipal water distribution system monitoring</p>
        <Badge variant="outline" className="mt-2">
          <Activity className="h-3 w-3 mr-1 animate-pulse" />
          Live Updates Every 5s
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Flow Rate"
          value={`${(metrics.totalFlow / 1000).toFixed(1)}K L/h`}
          icon={Droplets}
          trend={{ value: 12, isPositive: true }}
          status="normal"
        />
        <MetricCard
          title="Avg Pressure"
          value={`${Math.round(metrics.avgPressure)} PSI`}
          icon={Gauge}
          trend={{ value: 3, isPositive: true }}
          status={metrics.avgPressure < 40 ? "warning" : "normal"}
        />
        <MetricCard
          title="Active Pumps"
          value={`${metrics.activePumps}/${metrics.totalPumps}`}
          icon={Activity}
          status="normal"
        />
        <MetricCard
          title="Critical Zones"
          value={metrics.criticalZones.toString()}
          icon={AlertTriangle}
          status={metrics.criticalZones > 2 ? "warning" : "normal"}
        />
      </div>

      {/* Real-Time Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pumps">Pump Analytics</TabsTrigger>
          <TabsTrigger value="pressure">Pressure Analytics</TabsTrigger>
          <TabsTrigger value="flow">Flow Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ZoneMap
                zones={zones || []}
                onZoneClick={(zone) => {
                  toast({
                    title: zone.name,
                    description: `Flow: ${zone.flowRate} L/h | Pressure: ${zone.pressure} PSI`,
                  });
                }}
              />
            </div>
            <div>
              <AlertsList
                alerts={alerts}
                onResolve={(id) => {
                  setAlerts(alerts.filter((a) => a.id !== id));
                  toast({
                    title: "Alert Resolved",
                    description: "The alert has been marked as resolved.",
                  });
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Zone Status Distribution</CardTitle>
                <CardDescription>Current status across all zones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={zoneStatusData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="status" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Real-Time Flow & Pressure</CardTitle>
                <CardDescription>Last 2 minutes of data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={realTimeData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="time" className="text-xs" />
                      <YAxis yAxisId="left" className="text-xs" />
                      <YAxis yAxisId="right" orientation="right" className="text-xs" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="flow" stroke="hsl(var(--chart-1))" name="Flow (L/h)" strokeWidth={2} dot={false} />
                      <Line yAxisId="right" type="monotone" dataKey="pressure" stroke="hsl(var(--chart-2))" name="Pressure (PSI)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pumps" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pump Usage Overview</CardTitle>
                <CardDescription>Current pump operational status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pumpUsageData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, count }) => `${status}: ${count}`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {pumpUsageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pump Efficiency Metrics</CardTitle>
                <CardDescription>Flow rate by pump status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Active Pumps Flow Rate</p>
                      <p className="text-2xl font-bold text-chart-2">
                        {pumps ? Math.round(pumps.filter((p: any) => p.status === 'active').reduce((sum: number, p: any) => sum + parseFloat(p.flowRate), 0)) : 0} L/h
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-chart-2" />
                  </div>
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Average Pump Efficiency</p>
                      <p className="text-2xl font-bold">
                        {metrics.activePumps > 0 ? Math.round((metrics.activePumps / metrics.totalPumps) * 100) : 0}%
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Pumps in Maintenance</p>
                      <p className="text-2xl font-bold text-yellow-500">{pumpStats.maintenance || 0}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pressure" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Pressure Distribution</CardTitle>
                <CardDescription>Pressure levels across network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pressureChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pressureChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pressure by Zone</CardTitle>
                <CardDescription>Current pressure levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={zones ? zones.map((z: any) => ({ name: z.name, pressure: parseFloat(z.pressure) })) : []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={100} />
                      <YAxis className="text-xs" label={{ value: 'Pressure (PSI)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Bar dataKey="pressure" fill="hsl(var(--chart-2))">
                        {zones?.map((zone: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={parseFloat(zone.pressure) >= 50 ? '#10b981' : parseFloat(zone.pressure) >= 40 ? '#f59e0b' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="flow" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Water Flow by Zone</CardTitle>
                <CardDescription>Current flow rates across zones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={zones ? zones.map((z: any) => ({ name: z.name, flow: parseFloat(z.flowRate) })) : []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={100} />
                      <YAxis className="text-xs" label={{ value: 'Flow Rate (L/h)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Bar dataKey="flow" fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Water Source Capacity</CardTitle>
                <CardDescription>Current levels vs capacity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={waterSources ? waterSources.map((s: any) => ({
                      name: s.name,
                      current: s.currentLevel,
                      capacity: 100
                    })) : []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={100} />
                      <YAxis className="text-xs" label={{ value: 'Level (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="current" fill="hsl(var(--chart-1))" name="Current Level" />
                      <Bar dataKey="capacity" fill="hsl(var(--muted))" name="Capacity" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <AIEquityDashboard />
    </div>
  );
}