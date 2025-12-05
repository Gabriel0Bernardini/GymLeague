export default function Footer() {
  return (
    <footer className="w-full bg-blue-600 text-white py-4 sticky bottom-0 z-40">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        
        {/* Texto esquerdo */}
        <p className="text-sm">
          GymLeague © {new Date().getFullYear()} — Todos os direitos reservados.
        </p>

        {/* Links do lado direito (opcional) */}
        <div className="flex gap-4 mt-2 md:mt-0 text-sm">
          <a href="/perfil" className="hover:underline">Perfil</a>
          <a href="/sobre" className="hover:underline">Sobre</a>
          <a href="/contato" className="hover:underline">Contato</a>
        </div>

      </div>
    </footer>
  );
}
