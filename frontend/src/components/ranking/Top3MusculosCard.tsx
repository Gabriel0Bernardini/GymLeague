import React from "react";

type TopMusculo = { musculo: string; ranking: string };

export default function Top3MusculosCard({ top3 }: { top3: TopMusculo[] }) {
  return (
    <div className="bg-white shadow rounded-lg p-5">
      <h2 className="text-xl font-bold mb-3">Top 3 Músculos</h2>
      <ul className="space-y-3">
        {top3.map((m, i) => (
          <li key={i} className="p-3 bg-gray-50 border rounded-lg">
            <p className="font-semibold">{m.musculo} — {m.ranking}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}