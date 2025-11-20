import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../libs/api";
import { clearToken } from "../../libs/auth";

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    api.auth.me()
      .then(() => {
        setIsAuthenticated(true);
      })
      .catch(() => {
        clearToken();
        navigate("/", { replace: true });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-lg font-semibold">
        Carregando...
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
