import DashboardCard from "../../DashBoardCardGenerico";
import DashboardListItem from "../../DashBoardListItem";

import { BiNotepad } from "react-icons/bi";     

export default function MinhasFichasCard() {
  return (
    <DashboardCard
      title="Minhas Rotinas"
      icon={<BiNotepad size={45} />}
      buttonLabel="Ver rotinas"
      buttonLink="/meus-treinos"
    >
      <div className="flex flex-col gap-2">
        
        <DashboardListItem label="Treino A – Hipertrofia" link="/meus-treinos/a" />
        <DashboardListItem label="Treino B – Costas e Bíceps" link="/meus-treinos/b" />
        <DashboardListItem label="Treino C – Pernas" link="/meus-treinos/c" />

        {/* TODO: mapear user.fichas quando tiver backend */}
      </div>
    </DashboardCard>
  );
}
