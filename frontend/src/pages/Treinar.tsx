import { useEffect, useState } from "react";
import TopBar from "../components/ui/TopBar";
import Footer from "../components/ui/Footer";
import PrivateRoute from "../components/auth/PrivateRoute";
import { api } from "../libs/api";
import { clearToken } from "../libs/auth";

type RotinaItem = { id: number; nome: string };

export default function Treinar() {
  const [user, setUser] = useState<any | null>(null);

  const [rotinas, setRotinas] = useState<RotinaItem[]>([]);
  const [rotinaAtiva, setRotinaAtiva] = useState<RotinaItem | null>(null);

  const [treinos, setTreinos] = useState<any[]>([]);
  const [treinoAtivo, setTreinoAtivo] = useState<any | null>(null);

  const [exercicios, setExercicios] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);

  const [formSerie, setFormSerie] = useState({
    detalhe: "",
    repeticoes: 10,
    carga: 0,
    nome_exercicio: "",
  });

  const [serieEmEdicao, setSerieEmEdicao] = useState<any | null>(null);
  const [modalEditar, setModalEditar] = useState(false);
  const [notasTreino, setNotasTreino] = useState("");

  useEffect(() => {
    api.auth
      .me()
      .then((u) => setUser(u))
      .catch(() => {
        clearToken();
      });

    // carregar rotinas do usuário
    api.rotinas
      .listar()
      .then((r: any) => setRotinas(Array.isArray(r) ? r : []))
      .catch((e) => console.error("Erro ao buscar rotinas:", e));
  }, []);

  async function handleSelecionarRotina(rot: RotinaItem) {
    setRotinaAtiva(rot);
    // buscar treinos associados à rotina (backend espera email do criador + nome da rotina)
    try {
      // o backend relaciona rotinas a treinos por fkEmail_CriadorRotina — aqui assumimos que a rotina pertence ao usuário atual
      const emailCriador = user?.email ?? "";
      const data = await api.treinar.getTreinosDaRotina(emailCriador, rot.nome);
      setTreinos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar treinos da rotina:", err);
      setTreinos([]);
    }
  }

  async function handleSelecionarTreino(t: any) {
    setTreinoAtivo(t);
    // carregar exercicios do treino
    try {
      const data = await api.treinar.getExercicios(t.email_criador_treino ?? t.email_criador_treino, t.nome_treino ?? t.nome_treino);
      setExercicios(Array.isArray(data) ? data : []);

      // iniciar treino (se quiser) - opcional: chamar iniciar quando usuário clicar
      const emailCriador = t.email_criador_treino ?? t.email_criador_treino;
      await api.treinar.iniciar({ nome_treino: t.nome_treino ?? t.nome, email_criador_treino: emailCriador });

      // carregar series do dia
      const s = await api.treinar.getSeries(emailCriador, t.nome_treino ?? t.nome);
      setSeries(Array.isArray(s) ? s : []);
    } catch (err) {
      console.error("Erro ao carregar treino/exercicios:", err);
    }
  }

  async function handleAdicionarSerie() {
    if (!treinoAtivo || !formSerie.nome_exercicio) return;
    try {
      // calcular numero da serie (próximo número para este exercício)
      const seriesDoExercicio = series.filter((s) => s.fk_nomeExercicio === formSerie.nome_exercicio);
      const proximoNumero = seriesDoExercicio.length + 1;

      const payload = {
        numero: proximoNumero,
        detalhe: formSerie.detalhe || null,
        repeticoes: formSerie.repeticoes,
        carga: formSerie.carga,
        nome_exercicio: formSerie.nome_exercicio,
        nome_treino: treinoAtivo.nome_treino ?? treinoAtivo.nome,
        email_criador_treino: treinoAtivo.email_criador_treino ?? treinoAtivo.email_criador_treino,
      };

      await api.treinar.inserirSerie(payload);
      // atualizar lista
      const emailCriador = payload.email_criador_treino;
      const s = await api.treinar.getSeries(emailCriador, payload.nome_treino);
      setSeries(Array.isArray(s) ? s : []);

      // limpar formulário
      setFormSerie({
        detalhe: "",
        repeticoes: 10,
        carga: 0,
        nome_exercicio: "",
      });
    } catch (err) {
      console.error("Erro ao inserir série:", err);
      alert("Erro ao inserir série. Verifique os dados.");
    }
  }

  async function handleEditarSerie(serie: any) {
    setSerieEmEdicao({
      ...serie,
      repeticoes: serie.repeticoes,
      carga: serie.carga,
      detalhe: serie.detalhe || "",
    });
    setModalEditar(true);
  }

  async function handleSalvarEdicao() {
    if (!treinoAtivo || !serieEmEdicao) return;
    try {
      const payload = {
        numero: serieEmEdicao.numero,
        detalhe: serieEmEdicao.detalhe || null,
        repeticoes: serieEmEdicao.repeticoes,
        carga: serieEmEdicao.carga,
        nome_exercicio: serieEmEdicao.fk_nomeExercicio,
        nome_treino: treinoAtivo.nome_treino ?? treinoAtivo.nome,
        email_criador_treino: treinoAtivo.email_criador_treino ?? treinoAtivo.email_criador_treino,
      };

      await api.treinar.atualizarSerie(payload);
      // atualizar lista
      const emailCriador = payload.email_criador_treino;
      const s = await api.treinar.getSeries(emailCriador, payload.nome_treino);
      setSeries(Array.isArray(s) ? s : []);
      setModalEditar(false);
      setSerieEmEdicao(null);
    } catch (err) {
      console.error("Erro ao atualizar série:", err);
      alert("Erro ao atualizar série.");
    }
  }

  async function handleDeletarSerie(serie: any) {
    if (!confirm(`Tem certeza que deseja deletar a série ${serie.numero}?`)) return;
    if (!treinoAtivo) return;
    try {
      const payload = {
        numero: serie.numero,
        nome_exercicio: serie.fk_nomeExercicio,
        nome_treino: treinoAtivo.nome_treino ?? treinoAtivo.nome,
        email_criador_treino: treinoAtivo.email_criador_treino ?? treinoAtivo.email_criador_treino,
      };

      await api.treinar.deletarSerie(payload);
      // atualizar lista
      const emailCriador = payload.email_criador_treino;
      const s = await api.treinar.getSeries(emailCriador, payload.nome_treino);
      setSeries(Array.isArray(s) ? s : []);
    } catch (err) {
      console.error("Erro ao deletar série:", err);
      alert("Erro ao deletar série.");
    }
  }

  return (
    <PrivateRoute>
      <div className="flex flex-col min-h-screen">
        <TopBar user={user} onLogout={() => { clearToken(); window.location.href = "/"; }} />

        <div className="flex-grow overflow-y-auto p-4 pt-20 pb-32">
          <h2 className="text-2xl font-semibold mb-4">Treinar</h2>
          <div className="grid grid-cols-3 gap-6">
              <div className="col-span-1 bg-white rounded shadow p-4">
                <h3 className="font-semibold mb-2">Rotinas</h3>
                <div className="space-y-2 max-h-96 overflow-auto">
                  {rotinas.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleSelecionarRotina(r)}
                      className={`w-full text-left p-2 rounded ${rotinaAtiva?.id === r.id ? "bg-sky-100" : "hover:bg-gray-100"}`}
                    >
                      {r.nome}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-span-1 bg-white rounded shadow p-4">
                <h3 className="font-semibold mb-2">Treinos</h3>
                <div className="space-y-2 max-h-96 overflow-auto">
                  {treinos.length === 0 && <div className="text-sm text-gray-500">Selecione uma rotina</div>}
                  {treinos.map((t: any, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{t.nome_treino ?? t.nome}</div>
                        <div className="text-xs text-gray-500">Criador: {t.email_criador_treino ?? t.email_criador_treino}</div>
                      </div>
                      <div>
                        <button
                          onClick={() => handleSelecionarTreino(t)}
                          className="px-3 py-1 bg-sky-500 text-white rounded"
                        >
                          Abrir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-1 bg-white rounded shadow p-4">
                <h3 className="font-semibold mb-2">Exercícios & Séries</h3>

                {!treinoAtivo && <div className="text-sm text-gray-500">Abra um treino para ver exercícios</div>}

                {treinoAtivo && (
                  <div>
                    <div className="mb-3">
                      <div className="font-medium">Treino: {treinoAtivo.nome_treino ?? treinoAtivo.nome}</div>
                    </div>

                    {/* Indicador de Progresso */}
                    <div className="mb-4 p-3 bg-sky-50 rounded border border-sky-200">
                      <div className="text-sm font-semibold mb-2">Progresso</div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">
                          {series.length} / {exercicios.reduce((acc, ex) => acc + (ex.series_plano || 0), 0)} séries
                        </span>
                        <span className="text-xs bg-sky-500 text-white px-2 py-1 rounded">
                          {Math.round((series.length / Math.max(exercicios.reduce((acc, ex) => acc + (ex.series_plano || 0), 0), 1)) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded h-2">
                        <div
                          className="bg-sky-500 h-2 rounded transition-all"
                          style={{
                            width: `${Math.round((series.length / Math.max(exercicios.reduce((acc, ex) => acc + (ex.series_plano || 0), 0), 1)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-sm font-semibold mb-2">Exercícios & Séries</div>
                      <div className="space-y-3 max-h-64 overflow-auto text-sm">
                        {exercicios.map((ex, i) => {
                          const seriesDoExercicio = series.filter((s) => s.fk_nomeExercicio === ex.nome_exercicio);
                          const seriesExtras = Math.max(0, seriesDoExercicio.length - (ex.series_plano || 0));
                          return (
                            <div key={i} className="p-2 border rounded bg-gray-50">
                              <div className="flex justify-between items-start mb-1">
                                <div className="font-medium">{ex.nome_exercicio}</div>
                                <div className="text-xs">
                                  {seriesDoExercicio.length >= (ex.series_plano || 0) ? (
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
                                      ✓ {seriesDoExercicio.length}/{ex.series_plano}
                                      {seriesExtras > 0 && ` +${seriesExtras}🔥`}
                                    </span>
                                  ) : (
                                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                      {seriesDoExercicio.length}/{ex.series_plano}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs text-gray-600 mb-2">
                                {ex.descricao && `📋 ${ex.descricao}`}
                              </div>
                              <div className="space-y-1">
                                {Array.from({ length: Math.max(ex.series_plano, seriesDoExercicio.length) }).map((_, sIdx) => {
                                  const serie = seriesDoExercicio[sIdx];
                                  const isExtra = sIdx >= (ex.series_plano || 0);
                                  return (
                                    <div
                                      key={sIdx}
                                      className={`flex justify-between items-center p-1 rounded text-xs ${
                                        isExtra ? "bg-orange-50 border border-orange-200" : "bg-white"
                                      }`}
                                    >
                                      <span className="font-medium">
                                        {serie ? (
                                          <>
                                            ✓ Série {sIdx + 1}
                                            {isExtra && " 🔥 (Extra)"}
                                          </>
                                        ) : (
                                          `○ Série ${sIdx + 1}`
                                        )}
                                      </span>
                                      <span className="text-gray-600">
                                        {serie ? `${serie.repeticoes} reps • ${serie.carga}kg` : "—"}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-sm font-semibold">Adicionar Série</div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <input className="p-2 border rounded" placeholder="Repetições" type="number" value={formSerie.repeticoes} onChange={(e) => setFormSerie({ ...formSerie, repeticoes: Number(e.target.value) })} />
                        <input className="p-2 border rounded" placeholder="Carga (kg)" type="number" step="0.5" value={formSerie.carga} onChange={(e) => setFormSerie({ ...formSerie, carga: Number(e.target.value) })} />
                        <select className="col-span-2 p-2 border rounded" value={formSerie.nome_exercicio} onChange={(e) => setFormSerie({ ...formSerie, nome_exercicio: e.target.value })}>
                          <option value="">-- Escolher exercício --</option>
                          {exercicios.map((ex, i) => (
                            <option key={i} value={ex.nome_exercicio ?? ex.nome}>{ex.nome_exercicio ?? ex.nome}</option>
                          ))}
                        </select>
                        <input className="col-span-2 p-2 border rounded" placeholder="Detalhe (opcional)" value={formSerie.detalhe} onChange={(e) => setFormSerie({ ...formSerie, detalhe: e.target.value })} />
                      </div>
                      <div className="mt-2">
                        <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={handleAdicionarSerie}>Adicionar Série</button>
                      </div>
                    </div>

                    {/* Notas do Treino */}
                    <div className="mb-3">
                      <label className="text-sm font-semibold mb-1 block">Notas do Treino</label>
                      <textarea
                        className="w-full p-2 border rounded text-xs"
                        placeholder="Como foi? Ex: Ótimo, muita bomba... Braços cansados..."
                        rows={2}
                        value={notasTreino}
                        onChange={(e) => setNotasTreino(e.target.value)}
                      />
                    </div>

                    <div>
                      <div className="text-sm font-semibold mb-2">Séries do Dia</div>
                      <div className="space-y-2 max-h-32 overflow-auto text-sm">
                        {series.length === 0 && <div className="text-gray-500">Nenhuma série registrada hoje.</div>}
                        {series.map((s, i) => (
                          <div key={i} className="p-2 border rounded flex justify-between items-center">
                            <div>
                              <div className="font-medium">{s.numero} — {s.fk_nomeExercicio ?? s.fk_nomeExercicio}</div>
                              <div className="text-xs text-gray-600">{s.repeticoes} reps • {s.carga} kg</div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditarSerie(s)}
                                className="px-2 py-1 bg-blue-400 text-white rounded text-xs"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeletarSerie(s)}
                                className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                              >
                                Deletar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        {/* Modal de Edição */}
        {modalEditar && serieEmEdicao && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4">Editar Série {serieEmEdicao.numero}</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Repetições</label>
                  <input
                    className="w-full p-2 border rounded"
                    type="number"
                    value={serieEmEdicao.repeticoes}
                    onChange={(e) => setSerieEmEdicao({ ...serieEmEdicao, repeticoes: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Carga (kg)</label>
                  <input
                    className="w-full p-2 border rounded"
                    type="number"
                    value={serieEmEdicao.carga}
                    onChange={(e) => setSerieEmEdicao({ ...serieEmEdicao, carga: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Detalhe</label>
                  <input
                    className="w-full p-2 border rounded"
                    type="text"
                    value={serieEmEdicao.detalhe}
                    onChange={(e) => setSerieEmEdicao({ ...serieEmEdicao, detalhe: e.target.value })}
                    placeholder="Observações da série"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSalvarEdicao}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded"
                >
                  Salvar
                </button>
                <button
                  onClick={() => { setModalEditar(false); setSerieEmEdicao(null); }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-black rounded"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </PrivateRoute>
  );
}
