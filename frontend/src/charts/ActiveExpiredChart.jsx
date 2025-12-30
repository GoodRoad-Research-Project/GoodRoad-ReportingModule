import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ActiveExpiredChart({ activeVsExpiredPoints }) {
  const active = activeVsExpiredPoints?.active ?? 0;
  const expired = activeVsExpiredPoints?.expired ?? 0;

  const data = {
    labels: ["Active Points", "Expired Points"],
    datasets: [
      {
        label: "Penalty Points",
        data: [active, expired],
        borderWidth: 1,
        cutout: "65%" // makes it look modern
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // IMPORTANT
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#cbd5e1",
          boxWidth: 12,
          padding: 14
        }
      },
      tooltip: { enabled: true }
    }
  };

  return (
    <div>
      <h4 style={{ margin: "0 0 8px" }}>Active vs Expired Penalty Points</h4>
      <div style={{ height: 260 }}>
        <Doughnut data={data} options={options} />
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap", color: "rgba(255,255,255,0.75)" }}>
        <span><b>Active:</b> {active}</span>
        <span><b>Expired:</b> {expired}</span>
      </div>
    </div>
  );
}
