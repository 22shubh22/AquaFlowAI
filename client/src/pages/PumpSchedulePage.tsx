import { PumpSchedule } from "@/components/PumpSchedule";

export default function PumpSchedulePage() {
  const pumps = [
    { id: "P-001", zone: "North Zone", status: "active" as const, schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: "450 L/h" },
    { id: "P-002", zone: "East Zone", status: "active" as const, schedule: "05:30 - 08:30, 17:30 - 20:30", flowRate: "380 L/h" },
    { id: "P-003", zone: "South Zone", status: "idle" as const, schedule: "07:00 - 10:00, 19:00 - 22:00", flowRate: "0 L/h" },
    { id: "P-004", zone: "West Zone", status: "active" as const, schedule: "06:30 - 09:30, 18:30 - 21:30", flowRate: "420 L/h" },
    { id: "P-005", zone: "Central Zone", status: "maintenance" as const, schedule: "Scheduled Maintenance", flowRate: "0 L/h" },
    { id: "P-006", zone: "Industrial", status: "active" as const, schedule: "24/7 Continuous", flowRate: "720 L/h" },
    { id: "P-007", zone: "North Zone", status: "active" as const, schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: "480 L/h" },
    { id: "P-008", zone: "East Zone", status: "idle" as const, schedule: "05:30 - 08:30, 17:30 - 20:30", flowRate: "0 L/h" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pump Schedule</h1>
        <p className="text-muted-foreground mt-1">Monitor and manage pump operations across all zones</p>
      </div>

      <PumpSchedule pumps={pumps} />
    </div>
  );
}
