// src/pages/MeusTreinos.tsx (ou CriarTreinosPage.tsx dependendo do seu nome)
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

  function handleLogout() {
    clearToken();
    navigate("/", { replace: true });
  }

  useEffect(() => {
    api.auth.me()
      .then((data) => {
        setUser(data);
        // buscar fichas (rotinas) do usuário
        return api.rotinas.listar();
      })
      .then((lista) => {
        // espera que lista seja array de { id, nome } ou adapte
        setFichas(Array.isArray(lista) ? lista : []);
      })
      .catch(() => {
        clearToken();
        navigate("/", { replace: true });
      });
  }, []);

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
          onAbrir={(id) => console.log("Abrir ficha", id)}
          onExcluir={(id) => setFichas(prev => prev.filter(f => f.id !== id))}
          onCriar={() => setModalAberto(true)}
        />

        <ModalProgramaTreino
          aberto={modalAberto}
          onClose={() => setModalAberto(false)}
          onSalvar={({ nomePrograma, fichas: fichasDoPrograma }) => {
            // Exemplo de integração: adaptar payload ao seu endpoint
            api.rotinas.criar?.({ nome: nomePrograma, fichas: fichasDoPrograma })
              .then(() => {
                // atualizar lista local (recarregar)
                return api.rotinas.listar();
              })
              .then((lista) => setFichas(Array.isArray(lista) ? lista : []))
              .catch(err => console.error("Erro ao salvar rotina", err));
          }}
        />

        <Footer />
      </div>
    </PrivateRoute>
  );
}
