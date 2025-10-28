// src/libs/api.ts

// URL base da API — lida com o ambiente (ex: localhost ou produção)
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

// Define opções extras: auth = se precisa mandar o token
type Options = RequestInit & { auth?: boolean };

/**
 * Função genérica de requisição HTTP.
 * - `path`: endpoint da API (ex: "/auth/login")
 * - `opts`: método, headers, body, etc.
 * - retorna o tipo genérico <T> inferido da resposta (ex: LoginResponseDTO)
 */
async function request<T>(
  path: string,
  { auth, headers, ...opts }: Options = {}
): Promise<T> {
  // cria um header tipado e seguro
  const finalHeaders = new Headers({
    "Content-Type": "application/json",
    ...(headers || {}),
  });

  // se a rota exigir autenticação, anexa o token
  if (auth) {
    const token = localStorage.getItem("token");
    if (token) finalHeaders.append("Authorization", `Bearer ${token}`);
  }

  // faz a requisição
  const res = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers: finalHeaders,
  });

  // tenta interpretar a resposta como JSON
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  // se não deu certo (status 4xx / 5xx), lança erro com info extra
  if (!res.ok) {
    const err = new Error((data && data.message) || `HTTP ${res.status}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err as any).status = res.status;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err as any).body = data;
    throw err;
  }

  // se deu certo, retorna o JSON já tipado
  return data as T;
}

/**
 * Endpoints organizados por domínio (ex: auth, users, workouts, etc.)
 * A ideia é crescer esse objeto à medida que o back evolui.
 */
export const api = {
  auth: {
    login: (payload: import("../type/dto").LoginRequestDTO) =>
      request<import("../type/dto").LoginResponseDTO>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    
    register: (payload: import("../type/dto").RegisterRequestDTO) =>
      request<import("../type/dto").RegisterResponseDTO>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      }),  

    me: () =>
      request<{ email: string; pNome: string }>("/auth/me", {
        auth: true,
      }),
  },
};