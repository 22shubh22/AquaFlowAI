import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";

interface Report {
  id: string;
  type: string;
  location: string;
  description: string;
  status: "pending" | "investigating" | "resolved";
  timestamp: string;
}

interface CitizenReportsProps {
  reports: Report[];
}

export function CitizenReports({ reports }: CitizenReportsProps) {
  const statusConfig = {
    pending: { variant: "secondary" as const, label: "Pending" },
    investigating: { variant: "secondary" as const, label: "Investigating" },
    resolved: { variant: "secondary" as const, label: "Resolved" },
  };

  return (
    <Card className="p-6" data-testid="card-citizen-reports">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Citizen Reports</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-muted-foreground">
              No reports submitted yet
            </div>
          ) : (
            reports.map((report) => (
              <Card key={report.id} className="p-4 hover-elevate" data-testid={`report-${report.id}`}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant={statusConfig[report.status].variant}>
                      {statusConfig[report.status].label}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-medium">
                      {report.type}
                    </span>
                  </div>
                  
                  <p className="text-sm line-clamp-2">{report.description}</p>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {report.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {report.timestamp}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
