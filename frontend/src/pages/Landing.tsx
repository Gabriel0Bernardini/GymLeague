import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../libs/auth";
import Button from "../components/ui/Button";

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="bg-blue-600 px-6 py-4 text-white">
        <div className="flex max-w-5xl items-center justify-between gap-4">
          <span className="text-2xl font-bold">GymLeague</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl grow flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
          Alcance novos patamares no seu treino
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-600">
          Organize treinos, acompanhe seu desempenho e complete marcos
          com a plataforma GymLeague.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => navigate("/cadastro")} className="px-8 py-3 text-lg font-semibold">
            Comece agora
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/login")}
            className="px-8 py-3 text-lg"
          >
            Já tenho conta
          </Button>
        </div>
      </main>

      <footer className="bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl justify-between text-xs text-gray-500">
          <span>© {new Date().getFullYear()} GymLeague. Todos os direitos reservados.</span>
          <span>Eleve seu treino a um novo nível.</span>
        </div>
      </footer>
    </div>
  );
}