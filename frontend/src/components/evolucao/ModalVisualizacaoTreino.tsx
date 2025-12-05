import React, { useState } from "react";
import { FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";

type Serie = {
  numero: number;
  detalhe: string;
  repeticoes: number;
  carga: number;
};

type ExercicioDetalhado = {
  nome: string;
  numeroSeries: number;
  series: Serie[];
};

type ModalVisualizacaoTreinoProps = {
  aberto: boolean;
  onClose: () => void;
  nomeTreino: string;
  nomeRotina: string | null;
  dataDoTreino: string;
  exercicios: ExercicioDetalhado[];
};

export default function ModalVisualizacaoTreino({
  aberto,
  onClose,
  nomeTreino,
  nomeRotina,
  dataDoTreino,
  exercicios,
}: ModalVisualizacaoTreinoProps) {
  const [expandedExercicio, setExpandedExercicio] = useState<string | null>(null);
  const [visivel, setVisivel] = useState(false);
  const [animandoSaida, setAnimandoSaida] = useState(false);

  React.useEffect(() => {
    if (aberto) {
      setVisivel(true);
      setAnimandoSaida(false);
    }
  }, [aberto]);

  function fecharComAnimacao() {
    setAnimandoSaida(true);
    setTimeout(() => {
      setVisivel(false);
      onClose();
    }, 300);
  }

  if (!aberto && !visivel) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex justify-center items-center
        bg-black/40 backdrop-blur-sm
        transition-opacity duration-300
        ${animandoSaida ? "opacity-0" : "opacity-100"}
      `}
      onClick={fecharComAnimacao}
    >
      <div
        className={`
          bg-white rounded-2xl shadow-xl p-6
          w-3/4 max-w-[900px]
          h-3/4 overflow-y-auto
          transform transition-all duration-300
          ${animandoSaida ? "translate-y-6 opacity-0 scale-95" : "translate-y-0 opacity-100 scale-100"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Topo */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <div>
            <h2 className="text-2xl font-bold">{nomeTreino}</h2>
            {nomeRotina && (
              <p className="text-sm text-gray-600 mt-1">
                Rotina: <span className="font-semibold">{nomeRotina}</span>
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Data: {new Date(dataDoTreino).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <button onClick={fecharComAnimacao} className="text-gray-600 hover:text-red-600">
            <FaTimes size={22} />
          </button>
        </div>

        {/* Lista de exercícios */}
        {exercicios.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Nenhum exercício registrado para este treino.</p>
        ) : (
          <div className="space-y-4">
            {exercicios.map((exercicio) => (
              <div key={exercicio.nome} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() =>
                    setExpandedExercicio(
                      expandedExercicio === exercicio.nome ? null : exercicio.nome
                    )
                  }
                  className="w-full flex justify-between items-center p-4 bg-gray-100 hover:bg-gray-200 transition"
                >
                  <div className="text-left">
                    <h3 className="font-bold text-lg">{exercicio.nome}</h3>
                    <p className="text-sm text-gray-600">
                      {exercicio.numeroSeries} série{exercicio.numeroSeries !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {expandedExercicio === exercicio.nome ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
                </button>

                {expandedExercicio === exercicio.nome && (
                  <div className="p-4 bg-gray-50">
                    {exercicio.series.length === 0 ? (
                      <p className="text-sm text-gray-600">Nenhuma série registrada.</p>
                    ) : (
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="border p-2 text-left">Série</th>
                            <th className="border p-2 text-center">Carga (kg)</th>
                            <th className="border p-2 text-center">Repetições</th>
                            <th className="border p-2 text-left">Detalhe</th>
                          </tr>
                        </thead>
                        <tbody>
                          {exercicio.series.map((serie, idx) => (
                            <tr key={idx} className="hover:bg-gray-100">
                              <td className="border p-2 font-semibold">#{serie.numero}</td>
                              <td className="border p-2 text-center">
                                {serie.carga || "-"}
                              </td>
                              <td className="border p-2 text-center">
                                {serie.repeticoes || "-"}
                              </td>
                              <td className="border p-2 text-gray-700">
                                {serie.detalhe || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
