import { ReportForm } from "@/components/ReportForm";
import { CitizenReports } from "@/components/CitizenReports";
import { Card } from "@/components/ui/card";
import { Droplets, Clock, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function CitizenPortal() {
  const { toast } = useToast();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Get user object from auth context

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await api.getReports();
      setReports(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (reportData: any) => {
    try {
      if (!user?.id) {
        toast({
          title: "Error",
          description: "You must be logged in to submit a report",
          variant: "destructive",
        });
        return;
      }

      await api.createReport({
        ...reportData,
        userId: user.id,
      });
      toast({
        title: "Success",
        description: "Your report has been submitted successfully",
      });
      loadReports();
    } catch (error: any) {
      console.error("Report submission error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit report",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    try {
      await api.updateReportStatus(reportId, newStatus);
      toast({
        title: "Status Updated",
        description: "Report status has been updated successfully.",
      });
      loadReports();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
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
        <CitizenReports reports={reports} onStatusChange={handleStatusChange} loading={loading} />
      </div>
    </div>
  );
}