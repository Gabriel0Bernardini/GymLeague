import { FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useState } from "react";

export type Exercicio = {
    nome: string;
    series: number;
    descricao?: string;
};

export type Treino = {
    nome: string;
    exercicios: Exercicio[];
};

export type Rotina = {
    nome: string;
    criadorEmail: string;
    criadorNome: string;
    treinos: Treino[];
};

type Props = {
    aberto: boolean;
    onClose: () => void;
    rotina: Rotina | null;
    adicionarRotina?: (rotina:Rotina) => void;
};

export default function ModalVerRotinas({aberto, onClose, rotina, adicionarRotina}: Props){
    const [ abertaId, setAbertaId] = useState<number | null>(null);
    if(!aberto || !rotina) return null;

    function toggleTreino(id:number){
        setAbertaId(prev => (prev === id ? null : id));
    }

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-[75%] max-h-[85%] overflow-y-auto transform transition-all duration-300">
                {/*TOPO*/}
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-2xl font-bold">
                        {rotina.nome}
                    </h2>

                    <button className="text-gray-600 hover:text-red-600" onClick={onClose}>
                        <FaTimes size={22}/>
                    </button>
                </div>

                {/*Treinos*/}
                <div className="space-y-4">
                    {rotina.treinos.map((t, indexTreino) =>(
                        <div key={indexTreino} className="border rounded-lg overflow-hidden">
                            <button onClick={() => toggleTreino(indexTreino)}
                                className= "w-full flex justify-between items-center p-3 bg-gray-100 hover:bg-gray-200"
                            >
                                <span className="font-bold">{t.nome}</span>
                                {abertaId === indexTreino ? <FaChevronUp/> : <FaChevronDown/>}
                            </button>

                            {abertaId === indexTreino && (
                                <div className="p-3 bg-gray-50">
                                {t.exercicios.length === 0 ? (
                                    <div className="text-center text-gray-500 p-4">
                                    Nenhum exercício nesta ficha
                                    </div>
                                ) : (
                                    <table className="w-full text-center border">
                                    <thead className="bg-gray-200">
                                        <tr>
                                        <th className="border p-2">Nome</th>
                                        <th className="border p-2">Séries</th>
                                        <th className="border p-2">Descrição</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {t.exercicios.map((e, indexExercicio) => (
                                        <tr key={indexExercicio} className="border">
                                            <td className="border p-2">{e.nome}</td>
                                            <td className="border p-2">{e.series}</td>
                                            <td className="border p-2 text-sm">{e.descricao ?? "-"}</td>
                                        </tr>
                                        ))}
                                    </tbody>
                                    </table>
                                )}
                                </div>
                            )}
                            
                            
                        </div>
                    ))}
                </div>
                <div className="flex justify-end mt-6">
                    <button
                        onClick={() => adicionarRotina?.(rotina)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Adicionar nas minhas rotinas
                    </button>
            </div>
            </div>
        </div>
    );
}