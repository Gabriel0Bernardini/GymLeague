
export type CardPesoAtualProps = {
  pesoAtual?: number;    
};

export default function PesoAtualCard({ 
    pesoAtual = 82 // placeholder default
}: CardPesoAtualProps) {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 flex items-center gap-4">
      
      <div className="text-blue-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
          className="w-12 h-12"
        >
          <path d="M12 2a7 7 0 0 0-7 7v1H4a2 2 0 0 0-2 2v8a2 
                  2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8a2 2 0 0 
                  0-2-2h-1V9a7 7 0 0 0-7-7Zm5 8H7V9a5 5 0 0 
                  1 10 0v1Z" />
        </svg>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Peso Atual</h2>
        <p className="text-gray-700 text-sm">
          <strong>{pesoAtual}kg</strong>
          {/* TODO: substituir por user.pesoAtual quando estiver no banco */}
        </p>
      </div>
    </div>
  );
}
