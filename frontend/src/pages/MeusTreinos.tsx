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





export type User = {
  pNome: string;
  email: string;
};

export default function CriarTreinosPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

   {/* TO DO: ALTERAR ISSO E INTEGRAR COM O BANCO*/}
  const [fichas, setFichas] = useState([
    { id: 1, nome: "Ficha Personalizada 1" },
    { id: 2, nome: "Ficha de Eduardo" },
    { id: 3, nome: "Ficha Compartilhada do Personal Pedro" },
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
      <div className="min-h-screen flex flex-col bg-gray-100 pt-20">
        
        {/* Top Bar fixa */}
        <div className="fixed top-0 left-0 w-full z-50">
          <TopBar user={user} onLogout={handleLogout} />
        </div>

        {/* Saudação */}
        <GreetingsCard user={user} />

        {/* Conteúdo principal */}
        <div className="p-4 flex flex-col gap-4">

          <CardMetaAtual />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        onCriar={() => console.log("Criar nova ficha")}
        />

        <Footer />
      </div>
    </PrivateRoute>
  );
}
