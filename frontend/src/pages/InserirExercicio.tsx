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
import type { FeedbackState } from "./Cadastro";

export type GrupoMuscular = {
  nomeGrupo: string
}

export type Musculo = {
  nome: string,
  grupoMuscular: GrupoMuscular
}

export default function InserirExercicio() {
  const [grupos, setGrupos] = useState<GrupoMuscular[]>([]);
  const [musculos, setMusculos] = useState<Musculo[]>([]);
  const [nomeError, setNomeError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMusculos, setSelectedMusculos] = useState<string[]>([]);

  function toggleMusculo(nome: string) {
    setSelectedMusculos((prev) =>
      prev.includes(nome)
        ? prev.filter((m) => m !== nome) // remove
        : [...prev, nome]                // adiciona
    );
  }

  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  // apenas o campo de nome, sem validação ou lógica
  const [nome, setNome] = useState("");

  function handleLogout() {
    clearToken();
    navigate("/", { replace: true });
  }

  useEffect(() => {
    async function load() {
      const userData = await api.auth.me();
      setUser(userData);

      const resp = await api.inserirExercicio.carregarDados();

      console.log("Dados recebidos da API:", resp.gruposMusculares);

      setGrupos(resp.gruposMusculares);
      setMusculos(resp.musculos);
    }
    load();
  }, []);


  // submit vazio (placeholder)
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let hasError = false;
    setNomeError(null);  
    setFeedback(null);
  
    if (!nome.trim()) {
      setNomeError("Informe o nome.");
      hasError = true;
    }

    if (selectedMusculos.length === 0) {
    setFeedback({
      message: "Selecione ao menos um músculo.",
      variant: "error",
    });
    hasError = true;
  }

    if (hasError) return;
    
    try {
      setIsLoading(true);
      await api.inserirExercicio.criar({
        nome,
        musculos: selectedMusculos,
      });
      navigate("/home", { replace: true });
    } catch (err) {
      const status = (err as { status?: number }).status;
      const body = (err as { body?: { code?: string } }).body;
      if (status === 409 || body?.code === "EXERCISE_ALREADY_EXISTS") {
        setNomeError("Esse exercício já existe.");
      } else {
        setFeedback({
          message: "Erro ao criar exercício. Tente novamente.",
          variant: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
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
              variant={nomeError ? "error" : "default"}
            />
            {nomeError && (
              <p className="text-red-500 text-xs italic -mt-3 mb-2">
                {nomeError}
              </p>
            )}
          </div>

          {/* Musculos e grupos musculares */}
          {grupos.map((grupo) => (
            <div key={grupo.nomeGrupo} className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                {grupo.nomeGrupo}
              </label>
              
              <div className="flex flex-col gap-2 ml-2">
                {musculos
                  .filter((m) => m.grupoMuscular.nomeGrupo === grupo.nomeGrupo)
                  .map((m) => (
                    <label key={m.nome} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={m.nome}
                        checked={selectedMusculos.includes(m.nome)}
                        onChange={() => toggleMusculo(m.nome)}
                      />
                      <span>{m.nome}</span>
                    </label>
                  ))}
              </div>
            </div>
          ))}

          {feedback && (
            <div
              role="status"
              aria-live="polite"
              className={`my-2 text-sm ${feedback.variant === "error" ? "text-red-600" : "text-green-700"}`}
            >
              {feedback.message}
            </div>
          )}

          <Button
            type="submit"
            className="cursor-pointer text-white font-bold py-2 px-4 rounded w-full mt-2"
          >
            {isLoading ? "Criando exercicio..." : "Criar exercicio"}
          </Button>
        </form>


        <Footer />
      </div>
    </PrivateRoute>
  );
}
