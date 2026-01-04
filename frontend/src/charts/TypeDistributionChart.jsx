import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TypeDistributionChart({ distributionByType }) {
  const labels = Object.keys(distributionByType || {});
  const values = labels.map((k) => distributionByType[k]);

  const safeLabels = labels.length ? labels : ["No data"];
  const safeValues = values.length ? values : [0];

  const data = {
    labels: safeLabels,
    datasets: [
      {
        label: "By Type",
        data: safeValues,
        borderWidth: 1
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
      <h4 style={{ margin: "0 0 8px" }}>Violation Type Distribution</h4>
      <div style={{ height: 260 }}>
        <Pie data={data} options={options} />
      </div>
    </div>
  );
}
