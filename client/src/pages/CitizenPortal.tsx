import { ReportForm } from "@/components/ReportForm";
import { CitizenReports } from "@/components/CitizenReports";
import { Card } from "@/components/ui/card";
import { Droplets, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function CitizenPortal() {
  const { toast } = useToast();
  const [reports, setReports] = useState([
    {
      id: "R1",
      type: "No Water Supply",
      location: "Gandhi Nagar, Block A",
      description: "No water supply since yesterday morning. Multiple households affected in the area.",
      status: "investigating" as const,
      timestamp: "2 hours ago",
    },
    {
      id: "R2",
      type: "Water Leak",
      location: "Civil Lines, Main Road",
      description: "Large water leak near the main pipeline. Water wastage observed.",
      status: "pending" as const,
      timestamp: "5 hours ago",
    },
  ]);

  const handleSubmit = (report: any) => {
    const newReport = {
      id: `R${reports.length + 1}`,
      type: report.type,
      location: report.location,
      description: report.description,
      status: "pending" as const,
      timestamp: "Just now",
    };
    setReports([newReport, ...reports]);
    toast({
      title: "Report Submitted",
      description: "Your water issue has been reported. We'll investigate shortly.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="relative bg-gradient-to-br from-primary/10 via-chart-2/5 to-chart-3/10 rounded-lg p-8 md:p-12 overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Citizen Water Portal</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Help us maintain equitable water distribution by reporting issues in your community
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-2/10">
                  <Droplets className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-2xl font-bold">1,247</p>
                  <p className="text-xs text-muted-foreground">Reports Resolved</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">4.2 hrs</p>
                  <p className="text-xs text-muted-foreground">Avg Response Time</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-1/10">
                  <CheckCircle className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-2xl font-bold">94%</p>
                  <p className="text-xs text-muted-foreground">Resolution Rate</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
          <Droplets className="h-full w-full text-primary" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportForm onSubmit={handleSubmit} />
        <CitizenReports reports={reports} />
      </div>
    </div>
  );
}
