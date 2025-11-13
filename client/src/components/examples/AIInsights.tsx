import { AIInsights } from "../AIInsights";

export default function AIInsightsExample() {
  const insights = [
    {
      id: "I1",
      type: "prediction" as const,
      title: "Peak Demand Expected Tomorrow",
      description: "AI model predicts 35% higher demand in South Zone during 8-10 AM based on historical patterns and weather forecast.",
      priority: "high" as const,
    },
    {
      id: "I2",
      type: "recommendation" as const,
      title: "Optimize Pump Schedule",
      description: "Recommend shifting Pump P-003 schedule to 5:30 AM to better serve tail-end households in East Zone.",
      priority: "medium" as const,
    },
    {
      id: "I3",
      type: "success" as const,
      title: "Distribution Equity Improved",
      description: "Recent scheduling adjustments resulted in 18% more equitable water distribution across all zones.",
      priority: "low" as const,
    },
    {
      id: "I4",
      type: "alert" as const,
      title: "Reservoir Level Trending Down",
      description: "Central reservoir level declining faster than normal. Consider adjusting consumption limits for next 48 hours.",
      priority: "high" as const,
    },
  ];

  return (
    <div className="p-6">
      <AIInsights insights={insights} />
    </div>
  );
}
