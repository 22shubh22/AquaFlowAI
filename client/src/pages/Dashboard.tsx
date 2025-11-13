import { MetricCard } from "@/components/MetricCard";
import { ZoneMap } from "@/components/ZoneMap";
import { AlertsList } from "@/components/AlertsList";
import { FlowChart } from "@/components/FlowChart";
import { AIInsights } from "@/components/AIInsights";
import { Droplets, Gauge, Activity, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  
  const [alerts, setAlerts] = useState([
    {
      id: "A1",
      type: "pressure-drop" as const,
      zone: "East Zone",
      severity: "critical" as const,
      message: "Pressure dropped below threshold (35 PSI). Immediate attention required.",
      timestamp: "5 minutes ago",
    },
    {
      id: "A2",
      type: "excess-pumping" as const,
      zone: "North Zone",
      severity: "warning" as const,
      message: "Pump #12 running above optimal capacity for extended period.",
      timestamp: "15 minutes ago",
    },
  ]);

  const zones = [
    { id: "RAI-1", name: "Civil Lines", status: "optimal" as const, flowRate: "520 L/h", pressure: "50 PSI", x: 45, y: 25 },
    { id: "RAI-2", name: "Shankar Nagar", status: "optimal" as const, flowRate: "480 L/h", pressure: "48 PSI", x: 35, y: 35 },
    { id: "RAI-3", name: "Devendra Nagar", status: "low-pressure" as const, flowRate: "320 L/h", pressure: "35 PSI", x: 25, y: 50 },
    { id: "RAI-4", name: "Pandri", status: "optimal" as const, flowRate: "450 L/h", pressure: "46 PSI", x: 50, y: 45 },
    { id: "RAI-5", name: "Mowa", status: "high-demand" as const, flowRate: "580 L/h", pressure: "42 PSI", x: 65, y: 30 },
    { id: "RAI-6", name: "Tatibandh", status: "optimal" as const, flowRate: "410 L/h", pressure: "47 PSI", x: 55, y: 55 },
    { id: "RAI-7", name: "Gudhiyari", status: "low-pressure" as const, flowRate: "340 L/h", pressure: "36 PSI", x: 40, y: 60 },
    { id: "RAI-8", name: "Kota", status: "high-demand" as const, flowRate: "620 L/h", pressure: "40 PSI", x: 70, y: 50 },
    { id: "RAI-9", name: "Sunder Nagar", status: "optimal" as const, flowRate: "490 L/h", pressure: "49 PSI", x: 30, y: 42 },
    { id: "RAI-10", name: "Urla", status: "high-demand" as const, flowRate: "720 L/h", pressure: "38 PSI", x: 75, y: 65 },
    { id: "RAI-11", name: "Amanaka", status: "optimal" as const, flowRate: "460 L/h", pressure: "47 PSI", x: 60, y: 70 },
    { id: "RAI-12", name: "Telibandha", status: "optimal" as const, flowRate: "500 L/h", pressure: "48 PSI", x: 48, y: 35 },
  ];

  const flowData = [
    { time: "00:00", flow: 1800, pressure: 42 },
    { time: "04:00", flow: 1200, pressure: 48 },
    { time: "08:00", flow: 2800, pressure: 38 },
    { time: "12:00", flow: 2400, pressure: 44 },
    { time: "16:00", flow: 2600, pressure: 40 },
    { time: "20:00", flow: 3000, pressure: 36 },
    { time: "24:00", flow: 2200, pressure: 46 },
  ];

  const insights = [
    {
      id: "I1",
      type: "prediction" as const,
      title: "Peak Demand Expected Tomorrow",
      description: "AI model predicts 35% higher demand in South Zone during 8-10 AM based on historical patterns.",
      priority: "high" as const,
    },
    {
      id: "I2",
      type: "recommendation" as const,
      title: "Optimize Pump Schedule",
      description: "Recommend shifting Pump P-003 schedule to 5:30 AM for better distribution equity.",
      priority: "medium" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Real-time water distribution monitoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Flow Rate"
          value="2.4M L/h"
          icon={Droplets}
          trend={{ value: 12, isPositive: true }}
          status="normal"
        />
        <MetricCard
          title="Avg Pressure"
          value="45 PSI"
          icon={Gauge}
          trend={{ value: 3, isPositive: true }}
          status="normal"
        />
        <MetricCard
          title="Active Pumps"
          value="18/24"
          icon={Activity}
          status="normal"
        />
        <MetricCard
          title="Active Alerts"
          value={alerts.length.toString()}
          icon={AlertTriangle}
          status={alerts.length > 2 ? "warning" : "normal"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ZoneMap
            zones={zones}
            onZoneClick={(zone) => {
              toast({
                title: zone.name,
                description: `Flow: ${zone.flowRate} | Pressure: ${zone.pressure}`,
              });
            }}
          />
        </div>
        <div>
          <AlertsList
            alerts={alerts}
            onResolve={(id) => {
              console.log("Resolving alert:", id);
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
        <FlowChart data={flowData} />
        <AIInsights insights={insights} />
      </div>
    </div>
  );
}
