import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type GraficosProps = {
  tipoGrafico: "peso" | "gordura";
  onMudarTipo: (tipo: "peso" | "gordura") => void;
  dadosPeso: { peso: number; dataPesagem: string }[];
  dadosGordura: { percentual_gordura: number; dataPesagem: string }[];
};

export default function Graficos({
  tipoGrafico,
  onMudarTipo,
  dadosPeso,
  dadosGordura,
}: GraficosProps) {
  // Transformar dados para formato compatível com recharts
  const dadosGrafico = useMemo(() => {
    if (tipoGrafico === "peso") {
      const mapeados = dadosPeso.map((d) => ({
        data: new Date(d.dataPesagem).toLocaleDateString("pt-BR"),
        valor: parseFloat(String(d.peso)),
        timestamp: new Date(d.dataPesagem).getTime(),
      }));
      return mapeados;
    } else {
      const mapeados = dadosGordura.map((d) => ({
        data: new Date(d.dataPesagem).toLocaleDateString("pt-BR"),
        valor: parseFloat(String(d.percentual_gordura)),
        timestamp: new Date(d.dataPesagem).getTime(),
      }));
      return mapeados;
    }
  }, [tipoGrafico, dadosPeso, dadosGordura]);

  // Ordenar por timestamp
  const dadosOrdenados = useMemo(() => {
    const sorted = [...dadosGrafico].sort((a, b) => a.timestamp - b.timestamp);
    return sorted;
  }, [dadosGrafico]);

  const labelYAxis = tipoGrafico === "peso" ? "Peso (kg)" : "Percentual Gordura (%)";

  return (
    <div className="w-full h-full flex flex-col">
      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => onMudarTipo("peso")}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            tipoGrafico === "peso"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Peso Corporal
        </button>
        <button
          onClick={() => onMudarTipo("gordura")}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            tipoGrafico === "gordura"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Percentual de Gordura
        </button>
      </div>

      {/* Gráfico */}
      <div style={{ width: "100%", height: "500px", position: "relative" }}>
        {!dadosOrdenados || dadosOrdenados.length === 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              width: "100%",
            }}
          >
            <p style={{ color: "#999", fontSize: "18px" }}>Nenhum dado disponível para este filtro.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dadosOrdenados}
              margin={{ top: 5, right: 30, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="data"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={Math.max(0, Math.floor(dadosOrdenados.length / 5) - 1)}
              />
              <YAxis label={{ value: labelYAxis, angle: -90, position: "insideLeft" }} />
              <Tooltip
                formatter={(value: any) => [
                  typeof value === "number" ? value.toFixed(2) : value,
                  tipoGrafico === "peso" ? "Peso (kg)" : "Gordura (%)",
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="valor"
                stroke={tipoGrafico === "peso" ? "#3b82f6" : "#ef4444"}
                dot={{ fill: tipoGrafico === "peso" ? "#3b82f6" : "#ef4444", r: 4 }}
                name={tipoGrafico === "peso" ? "Peso (kg)" : "Gordura (%)"}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
