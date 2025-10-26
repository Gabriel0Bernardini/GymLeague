import { useState } from "react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { api } from "../libs/api";
import { saveToken } from "../libs/auth";
import { useNavigate } from "react-router-dom";

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
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

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
            setIsLoading(true);
            const res = await api.auth.login({ username, password });
            saveToken(res.token);
            setFeedback("Login realizado com sucesso!");
            navigate("/home");
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
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded shadow-md p-8">
            <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

            {/* role="status" + aria-live ajudam leitores de tela a perceber mensagens dinâmicas */}
            {feedback && (
            <div role="status" aria-live="polite" className="mb-4 text-green-700 text-sm">
                {feedback}
            </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-3">
            <Input
                id="username"
                label="Usuário"
                placeholder="Seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                // quando há erro, mudamos a variante para o estilo vermelho
                variant={userError ? "error" : "default"}
            />
            {/* mensagem de erro específica do username (opcional, pois seu Input já pode exibir) */}
            {userError && <p className="text-red-500 text-xs italic -mt-2 mb-2">{userError}</p>}

            <Input
                id="password"
                label="Senha"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant={passError ? "error" : "default"}
            />
            {/* mensagem de erro específica da senha (opcional) */}
            {passError && <p className="text-red-500 text-xs italic -mt-2 mb-2">{passError}</p>}

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2"
            >
                {isLoading ? "Entrando..." : "Entrar"}
            </Button>
            </form>
        </div>
        </div>
    );
}