import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";

interface PopulationHistoryChartProps {
  zoneId: string;
  zoneName: string;
}

export function PopulationHistoryChart({ zoneId, zoneName }: PopulationHistoryChartProps) {
  const { data: populationHistory, isLoading } = useQuery({
    queryKey: ["population-history", zoneId],
    queryFn: async () => {
      // Fetch all population history (no time limit for yearly data)
      const res = await api.get(`/api/historical/population/${zoneId}`);
      return res.json();
    },
    refetchInterval: 60000 // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!populationHistory || populationHistory.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No population data available for {zoneName}
      </div>
    );
  }

  const chartData = populationHistory.map((h: any) => ({
    time: new Date(h.timestamp).getFullYear().toString(),
    population: h.population
  })).reverse(); // Reverse to show oldest to newest

  // Calculate trend
  const trend = chartData.length >= 2 
    ? chartData[chartData.length - 1].population - chartData[0].population
    : 0;
  const trendPercentage = chartData.length >= 2
    ? ((trend / chartData[0].population) * 100).toFixed(2)
    : "0";

  const yearsSpan = chartData.length > 1 
    ? `${chartData[0].time} - ${chartData[chartData.length - 1].time}`
    : chartData[0]?.time || 'N/A';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {trend > 0 ? (
            <TrendingUp className="h-5 w-5 text-green-500" />
          ) : trend < 0 ? (
            <TrendingDown className="h-5 w-5 text-red-500" />
          ) : null}
          <span className="text-sm text-muted-foreground">
            {trend > 0 ? '+' : ''}{trend.toLocaleString()} ({trend > 0 ? '+' : ''}{trendPercentage}%) over {chartData.length} years
          </span>
        </div>
        <span className="text-sm font-medium">
          Current: {chartData[chartData.length - 1]?.population.toLocaleString() || 'N/A'}
        </span>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="time" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              interval="preserveStartEnd"
              label={{ value: 'Year', position: 'insideBottom', offset: -5, style: { fontSize: '12px' } }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ value: 'Population', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
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
              type="monotone" 
              dataKey="population" 
              stroke="hsl(var(--chart-3))" 
              strokeWidth={2}
              name="Population"
              dot={{ fill: 'hsl(var(--chart-3))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}