import { useState } from "react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { api } from "../libs/api";
import { clearToken, saveToken } from "../libs/auth";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

// se já for usar router:


/*
  Conceitos:
  - useState: cria estado reativo. Ao mudar (setAlgo), o React redesenha a interface;
  - onSubmit: handler do <form>. Usamos preventDefault() para evitar recarregar a página;
  - Validação: aqui é simples (demonstração). Depois você troca pelo POST no back;
  - Acessibilidade: o Input já faz label + id; aqui só passamos id/label certinhos.
*/

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [showSenha, setShowSenha] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [userError, setUserError] = useState<string | null>(null);
    const [passError, setPassError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);

 // submit do formulário
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault(); // NÃO recarregar a página (comportamento padrão do HTML)
        setFeedback(null);

        // resetar erros antes de validar
        setUserError(null);
        setPassError(null);

        try {
            clearToken();
            setIsLoading(true);
            const res = await api.auth.login({ email, senha });
            saveToken(res.token);
            setFeedback("Login realizado com sucesso!");
            navigate("/home");
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            if (err.status === 401 || err?.body?.code === "INVALID_CREDENTIALS") {
                setPassError("Usuário ou senha inválidos.");
            } else {
                setFeedback("Falha ao conectar. Tente novamente.");
            }
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center px-8 pt-6 pb-8">
          <div className="bg-white w-full max-w-md rounded shadow-md p-5">
            <div className="bg-sky-500 shadow-md rounded px-8 pt-6 pb-8">
              <div className="flex items-center justify-center gap-10">
                <span className="text-white text-5xl font-bold">Login</span>
              </div>
            </div>
    
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded px-8 pt-6 pb-4"
            >
              <div className="mb-4">
                <Input
                  id="email"
                  label="Email"
                  placeholder="Seu Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  // quando há erro, mudamos a variante para o estilo vermelho
                  variant={userError ? "error" : "default"}
                />
                {/* mensagem de erro específica do username (opcional, pois seu Input já pode exibir) */}
                {userError && 
                  <p className="text-red-500 text-xs italic -mt-3 mb-2">
                    {userError}
                  </p>
                }
              </div>
    
              <div className="mb-4 relative">
                <Input
                  id="senha"
                  label="Senha"
                  type={showSenha ? "text" : "password"}
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  variant={passError ? "error" : "default"}
                />
                <button
                  type="button"
                  aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={showSenha}
                  onClick={() => setShowSenha((s) => !s)}
                  onMouseDown={(e) => e.preventDefault()}
                  className="absolute right-3 top-12 transform -translate-y-1/2 text-gray-600 hover:text-gray-900"
                >
                  {showSenha ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
                
                {passError && (
                  <p className="text-red-500 text-xs italic -mt-3 mb-2">
                    {passError}
                  </p>
                )}
              </div>
              {feedback && (
                <div
                  role="status"
                  aria-live="polite"
                  className="my-2 text-green-700 text-1xs"
                >
                  {feedback}
                </div>
              )}
              {!feedback && (
                <p className="opacity-100 italic block">
                  Não tem cadastro?{" "}
                  <a
                    className="text-sky-500 hover:underline scale opacity-100"
                    href="/cadastro"
                  >
                    Cadastre-se
                  </a>
                </p>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 focus:outline-none focus:shadow-outline cursor-pointer"
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </div>
        </div>
    );
}