import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { User } from "./Home";

import TopBar from "../components/ui/TopBar";
import RankingCard from "../components/ranking/RankingCard";
import PesoAtualCardEditavel from "../components/ranking/PesoAtualCardEditavel";
import PercentualGCardEditavel from "../components/ranking/PercentualGCardEditavel";
import MetasCard from "../components/ranking/MetasCard";
import TodosMusculosCard from "../components/ranking/TodosMusculosCard";
import Top3MusculosCard from "../components/ranking/Top3MusculosCard";
import AlturaCardEditavel from "../components/ranking/AlturaCardEditavel";
import Footer from "../components/ui/Footer";

import { clearToken } from "../libs/auth";
import { api } from "../libs/api";

export default function Ranking() {
  const navigate = useNavigate();
  const [top3, setTop3] = useState<
  { musculo: string; ranking: string }[]>([]);
  
  const [grupos, setGrupos] = useState<
  Record<string, { 
    rankingGrupo: string; 
    musculos: { musculo: string; ranking: string }[]
  }>
>({});

  function handleLogout() {
    clearToken();
    navigate("/", { replace: true });
  }
  const [user, setUser] = useState<User | null>(null);

 useEffect(() => {
  api.auth.me().then(async (data) => {
    setUser(data);

    const t3 = await api.ranking.top3(data.email);
    setTop3(t3);

    const tg = await api.ranking.todos(data.email);
    setGrupos(tg.grupos);
  });
}, []);

  return (
    <div className="w-full min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="pt-10">
        <TopBar user={user} onLogout={handleLogout}/>
        <RankingCard user={user}></RankingCard>
        <div className="flex gap-x-4">
          <div className="flex-1">
            <PesoAtualCardEditavel />
          </div>
          <div className="flex-1">
            <PercentualGCardEditavel />
          </div>
          <div className="flex-1">
            <AlturaCardEditavel />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Top3MusculosCard top3={top3} />
          <MetasCard />
        </div>

        <div className="bg-white shadow rounded-lg p-5 flex justify-center items-center">
          <TodosMusculosCard grupos={grupos} />
        </div>
      </div>
       <Footer></Footer>
    </div>
  );
}