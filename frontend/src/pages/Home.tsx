import { FaUser } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { clearToken } from "../libs/auth";
import { useNavigate } from "react-router-dom";
import { api } from "../libs/api"
import { useEffect, useState } from "react";

type User = {
  pNome?: string;
  email?: string;
}

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    let active = true;

    api.auth.me()
      .then((data) => {
        if (active) setUser(data);
      })
      .catch(() => {
        // token inválido/expirado → trate com logout ou redirect
      });

    return () => {
      active = false;
    };
  }, []);

  function handleLogout(){

    clearToken();
    navigate("/login", { replace: true });
  }

  return (
    <div>
      <div className="p-4 bg-blue-600 text-white flex justify-end">
        <p className="pr-3 text-xl font-brasilic">{user?.pNome ?? "carregando..."}</p>
        <button><a href="/perfil"><FaUser className="h-6 w-6"/></a></button>
        <button onClick={handleLogout} className="pl-4 cursor-pointer"><IoLogOut className="h-6 w-6" /></button>
      </div>
      <div className="flex items-center justify-center bg-gray-100">
        <h1>Bem-vindo ao GymLeague</h1>
      </div>
    </div>
  );
}
