export async function getPenaltyScore(plateNo) {
  const res = await fetch(`http://127.0.0.1:8000/api/penalty/user/${encodeURIComponent(plateNo)}/score`);
  if (!res.ok) throw new Error("Failed to fetch score");
  return res.json();
}

export async function getPenaltyCharts(plateNo) {
  const res = await fetch(`http://127.0.0.1:8000/api/penalty/user/${encodeURIComponent(plateNo)}/charts`);
  if (!res.ok) throw new Error("Failed to fetch charts");
  return res.json();
}
