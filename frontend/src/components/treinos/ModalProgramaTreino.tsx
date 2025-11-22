// src/components/treinos/ModalProgramaTreino.tsx
import { useEffect, useState } from "react";
import { FaTimes, FaEdit, FaChevronDown, FaChevronUp } from "react-icons/fa";
import ModalSelecionarExercicios from "./ModalSelecionarExercicios";

type Exercicio = {
  nome: string;
  musculos: string[];
  grupoMuscular: string;
};

type Ficha = {
  id: number;
  nome: string;
  exercicios: Exercicio[];
  editando?: boolean;
};

type ModalProgramaTreinoProps = {
  aberto: boolean;
  onClose: () => void;
  onSalvar?: (payload: { nomePrograma: string; fichas: Ficha[] }) => void; // opcional callback externo
};

export default function ModalProgramaTreino({ aberto, onClose, onSalvar }: ModalProgramaTreinoProps) {
  const [nomePrograma, setNomePrograma] = useState("Novo Programa De Treino");
  const [editandoNome, setEditandoNome] = useState(false);

  const [fichas, setFichas] = useState<Ficha[]>([
    { id: 1, nome: "Ficha A", exercicios: [], editando: false }
  ]);

  const [abertaId, setAbertaId] = useState<number | null>(null);

  // mini modal de seleção de exercícios
  const [modalExercicioAberto, setModalExercicioAberto] = useState(false);
  const [fichaSelecionadaId, setFichaSelecionadaId] = useState<number | null>(null);

  // animação de entrada/saída
  const [visivel, setVisivel] = useState(false);
  const [animandoSaida, setAnimandoSaida] = useState(false);

  useEffect(() => {
    if (aberto) {
      setVisivel(true);
      setTimeout(() => setAnimandoSaida(false), 10);
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

  function adicionarFicha() {
    const letra = String.fromCharCode(65 + fichas.length);
    setFichas(prev => [...prev, { id: Date.now(), nome: `Ficha ${letra}`, exercicios: [], editando: false }]);
  }

  function toggleFicha(id: number) {
    setAbertaId(prev => (prev === id ? null : id));
  }

  function editarNomeFicha(id: number, novoNome: string) {
    setFichas(prev => prev.map(f => (f.id === id ? { ...f, nome: novoNome } : f)));
  }

  function alternarEdicaoNome(id: number) {
    setFichas(prev => prev.map(f => (f.id === id ? { ...f, editando: !f.editando } : f)));
  }

  function abrirSelecionarExerciciosParaFicha(id: number) {
    setFichaSelecionadaId(id);
    setModalExercicioAberto(true);
  }

  function onSelecionarExercicioParaFicha(ex: Exercicio) {
    if (fichaSelecionadaId == null) return;
    setFichas(prev =>
      prev.map(f =>
        f.id === fichaSelecionadaId ? { ...f, exercicios: [...f.exercicios, ex] } : f
      )
    );
    setModalExercicioAberto(false);
  }

  function handleSalvar() {
    // se o usuário passar onSalvar, chama ele; senão só fecha
    if (onSalvar) onSalvar({ nomePrograma, fichas });
    fecharComAnimacao();
  }

  return (
    <>
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
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              {editandoNome ? (
                <input className="border p-1 rounded" value={nomePrograma} onChange={(e) => setNomePrograma(e.target.value)} />
              ) : (
                <h2 className="text-2xl font-bold">{nomePrograma}</h2>
              )}
              <button className="text-gray-600 hover:text-black" onClick={() => setEditandoNome(prev => !prev)}>
                <FaEdit />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={fecharComAnimacao} className="text-gray-600 hover:text-red-600">
                <FaTimes size={22} />
              </button>
            </div>
          </div>

          {/* Lista fichas */}
          <div className="space-y-4">
            {fichas.map(f => (
              <div key={f.id} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFicha(f.id)}
                  className="w-full flex justify-between items-center p-3 bg-gray-100 hover:bg-gray-200"
                >
                  <div className="flex items-center gap-3">
                    {f.editando ? (
                      <input className="border px-2 py-1 rounded" value={f.nome} onChange={(e) => editarNomeFicha(f.id, e.target.value)} />
                    ) : (
                      <span className="font-bold">{f.nome}</span>
                    )}

                    <button
                      className="text-gray-600 hover:text-black"
                      onClick={(e) => {
                        e.stopPropagation();
                        alternarEdicaoNome(f.id);
                      }}
                    >
                      <FaEdit />
                    </button>
                  </div>

                  {abertaId === f.id ? <FaChevronUp /> : <FaChevronDown />}
                </button>

                {abertaId === f.id && (
                  <div className="p-3 bg-gray-50">
                    <table className="w-full text-center border">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="border p-2">Nome</th>
                          <th className="border p-2">Séries</th>
                          <th className="border p-2">Repetições</th>
                          <th className="border p-2">Carga</th>
                          <th className="border p-2">Descrição</th>
                        </tr>
                      </thead>
                      <tbody>
                        {f.exercicios.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="border p-2 text-sm text-gray-500">Nenhum exercício adicionado ainda</td>
                          </tr>
                        ) : (
                          f.exercicios.map((ex, idx) => (
                            <tr key={`${ex.nome}-${idx}`}>
                              <td className="border p-2">{ex.nome}</td>
                              <td className="border p-2">—</td>
                              <td className="border p-2">—</td>
                              <td className="border p-2">—</td>
                              <td className="border p-2 text-sm">{ex.musculos?.join?.(", ") ?? ""}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                    <button
                      className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                      onClick={() => abrirSelecionarExerciciosParaFicha(f.id)}
                    >
                      Adicionar exercícios nessa ficha
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <button onClick={adicionarFicha} className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-black">
              Adicionar Ficha
            </button>
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={handleSalvar} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Salvar Programa
            </button>
          </div>
        </div>
      </div>

      {/* Mini-modal de seleção de exercícios */}
      <ModalSelecionarExercicios
        aberto={modalExercicioAberto}
        onClose={() => setModalExercicioAberto(false)}
        onSelecionar={onSelecionarExercicioParaFicha}
      />
    </>
  );
}
