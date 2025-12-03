import { useEffect, useState } from "react";
import TopBar from "../components/ui/TopBar";
import Footer from  "../components/ui/Footer";
import { api } from "../libs/api";
import { useNavigate, useLocation } from "react-router-dom";
import type { User } from "./Home";
import PrivateRoute from "../components/auth/PrivateRoute";
import { clearToken } from "../libs/auth";
import ModalVerRotinas from "../components/ModalVerRotinas"; 
import type { Rotina } from "../components/ModalVerRotinas";
import { FaMagnifyingGlass } from "react-icons/fa6";


 export default function ExplorarRotinas(){
    const [rotinas, setRotinas] = useState<Rotina[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [modalAberto, setModalAberto] = useState(false);
    const [rotinaSelecionada, setRotinaSelecionada] = useState<Rotina | null>(null);
    const [filtro, setFiltro] = useState("");
    const [tipoFiltro, setTipoFiltro] = useState<"nome" | "criador">("nome"); 

    const navigate = useNavigate();
    const location = useLocation();

    function handleLogout() {
        clearToken();
        navigate("/", { replace: true });
      }

    useEffect(() => {
    api.auth.me().then((data) => setUser(data));

    api.explorarRotinas.listar()
      .then((data) => {
        setRotinas(data.rotinas);
      })
      .catch((err) => {
        console.error("Erro ao carregar rotinas", err);
      });

  }, []);

    // abrir modal se a página foi acessada com uma rotina no state
    useEffect(() => {
      const state: any = (location && (location as any).state) || {};
      const rotinaPublica: Rotina | undefined = state?.rotinaPublica;
      if (rotinaPublica) {
        setRotinaSelecionada(rotinaPublica);
        setModalAberto(true);
        // limpar state para não reabrir ao navegar
        navigate(location.pathname, { replace: true, state: null });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location?.state]);

    async function adicionarRotinaHandler(rotina: Rotina) {
        if (!user) return;

        try {
            const res = await api.explorarRotinas.copiar(rotina, user.email);
            alert(res.mensagem);
            setModalAberto(false);
        } catch (err) {
            console.error(err);
            alert("Erro ao copiar rotina");
        }
    }

    return (
        <PrivateRoute>
            <div className="min-h-screen flex flex-col">
                <TopBar user={user} onLogout={handleLogout} />
                <div className="pt-20 flex-grow">
                  <div className="p-6">
                      <h1 className="text-3xl font-semibold mb-2">Explorar</h1>
                      <p className="text-gray-600 mb-6">
                          Descubra outras rotinas dos usuários
                      </p>
                      
                      <div className="flex gap-4 mb-6 items-center">
                          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full">
                            <span className="text-gray-500"><FaMagnifyingGlass/></span>
                            <input type="text"
                              placeholder="Pesquisar"
                              className="w-full outline-none text-gray-700 placeholder-gray-400"
                              value={filtro}
                              onChange={(e) => setFiltro(e.target.value)}
                            />
                          </div>

                          <select className="border border-gray-300 rounded-lg shadow-sm px-3 py-2 bg-white"
                            value={tipoFiltro}
                            onChange={(e) => setTipoFiltro(e.target.value as "nome" | "criador")}
                            >
                              <option value="nome">Rotina</option>
                              <option value="criador">Criador</option>
                            </select>
                      </div>
                      {/*Grid das rotinas*/}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {rotinas.filter((r) => {
                            if(filtro.trim() === "") return true;
                            if(tipoFiltro === "nome"){
                              return r.nome.toLowerCase().includes(filtro.toLowerCase());
                            }
                            if(tipoFiltro === "criador"){
                              return r.criadorNome.toLowerCase().includes(filtro.toLowerCase());
                            }
                            return true;

                          }).map((rotina) => (
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
                      adicionarRotina={adicionarRotinaHandler}
                  />
                  )}
                <div/>
                </div>
                <Footer/>
            </div>
        </PrivateRoute>
    )
 }
