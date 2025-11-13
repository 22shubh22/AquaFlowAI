import { Card } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  status?: "normal" | "warning" | "critical";
}

export function MetricCard({ title, value, icon: Icon, trend, status = "normal" }: MetricCardProps) {
  const statusColors = {
    normal: "text-chart-1",
    warning: "text-yellow-500",
    critical: "text-destructive",
  };

  return (
    <Card className="p-6" data-testid={`card-metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-4xl font-bold">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 text-sm">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-chart-2" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span className={trend.isPositive ? "text-chart-2" : "text-destructive"}>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-muted-foreground">vs last week</span>
            </div>
          )}
        </div>
        <div className={`rounded-lg p-3 ${status === 'critical' ? 'bg-destructive/10' : status === 'warning' ? 'bg-yellow-500/10' : 'bg-primary/10'}`}>
          <Icon className={`h-6 w-6 ${statusColors[status]}`} />
        </div>
      </div>
    </Card>
  );
}
