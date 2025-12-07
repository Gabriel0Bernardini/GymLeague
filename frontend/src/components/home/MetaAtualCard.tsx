import React, { useEffect, useState } from "react";
import { api } from "../../libs/api";

type MetaResp = {
  meta?: {
    titulo?: string;
    objetivo?: number;
    tipo?: string;
    valorInicial?: number | null;
  };
  usuario?: {
    peso?: number;
    percentual_gordura?: number;
  };
  percentComplete?: number;
  valorAtual?: number;
  message?: string;
};

export default function MetaAtualCard() {
  const [data, setData] = useState<MetaResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.home.metas();
        if (!mounted) return;
        setData(res);
      } catch (err: any) {
        setError(err?.message || "Erro ao carregar meta.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <div className="bg-blue-500 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2">Meta Atual</h2>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !data || data.message) {
    return (
      <div className="p-4">
        <div className="bg-blue-500 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2">Meta Atual</h2>
          <p className="text-white">{error ?? data?.message ?? "Nenhuma meta encontrada."}</p>
        </div>
      </div>
    );
  }

  const meta = data.meta ?? {};
  const percent = Math.max(0, Math.min(100, Math.round((data.percentComplete ?? 0) as number)));
  const objetivo = meta.objetivo ?? 0;
  const tipo = (meta.tipo ?? "P").toUpperCase();
  const unidade = tipo === "G" ? "%" : "kg";
  const valorAtual = data.valorAtual ?? (tipo === "G" ? data.usuario?.percentual_gordura : data.usuario?.peso);

  return (
    <div className="p-4">
      <div className="bg-blue-500 shadow-md rounded-lg p-6 grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold mb-2">Meta Atual</h2>

          <p className="text-white text-base">
            <span className="opacity-90">{meta.titulo ?? "Meta"}</span>
          </p>

          <p className="text-white text-base mt-2">
            Objetivo: <strong>{Number(objetivo).toFixed(2)}{unidade}</strong>
          </p>

          <div className="mt-4">
            <div className="w-full bg-gray-600 rounded-full h-4">
              <div
                className="bg-white h-4 rounded-full"
                style={{ width: `${percent}%` }}
              />
            </div>

            <p className="text-white text-sm mt-1">
              Progresso: <strong>{percent}%</strong>
            </p>

            <p className="text-white text-sm mt-1 opacity-90">
              Atual: <strong>{valorAtual !== undefined && valorAtual !== null ? Number(valorAtual).toFixed(2) : "-"}{unidade}</strong>
            </p>

            {meta.valorInicial !== null && meta.valorInicial !== undefined && (
              <p className="text-white text-xs mt-1 opacity-70">Iniciado em: {Number(meta.valorInicial).toFixed(2)}{unidade}</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">Treino</h2>

          <p className="text-white text-base">
            Ficha atual: <strong>A - Hipertrofia</strong>
          </p>

          <p className="text-white text-base mt-1">
            Próximo treino: <strong>Treino B - Costas e Bíceps</strong>
          </p>
        </div>
      </div>
    </div>
  );
}