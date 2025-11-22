// src/components/treinos/ListaDeFichas.tsx
import { FaTrash, FaFolderOpen } from "react-icons/fa";

type Ficha = {
  id: number;
  nome: string;
};

type ListaDeFichasProps = {
  fichas: Ficha[];
  onAbrir: (id: number) => void;
  onExcluir: (id: number) => void;
  onCriar: () => void;
};

export default function ListaDeFichas({
  fichas,
  onAbrir,
  onExcluir,
  onCriar
}: ListaDeFichasProps) {
  return (
    <div className="p-4">
      <div className="bg-gray-200 p-4 rounded shadow-md mt-6">

        <h2 className="text-xl font-bold mb-2">Minhas Fichas</h2>
        <p className="text-sm text-gray-600 mb-3">Acesse suas fichas de treino</p>

        <div className="bg-gray-300 rounded p-2 max-h-[240px] overflow-y-auto">

          {fichas.length === 0 ? (
            <p className="text-center text-sm text-gray-700 py-4">
              Nenhuma ficha criada ainda.
            </p>
          ) : (
            fichas.map((ficha) => (
              <div
                key={ficha.id}
                className="bg-gray-200 flex justify-between items-center p-3 border-b border-gray-400 last:border-none"
              >
                <span className="font-semibold">{ficha.nome}</span>

                <div className="flex gap-3 items-center">
                  <button
                    onClick={() => onAbrir(ficha.id)}
                    className="hover:text-blue-600 transition-colors"
                    title="Abrir Ficha"
                  >
                    <FaFolderOpen size={20} />
                  </button>

                  <button
                    onClick={() => onExcluir(ficha.id)}
                    className="hover:text-red-600 transition-colors"
                    title="Excluir Ficha"
                  >
                    <FaTrash size={20} />
                  </button>
                </div>
              </div>
            ))
          )}

        </div>

        <div className="flex justify-center mt-6">
          <button
            className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
            onClick={onCriar}
          >
            Criar Nova Ficha
          </button>
        </div>

      </div>
    </div>
  );
}
