
export type MetaAtualProps = {
  pesoDesejado?: number;    
  dataLimite?: string;      
  percentual?: number;      
  fichaAtual?: string;       
  proximoTreino?: string;    
};

export default function MetaAtualCard({
  pesoDesejado = 75,           // placeholder default
  dataLimite = "30 de Outubro",   // placeholder default
  percentual = 45,                 // placeholder default (45%)
  fichaAtual = "A - Hipertrofia", // placeholder default
  proximoTreino = "Treino B - Costas e Bíceps", // placeholder
}: MetaAtualProps) {
  // garante que a largura da barra fique entre 0 e 100
  const pct = Math.max(0, Math.min(100, Math.round(percentual)));

    return (
    <div className="p-4">
      <div className="bg-blue-500 shadow-md rounded-lg p-6 grid grid-cols-2 gap-6">

        <div>
          <h2 className="text-xl font-bold mb-2">Meta Atual</h2>

          <p className="text-white text-base">
            Peso desejado: <strong>{pesoDesejado}kg</strong>
            {/* TODO: substituir pesoDesejado por valor vindo do banco → user.metaPeso */}
          </p>

          <p className="text-white text-base mt-1">
            Final do mês: <strong>{dataLimite}</strong>
            {/* TODO: substituir dataLimite pela data real → meta.dataLimite */}
          </p>

          <div className="mt-4">
            <div className="w-full bg-gray-600 rounded-full h-4">
              <div
                className="bg-white h-4 rounded-full"
                style={{ width: `${pct}%` }}  
                // TODO: substituir percentual pelo cálculo real:
                // (progressoAtual / metaTotal) * 100 
              />
            </div>

            <p className="text-white text-sm mt-1">
              Progresso: <strong>{pct}%</strong>
              {/* TODO: substituir pct pela % vinda do backend */}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">Treino</h2>

          <p className="text-white text-base">
            Ficha atual: <strong>{fichaAtual}</strong>
            {/* TODO: substituir fichaAtual pelo treino atual → treinoAtual.nome */}
          </p>

          <p className="text-white text-base mt-1">
            Próximo treino: <strong>{proximoTreino}</strong>
            {/* TODO: substituir proximoTreino pelo próximo treino da semana → treino.proximo */}
          </p>
        </div>
      </div>
    </div>
  );
}