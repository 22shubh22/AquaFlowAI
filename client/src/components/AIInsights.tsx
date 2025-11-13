import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

interface Insight {
  id: string;
  type: "prediction" | "recommendation" | "alert" | "success";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

interface AIInsightsProps {
  insights: Insight[];
}

export function AIInsights({ insights }: AIInsightsProps) {
  const typeConfig = {
    prediction: { icon: TrendingUp, color: "text-chart-1", label: "Prediction" },
    recommendation: { icon: Brain, color: "text-chart-3", label: "Recommendation" },
    alert: { icon: AlertCircle, color: "text-yellow-500", label: "Alert" },
    success: { icon: CheckCircle, color: "text-chart-2", label: "Optimization" },
  };

  const priorityConfig = {
    high: { variant: "destructive" as const, label: "High Priority" },
    medium: { variant: "secondary" as const, label: "Medium" },
    low: { variant: "secondary" as const, label: "Low" },
  };

  return (
    <Card className="p-6" data-testid="card-ai-insights">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">AI-Driven Insights</h3>
        </div>
        
        <div className="space-y-3">
          {insights.map((insight) => {
            const Icon = typeConfig[insight.type].icon;
            return (
              <div
                key={insight.id}
                className="p-4 rounded-lg border hover-elevate"
                data-testid={`insight-${insight.id}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${typeConfig[insight.type].color}`} />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{insight.title}</span>
                      <Badge variant={priorityConfig[insight.priority].variant} className="text-xs">
                        {priorityConfig[insight.priority].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
