export type RankingGeralProps = {    
  rankingGeral?: string;
};

export default function RankingGeralCard({
  rankingGeral = "Esmeralda 3" //placeholder default
}: RankingGeralProps) {
    return (
        <div className="bg-white shadow-md rounded-xl p-6 flex items-center gap-4">

            <div className="text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" 
                  fill="currentColor" 
                  viewBox="0 0 24 24" 
                  className="w-12 h-12">
                <path d="M17 2H7v2H2v3a5 5 0 0 0 5 5h.1A6.002 
                        6.002 0 0 0 11 16.9V19H8v2h8v-2h-3v-2.1A6.002 
                        6.002 0 0 0 16.9 12H17a5 5 0 0 0 5-5V4h-5V2Zm3 
                        5a3 3 0 0 1-3 3h-.1a6.04 6.04 0 0 0-.9-2.17V6h4v1Zm-6 
                        1.83A4.02 4.02 0 0 1 12 11a4.02 4.02 0 0 1-2-2.17V4h4v4.83ZM7 
                        6v1.83A4.02 4.02 0 0 1 5.1 10H5a3 3 0 0 1-3-3V6h5Z" />
              </svg>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Ranking Geral</h2>
              <p className="text-gray-700 text-sm">
              <strong>{rankingGeral}</strong>
               {/* TODO: substituir por ranking.posicao retornado da API */}
              </p>
            </div>

          </div>
    );
}