import { FaTrash, FaFolderOpen } from "react-icons/fa";
import Button from "../ui/Button";

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
    <div className="bg-gray-200 p-4 rounded shadow-md mt-6">

      {/* Título */}
      <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
        Minhas Fichas
      </h2>

      {/* Subtítulo */}
      <p className="text-sm text-gray-600 mb-3">
        Acesse suas fichas de treino
      </p>

      {/* Lista de fichas */}
      <div className="bg-gray-300 rounded p-2 max-h-[350px] overflow-y-auto">

        {fichas.map((ficha) => (
          <div
            key={ficha.id}
            className="bg-gray-200 flex justify-between items-center p-3 border-b border-gray-400"
          >
            <span className="font-semibold">{ficha.nome}</span>

            <div className="flex gap-3">

              {/* Abrir */}
              <button
                onClick={() => onAbrir(ficha.id)}
                className="hover:text-blue-600"
              >
                <FaFolderOpen size={20} />
              </button>

              {/* Excluir */}
              <button
                onClick={() => onExcluir(ficha.id)}
                className="hover:text-red-600"
              >
                <FaTrash size={20} />
              </button>

            </div>
          </div>
        ))}

      </div>

      {/* Botão Criar Nova */}
      <div className="flex justify-center mt-6">
        <Button variant="blue" onClick={onCriar}>
          Adicionar Nova Ficha
        </Button>
      </div>

    </div>
  );
}
