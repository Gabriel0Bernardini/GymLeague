import DashboardCard from "../../DashBoardCardGenerico";
import DashboardListItem from "../../DashBoardListItem";   
import { FaRegClipboard } from "react-icons/fa"; 

export default function FichasPersonalizadasCard() {
  return (
    <DashboardCard
      title="Rotinas Personalizadas"
      icon={ <FaRegClipboard size={40} /> }
      buttonLabel="Ver personalizadas"
      buttonLink="/explorar-rotinas"
    >
      <div className="flex flex-col gap-2">
              
        <DashboardListItem label="Treino FullBody – Criado em 10/10" link="/fichas/a" />
        <DashboardListItem label="Treino HIIT – Criado em 02/10" link="/fichas/b" />

        {/* TODO: mapear user.fichas quando tiver backend */}
      </div>
      
    </DashboardCard>
  );
}
