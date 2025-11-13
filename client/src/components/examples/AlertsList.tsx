import { AlertsList } from "../AlertsList";
import { useState } from "react";

export default function AlertsListExample() {
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
    {
      id: "A3",
      type: "leak-detected" as const,
      zone: "Central Zone",
      severity: "critical" as const,
      message: "Potential leak detected. Flow rate anomaly in pipeline section B-12.",
      timestamp: "23 minutes ago",
    },
  ]);

  return (
    <div className="p-6">
      <AlertsList
        alerts={alerts}
        onResolve={(id) => {
          console.log("Resolving alert:", id);
          setAlerts(alerts.filter((a) => a.id !== id));
        }}
      />
    </div>
  );
}
