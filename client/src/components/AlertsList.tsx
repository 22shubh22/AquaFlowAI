import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Droplet, Gauge, Clock } from "lucide-react";

interface Alert {
  id: string;
  type: "pressure-drop" | "excess-pumping" | "leak-detected" | "low-reservoir";
  zone: string;
  severity: "critical" | "warning" | "info";
  message: string;
  timestamp: string;
}

interface AlertsListProps {
  alerts: Alert[];
  onResolve?: (alertId: string) => void;
}

export function AlertsList({ alerts, onResolve }: AlertsListProps) {
  const iconMap = {
    "pressure-drop": Gauge,
    "excess-pumping": AlertTriangle,
    "leak-detected": Droplet,
    "low-reservoir": Droplet,
  };

  const severityConfig = {
    critical: { variant: "destructive" as const, label: "Critical" },
    warning: { variant: "secondary" as const, label: "Warning" },
    info: { variant: "secondary" as const, label: "Info" },
  };

  return (
    <Card className="p-6" data-testid="card-alerts">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Alerts</h3>
        
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active alerts
            </div>
          ) : (
            alerts.map((alert) => {
              const Icon = iconMap[alert.type];
              return (
                <div
                  key={alert.id}
                  className="flex items-start gap-4 p-4 rounded-lg border hover-elevate"
                  data-testid={`alert-${alert.id}`}
                >
                  <div className={`p-2 rounded-lg ${alert.severity === 'critical' ? 'bg-destructive/10' : 'bg-yellow-500/10'}`}>
                    <Icon className={`h-5 w-5 ${alert.severity === 'critical' ? 'text-destructive' : 'text-yellow-500'}`} />
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={severityConfig[alert.severity].variant}>
                        {severityConfig[alert.severity].label}
                      </Badge>
                      <span className="text-sm font-medium">{alert.zone}</span>
                    </div>
                    <p className="text-sm">{alert.message}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {alert.timestamp}
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onResolve?.(alert.id)}
                    data-testid={`button-resolve-${alert.id}`}
                  >
                    Resolve
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
}
