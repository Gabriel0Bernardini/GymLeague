import DashboardCard from "../../DashBoardCardGenerico";
     
import { FaChartLine } from "react-icons/fa"; 

export default function MinhaEvolucaoCard() {
  return (
    <DashboardCard
      title="Minha Evolução"
      icon={ <FaChartLine size={40} /> }
      buttonLabel="Ver evolução"
      buttonLink="/evolucao"
    >
      <div className="p-3 bg-gray-50 rounded-md shadow-inner border border-gray-200">
        <ul className="text-sm text-gray-700 list-disc ml-5">
          <li>-1.2kg na última semana</li>
          <li>Média de 6 treinos no mês</li>
          {/* TODO: substituir pelos dados reais → progresso.historico */}
        </ul>
      </div>
    </DashboardCard>
  );
}
