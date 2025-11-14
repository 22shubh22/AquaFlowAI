import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, Activity, Droplet, Gauge } from "lucide-react";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";

export default function AnalyticsPage() {
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [timeRange, setTimeRange] = useState(24);
  const [activeTab, setActiveTab] = useState("zone");

  const { data: zones, isLoading: zonesLoading, error: zonesError } = useQuery({
    queryKey: ["zones"],
    queryFn: async () => {
      const res = await api.get("/api/zones");
      return res.json();
    }
  });

  // Debug logging
  useEffect(() => {
    console.log("Zones data:", zones);
    console.log("Zones loading:", zonesLoading);
    console.log("Zones error:", zonesError);
  }, [zones, zonesLoading, zonesError]);

  const { data: predictions } = useQuery({
    queryKey: ["demand-predictions"],
    queryFn: async () => {
      const res = await api.get("/api/analytics/demand-prediction");
      return res.json();
    },
    refetchInterval: 60000 // Refresh every minute
  });

  const { data: zoneHistory } = useQuery({
    queryKey: ["zone-history", selectedZone, timeRange],
    queryFn: async () => {
      const res = await api.get(`/api/historical/zones/${selectedZone}?hours=${timeRange}`);
      return res.json();
    },
    enabled: !!selectedZone
  });

  const { data: allZoneHistory } = useQuery({
    queryKey: ["all-zone-history", timeRange],
    queryFn: async () => {
      const res = await api.get(`/api/historical/zones?hours=${timeRange}`);
      return res.json();
    }
  });

  // Set default zone when zones load
  useEffect(() => {
    if (zones && zones.length > 0 && !selectedZone) {
      setSelectedZone(zones[0].id);
    }
  }, [zones, selectedZone]);

  // Format data for charts
  const formatHistoricalData = () => {
    if (!zoneHistory) return [];
    return zoneHistory.map((h: any) => ({
      time: new Date(h.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      flow: Math.round(h.flowRate),
      pressure: Math.round(h.pressure)
    }));
  };

  // Calculate hourly averages
  const getHourlyAverages = () => {
    if (!allZoneHistory) return [];

    const hourlyData: Record<number, { flow: number[], pressure: number[] }> = {};

    // The /api/historical/zones endpoint returns an object where keys are hour numbers,
    // and values are arrays of records for that hour.
    // We need to iterate over the values of this object.
    Object.values(allZoneHistory).flat().forEach((record: any) => {
      const hour = new Date(record.timestamp).getHours(); // Extract hour from timestamp
      if (!hourlyData[hour]) {
        hourlyData[hour] = { flow: [], pressure: [] };
      }
      hourlyData[hour].flow.push(record.flowRate);
      hourlyData[hour].pressure.push(record.pressure);
    });

    return Array.from({ length: 24 }, (_, hour) => {
      const data = hourlyData[hour] || { flow: [0], pressure: [0] };
      return {
        hour: `${hour}:00`,
        avgFlow: Math.round(data.flow.reduce((a, b) => a + b, 0) / data.flow.length),
        avgPressure: Math.round(data.pressure.reduce((a, b) => a + b, 0) / data.pressure.length)
      };
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics & Predictions</h1>
        <p className="text-muted-foreground mt-1">AI-driven insights and historical data analysis</p>
      </div>

      {/* Demand Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Demand Predictions (Next 2 Hours)
          </CardTitle>
          <CardDescription>AI-powered demand forecasting based on historical patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions?.map((pred: any) => (
              <Card key={pred.zoneId}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{pred.zoneName}</span>
                      <div className="flex items-center gap-1 text-sm">
                        {pred.trend === "increasing" ? (
                          <TrendingUp className="h-4 w-4 text-destructive" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-chart-2" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Current:</span>
                        <span className="font-medium">{pred.currentDemand} L/h</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Predicted:</span>
                        <span className="font-medium">{pred.predictedDemand} L/h</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Confidence:</span>
                        <span className="font-medium">{(pred.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Historical Data Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Data Analysis</CardTitle>
          <CardDescription>View and analyze historical trends</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="zone" className="space-y-4">
            <TabsList>
              <TabsTrigger value="zone">Zone Analysis</TabsTrigger>
              <TabsTrigger value="patterns">Usage Patterns</TabsTrigger>
            </TabsList>

            <TabsContent value="zone" className="space-y-4">
              <div className="flex gap-4">
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={
                      zonesLoading ? "Loading zones..." : 
                      zonesError ? "Error loading zones" :
                      zones && zones.length > 0 ? "Select zone" : "No zones available"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {zonesLoading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : zonesError ? (
                      <SelectItem value="error" disabled>Error loading zones</SelectItem>
                    ) : zones && zones.length > 0 ? (
                      zones.map((zone: any) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No zones available</SelectItem>
                    )}
                  </SelectContent>
                </Select>

                <Select value={timeRange.toString()} onValueChange={(v) => setTimeRange(parseInt(v))}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">Last 24 hours</SelectItem>
                    <SelectItem value="48">Last 48 hours</SelectItem>
                    <SelectItem value="168">Last 7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formatHistoricalData()}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="time" className="text-xs" />
                    <YAxis yAxisId="left" className="text-xs" />
                    <YAxis yAxisId="right" orientation="right" className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="flow" stroke="hsl(var(--chart-1))" name="Flow Rate (L/h)" />
                    <Line yAxisId="right" type="monotone" dataKey="pressure" stroke="hsl(var(--chart-2))" name="Pressure (PSI)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="patterns" className="space-y-4">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getHourlyAverages()}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="hour" className="text-xs" />
                    <YAxis yAxisId="left" className="text-xs" />
                    <YAxis yAxisId="right" orientation="right" className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="avgFlow" fill="hsl(var(--chart-1))" name="Avg Flow Rate (L/h)" />
                    <Bar yAxisId="right" dataKey="avgPressure" fill="hsl(var(--chart-2))" name="Avg Pressure (PSI)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Average flow rate and pressure by hour of day across all zones
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}