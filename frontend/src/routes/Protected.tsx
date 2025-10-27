import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../libs/auth";

type Props = { children: React.ReactNode };

export default function Protected({ children }: Props) {
  const location = useLocation();
  if (!isAuthenticated()) {
    // redireciona para /login e guarda de onde veio (state.from)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
