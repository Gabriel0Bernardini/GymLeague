import { useState } from "react";
import { FaTimes, FaEdit, FaChevronDown, FaChevronUp } from "react-icons/fa";

type Ficha = {
  id: number;
  nome: string;
  exercicios: any[];
  editando?: boolean;
};

type ModalProgramaTreinoProps = {
  aberto: boolean;
  onClose: () => void;
};

export default function ModalProgramaTreino({ aberto, onClose }: ModalProgramaTreinoProps) {
  
  const [nomePrograma, setNomePrograma] = useState("Novo Programa De Treino");
  const [editandoNome, setEditandoNome] = useState(false);

  const [fichas, setFichas] = useState<Ficha[]>([
    { id: 1, nome: "Ficha A", exercicios: [], editando: false }
  ]);

  const [abertaId, setAbertaId] = useState<number | null>(null);

  if (!aberto) return null;

  function adicionarFicha() {
    const letra = String.fromCharCode(65 + fichas.length);
    setFichas(prev => [
      ...prev,
      { id: Date.now(), nome: `Ficha ${letra}`, exercicios: [], editando: false }
    ]);
  }

  function toggleFicha(id: number) {
    setAbertaId(prev => (prev === id ? null : id));
  }

  function editarNomeFicha(id: number, novoNome: string) {
    setFichas(prev =>
      prev.map(f => (f.id === id ? { ...f, nome: novoNome } : f))
    );
  }

  function alternarEdicaoNome(id: number) {
    setFichas(prev =>
      prev.map(f =>
        f.id === id ? { ...f, editando: !f.editando } : f
      )
    );
  }

  return (
    <div className="
      fixed inset-0 backdrop-blur-sm bg-black/30 z-50 
      flex justify-center items-center
    ">
      
      <div className="
        bg-white rounded-lg shadow-xl p-6 w-[75%] max-h-[85%] overflow-y-auto
        transform transition-all duration-300 scale-100 opacity-100
      ">

        {/* TOPO */}
        <div className="flex justify-between items-center mb-4">

          {/* Título Editável */}
          <div className="flex items-center gap-3">
            {editandoNome ? (
              <input
                className="border p-1 rounded"
                value={nomePrograma}
                onChange={(e) => setNomePrograma(e.target.value)}
              />
            ) : (
              <h2 className="text-2xl font-bold">{nomePrograma}</h2>
            )}

            <button
              className="text-gray-600 hover:text-black"
              onClick={() => setEditandoNome(prev => !prev)}
            >
              <FaEdit />
            </button>
          </div>

          <button 
            onClick={onClose}
            className="text-gray-600 hover:text-red-600"
          >
            <FaTimes size={22} />
          </button>

        </div>

        {/* LISTA DE FICHAS */}
        <div className="space-y-4">

          {fichas.map(f => (
            <div key={f.id} className="border rounded-lg overflow-hidden">

              {/* Cabeçalho da Ficha */}
              <button
                onClick={() => toggleFicha(f.id)}
                className="w-full flex justify-between items-center p-3 bg-gray-100 hover:bg-gray-200"
              >
                <div className="flex items-center gap-2">

                  {f.editando ? (
                    <input
                      className="border p-1 rounded"
                      value={f.nome}
                      onChange={(e) => editarNomeFicha(f.id, e.target.value)}
                    />
                  ) : (
                    <span className="font-bold">{f.nome}</span>
                  )}

                  {/* Botão de editar nome */}
                  <FaEdit
                    onClick={(e) => {
                      e.stopPropagation();
                      alternarEdicaoNome(f.id);
                    }}
                    className="cursor-pointer text-gray-700 hover:text-black"
                  />

                </div>

                {abertaId === f.id ? <FaChevronUp /> : <FaChevronDown />}
              </button>

              {/* Conteúdo da Ficha */}
              {abertaId === f.id && (
                <div className="p-3 bg-gray-50">

                  <table className="w-full text-center border">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="border p-2">Nome</th>
                        <th className="border p-2">Séries</th>
                        <th className="border p-2">Repetições</th>
                        <th className="border p-2">Carga</th>
                        <th className="border p-2">Descrição</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-2 text-sm text-gray-500" colSpan={5}>
                          Nenhum exercício adicionado ainda
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <button
                    className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  >
                    Adicionar exercícios nessa ficha
                  </button>

                </div>
              )}

            </div>
          ))}

        </div>

        {/* Adicionar Ficha */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={adicionarFicha}
            className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-black"
          >
            Adicionar Ficha
          </button>
        </div>

        {/* Salvar */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => console.log("Salvar programa futuramente")}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Salvar Programa
          </button>
        </div>

      </div>
    </div>
  );
}
