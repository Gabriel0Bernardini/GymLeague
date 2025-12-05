import React from "react";

type MusculoGrupo = {
  rankingGrupo: string;
  musculos: { musculo: string; ranking: string }[];
};

export default function TodosMusculosCard({ grupos }: { grupos: Record<string, MusculoGrupo> }) {
  return (
    <div className="bg-white shadow rounded-lg p-5 w-full">
      <h2 className="text-xl font-bold mb-3">Ranking Geral</h2>
      <div className="space-y-4">
        {Object.keys(grupos).map((grupo) => (
          <div key={grupo} className="border p-3 rounded-lg">
            <p className="font-bold text-lg mb-1">
              {grupo} — <span>{grupos[grupo].rankingGrupo}</span>
            </p>
            <ul className="space-y-1">
              {grupos[grupo].musculos.map((m, i) => (
                <li key={i}>• {m.musculo} — {m.ranking}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}