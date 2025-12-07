import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import TopBar from "../components/ui/TopBar";
import CardMetaAtual from "../components/home/MetaAtualCard";
import CardPesoAtual from "../components/home/PesoAtualCard";
import CardRankingGeral from "../components/home/RankingGeralCard";
import FichasPersonalizadasCard from "../components/home/cardsPaginas/FichasPersonalizadasCard";
import MinhasFichasCard from "../components/home/cardsPaginas/MinhasFichasCard";
import Footer from "../components/ui/Footer";
import GreetingsCard from "../components/home/GreetingsCard";

import { clearToken } from "../libs/auth";
import { api } from "../libs/api";
import PrivateRoute from "../components/auth/PrivateRoute";

export type User = {
  pNome: string;
  email: string;
}

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  function handleLogout() {
    clearToken();
    navigate("/", { replace: true });
  }

  useEffect(() => {
    api.auth.me().then((data) => setUser(data));
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

        <div className="grid md:grid-cols-2 gap-4 p-4">
          <MinhasFichasCard />
          <FichasPersonalizadasCard />
        </div>

        <Footer />
      </div>
    </PrivateRoute>
  );
}
