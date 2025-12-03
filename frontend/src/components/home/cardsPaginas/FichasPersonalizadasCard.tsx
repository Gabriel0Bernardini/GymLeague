import DashboardCard from "../../DashBoardCardGenerico";
import { FaRegClipboard } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../libs/api";
import type { Rotina } from "../../../components/ModalVerRotinas";

export default function FichasPersonalizadasCard() {
  const [rotinas, setRotinas] = useState<Rotina[]>([]);

  useEffect(() => {
    let mounted = true;
    api.explorarRotinas
      .listar()
      .then((res) => {
        if (!mounted) return;
        setRotinas(Array.isArray(res.rotinas) ? res.rotinas : []);
      })
      .catch((err) => {
        console.error("Erro ao carregar rotinas personalizadas", err);
        if (!mounted) return;
        setRotinas([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const navigate = useNavigate();

  function abrir(rotina: Rotina) {
    // Navega para a página de explorar e passa a rotina no state
    navigate("/explorar-rotinas", { state: { rotinaPublica: rotina } });
  }

  return (
    <>
      <DashboardCard
        title="Rotinas Personalizadas"
        icon={<FaRegClipboard size={40} />}
        buttonLabel="Ver personalizadas"
        buttonLink="/explorar-rotinas"
      >
        <div className="flex flex-col gap-2">
          <div className="bg-gray-300 rounded p-2 max-h-[240px] overflow-y-auto">
            {rotinas.length === 0 ? (
              <p className="text-center text-sm text-gray-700 py-4">Nenhuma rotina pública encontrada.</p>
            ) : (
              rotinas.map((r) => (
                <button
                  key={r.nome}
                  onClick={() => abrir(r)}
                  className="
                    block
                    bg-gray-100
                    hover:bg-gray-200
                    transition
                    p-3
                    rounded-md
                    text-sm
                    text-gray-800
                    shadow-sm
                    border
                    border-gray-300
                    w-full
                    text-left
                    mb-2
                  "
                >
                  <div className="flex flex-col">
                    <span className="font-semibold truncate">{r.nome}</span>
                    <span className="text-xs text-gray-500">Criado por {r.criadorNome}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </DashboardCard>

      {/* Note: abertura do modal será feita na página /explorar-rotinas via location.state
          para manter comportamento consistente quando o usuário navegar para a página. */}
    </>
  );
}
