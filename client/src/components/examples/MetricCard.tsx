import { MetricCard } from "../MetricCard";
import { Droplets, Gauge, Activity, AlertTriangle } from "lucide-react";

export default function MetricCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
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
        title="Alerts"
        value="3"
        icon={AlertTriangle}
        trend={{ value: 25, isPositive: false }}
        status="warning"
      />
    </div>
  );
}
