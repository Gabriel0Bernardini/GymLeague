import { FaUser } from "react-icons/fa";


export default function Home() {
  return (
    <div>
      <div className="p-4 bg-blue-600 text-white flex justify-end">
        <button ><a href="/perfil"><FaUser className="h-6 w-6"/></a></button>
      </div>
      <div className="flex items-center justify-center bg-gray-100">
        <h1>Bem-vindo ao GymLeague</h1>
      </div>
    </div>
  );
}
