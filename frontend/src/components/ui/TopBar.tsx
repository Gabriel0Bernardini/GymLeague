import { FaUser } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { BiNotepad } from "react-icons/bi";        
import { FaChartLine } from "react-icons/fa";       
import { FaRegClipboard } from "react-icons/fa";     
import { FaCalendarAlt } from "react-icons/fa";     

type TopBarProps = {
  user: { pNome: string; email: string } | null;
  onLogout: () => void;
};

export default function TopBar({ user, onLogout }: TopBarProps) {
  return (
    <div className="p-4 bg-blue-600 text-white flex justify-between items-center fixed top-0 left-0 w-full z-10 shadow-md">
      
      <nav className="flex gap-6 text-white text-xl">

        <a href="/treinos" className="hover:text-gray-200">
          <BiNotepad className="h-7 w-7" title="Meus Treinos" />
        </a>

        <a href="/evolucao" className="hover:text-gray-200">
          <FaChartLine className="h-7 w-7" title="Evolução" />
        </a>

        <a href="/fichas" className="hover:text-gray-200">
          <FaRegClipboard className="h-7 w-7" title="Fichas Personalizadas" />
        </a>

        <a href="/calendario" className="hover:text-gray-200">
          <FaCalendarAlt className="h-7 w-7" title="Calendário" />
        </a>

      </nav>

      <div className="flex items-center">
        <p className="pr-3 text-xl font-brasilic">{user?.pNome ?? "carregando..."}</p>

        <a href="/perfil" className="hover:text-gray-200">
          <FaUser className="h-6 w-6" />
        </a>

        <button 
          onClick={onLogout} 
          className="pl-4 cursor-pointer hover:text-gray-300"
        >
          <IoLogOut className="h-6 w-6" />
        </button>
      </div>

    </div>
  );
}
