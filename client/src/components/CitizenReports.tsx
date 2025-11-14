
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Report {
  id: string;
  type: string;
  location: string;
  description: string;
  status: "pending" | "investigating" | "resolved";
  timestamp: string | Date;
}

interface CitizenReportsProps {
  reports: Report[];
  onStatusChange?: (reportId: string, newStatus: string) => void;
  loading?: boolean;
}

export function CitizenReports({ reports, onStatusChange, loading }: CitizenReportsProps) {
  const statusConfig = {
    pending: { variant: "secondary" as const, label: "Pending", color: "bg-yellow-500" },
    investigating: { variant: "secondary" as const, label: "Investigating", color: "bg-blue-500" },
    resolved: { variant: "secondary" as const, label: "Resolved", color: "bg-green-500" },
  };

  const formatTimestamp = (timestamp: string | Date) => {
    if (typeof timestamp === 'string') return timestamp;
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <Card className="p-6" data-testid="card-citizen-reports">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Citizen Reports</h3>
          <div className="text-center py-8 text-muted-foreground">
            Loading reports...
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6" data-testid="card-citizen-reports">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Citizen Reports</h3>
          <span className="text-sm text-muted-foreground">
            {reports.length} report{reports.length !== 1 ? 's' : ''}
          </span>
        </div>
        
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
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusConfig[report.status].color}`} />
                      <Badge variant={statusConfig[report.status].variant}>
                        {statusConfig[report.status].label}
                      </Badge>
                    </div>
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
                      {formatTimestamp(report.timestamp)}
                    </div>
                  </div>

                  {onStatusChange && (
                    <div className="pt-2 border-t">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full">
                            Change Status
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => onStatusChange(report.id, "pending")}
                            disabled={report.status === "pending"}
                          >
                            Mark as Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onStatusChange(report.id, "investigating")}
                            disabled={report.status === "investigating"}
                          >
                            Mark as Investigating
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onStatusChange(report.id, "resolved")}
                            disabled={report.status === "resolved"}
                          >
                            Mark as Resolved
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
