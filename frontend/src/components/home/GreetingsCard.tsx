type GreetingsCardProps = {
  user: { pNome: string; email: string } | null;
};

export default function GreetingsCard({ user}: GreetingsCardProps) {

    return (
        <div className="p-4">
            <div className="bg-white shadow-md rounded-xl p-6 flex items-center gap-6">
                <div className="text-gray-700">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
                </svg>
                </div>
    
                <div>
                <p className="text-lg font-semibold">
                    Bem-vindo, {user?.pNome ?? "carregando..."}!
                </p>
                <p className="text-gray-600 text-sm">
                    Acompanhe seu progresso e evolução
                </p>
                </div>
    
            </div>
        </div>
    );
}