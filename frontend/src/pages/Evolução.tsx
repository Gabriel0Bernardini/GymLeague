import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearToken } from "../libs/auth";
import { api } from "../libs/api";
import type { User } from "./Home";

import PrivateRoute from "../components/auth/PrivateRoute";
import TopBar from "../components/ui/TopBar";
import Footer from "../components/ui/Footer";

export default function Evolução() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    function handleLogout() {
        clearToken();
        navigate("/", { replace: true });
      }
    useEffect(() => {
        api.auth.me().then((data) => setUser(data));
    }, []);
      
    return (
        <PrivateRoute>
            <div className="pt-20">
                {/* Top Bar */}
                <TopBar user={user} onLogout={handleLogout} />
                <Footer />
            </div>
        </PrivateRoute>
    );
}
            