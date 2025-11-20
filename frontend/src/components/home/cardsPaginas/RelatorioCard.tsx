import DashboardCard from "../../DashBoardCardGenerico";  
import { FaCalendarAlt } from "react-icons/fa";    

export default function RelatorioCard() {
  return (
    <DashboardCard
      title="Relatório"
      icon={ <FaCalendarAlt size={45} /> }
      buttonLabel="Ver relatório"
      buttonLink="/relatorio"
    >
      <div className="p-3 bg-gray-50 rounded-md shadow-inner border border-gray-200">
      <ul className="text-sm text-gray-700 list-disc ml-5">
        <li>Último treino: 18/11</li>
        <li>Presença semanal: 4 dias</li>
        <li>Meta batida por 2 semanas seguidas</li>
        {/* TODO: substituir -> relatorio.dados */}
      </ul>
      </div>
    </DashboardCard>
  );
}
