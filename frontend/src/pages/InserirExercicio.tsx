import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { User } from "./Home";

import TopBar from "../components/ui/TopBar";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Footer from "../components/ui/Footer";

import { clearToken } from "../libs/auth";
import { api } from "../libs/api";
import PrivateRoute from "../components/auth/PrivateRoute";

export type GrupoMuscular = {
  nomeGrupo: string
}

export type Musculo = {
  nome: string,
  grupoMuscular: GrupoMuscular
}

export default function InserirExercicio() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  // apenas o campo de nome, sem validação ou lógica
  const [nome, setNome] = useState("");

  function handleLogout() {
    clearToken();
    navigate("/", { replace: true });
  }

  useEffect(() => {
    api.auth.me().then((data) => setUser(data));
  }, []);

  // submit vazio (placeholder)
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("Form enviado — funcionalidade será adicionada depois");
  }

  return (
    <PrivateRoute>
      <div className="pt-20">
        <TopBar user={user} onLogout={handleLogout} />

        <form
  onSubmit={handleSubmit}
  className="max-w-xl mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mt-10"
>
  <h2 className="text-2xl font-bold mb-4">Criar Exercício</h2>

  {/* Nome do exercício */}
  <div className="mb-4">
    <Input
      id="nomeExercicio"
      label="Nome do Exercício"
      placeholder="Supino Reto"
      value={nome}
      onChange={(e) => setNome(e.target.value)}
      variant="default"
    />
  </div>

  {/* Grupo Peito */}
  <div className="mb-4">
    <label className="block text-gray-700 font-semibold mb-2">Peito</label>

    <div className="flex flex-col gap-2 ml-2">
      <label className="flex items-center gap-2">
        <input type="checkbox" />
        <span>Cabeça Clavicular</span>
      </label>

      <label className="flex items-center gap-2">
        <input type="checkbox" />
        <span>Cabeça Esternal</span>
      </label>
    </div>
  </div>

  {/* Grupo Costas */}
  <div className="mb-4">
    <label className="block text-gray-700 font-semibold mb-2">Costas</label>

    <div className="flex flex-col gap-2 ml-2">
      <label className="flex items-center gap-2">
        <input type="checkbox" />
        <span>Latíssimo</span>
      </label>

      <label className="flex items-center gap-2">
        <input type="checkbox" />
        <span>Trapézio Médio</span>
      </label>
    </div>
  </div>

  <Button
    type="submit"
    className="cursor-pointer text-white font-bold py-2 px-4 rounded w-full mt-2"
  >
    Criar Exercício
  </Button>
</form>


        <Footer />
      </div>
    </PrivateRoute>
  );
}
