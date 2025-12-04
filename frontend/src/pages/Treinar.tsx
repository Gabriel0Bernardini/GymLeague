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
    numero: 1,
    detalhe: "",
    repeticoes: 10,
    carga: 0,
    nome_exercicio: "",
  });

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
    if (!treinoAtivo) return;
    try {
      const payload = {
        numero: formSerie.numero,
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
    } catch (err) {
      console.error("Erro ao inserir série:", err);
    }
  }

  return (
    <PrivateRoute>
      <div className="pt-20">
        <TopBar user={user} onLogout={() => { clearToken(); window.location.href = "/"; }} />

        <div className="p-4">
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

                  <div className="mb-3">
                    <div className="text-sm font-semibold">Exercícios</div>
                    <ul className="list-disc pl-5 text-sm">
                      {exercicios.map((ex, i) => (
                        <li key={i}>{ex.nome_exercicio ?? ex.nome}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-3">
                    <div className="text-sm font-semibold">Adicionar Série</div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <input className="p-2 border rounded" placeholder="Número" type="number" value={formSerie.numero} onChange={(e) => setFormSerie({ ...formSerie, numero: Number(e.target.value) })} />
                      <input className="p-2 border rounded" placeholder="Repetições" type="number" value={formSerie.repeticoes} onChange={(e) => setFormSerie({ ...formSerie, repeticoes: Number(e.target.value) })} />
                      <input className="p-2 border rounded" placeholder="Carga" type="number" value={formSerie.carga} onChange={(e) => setFormSerie({ ...formSerie, carga: Number(e.target.value) })} />
                      <select className="p-2 border rounded" value={formSerie.nome_exercicio} onChange={(e) => setFormSerie({ ...formSerie, nome_exercicio: e.target.value })}>
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

                  <div>
                    <div className="text-sm font-semibold mb-2">Séries do Dia</div>
                    <div className="space-y-2 max-h-48 overflow-auto text-sm">
                      {series.length === 0 && <div className="text-gray-500">Nenhuma série registrada hoje.</div>}
                      {series.map((s, i) => (
                        <div key={i} className="p-2 border rounded flex justify-between items-center">
                          <div>
                            <div className="font-medium">{s.numero} — {s.fk_nomeExercicio ?? s.fk_nomeExercicio}</div>
                            <div className="text-xs text-gray-600">{s.repeticoes} reps • {s.carga} kg</div>
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

        <Footer />
      </div>
    </PrivateRoute>
  );
}
