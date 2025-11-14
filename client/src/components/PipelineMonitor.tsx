
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts";
import { Droplets, Gauge, Activity, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";

export function PipelineMonitor() {
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  const { data: zones } = useQuery({
    queryKey: ["zones"],
    queryFn: () => api.get("/api/zones").then(res => res.data),
    refetchInterval: 5000
  });

  // Simulate historical data collection
  useEffect(() => {
    if (zones && zones.length > 0) {
      const interval = setInterval(() => {
        const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const avgPressure = zones.reduce((sum: number, z: any) => sum + parseFloat(z.pressure), 0) / zones.length;
        const totalFlow = zones.reduce((sum: number, z: any) => sum + parseFloat(z.flowRate), 0);
        
        setHistoricalData(prev => {
          const newData = [...prev, {
            time: timestamp,
            pressure: Math.round(avgPressure * 10) / 10,
            flow: Math.round(totalFlow),
            efficiency: Math.round((avgPressure / 50) * 100)
          }];
          return newData.slice(-30); // Keep last 30 data points (2.5 minutes)
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [zones]);

  // Calculate pressure trends
  const pressureTrend = historicalData.length >= 2 
    ? historicalData[historicalData.length - 1].pressure - historicalData[historicalData.length - 2].pressure 
    : 0;

  const flowTrend = historicalData.length >= 2 
    ? historicalData[historicalData.length - 1].flow - historicalData[historicalData.length - 2].flow 
    : 0;

  const currentPressure = historicalData.length > 0 ? historicalData[historicalData.length - 1].pressure : 0;
  const currentFlow = historicalData.length > 0 ? historicalData[historicalData.length - 1].flow : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Pressure</p>
                <p className="text-3xl font-bold">{currentPressure} PSI</p>
                <div className="flex items-center gap-1 mt-1">
                  {pressureTrend >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-chart-2" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                  <span className={`text-sm ${pressureTrend >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                    {Math.abs(pressureTrend).toFixed(1)} PSI
                  </span>
                </div>
              </div>
              <Gauge className="h-12 w-12 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Flow Rate</p>
                <p className="text-3xl font-bold">{(currentFlow / 1000).toFixed(1)}K L/h</p>
                <div className="flex items-center gap-1 mt-1">
                  {flowTrend >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-chart-2" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                  <span className={`text-sm ${flowTrend >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                    {Math.abs(flowTrend)} L/h
                  </span>
                </div>
              </div>
              <Droplets className="h-12 w-12 text-chart-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Efficiency</p>
                <p className="text-3xl font-bold">
                  {historicalData.length > 0 ? historicalData[historicalData.length - 1].efficiency : 0}%
                </p>
                <Badge variant="outline" className="mt-1">
                  <Activity className="h-3 w-3 mr-1" />
                  Optimal Range
                </Badge>
              </div>
              <Activity className="h-12 w-12 text-chart-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Real-Time Pipeline Analytics</CardTitle>
          <CardDescription>
            Live monitoring of pressure and flow (Last 2.5 minutes)
            <Badge variant="outline" className="ml-2">
              <Activity className="h-3 w-3 mr-1 animate-pulse" />
              Auto-updating
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData}>
                <defs>
                  <linearGradient id="colorPressure" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="time" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  yAxisId="left"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  label={{ value: 'Pressure (PSI)', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  label={{ value: 'Flow Rate (L/h)', angle: 90, position: 'insideRight' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="pressure" 
                  stroke="hsl(var(--chart-2))" 
                  fillOpacity={1}
                  fill="url(#colorPressure)"
                  name="Pressure (PSI)"
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="flow" 
                  stroke="hsl(var(--chart-1))" 
                  fillOpacity={1}
                  fill="url(#colorFlow)"
                  name="Flow Rate (L/h)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
