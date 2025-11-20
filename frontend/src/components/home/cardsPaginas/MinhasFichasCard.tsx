import DashboardCard from "../../DashBoardCardGenerico";
import DashboardListItem from "../../DashBoardListItem";

import { BiNotepad } from "react-icons/bi";     

export default function MinhasFichasCard() {
  return (
    <DashboardCard
      title="Minhas Fichas"
      icon={<BiNotepad size={45} />}
      buttonLabel="Ver fichas"
      buttonLink="/fichas"
    >
      <div className="flex flex-col gap-2">
        
        <DashboardListItem label="Treino A – Hipertrofia" link="/fichas/a" />
        <DashboardListItem label="Treino B – Costas e Bíceps" link="/fichas/b" />
        <DashboardListItem label="Treino C – Pernas" link="/fichas/c" />

        {/* TODO: mapear user.fichas quando tiver backend */}
      </div>
    </DashboardCard>
  );
}
