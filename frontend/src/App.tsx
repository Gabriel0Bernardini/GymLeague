import { isAuthenticated } from "./libs/auth";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { type ReactNode } from "react";
import Perfil from "./pages/Perfil"
import Cadastro from "./pages/Cadastro";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Home from "./pages/Home";

function ProtectedRoute({ children }: { children: ReactNode }) {
  return isAuthenticated() ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}