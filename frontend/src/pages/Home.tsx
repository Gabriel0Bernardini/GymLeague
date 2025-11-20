import { clearToken } from "../libs/auth";
import { useNavigate } from "react-router-dom";
import { api } from "../libs/api"
import { useEffect, useState } from "react";
import TopBar from "../components/ui/TopBar";

export type User = {
  pNome: string;
  email: string;
}

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  
  function handleLogout(){
    clearToken();
    navigate("/", { replace: true });
  }

  useEffect(() => {
    let active = true;

    api.auth.me()
      .then((data) => {
        if (active) setUser(data);
      })
      .catch(() => {
        handleLogout();
      });

    return () => {
      active = false;
    };
  }, []);


  return (
    <div>
      <TopBar user={user} onLogout={handleLogout} />
      <div className="flex items-center justify-center bg-gray-100">
        <h1>Bem-vindo ao GymLeague</h1>
      </div>
    </div>
  );
}
