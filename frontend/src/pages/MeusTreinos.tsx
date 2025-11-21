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

export default function CriarTreinosPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);


  const [modalAberto, setModalAberto] = useState(false);

   {/* TO DO: ALTERAR ISSO E INTEGRAR COM O BANCO*/}
  const [fichas, setFichas] = useState([
    { id: 1, nome: "Ficha Personalizada 1" },
    { id: 2, nome: "Ficha de Eduardo" },
    { id: 3, nome: "Ficha Compartilhada do Personal Pedro" },
    { id: 4, nome: "Ficha 4" },
    { id: 5, nome: "Ficha 5" },
    { id: 6, nome: "Ficha 6" },
    ]);


  function handleLogout() {
    clearToken();
    navigate("/", { replace: true });
  }

  useEffect(() => {
    api.auth.me()
      .then((data) => setUser(data))
      .catch(() => {
        clearToken();
        navigate("/", { replace: true });
      });
  }, []);

  return (
    <PrivateRoute>
      <div className="pt-20">
        {/* Top Bar */}
        <TopBar user={user} onLogout={handleLogout} />

        {/* Boas-Vindas */}
        <GreetingsCard user={user} />

        {/* Meta Atual */}
        <CardMetaAtual />

        {/* Peso e Ranking */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-6">
            <CardPesoAtual />
            <CardRankingGeral />
          </div>
        </div>

        <ListaDeFichas
        fichas={fichas}
        onAbrir={(id) => console.log("Abrir ficha", id)}
        onExcluir={(id) => {
            setFichas(prev => prev.filter(f => f.id !== id));
        }}
        onCriar={() => setModalAberto(true)}
        />

        <ModalProgramaTreino
        aberto={modalAberto}
        onClose={() => setModalAberto(false)}
        />

        <Footer />
      </div>
    </PrivateRoute>
  );
}
