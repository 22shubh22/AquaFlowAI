import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { TrendingUp, Calendar, Zap, Target, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function AIEquityDashboard() {
  const [showCalculations, setShowCalculations] = useState(false);

  const { data: equityData } = useQuery({
    queryKey: ["equity-score"],
    queryFn: api.getEquityScore,
    refetchInterval: 60000
  });

  const { data: zones } = useQuery({
    queryKey: ["zones"],
    queryFn: async () => {
      const res = await api.get("/api/zones");
      return res.json();
    },
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

  // Calculate per-capita flow rates for each zone
  const zoneCalculations = zones?.filter((z: any) => z.population && z.population > 0 && z.flowRate)
    .map((zone: any) => ({
      name: zone.name,
      population: zone.population,
      flowRate: zone.flowRate,
      perCapita: (zone.flowRate / zone.population).toFixed(4)
    })) || [];

  // Calculate statistics
  const perCapitaValues = zoneCalculations.map((z: any) => parseFloat(z.perCapita));
  const mean = perCapitaValues.length > 0 
    ? (perCapitaValues.reduce((sum: number, val: number) => sum + val, 0) / perCapitaValues.length) 
    : 0;
  
  const variance = perCapitaValues.length > 0
    ? perCapitaValues.reduce((sum: number, val: number) => sum + Math.pow(val - mean, 2), 0) / perCapitaValues.length
    : 0;
  
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;
  const calculatedScore = Math.max(0, Math.min(100, 100 - (coefficientOfVariation * 100)));

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

              {/* Detailed Calculations */}
              <Collapsible open={showCalculations} onOpenChange={setShowCalculations}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    <span className="text-sm font-medium">View Detailed Calculations</span>
                    {showCalculations ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  {/* Per-Zone Breakdown */}
                  <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Per-Zone Flow Rates
                    </p>
                    <div className="space-y-1.5">
                      {zoneCalculations.map((zone: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="font-medium">{zone.name}</span>
                          <div className="flex gap-3 text-xs text-muted-foreground">
                            <span>{zone.flowRate.toLocaleString()} L/h</span>
                            <span>÷ {zone.population.toLocaleString()} people</span>
                            <span className="font-mono font-semibold text-foreground">
                              = {zone.perCapita} L/h/person
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Statistical Summary */}
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      Statistical Summary
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Mean (μ)</p>
                        <p className="font-mono font-semibold">{mean.toFixed(4)} L/h/person</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Std Dev (σ)</p>
                        <p className="font-mono font-semibold">{stdDev.toFixed(4)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Coefficient of Variation</p>
                        <p className="font-mono font-semibold">{coefficientOfVariation.toFixed(4)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Final Score</p>
                        <p className="font-mono font-semibold text-primary">
                          100 - ({coefficientOfVariation.toFixed(4)} × 100) = {calculatedScore.toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Formula Explanation */}
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs font-semibold mb-2">Complete Formula:</p>
                    <div className="font-mono text-xs space-y-1 text-muted-foreground">
                      <p>1. Per-capita values: [{perCapitaValues.map(v => v.toFixed(4)).join(', ')}]</p>
                      <p>2. Mean (μ) = Σ(values) / n = {mean.toFixed(4)}</p>
                      <p>3. Variance (σ²) = Σ(value - μ)² / n = {variance.toFixed(6)}</p>
                      <p>4. Std Dev (σ) = √(variance) = {stdDev.toFixed(4)}</p>
                      <p>5. CV = σ / μ = {coefficientOfVariation.toFixed(4)}</p>
                      <p className="font-semibold text-foreground">6. Score = 100 - (CV × 100) = {calculatedScore.toFixed(0)}</p>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              
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