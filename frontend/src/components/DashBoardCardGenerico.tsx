type DashboardCardProps = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode; 
  buttonLabel: string;
  buttonLink: string;
};

export default function DashboardCard({
  title,
  icon,
  children,
  buttonLabel,
  buttonLink
}: DashboardCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col">

      {/* Ícone + título */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-blue-600 w-10 h-10">
          {icon}
        </div>

        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      {/* Conteúdo variável */}
      <div className="flex-1">
        {children}
      </div>

      {/* Botão */}
     <div className="mt-4 flex justify-center">
        <a
          href={buttonLink}
          className="
            text-base 
            font-bold
            bg-blue-600 
            text-white 
            py-2 px-6 
            rounded-md 
            hover:bg-blue-700 
            transition
            w-full 
            min-w-[200px]            
            max-w-[500px]
            text-center
          "
        >
          {buttonLabel}
        </a>
      </div>
    </div>
  );
}
