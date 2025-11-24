// src/components/treinos/ModalProgramaTreino.tsx
import React, { useEffect, useState } from "react";
import { FaTimes, FaEdit, FaChevronDown, FaChevronUp, FaTrash } from "react-icons/fa";
import ModalSelecionarExercicios from "./ModalSelecionarExercicios";
import type { ExercicioSelecionavel } from "./ModalSelecionarExercicios";

type SerieData = {
  carga: string;
  repeticoes: string;
  detalhe: string;
};

type Exercicio = {
  nome: string;
  musculos: string[];
  grupoMuscular: string;
  // o campo que o usuário vai digitar inicialmente (número de séries)
  series: string; // usamos string pra manter compatibilidade com inputs
  descricao: string;
  // controles internos
  seriesExpanded?: boolean;
  seriesData: SerieData[];
};

type Ficha = {
  id: number;
  nome: string;
  exercicios: Exercicio[];
  editando?: boolean;
};

export type ModalProgramaTreinoProps = {
  aberto: boolean;
  onClose: () => void;
  dados: any | null;
  onSalvar?: (payload: { nomePrograma: string; fichas: Ficha[] }) => void;
};

export default function ModalProgramaTreino({ aberto, dados, onClose, onSalvar }: ModalProgramaTreinoProps) {
  const [nomePrograma, setNomePrograma] = useState("Novo Programa De Treino");
  const [editandoNome, setEditandoNome] = useState(false);

  const [fichas, setFichas] = useState<Ficha[]>([
    { id: 1, nome: "Ficha A", exercicios: [], editando: false },
  ]);

  const [abertaId, setAbertaId] = useState<number | null>(null);

  // mini modal
  const [modalExercicioAberto, setModalExercicioAberto] = useState(false);
  const [fichaSelecionadaId, setFichaSelecionadaId] = useState<number | null>(null);

  // animação visibilidade
  const [visivel, setVisivel] = useState(false);
  const [animandoSaida, setAnimandoSaida] = useState(false);

  const modoEdicao = !!dados;

  useEffect(() => {
    if (aberto) {
      setVisivel(true);
      setAnimandoSaida(false);

      if (!dados) {
        // modo "criar novo"
        setNomePrograma("Novo Programa De Treino");
        setFichas([{ id: 1, nome: "Ficha A", exercicios: [], editando: false }]);
        setAbertaId(null);
        setFichaSelecionadaId(null);
        setModalExercicioAberto(false);
        return;
      }

      // modo "editar" — converter estrutura
      setNomePrograma(dados.nome ?? "Programa sem nome");

      const fichasConvertidas = (dados.fichas ?? []).map((f: any, index: number) => ({
        id: f.id ?? Date.now() + index,
        nome: f.nome,
        editando: false,
        exercicios: (f.exercicios ?? []).map((ex: any) => ({
          nome: ex.nome,
          musculos: ex.musculos ?? [],
          grupoMuscular: ex.grupoMuscular ?? "",
          series: ex.series ?? "",
          descricao: ex.descricao ?? "",
          seriesExpanded: false,
          seriesData: (ex.seriesData ?? []).map((s: any) => ({
            carga: s.carga ?? "",
            repeticoes: s.repeticoes ?? "",
            detalhe: s.detalhe ?? "",
          })),
        })),
      }));

      setFichas(fichasConvertidas);
      setAbertaId(null);
      setFichaSelecionadaId(null);
      setModalExercicioAberto(false);
    }
  }, [aberto, dados]);

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
    setFichas((prev) => [
      ...prev,
      { id: Date.now(), nome: `Ficha ${letra}`, exercicios: [], editando: false },
    ]);
  }

  function toggleFicha(id: number) {
    setAbertaId((prev) => (prev === id ? null : id));
  }

  function editarNomeFicha(id: number, novoNome: string) {
    setFichas((prev) => prev.map((f) => (f.id === id ? { ...f, nome: novoNome } : f)));
  }

  function alternarEdicaoNome(id: number) {
    setFichas((prev) => prev.map((f) => (f.id === id ? { ...f, editando: !f.editando } : f)));
  }

  function abrirSelecionarExerciciosParaFicha(id: number) {
    setFichaSelecionadaId(id);
    setModalExercicioAberto(true);
  }

  // quando o modal de seleção chama onSelecionar, adicionamos o exercício com campos padrão
  function onSelecionarExercicioParaFicha(ex: ExercicioSelecionavel) {
    if (fichaSelecionadaId == null) return;
    const exComCampos: Exercicio = {
      nome: ex.nome,
      musculos: ex.musculos ?? [],
      grupoMuscular: ex.grupoMuscular ?? "",
      series: ex.series ?? "", // inicialmente vazio: usuário digita o número
      descricao: ex.descricao ?? "",
      seriesExpanded: false,
      seriesData: [], // será populado quando usuário digitar número
    };
    setFichas((prev) =>
      prev.map((f) => (f.id === fichaSelecionadaId ? { ...f, exercicios: [...f.exercicios, exComCampos] } : f))
    );
    setModalExercicioAberto(false);
    setAbertaId(fichaSelecionadaId);
  }

  function atualizarCampoExercicio(fichaId: number, index: number, campo: keyof Exercicio, valor: string) {
    setFichas((prev) =>
      prev.map((f) =>
        f.id === fichaId
          ? {
              ...f,
              exercicios: f.exercicios.map((ex, i) => (i === index ? { ...ex, [campo]: valor } : ex)),
            }
          : f
      )
    );
  }

  // atualiza número de séries e cria/ajusta seriesData
  function atualizarNumeroSeries(fichaId: number, index: number, valor: string) {
    const n = Math.max(0, Math.floor(Number(valor) || 0));
    setFichas((prev) =>
      prev.map((f) => {
        if (f.id !== fichaId) return f;
        return {
          ...f,
          exercicios: f.exercicios.map((ex, i) => {
            if (i !== index) return ex;
            const old = ex.seriesData ?? [];
            const novo: SerieData[] = [];
            for (let k = 0; k < n; k++) {
              novo.push(old[k] ?? { carga: "", repeticoes: "", detalhe: "" });
            }
            return {
              ...ex,
              series: String(n),
              seriesData: novo,
            };
          }),
        };
      })
    );
  }

  function atualizarSerieCampo(fichaId: number, exIndex: number, serieIndex: number, campo: keyof SerieData, valor: string) {
    setFichas((prev) =>
      prev.map((f) => {
        if (f.id !== fichaId) return f;
        return {
          ...f,
          exercicios: f.exercicios.map((ex, i) => {
            if (i !== exIndex) return ex;
            const newSeries = ex.seriesData.map((s, j) => (j === serieIndex ? { ...s, [campo]: valor } : s));
            return { ...ex, seriesData: newSeries };
          }),
        };
      })
    );
  }

  function removerExercicioDaFicha(fichaId: number, index: number) {
    setFichas((prev) =>
      prev.map((f) =>
        f.id === fichaId ? { ...f, exercicios: f.exercicios.filter((_, i) => i !== index) } : f
      )
    );
  }

  function toggleExpandSeries(fichaId: number, index: number) {
    setFichas((prev) =>
      prev.map((f) =>
        f.id === fichaId
          ? {
              ...f,
              exercicios: f.exercicios.map((ex, i) => (i === index ? { ...ex, seriesExpanded: !ex.seriesExpanded } : ex)),
            }
          : f
      )
    );
  }

  function handleSalvar() {
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
                <input
                  className="border p-1 rounded"
                  value={nomePrograma}
                  onChange={(e) => setNomePrograma(e.target.value)}
                />
              ) : (
                <h2 className="text-2xl font-bold">
                  {modoEdicao ? nomePrograma : "Criar Nova Rotina"}
                </h2>
              )}
              <button className="text-gray-600 hover:text-black" onClick={() => setEditandoNome((p) => !p)}>
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
            {fichas.map((f) => (
              <div key={f.id} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFicha(f.id)}
                  className="w-full flex justify-between items-center p-3 bg-gray-100 hover:bg-gray-200"
                >
                  <div className="flex items-center gap-3">
                    {f.editando ? (
                      <input
                        className="border px-2 py-1 rounded"
                        value={f.nome}
                        onChange={(e) => editarNomeFicha(f.id, e.target.value)}
                      />
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
                          <th className="border p-2">Descrição</th>
                          <th className="border p-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {f.exercicios.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="border p-2 text-sm text-gray-500">
                              Nenhum exercício adicionado ainda
                            </td>
                          </tr>
                        ) : (
                          f.exercicios.map((ex, idx) => (
                            <React.Fragment key={`${ex.nome}-${idx}`}>
                              <tr>
                                <td className="border p-2 text-left">{ex.nome}</td>

                                <td className="border p-2">
                                  <input
                                    type="number"
                                    min={0}
                                    className="border rounded p-1 w-20 text-center"
                                    value={ex.series}
                                    onChange={(e) => atualizarNumeroSeries(f.id, idx, e.target.value)}
                                  />
                                </td>

                                <td className="border p-2">
                                  <input
                                    className="border rounded p-1 w-full"
                                    value={ex.descricao}
                                    onChange={(e) => atualizarCampoExercicio(f.id, idx, "descricao", e.target.value)}
                                  />
                                </td>

                                <td className="border p-2">
                                  <div className="flex justify-center gap-2">
                                    <button
                                      className="text-gray-600 hover:text-black"
                                      onClick={() => toggleExpandSeries(f.id, idx)}
                                      title="Mostrar/ocultar séries"
                                    >
                                      {ex.seriesExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                    </button>

                                    <button
                                      className="text-red-600 hover:text-red-800"
                                      onClick={() => removerExercicioDaFicha(f.id, idx)}
                                      title="Remover exercício"
                                    >
                                      <FaTrash />
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {/* linha das séries — aparece quando expandido */}
                              {ex.seriesExpanded && (
                                <tr>
                                  <td colSpan={4} className="border p-2 bg-gray-50">
                                    <div className="ml-8 space-y-2">
                                      {ex.seriesData.length === 0 ? (
                                        <p className="text-sm text-gray-600">Nenhuma série configurada (digite o número de séries).</p>
                                      ) : (
                                        ex.seriesData.map((s, si) => (
                                          <div key={si} className="flex gap-2 items-center">
                                            <div className="w-28 font-medium">Série {si + 1}</div>

                                            <input
                                              placeholder="Carga"
                                              className="border rounded p-1 w-28"
                                              value={s.carga}
                                              onChange={(e) => atualizarSerieCampo(f.id, idx, si, "carga", e.target.value)}
                                            />

                                            <input
                                              placeholder="Repetições"
                                              className="border rounded p-1 w-28"
                                              value={s.repeticoes}
                                              onChange={(e) => atualizarSerieCampo(f.id, idx, si, "repeticoes", e.target.value)}
                                            />

                                            <input
                                              placeholder="Detalhe"
                                              className="border rounded p-1 flex-1"
                                              value={s.detalhe}
                                              onChange={(e) => atualizarSerieCampo(f.id, idx, si, "detalhe", e.target.value)}
                                            />
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
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
            <button
              onClick={handleSalvar}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              {modoEdicao ? "Salvar Alterações" : "Criar Programa"}
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
