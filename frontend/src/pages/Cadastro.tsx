import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import ValidadorSenha from "../components/ui/ValidadorSenha";
import { api } from "../libs/api";
import { saveToken } from "../libs/auth";

type FeedbackState = {
  message: string;
  variant: "success" | "error";
};

export default function Cadastro() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [nomeError, setNomeError] = useState<string | null>(null);
  const [senhaError, setSenhaError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [confirmSenhaError, setConfirmSenhaError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    setNomeError(null);
    setSenhaError(null);
    setEmailError(null);
    setConfirmSenhaError(null);

    let hasError = false;

    if (!nome.trim()) {
      setNomeError("Informe o nome.");
      hasError = true;
    }
    if (!email.trim()) {
      setEmailError("Informe o email.");
      hasError = true;
    }
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Por favor, insira um email válido: exemplo@dominio.com");
      hasError = true;
    }
    if (senha.length === 0) {
      setSenhaError("Insira a sua senha.");
      hasError = true;
    }
    if (confirmSenha.length === 0) {
      setConfirmSenhaError("Confirme a sua senha.");
      hasError = true;
    }
    if (senha && confirmSenha && senha !== confirmSenha) {
      setConfirmSenhaError("As senhas não coincidem.");
      hasError = true;
    }
    if (!isPasswordValid) {
      setSenhaError("A senha não atende aos critérios mínimos.");
      hasError = true;
    }

    if (hasError) return;

    try {
      setIsLoading(true);
      const res = await api.auth.register({ email, pNome: nome, senha });
      saveToken(res.token);
      navigate("/home", { replace: true });
    } catch (err) {
      const status = (err as { status?: number }).status;
      const body = (err as { body?: { code?: string } }).body;
      if (status === 409 || body?.code === "EMAIL_ALREADY_EXISTS") {
        setEmailError("Email já cadastrado.");
      } else {
        setFeedback({
          message: "Falha ao cadastrar. Tente novamente.",
          variant: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <div className="max-w-xl w-full bg-white shadow-md rounded px-8 pt-6 pb-8 mb-2">
        <div className="bg-sky-500 shadow-md rounded px-8 pt-6 pb-8">
          <div className="flex items-center justify-center gap-10">
            <span className="text-white text-5xl font-bold">GymLeague</span>
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded px-8 pt-6 pb-4"
        >
          <div className="mb-4">
            <Input
              id="nome"
              label="Nome"
              placeholder="Felipe Princi"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              variant={nomeError ? "error" : "default"}
            />
            {nomeError && (
              <p className="text-red-500 text-xs italic -mt-3 mb-2">
                {nomeError}
              </p>
            )}
          </div>
          <div className="mb-4">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="felipeprinci@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant={emailError ? "error" : "default"}
            />
            {emailError && (
              <p className="text-red-500 text-xs italic -mt-3 mb-2">
                {emailError}
              </p>
            )}
          </div>
          <div className="mb-4 relative">
            <Input
              id="senha"
              label="Senha"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value);
              }}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setTimeout(() => setIsPasswordFocused(false), 150)}
              variant={senhaError ? "error" : "default"}
            />
            <button
              type="button"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((s) => !s)}
              onMouseDown={(event) => event.preventDefault()}
              className="absolute right-3 top-12 transform -translate-y-1/2 text-gray-600 hover:text-gray-900 text-xs font-semibold"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
            {senhaError && (
              <p className="text-red-500 text-xs italic -mt-3 mb-2">
                {senhaError}
              </p>
            )}
            <ValidadorSenha
              password={senha}
              visible={isPasswordFocused}
              onValidationChange={setIsPasswordValid}
            />
          </div>
          <div className="mb-4">
            <Input
              id="confirmSenha"
              label="Confirme a Senha"
              type="password"
              placeholder="••••••••"
              value={confirmSenha}
              onChange={(e) => setConfirmSenha(e.target.value)}
              variant={confirmSenhaError ? "error" : "default"}
            />
            {confirmSenhaError && (
              <p className="text-red-500 text-xs italic -mt-3 mb-2">
                {confirmSenhaError}
              </p>
            )}
          </div>
          {feedback && (
            <div
              role="status"
              aria-live="polite"
              className={`my-2 text-sm ${feedback.variant === "error" ? "text-red-600" : "text-green-700"}`}
            >
              {feedback.message}
            </div>
          )}
          <p className="opacity-100 italic block">
            Já tem uma conta?{" "}
            <Link className="text-sky-500 hover:underline" to="/login">
              Login
            </Link>
          </p>
          <Button
            type="submit"
            disabled={isLoading}
            className="cursor-pointer text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mt-2"
          >
            {isLoading ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
