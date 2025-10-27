import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { isAuthenticated } from "./libs/auth";
import Perfil from "./pages/Perfil"
import Cadastro from "./pages/Cadastro";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}