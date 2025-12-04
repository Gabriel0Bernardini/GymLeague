import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { User } from "./Home";

import TopBar from "../components/ui/TopBar";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Footer from "../components/ui/Footer";
import GreetingsCard from "../components/home/GreetingsCard";

import { clearToken } from "../libs/auth";
import { api } from "../libs/api";
import PrivateRoute from "../components/auth/PrivateRoute";
import type { FeedbackState } from "./Cadastro";

export default function Ranking() {
  const navigate = useNavigate();
  
  function handleLogout() {
    clearToken();
    navigate("/", { replace: true });
  }
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    api.auth.me().then((data) => setUser(data));
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="pt-10">
        <TopBar user={user} onLogout={handleLogout}/>
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
                <p className="font-semibold">
                    Ranking Atual:
                    <span className="font-bold text-xl"> Prata II</span>
                </p>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-5">
            <h2 className="text-xl font-bold mb-3">Top Ranking Muscles</h2>

            <ul className="space-y-3">
              <li className="p-3 bg-gray-50 border rounded-lg">
                <p className="font-semibold">Chest - Esmeralda II</p>
                <p className="text-sm text-gray-600">
                  Double Press – 28kg • Incline Double Press – 24kg
                </p>
              </li>

              <li className="p-3 bg-gray-50 border rounded-lg">
                <p className="font-semibold">Trapézio – Ouro I</p>
              </li>

              <li className="p-3 bg-gray-50 border rounded-lg">
                <p className="font-semibold">Abdômen Superior – Prata IV</p>
              </li>
            </ul>
          </div>
          <div className="bg-white shadow rounded-lg p-5">
            <h2 className="text-xl font-bold mb-3">Metas</h2>

            <div className="space-y-4">
              <div>
                <p className="font-semibold">Meta: Braço do Ramon Dino — 168cm</p>
                <p className="text-sm">Progresso atual: 27cm</p>
              </div>

              <div>
                <p className="font-semibold">Meta: Perninhas do Lucas — 8cm</p>
                <p className="text-sm">Progresso atual: 27cm</p>
              </div>

              <div>
                <p className="font-semibold">Meta: Rank — Diamante</p>
                <p className="text-sm">Progresso atual: Plástico</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-5 flex justify-center items-center">
          <div className="w-72 h-96 border rounded-lg flex items-center justify-center text-gray-500">
            provavel lista de grupso musculartes
          </div>
        </div>

      </div>
    </div>
  );
}