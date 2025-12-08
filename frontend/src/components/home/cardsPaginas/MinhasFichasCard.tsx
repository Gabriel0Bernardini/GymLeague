import DashboardCard from "../../DashBoardCardGenerico";
import { BiNotepad } from "react-icons/bi";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../libs/api";

type Ficha = { id: number; nome: string };

export default function MinhasFichasCard() {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    api.rotinas
      .listar()
      .then((list) => {
        if (!mounted) return;
        // obter todas as fichas do backend; o container terá altura limitada com scroll vertical
        setFichas(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!mounted) return;
        setFichas([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  function abrirNaPagina(nome: string) {
    // navega para /meus-treinos passando o nome da rotina para abrir
    navigate("/meus-treinos", { state: { abrirRotinaNome: nome } });
  }

  return (
    <DashboardCard
      title="Minhas Rotinas"
      icon={<BiNotepad size={45} />}
      buttonLabel="Ver rotinas"
      buttonLink="/meus-treinos"
    >
      <div className="flex flex-col gap-2">
        {fichas.length === 0 ? (
          <div className="text-sm text-gray-600">Nenhuma rotina criada ainda.</div>
        ) : (
          <div className="bg-gray-300 rounded p-2 max-h-[240px] overflow-y-auto">
            {fichas.map((f) => (
              <button
                key={f.id}
                onClick={() => abrirNaPagina(f.nome)}
                className="block bg-gray-100 hover:bg-gray-200 transition p-3 rounded-md text-sm text-gray-800 shadow-sm border border-gray-300 w-full text-left mb-2"
              >
                {f.nome}
              </button>
            ))}
          </div>
        )}

      </div>
    </DashboardCard>
  );
}
