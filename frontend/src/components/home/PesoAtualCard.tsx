
import React, { useEffect, useState } from "react";
import { api } from "../../libs/api";

export type CardPesoAtualProps = {};

export default function PesoAtualCard(_: CardPesoAtualProps) {
  const [peso, setPeso] = useState<number | null>(null);
  const [percentual, setPercentual] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.home.pesoPercentual();
        if (!mounted) return;
        setPeso(res.peso ?? null);
        setPercentual(res.percentual_gordura ?? null);
      } catch (err) {
        console.error("Erro ao buscar peso/percentual:", err);
        if (!mounted) return;
        setPeso(null);
        setPercentual(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  function formatPercent(v: number | null) {
    if (v === null || v === undefined) return "-";
    const n = Number(v);
    const value = n <= 1 ? n * 100 : n;
    return `${value.toFixed(1)}%`;
  }

  return (
    <div className="bg-white shadow-md rounded-xl p-6 flex items-center gap-4">
      <div className="flex-1 flex items-center justify-center gap-4">
        <div className="text-blue-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="w-12 h-12"
          >
            <path d="M12 2a7 7 0 0 0-7 7v1H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V9a7 7 0 0 0-7-7Zm5 8H7V9a5 5 0 0 1 10 0v1Z" />
          </svg>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Peso Atual</h2>
          <p className="text-gray-700 text-sm">
            <strong>{loading ? "..." : peso !== null ? `${peso}kg` : "-"}</strong>
          </p>
        </div>
      </div>

      <div className="w-px h-20 bg-gray-200" />

      <div className="flex-1 flex items-center justify-center gap-4">
        <div className="text-blue-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            className="w-12 h-12 fill-current"
          >
            <path d="M288 192C288 139 245 96 192 96C139 96 96 139 96 192C96 245 139 288 192 288C245 288 288 245 288 192zM544 448C544 395 501 352 448 352C395 352 352 395 352 448C352 501 395 544 448 544C501 544 544 501 544 448zM534.6 150.6C547.1 138.1 547.1 117.8 534.6 105.3C522.1 92.8 501.8 92.8 489.3 105.3L105.3 489.3C92.8 501.8 92.8 522.1 105.3 534.6C117.8 547.1 138.1 547.1 150.6 534.6L534.6 150.6z" />
          </svg>
        </div>

        <div>
          <h2 className="text-lg font-semibold">% Gordura</h2>
          <p className="text-gray-800 font-semibold">{loading ? "..." : formatPercent(percentual)}</p>
        </div>
      </div>
    </div>
  );
}
