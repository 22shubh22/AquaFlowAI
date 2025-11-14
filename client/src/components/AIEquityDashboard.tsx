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

            <div className="pt-4 border-t space-y-3">
              <div>
                <p className="text-sm font-semibold mb-2">How it's calculated:</p>
                <p className="text-sm text-muted-foreground">
                  The score is based on the <strong>Coefficient of Variation (CV)</strong> of per-capita flow rates across all zones:
                </p>
                <ul className="text-sm text-muted-foreground ml-4 mt-1 space-y-1">
                  <li>• Calculate per-capita flow rate for each zone (L/h per person)</li>
                  <li>• Measure the standard deviation across zones</li>
                  <li>• Divide by the mean to get CV</li>
                  <li>• Score = 100 - (CV × 100)</li>
                </ul>
              </div>
              
              <div>
                <p className="text-sm font-semibold mb-2">Significance:</p>
                <ul className="text-sm text-muted-foreground ml-4 space-y-1">
                  <li>• <strong>100:</strong> Perfect equity - all zones receive equal water per person</li>
                  <li>• <strong>80-99:</strong> Excellent - minor variations in distribution</li>
                  <li>• <strong>60-79:</strong> Good - acceptable distribution fairness</li>
                  <li>• <strong>40-59:</strong> Fair - some zones may be underserved</li>
                  <li>• <strong>&lt;40:</strong> Poor - significant distribution inequality</li>
                </ul>
              </div>
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