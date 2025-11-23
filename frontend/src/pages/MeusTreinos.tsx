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

  // rotina completa (modo edição) - use "any" pra evitar conflito de tipos do backend
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
    const ficha = fichas.find((f) => f.id === id);
    if (!ficha) return;

    // precisa existir rotinaSelecionada com nome (modo edição) — se não houver, não sabemos qual rotina alterar
    const nomeRotina = rotinaSelecionada?.nome;
    if (!nomeRotina) {
      console.warn("Tentando excluir ficha mas nenhuma rotina está selecionada (nomeRotina ausente).");
      return;
    }

    try {
      // cast to any porque sua tipagem do api pode não ter excluirFicha ainda
      await (api.rotinas as any).excluirFicha?.(nomeRotina, ficha.nome);
      // atualizar lista local
      setFichas((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Erro ao excluir ficha:", err);
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
              await api.rotinas.criar?.({ nome: nomePrograma, fichas: fichasDoPrograma });

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
