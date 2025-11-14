
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2 } from "lucide-react";

interface ZoneHistoricalChartProps {
  zoneId: string;
  zoneName: string;
}

export function ZoneHistoricalChart({ zoneId, zoneName }: ZoneHistoricalChartProps) {
  const { data: zoneHistory, isLoading } = useQuery({
    queryKey: ["zone-history", zoneId],
    queryFn: async () => {
      const res = await api.get(`/api/historical/zones/${zoneId}?hours=24`);
      return res.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!zoneHistory || zoneHistory.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No historical data available for {zoneName}
      </div>
    );
  }

  const chartData = zoneHistory.map((h: any) => ({
    time: new Date(h.timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    consumption: Math.round(h.flowRate),
    pressure: Math.round(h.pressure)
  })).reverse(); // Reverse to show oldest to newest

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis 
            dataKey="time" 
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            interval="preserveStartEnd"
          />
          <YAxis 
            yAxisId="left"
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            label={{ value: 'Consumption (L/h)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            label={{ value: 'Pressure (PSI)', angle: 90, position: 'insideRight', style: { fontSize: '12px' } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem'
            }}
          />
          <Legend />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="consumption" 
            stroke="hsl(var(--chart-1))" 
            strokeWidth={2}
            name="Consumption Rate (L/h)"
            dot={false}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="pressure" 
            stroke="hsl(var(--chart-2))" 
            strokeWidth={2}
            name="Pressure (PSI)"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
