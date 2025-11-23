import { useEffect, useState } from "react";
import { FaTimes, FaSearch } from "react-icons/fa";
import { api } from "../../libs/api";

export type ExercicioSelecionavel = {
  nome: string;
  musculos: string[];
  grupoMuscular: string;
  // campos que vamos popular por padrão quando o exercício for escolhido
  series?: string;
  repeticoes?: string;
  carga?: string;
  descricao?: string;
};

type ModalSelecionarExerciciosProps = {
  aberto: boolean;
  onClose: () => void;
  onSelecionar: (exercicio: ExercicioSelecionavel) => void;
};

export default function ModalSelecionarExercicios({
  aberto,
  onClose,
  onSelecionar,
}: ModalSelecionarExerciciosProps) {
  const [pesquisa, setPesquisa] = useState("");
  const [grupo, setGrupo] = useState("");
  const [musculo, setMusculo] = useState("");

  const [exercicios, setExercicios] = useState<ExercicioSelecionavel[]>([]);
  const [grupos, setGrupos] = useState<string[]>([]);
  const [musculos, setMusculos] = useState<string[]>([]);

  // carregar dados do backend quando abrir
  useEffect(() => {
    if (!aberto) return;

    // buscar exercícios
    api.exercicios
      .listar()
      .then((res) => {
        // espera-se um array de { nome, musculos, grupoMuscular } — adapte se seu backend retornar diferente
        if (Array.isArray(res)) setExercicios(res);
        else setExercicios([]);
      })
      .catch(() => setExercicios([]));

    // buscar grupos musculares
    api.gruposMusculares
      .listar()
      .then((res) => {
        if (Array.isArray(res)) setGrupos(res);
        else setGrupos([]);
      })
      .catch(() => setGrupos([]));

    // reset filtros ao abrir
    setPesquisa("");
    setGrupo("");
    setMusculo("");
  }, [aberto]);

  // carregar músculos ao mudar grupo
  useEffect(() => {
    if (!grupo) {
      setMusculos([]);
      return;
    }
    api.musculos
      .listarPorGrupo(grupo)
      .then((res) => {
        if (Array.isArray(res)) setMusculos(res);
        else setMusculos([]);
      })
      .catch(() => setMusculos([]));
  }, [grupo]);

  if (!aberto) return null;

  const filtrados = exercicios.filter((e) =>
    e.nome.toLowerCase().includes(pesquisa.toLowerCase()) &&
    (grupo ? e.grupoMuscular === grupo : true) &&
    (musculo ? e.musculos.includes(musculo) : true)
  );

  function handleSelecionar(e: ExercicioSelecionavel) {
    // passa o exercício com campos padrão para edição na ficha
    onSelecionar({
      ...e,
      series: e.series ?? "",
      repeticoes: e.repeticoes ?? "",
      carga: e.carga ?? "",
      descricao: e.descricao ?? "",
    });
    onClose();
  }

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
            {grupos.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <select
            className="border p-2 rounded"
            value={musculo}
            onChange={(e) => setMusculo(e.target.value)}
            disabled={!grupo}
          >
            <option value="">Músculo</option>
            {musculos.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="max-h-[300px] overflow-y-auto border rounded p-2 bg-gray-50">
          {filtrados.map((ex) => (
            <div
              key={ex.nome}
              className="p-3 bg-white rounded shadow-sm mb-2 cursor-pointer hover:bg-gray-100 transition"
              onClick={() => handleSelecionar(ex)}
            >
              <p className="font-semibold">{ex.nome}</p>
              <p className="text-sm text-gray-600">
                {ex.grupoMuscular} — {ex.musculos.join(", ")}
              </p>
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
