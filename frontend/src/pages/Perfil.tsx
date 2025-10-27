import { FaUser } from "react-icons/fa";
import { useState } from "react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import ValidadorSenha from "../components/ui/ValidadorSenha";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Perfil() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [confirmPassError, setConfirmPassError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    setUserError(null);
    setPassError(null);
    setConfirmPassError(null);

    let hasError = false;

    if (!username.trim()) {
      setUserError("Informe o usuário.");
      hasError = true;
    }
    if (password.length <= 0) {
      setPassError("Insira a sua senha.");
      hasError = true;
    }
    if (confirmPassword.length <= 0) {
      setConfirmPassError("Confirme a sua senha.");
      hasError = true;
    }
    if (password !== confirmPassword) {
      setConfirmPassError("As senhas não coincidem.");
      hasError = true;
    }
    if (!isPasswordValid) {
      setPassError("A senha não atende aos critérios mínimos.");
      hasError = true;
    }

    if (hasError) return;

    try {
      setIsLoading(true);
      await new Promise((r) => setTimeout(r, 1200));
      setFeedback("Atualização realizada com sucesso!");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <div className="max-w-xl w-full bg-white shadow-md rounded px-8 pt-6 pb-8 mb-2">
        <div className="bg-sky-500 shadow-md rounded px-8 pt-6 pb-8">
          <div className="flex items-center justify-center gap-10">
            <span className="text-white text-5xl font-bold">Perfil</span>
            <FaUser className="text-white h-20 w-20" />
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded px-8 pt-6 pb-4"
        >

          <div className="mb-4">
            <Input
              id="NomeUsuario"
              label="Nome do Usuário"
              placeholder="nome antigo"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant={userError ? "error" : "default"}
            />
            {userError && (
              <p className="text-red-500 text-xs italic -mt-3 mb-2">
                {userError}
              </p>
            )}
          </div>
          <div className="mb-4 relative">
            <Input
              id="password"
              label="Senha"
              type={showPassword ? "text" : "password"}
              placeholder="(Senha antiga)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setTimeout(() => setIsPasswordFocused(false), 150)}
              variant={passError ? "error" : "default"}
            />
            <button
              type="button"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((s) => !s)}
              onMouseDown={(e) => e.preventDefault()}
              className="absolute right-3 top-12 transform -translate-y-1/2 text-gray-600 hover:text-gray-900"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>

            {passError && (
              <p className="text-red-500 text-xs italic -mt-3 mb-2">
                {passError}
              </p>
            )}

            {/* Popup de validação da senha */}
            <ValidadorSenha
              password={password}
              visible={isPasswordFocused}
              onValidationChange={setIsPasswordValid}
            />
          </div>

          {/* Confirmação de senha */}
          <div className="mb-4">
            <Input
              id="confirmPassword"
              label="Confirme a Senha"
              type="password"
              placeholder="(Senha antiga)"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              variant={confirmPassError ? "error" : "default"}
            />
            {confirmPassError && (
              <p className="text-red-500 text-xs italic -mt-3 mb-2">
                {confirmPassError}
              </p>
            )}
          </div>

          {/* Botão e feedback */}
          <Button
            type="submit"
            disabled={isLoading}
            className="cursor-pointer text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mt-2 bg-sky-500 hover:bg-sky-600"
          >
            {isLoading ? "Atualizando..." : "Atualizar Perfil"}
          </Button>

          {feedback && (
            <div
              role="status"
              aria-live="polite"
              className="my-2 text-green-700 text-1xs"
            >
              {feedback}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
