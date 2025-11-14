import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface FlowChartProps {
  data: Array<{
    time: string;
    flow: number;
    pressure: number;
  }>;
}

export function FlowChart({ data }: FlowChartProps) {
  return (
    <Card className="p-6" data-testid="card-flow-chart">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">24-Hour Consumption & Pressure Trends</h3>
        
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
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
                label={{ value: 'Consumption (L/h)', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: 'Pressure (PSI)', angle: 90, position: 'insideRight' }}
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
                dataKey="flow" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={2}
                name="Consumption Rate"
                dot={false}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="pressure" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                name="Pressure"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
