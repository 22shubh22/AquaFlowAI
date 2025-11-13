import { FlowChart } from "../FlowChart";

export default function FlowChartExample() {
  const data = [
    { time: "00:00", flow: 1800, pressure: 42 },
    { time: "04:00", flow: 1200, pressure: 48 },
    { time: "08:00", flow: 2800, pressure: 38 },
    { time: "12:00", flow: 2400, pressure: 44 },
    { time: "16:00", flow: 2600, pressure: 40 },
    { time: "20:00", flow: 3000, pressure: 36 },
    { time: "24:00", flow: 2200, pressure: 46 },
  ];

  return (
    <div className="p-6">
      <FlowChart data={data} />
    </div>
  );
}
