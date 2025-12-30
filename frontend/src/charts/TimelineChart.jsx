import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function TimelineChart({ timelineByMonth }) {
  const labels = Object.keys(timelineByMonth || {}).sort();
  const values = labels.map((k) => timelineByMonth[k]);

  // empty data handling (looks nice for demo)
  const safeLabels = labels.length ? labels : ["No data"];
  const safeValues = values.length ? values : [0];

  const data = {
    labels: safeLabels,
    datasets: [
      {
        label: "Violations per month",
        data: safeValues,
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // IMPORTANT
    plugins: {
      legend: { display: true, position: "top" },
      tooltip: { enabled: true }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#cbd5e1" } // readable on dark bg
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255,255,255,0.10)" },
        ticks: { stepSize: 1, color: "#cbd5e1" }
      }
    }
  };

  return (
    <div>
      <h4 style={{ margin: "0 0 8px" }}>Violation Timeline</h4>
      <div style={{ height: 260 }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
