import React, { useEffect, useState, useRef } from "react";
import { FaSearch, FaChevronDown } from "react-icons/fa";

type SeletorExercicioProps = {
  exercicios: { nome: string; ultimaData: string | null }[];
  selecionado: string | null;
  onSelecionar: (nomeExercicio: string) => void;
  loading?: boolean;
};

export default function SeletorExercicio({
  exercicios,
  selecionado,
  onSelecionar,
  loading = false,
}: SeletorExercicioProps) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtrar exercícios pela busca
  const exerciciosFiltrados = exercicios.filter((ex) =>
    ex.nome.toLowerCase().includes(busca.toLowerCase())
  );

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setAberto(false);
      }
    }

    if (aberto) {
      document.addEventListener("mousedown", handleClickOutside);
      // Focar no input quando abrir
      setTimeout(() => inputRef.current?.focus(), 0);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [aberto]);

  const exercicioSelecionado = exercicios.find((ex) => ex.nome === selecionado);

  return (
    <div ref={containerRef} className="relative w-full sm:w-80">
      {/* Botão de abertura */}
      <button
        onClick={() => setAberto(!aberto)}
        className={`w-full px-4 py-2 rounded-lg font-semibold transition flex items-center justify-between ${
          selecionado
            ? "bg-green-600 text-white hover:bg-green-700"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        } ${aberto ? "rounded-b-none" : ""}`}
      >
        <span>
          {loading ? "Carregando..." : selecionado ? selecionado : "Selecionar Exercício"}
        </span>
        <FaChevronDown
          className={`transition-transform ${aberto ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown aberto */}
      {aberto && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-lg z-50">
          {/* Barra de pesquisa */}
          <div className="p-3 border-b border-gray-300 flex items-center gap-2">
            <FaSearch className="text-gray-400" size={16} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar exercício..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="flex-1 outline-none text-sm"
            />
          </div>

          {/* Lista de exercícios */}
          <div className="max-h-64 overflow-y-auto">
            {exerciciosFiltrados.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {exercicios.length === 0
                  ? "Nenhum exercício realizado ainda"
                  : "Nenhum exercício encontrado"}
              </div>
            ) : (
              exerciciosFiltrados.map((ex) => (
                <button
                  key={ex.nome}
                  onClick={() => {
                    onSelecionar(ex.nome);
                    setAberto(false);
                    setBusca("");
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition flex justify-between items-center ${
                    selecionado === ex.nome ? "bg-blue-100 border-l-4 border-blue-600" : ""
                  }`}
                >
                  <span className="font-medium text-gray-800">{ex.nome}</span>
                  {ex.ultimaData && (
                    <span className="text-xs text-gray-500">
                      {new Date(ex.ultimaData).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
