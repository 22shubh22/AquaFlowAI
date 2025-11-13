import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Circle } from "lucide-react";

interface PumpScheduleProps {
  pumps: Array<{
    id: string;
    zone: string;
    status: "active" | "idle" | "maintenance";
    schedule: string;
    flowRate: string;
  }>;
}

export function PumpSchedule({ pumps }: PumpScheduleProps) {
  const statusConfig = {
    active: { color: "text-chart-2", bgColor: "bg-chart-2/10", label: "Active" },
    idle: { color: "text-muted-foreground", bgColor: "bg-muted", label: "Idle" },
    maintenance: { color: "text-yellow-500", bgColor: "bg-yellow-500/10", label: "Maintenance" },
  };

  return (
    <Card className="p-6" data-testid="card-pump-schedule">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pump Schedule</h3>
        
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pump ID</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Flow Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pumps.map((pump) => (
                <TableRow key={pump.id} data-testid={`row-pump-${pump.id}`}>
                  <TableCell className="font-medium">{pump.id}</TableCell>
                  <TableCell>{pump.zone}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Circle className={`h-2 w-2 fill-current ${statusConfig[pump.status].color}`} />
                      <Badge variant="secondary" className={statusConfig[pump.status].bgColor}>
                        {statusConfig[pump.status].label}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{pump.schedule}</TableCell>
                  <TableCell className="font-medium">{pump.flowRate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
