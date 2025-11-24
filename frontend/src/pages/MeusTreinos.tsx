// src/pages/MeusTreinos.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearToken } from "../libs/auth";
import { api } from "../libs/api";

import TopBar from "../components/ui/TopBar";
import CardMetaAtual from "../components/home/MetaAtualCard";
import CardPesoAtual from "../components/home/PesoAtualCard";
import CardRankingGeral from "../components/home/RankingGeralCard";
import GreetingsCard from "../components/home/GreetingsCard";
import Footer from "../components/ui/Footer";
import PrivateRoute from "../components/auth/PrivateRoute";
import ListaDeFichas from "../components/treinos/ListaDeFichas";
import ModalProgramaTreino from "../components/treinos/ModalProgramaTreino";

export type User = {
  pNome: string;
  email: string;
};

export default function MeusTreinos() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [fichas, setFichas] = useState<{ id: number; nome: string }[]>([]);

  const [rotinaSelecionada, setRotinaSelecionada] = useState<any | null>(null);

  function handleLogout() {
    clearToken();
    navigate("/", { replace: true });
  }

  useEffect(() => {
    api.auth
      .me()
      .then((data) => {
        setUser(data);
        return api.rotinas.listar();
      })
      .then((lista) => {
        setFichas(Array.isArray(lista) ? lista : []);
      })
      .catch(() => {
        clearToken();
        navigate("/", { replace: true });
      });
  }, []);

  async function handleAbrir(id: number) {
    const ficha = fichas.find((f) => f.id === id);
    if (!ficha) return;

    try {
      // ficha.nome é string garantido aqui
      const dados = await (api.rotinas as any).obter?.(ficha.nome);
      // se obter não existir ou retornar undefined, trate
      if (!dados) {
        console.warn("API não retornou dados da rotina para", ficha.nome);
        return;
      }
      setRotinaSelecionada(dados);
      setModalAberto(true);
    } catch (err) {
      console.error("Erro ao carregar rotina:", err);
    }
  }

  async function handleExcluir(id: number) {
    const rotina = fichas.find((f) => f.id === id);
    if (!rotina) return;

    try {
      await api.rotinas.excluir(rotina.nome);

      // Atualizar lista depois da exclusão
      const listaAtualizada = await api.rotinas.listar();
      setFichas(Array.isArray(listaAtualizada) ? listaAtualizada : []);
    } catch (err) {
      console.error("Erro ao excluir rotina:", err);
    }
  }

  function handleCriar() {
    setRotinaSelecionada(null);
    setModalAberto(true);
  }

  return (
    <PrivateRoute>
      <div className="pt-20">
        <TopBar user={user} onLogout={handleLogout} />
        <GreetingsCard user={user} />
        <CardMetaAtual />

        <div className="p-4">
          <div className="grid grid-cols-2 gap-6">
            <CardPesoAtual />
            <CardRankingGeral />
          </div>
        </div>

        <ListaDeFichas
          fichas={fichas}
          onAbrir={(id) => handleAbrir(id)}
          onExcluir={(id) => handleExcluir(id)}
          onCriar={() => handleCriar()}
        />

       <ModalProgramaTreino
          aberto={modalAberto}
          dados={rotinaSelecionada}
          onClose={() => setModalAberto(false)}
          onSalvar={async ({ nomePrograma, fichas: fichasDoPrograma }) => {
            try {
              const payload = {
                nome: nomePrograma,
                fichas: fichasDoPrograma
              };

              if (rotinaSelecionada) {
                // MODO EDIÇÃO
                await api.rotinas.editar(rotinaSelecionada.nome, payload);
              } else {
                // MODO CRIAÇÃO
                await api.rotinas.criar(payload);
              }

              // Atualiza lista 
              const listaAtualizada = await api.rotinas.listar();
              setFichas(Array.isArray(listaAtualizada) ? listaAtualizada : []);

              setModalAberto(false);
            } catch (err) {
              console.error("Erro ao salvar rotina:", err);
            }
          }}
        />

        <Footer />
      </div>
    </PrivateRoute>
  );
}