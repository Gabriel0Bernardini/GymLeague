import { useEffect, useState } from "react";
import TopBar from "../components/ui/TopBar";
import Footer from  "../components/ui/Footer";
import { api } from "../libs/api";
import { useNavigate } from "react-router-dom";
import type { User } from "./Home";
import PrivateRoute from "../components/auth/PrivateRoute";
import { clearToken } from "../libs/auth";
import ModalVerRotinas from "../components/ModalVerRotinas"; 
import type { Rotina } from "../components/ModalVerRotinas";


 export default function ExplorarRotinas(){
    const [rotinas, setRotinas] = useState<Rotina[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [modalAberto, setModalAberto] = useState(false);
    const [rotinaSelecionada, setRotinaSelecionada] = useState<Rotina | null>(null);

    const navigate = useNavigate();

    function handleLogout() {
        clearToken();
        navigate("/", { replace: true });
      }

    useEffect(() => {
        api.auth.me().then((data) => setUser(data));

        setRotinas([
  {
    id: 1,
    nome: "Rotina PPL",
    criadorEmail: "felipeprinci@gmail.com",
    criadorNome: "Felipe Princi",
    treinos: [
      {
        id: 101,
        nome: "Treino Push",
        exercicios: [
          { id: 1, nome: "Supino Reto", series: 4, repeticoes: 8, carga: "40kg" },
          { id: 2, nome: "Desenvolvimento Militar", series: 4, repeticoes: 10, carga: "25kg" },
          { id: 3, nome: "Tríceps Corda", series: 3, repeticoes: 12, carga: "20kg" },
        ]
      },
      {
        id: 102,
        nome: "Treino Pull",
        exercicios: [
          { id: 4, nome: "Puxada Aberta", series: 4, repeticoes: 10, carga: "45kg" },
          { id: 5, nome: "Remada Curvada", series: 4, repeticoes: 8, carga: "30kg" },
          { id: 6, nome: "Rosca Direta", series: 3, repeticoes: 12, carga: "12kg" },
        ]
      },
      {
        id: 103,
        nome: "Treino Legs",
        exercicios: [
          { id: 7, nome: "Agachamento Livre", series: 5, repeticoes: 5, carga: "60kg" },
          { id: 8, nome: "Leg Press", series: 4, repeticoes: 10, carga: "100kg" },
          { id: 9, nome: "Elevação de Panturrilha", series: 4, repeticoes: 15, carga: "20kg" },
        ]
      }
    ]
  },

  {
    id: 2,
    nome: "Rotina All-Body",
    criadorEmail: "felipeprinci@gmail.com",
    criadorNome: "Felipe Princi",
    treinos: [
      {
        id: 201,
        nome: "Full Body A",
        exercicios: [
          { id: 10, nome: "Agachamento", series: 4, repeticoes: 8, carga: "50kg" },
          { id: 11, nome: "Supino Reto", series: 4, repeticoes: 10, carga: "35kg" },
          { id: 12, nome: "Remada Baixa", series: 4, repeticoes: 12, carga: "40kg" },
        ]
      },
      {
        id: 202,
        nome: "Full Body B",
        exercicios: [
          { id: 13, nome: "Leg Press", series: 4, repeticoes: 12, carga: "120kg" },
          { id: 14, nome: "Desenvolvimento", series: 3, repeticoes: 10, carga: "20kg" },
          { id: 15, nome: "Puxada Supinada", series: 3, repeticoes: 12, carga: "35kg" },
        ]
      }
    ]
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
                            <div key={rotina.nome} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-4 cursor-pointer"
                            onClick={() => {
                                setRotinaSelecionada(rotina);
                                setModalAberto(true);
                            }}>
                                <div className="bg-gray-200 h-40 rounded-md mb-4"/>
                                <h2 className="text-lg font-semibold">{rotina.nome}</h2>
                                <p className="text-gray-500 text-sm">Criado por {rotina.criadorNome}</p>

                            </div>

                        ))}
                    </div>

                </div>
                {modalAberto && rotinaSelecionada && (
                <ModalVerRotinas
                    aberto={modalAberto}
                    rotina={rotinaSelecionada}
                    onClose={() => setModalAberto(false)}
                />
                )}
                <Footer/>
            </div>
        </PrivateRoute>
    )
 }
