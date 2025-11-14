import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { TrendingUp, Calendar, Zap, Target } from "lucide-react";

export function AIEquityDashboard() {
  const { data: equityData } = useQuery({
    queryKey: ["equity-score"],
    queryFn: api.getEquityScore,
    refetchInterval: 60000
  });

  const { data: optimalSchedules, isLoading: isLoadingSchedules } = useQuery({
    queryKey: ["optimal-schedules"],
    queryFn: api.getOptimalSchedules,
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  const equityScore = equityData?.score || 0;
  const equityLevel = equityScore >= 80 ? "Excellent" : equityScore >= 60 ? "Good" : equityScore >= 40 ? "Fair" : "Poor";
  const equityColor = equityScore >= 80 ? "text-chart-2" : equityScore >= 60 ? "text-chart-1" : equityScore >= 40 ? "text-yellow-500" : "text-destructive";

  // Assuming 'schedules' should be 'optimalSchedules' based on the context
  const schedules = optimalSchedules || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Equity Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Distribution Equity Score
          </CardTitle>
          <CardDescription>AI-calculated fairness metric across all zones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-5xl font-bold ${equityColor}`}>{equityScore}</div>
                <p className="text-sm text-muted-foreground mt-1">out of 100</p>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {equityLevel}
              </Badge>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                This score measures how equitably water is distributed across zones based on per-capita flow rates.
                A score of 100 indicates perfectly equal distribution.
              </p>
            </div>

            {equityScore < 70 && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Recommendation: Review pump schedules in low-scoring zones
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Optimal Schedules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            AI-Recommended Schedules
          </CardTitle>
          <CardDescription>Optimized pump schedules for next 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!schedules || schedules.length === 0 ? (
              <p className="text-sm text-muted-foreground">No schedules available. The AI engine is calculating optimal schedules...</p>
            ) : (
              schedules.map((schedule, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{schedule.zoneName || 'Unknown Zone'}</p>
                    <p className="text-sm text-muted-foreground">
                      {schedule.startTime || 'N/A'} - {schedule.endTime || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {schedule.flowRate ? Math.round(schedule.flowRate).toLocaleString() : '0'} L/h
                    </p>
                    <p className="text-xs text-muted-foreground">{schedule.reason || 'Optimizing...'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}