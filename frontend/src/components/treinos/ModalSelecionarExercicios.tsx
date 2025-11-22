// src/components/treinos/ModalSelecionarExercicios.tsx
import { useEffect, useState } from "react";
import { FaTimes, FaSearch } from "react-icons/fa";
import { api } from "../../libs/api";

type Exercicio = {
  nome: string;
  musculos: string[];
  grupoMuscular: string;
};

type ModalSelecionarExerciciosProps = {
  aberto: boolean;
  onClose: () => void;
  onSelecionar: (exercicio: Exercicio) => void;
};

export default function ModalSelecionarExercicios({
  aberto,
  onClose,
  onSelecionar
}: ModalSelecionarExerciciosProps) {
  const [pesquisa, setPesquisa] = useState("");
  const [grupo, setGrupo] = useState("");
  const [musculo, setMusculo] = useState("");

  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [grupos, setGrupos] = useState<string[]>([]);
  const [musculos, setMusculos] = useState<string[]>([]);

  // carregar dados do backend
  useEffect(() => {
    if (!aberto) return;
    // fallback: se os endpoints não existirem, trate o erro no .catch
    api.exercicios.listar()
       .then((res) => {
        if (Array.isArray(res)) setMusculos(res);
        else setMusculos([]);
        })
      .catch(() => setExercicios([]));
    api.gruposMusculares.listar()
       .then((res) => {
        if (Array.isArray(res)) setMusculos(res);
        else setMusculos([]);
        })
      .catch(() => setGrupos([]));
  }, [aberto]);

  // carregar músculos ao mudar grupo
  useEffect(() => {
    if (!grupo) {
      setMusculos([]);
      return;
    }
    api.musculos.listarPorGrupo(grupo)
      .then((res) => {
        if (Array.isArray(res)) setMusculos(res);
        else setMusculos([]);
        })
      .catch(() => setMusculos([]));
  }, [grupo]);

  if (!aberto) return null;

  const filtrados = exercicios.filter(e =>
    e.nome.toLowerCase().includes(pesquisa.toLowerCase()) &&
    (grupo ? e.grupoMuscular === grupo : true) &&
    (musculo ? e.musculos.includes(musculo) : true)
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center">
      <div className="bg-white w-[70%] max-h-[80%] p-6 rounded-lg shadow-xl overflow-y-auto">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Selecionar Exercício</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-red-600">
            <FaTimes size={22} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <FaSearch className="absolute left-2 top-3 text-gray-500" />
            <input
              placeholder="Pesquisar exercício..."
              className="border rounded w-full p-2 pl-8"
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
            />
          </div>

          <select
            className="border p-2 rounded"
            value={grupo}
            onChange={(e) => setGrupo(e.target.value)}
          >
            <option value="">Grupo Muscular</option>
            {grupos.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <select
            className="border p-2 rounded"
            value={musculo}
            onChange={(e) => setMusculo(e.target.value)}
            disabled={!grupo}
          >
            <option value="">Músculo</option>
            {musculos.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="max-h-[300px] overflow-y-auto border rounded p-2 bg-gray-50">
          {filtrados.map(e => (
            <div
              key={e.nome}
              className="p-3 bg-white rounded shadow-sm mb-2 cursor-pointer hover:bg-gray-100 transition"
              onClick={() => onSelecionar(e)}
            >
              <p className="font-semibold">{e.nome}</p>
              <p className="text-sm text-gray-600">{e.grupoMuscular} — {e.musculos.join(", ")}</p>
            </div>
          ))}

          {filtrados.length === 0 && (
            <p className="text-center text-gray-600 py-4">Nenhum exercício encontrado.</p>
          )}
        </div>

      </div>
    </div>
  );
}
