import React, { useMemo } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

type CalendarioProps = {
  mês: number; // 0-11
  ano: number;
  datasComTreino: string[]; // formato "YYYY-MM-DD"
  onMesAnterior: () => void;
  onProximoMes: () => void;
  onDiaClicado: (data: string) => void;
};

export default function Calendario({
  mês,
  ano,
  datasComTreino,
  onMesAnterior,
  onProximoMes,
  onDiaClicado,
}: CalendarioProps) {
  const nomeMeses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const primeiroDia = new Date(ano, mês, 1).getDay(); // 0 = domingo
  const diasNoMes = new Date(ano, mês + 1, 0).getDate();

  const diasArray = useMemo(() => {
    const dias = [];
    // Preencher dias vazios do mês anterior
    for (let i = 0; i < primeiroDia; i++) {
      dias.push(null);
    }
    // Preencher dias do mês atual
    for (let dia = 1; dia <= diasNoMes; dia++) {
      dias.push(dia);
    }
    return dias;
  }, [mês, ano, primeiroDia, diasNoMes]);

  const temTreino = (dia: number | null): boolean => {
    if (dia === null) return false;
    const dataFormatada = `${ano}-${String(mês + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    return datasComTreino.some((d) => d.startsWith(dataFormatada));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
      {/* Cabeçalho com navegação */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onMesAnterior}
          className="p-2 hover:bg-gray-100 rounded transition"
        >
          <FaChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-bold">
          {nomeMeses[mês]} {ano}
        </h2>
        <button
          onClick={onProximoMes}
          className="p-2 hover:bg-gray-100 rounded transition"
        >
          <FaChevronRight size={20} />
        </button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((dia) => (
          <div key={dia} className="text-center font-bold text-sm text-gray-600 py-2">
            {dia}
          </div>
        ))}
      </div>

      {/* Grid de dias */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {diasArray.map((dia, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (dia !== null && temTreino(dia)) {
                const dataFormatada = `${ano}-${String(mês + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
                onDiaClicado(dataFormatada);
              }
            }}
            disabled={dia === null || !temTreino(dia)}
            className={`
              aspect-square rounded-lg flex items-center justify-center text-sm font-semibold
              transition-colors
              ${
                dia === null
                  ? "bg-gray-50 text-gray-300"
                  : temTreino(dia)
                  ? "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }
            `}
          >
            {dia}
          </button>
        ))}
      </div>

      {/* Legenda */}
      <div className="mt-6 pt-4 border-t flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Com treino</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 rounded border border-gray-300"></div>
          <span>Sem treino</span>
        </div>
      </div>
    </div>
  );
}