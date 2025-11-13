import { CitizenReports } from "../CitizenReports";

export default function CitizenReportsExample() {
  const reports = [
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
    {
      id: "R3",
      type: "Low Pressure",
      location: "Shankar Nagar",
      description: "Very low water pressure during morning hours. Unable to fill overhead tanks.",
      status: "resolved" as const,
      timestamp: "1 day ago",
    },
    {
      id: "R4",
      type: "Irregular Supply",
      location: "Telibandha",
      description: "Water supply timing is inconsistent. Sometimes comes at night instead of scheduled hours.",
      status: "investigating" as const,
      timestamp: "3 hours ago",
    },
  ];

  return (
    <div className="p-6">
      <CitizenReports reports={reports} />
    </div>
  );
}
