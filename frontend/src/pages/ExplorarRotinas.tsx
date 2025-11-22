import { useEffect, useState } from "react";
import TopBar from "../components/ui/TopBar";
import Footer from  "../components/ui/Footer";
import { api } from "../libs/api";
import { useNavigate } from "react-router-dom";
import type { User } from "./Home";
import PrivateRoute from "../components/auth/PrivateRoute";
import { clearToken } from "../libs/auth";

type Rotina = {
    nome: string;
    criadorEmail: string;
    criadorNome: string;
 }

 export default function ExplorarRotinas(){
    const [rotinas, setRotinas] = useState<Rotina[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    function handleLogout() {
        clearToken();
        navigate("/", { replace: true });
      }

    useEffect(() => {
        api.auth.me().then((data) => setUser(data));

        setRotinas([
            {
            nome: "Rotina PPL",
            criadorEmail: "felipeprinci@gmail.com",
            criadorNome: "Felipe Princi",
            },
            {
            nome: "Rotina All-Body",
            criadorEmail: "felipeprinci@gmail.com",
            criadorNome: "Felipe Princi",
            },
            {
            nome: "Rotina ABCDE",
            criadorEmail: "felipeprinci@gmail.com",
            criadorNome: "Felipe Princi",
            },
            {
            nome: "Rotina Upper",
            criadorEmail: "nicolas@gmail.com",
            criadorNome: "Nicolas",
            },

        ]);
    }, []);

    return (
        <PrivateRoute>
            <div className="pt-20">
                <TopBar user={user} onLogout={handleLogout} />

                <div className="p-6">
                    <h1 className="text-3xl font-semibold mb-2">Explorar</h1>
                    <p className="text-gray-600 mb-6">
                        Descubra outras rotinas dos usuários
                    </p>

                    {/*Grid das rotinas*/}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rotinas.map((rotina) => (
                            <div key={rotina.nome} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-4 cursor-pointer">
                                <div className="bg-gray-200 h-40 rounded-md mb-4"/>
                                <h2 className="text-lg font-semibold">{rotina.nome}</h2>
                                <p className="text-gray-500 text-sm">Criado por {rotina.criadorNome}</p>

                            </div>

                        ))}
                    </div>

                </div>
                <Footer/>
            </div>
        </PrivateRoute>
    )
 }
