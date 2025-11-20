import { clearToken } from "../libs/auth";
import { useNavigate } from "react-router-dom";
import { api } from "../libs/api"
import { useEffect, useState } from "react";

import TopBar from "../components/ui/TopBar";
import CardMetaAtual from "../components/home/MetaAtualCard";
import CardPesoAtual from "../components/home/PesoAtualCard";
import CardRankingGeral from "../components/home/RankingGeralCard";
import FichasPersonalizadasCard from "../components/home/cardsPaginas/FichasPersonalizadasCard";
import MinhaEvolucaoCard from "../components/home/cardsPaginas/MinhaEvolucaoCard";
import MinhasFichasCard from "../components/home/cardsPaginas/MinhasFichasCard";
import RelatorioCard from "../components/home/cardsPaginas/RelatorioCard";

export type User = {
  pNome: string;
  email: string;
}

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  
  function handleLogout(){
    clearToken();
    navigate("/", { replace: true });
  }

  useEffect(() => {
    let active = true;

    api.auth.me()
      .then((data) => {
        if (active) setUser(data);
      })
      .catch(() => {
        handleLogout();
      });

    return () => {
      active = false;
    };
  }, []);


  return (
    <div>
      {/* Componente da topbar*/}
      <TopBar user={user} onLogout={handleLogout} />
      
      {/* Retangulo de Boas Vindas */}
      <div className="p-4">
        <div className="bg-white shadow-md rounded-xl p-6 flex items-center gap-6">
          <div className="text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
            </svg>
          </div>

          <div>
            <p className="text-lg font-semibold">
              Bem-vindo, {user?.pNome ?? "carregando..."}!
            </p>
            <p className="text-gray-600 text-sm">
              Acompanhe seu progresso e evolução
            </p>
          </div>

        </div>
      </div>

      {/* Retangulo de Meta atual */}
      {/* TO DO: quando passar esse componente entrar com valores do banco, seguindo o formato export do componente*/}
      <CardMetaAtual /> 

      <div className="p-4">
        <div className="grid grid-cols-2 gap-6">

          {/* CARD — Peso Atual */}
          {/* TO DO: quando passar esse componente entrar com valores do banco, seguindo o formato export do componente*/}
          <CardPesoAtual/>

          {/* CARD — Ranking Geral */}
          {/* TO DO: quando passar esse componente entrar com valores do banco, seguindo o formato export do componente*/}
          <CardRankingGeral/>
          
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">

        <MinhasFichasCard />
        <MinhaEvolucaoCard />
        <FichasPersonalizadasCard />
        <RelatorioCard />

      </div>


      
    </div>
  );
}
