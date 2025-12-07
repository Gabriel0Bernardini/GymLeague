import { FaUser } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { BiNotepad } from "react-icons/bi";        
import { FaChartLine } from "react-icons/fa";       
import { FaRegClipboard } from "react-icons/fa";    
import { GiWeightLiftingUp } from "react-icons/gi";
import { FaHome } from "react-icons/fa";
import { LuDumbbell } from "react-icons/lu";
import { FaTrophy } from "react-icons/fa";

import { useLocation } from "react-router-dom";

type TopBarProps = {
  user: { pNome: string; email: string } | null;
  onLogout: () => void;
};

export default function TopBar({ user, onLogout }: TopBarProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  function isActive(path: string) {
    return currentPath === path;
  }

  const activeIcon = "text-black"; 
  const inactiveIcon = "text-white hover:text-gray-200";

  return (
    <div className="p-4 bg-blue-600 text-white flex justify-between items-center fixed top-0 left-0 w-full z-10 shadow-md">

      <nav className="flex gap-6 text-xl">
        
        <a href="/home" title="Home Page">
          <FaHome 
            className={`h-7 w-7 ${isActive("/home") ? activeIcon : inactiveIcon}`}
          />
        </a>

        <a href="/meus-treinos" title="Meus Treinos">
          <BiNotepad 
            className={`h-7 w-7 ${isActive("/meus-treinos") ? activeIcon : inactiveIcon}`}
          />
        </a>

        <a href="/evolucao" title="Evolução">
          <FaChartLine 
            className={`h-7 w-7 ${isActive("/evolucao") ? activeIcon : inactiveIcon}`}
          />
        </a>

        <a href="/treinar" title="Cadastrar treinos">
          <GiWeightLiftingUp 
            className={`h-7 w-7 ${isActive("/treinar") ? activeIcon : inactiveIcon}`}
          />
        </a>

        <a href="/explorar-rotinas" title="Explorar Rotinas">
          <FaRegClipboard 
            className={`h-7 w-7 ${isActive("/explorar-rotinas") ? activeIcon : inactiveIcon}`}
          />
        </a>

        <a href="/inserir-exercicio" title="Inserir Exercício">
          <LuDumbbell 
            className={`h-7 w-7 ${isActive("/inserir-exercicio") ? activeIcon : inactiveIcon}`}
          />  
        </a>

        <a href = "/ranking" title="Ranking e Metas">
          <FaTrophy 
            className={`h-7 w-7 ${isActive("/ranking") ? activeIcon : inactiveIcon}`}
          />
        </a>
      </nav>

      <div className="flex items-center">
        <p className="pr-3 text-xl font-brasilic">{user?.pNome ?? "carregando..."}</p>

        <a href="/perfil" className="hover:text-gray-200">
          <FaUser className="h-6 w-6" />
        </a>

        <button onClick={onLogout} className="pl-4 cursor-pointer hover:text-gray-300">
          <IoLogOut className="h-6 w-6" />
        </button>
      </div>

    </div>
  );
}