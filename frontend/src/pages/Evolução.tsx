import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearToken } from "../libs/auth";
import { api } from "../libs/api";
import type { User } from "./Home";

import PrivateRoute from "../components/auth/PrivateRoute";
import TopBar from "../components/ui/TopBar";
import Footer from "../components/ui/Footer";
import Calendario from "../components/evolucao/Calendario";
import Graficos from "../components/evolucao/Grafico";
import ModalVisualizacaoTreino from "../components/evolucao/ModalVisualizacaoTreino";

export default function Evolução() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  // Estado de abas
  const [abaAtiva, setAbaAtiva] = useState<"calendario" | "grafico">("calendario");

  // Estado do calendário
  const [mês, setMês] = useState(new Date().getMonth());
  const [ano, setAno] = useState(new Date().getFullYear());

  // Estado dos gráficos
  const [tipoGrafico, setTipoGrafico] = useState<"peso" | "gordura">("peso");

  // Dados dos treinos
  const [treinosComData, setTreinosComData] = useState<any[]>([]);
  const [loadingTreinos, setLoadingTreinos] = useState(false);

  // Dados de evolução
  const [dadosPeso, setDadosPeso] = useState<{ peso: number; dataPesagem: string }[]>([]);
  const [dadosGordura, setDadosGordura] = useState<
    { percentual_gordura: number; dataPesagem: string }[]
  >([]);
  const [loadingEvolucao, setLoadingEvolucao] = useState(false);

  // Modal de visualização de treino
  const [modalAberto, setModalAberto] = useState(false);
  const [treinoSelecionado, setTreinoSelecionado] = useState<any | null>(null);

  function handleLogout() {
    clearToken();
    navigate("/", { replace: true });
  }

  // Carregar dados do usuário e treinos ao montar
  useEffect(() => {
    api.auth
      .me()
      .then((data) => setUser(data))
      .catch(() => {
        clearToken();
        navigate("/", { replace: true });
      });

    carregarTreinos();
    carregarDadosEvolucao();
  }, []);

  async function carregarTreinos() {
    setLoadingTreinos(true);
    try {
      const resposta = await (api.evolucao as any).treinoCompletoData();
      setTreinosComData(resposta || []);
    } catch (err) {
      console.error("Erro ao carregar treinos:", err);
      setTreinosComData([]);
    } finally {
      setLoadingTreinos(false);
    }
  }

  async function carregarDadosEvolucao() {
    setLoadingEvolucao(true);
    try {
      const [resPeso, resGordura] = await Promise.all([
        (api.evolucao as any).pesoCorporal(),
        (api.evolucao as any).percentualGordura(),
      ]);

      const pesosProcessados = resPeso?.pesagens || [];
      const gorduraBrasProcessados = resGordura?.gordura || [];

      setDadosPeso(pesosProcessados);
      setDadosGordura(gorduraBrasProcessados);
    } catch (err) {
      console.error("Erro ao carregar dados de evolução:", err);
      setDadosPeso([]);
      setDadosGordura([]);
    } finally {
      setLoadingEvolucao(false);
    }
  }

  // Obter datas com treino no formato YYYY-MM-DD
  const datasComTreino = treinosComData
    .filter((t) => t.dataDoTreino && t.dataDoTreino !== "9999-12-31")
    .map((t) => t.dataDoTreino);

  function handleDiaClicado(data: string) {
    const treino = treinosComData.find((t) => t.dataDoTreino === data);
    if (treino) {
      setTreinoSelecionado(treino);
      setModalAberto(true);
    }
  }

  function handleMesAnterior() {
    if (mês === 0) {
      setMês(11);
      setAno(ano - 1);
    } else {
      setMês(mês - 1);
    }
  }

  function handleProximoMes() {
    if (mês === 11) {
      setMês(0);
      setAno(ano + 1);
    } else {
      setMês(mês + 1);
    }
  }

  return (
    <PrivateRoute>
      <div className="pt-20 pb-10 bg-gray-50 min-h-screen">
        {/* Top Bar */}
        <TopBar user={user} onLogout={handleLogout} />

        {/* Container principal */}
        <div className="px-4 py-6 max-w-7xl mx-auto">
          {/* Botões de abas */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setAbaAtiva("calendario")}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                abaAtiva === "calendario"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              📅 Calendário
            </button>
            <button
              onClick={() => setAbaAtiva("grafico")}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                abaAtiva === "grafico"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              📈 Gráfico
            </button>
          </div>

          {/* Conteúdo da aba ativa */}
          <div className="bg-white rounded-lg shadow-lg overflow-visible" style={{ minHeight: "650px" }}>
            {abaAtiva === "calendario" ? (
              <div className="p-6 h-full" style={{ minHeight: "650px" }}>
                {loadingTreinos ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Carregando calendário...</p>
                  </div>
                ) : (
                  <Calendario
                    mês={mês}
                    ano={ano}
                    datasComTreino={datasComTreino}
                    onMesAnterior={handleMesAnterior}
                    onProximoMes={handleProximoMes}
                    onDiaClicado={handleDiaClicado}
                  />
                )}
              </div>
            ) : (
              <div className="p-6" style={{ minHeight: "650px" }}>
                {loadingEvolucao ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Carregando gráficos...</p>
                  </div>
                ) : (
                  <Graficos
                    tipoGrafico={tipoGrafico}
                    onMudarTipo={setTipoGrafico}
                    dadosPeso={dadosPeso}
                    dadosGordura={dadosGordura}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal de visualização de treino */}
        {treinoSelecionado && (
          <ModalVisualizacaoTreino
            aberto={modalAberto}
            onClose={() => {
              setModalAberto(false);
              setTreinoSelecionado(null);
            }}
            nomeTreino={treinoSelecionado.nomeTreino}
            nomeRotina={treinoSelecionado.nomeRotina}
            dataDoTreino={treinoSelecionado.dataDoTreino}
            exercicios={treinoSelecionado.exercicios || []}
          />
        )}

        <Footer />
      </div>
    </PrivateRoute>
  );
}
            