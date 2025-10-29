const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

type Options = RequestInit & { auth?: boolean };

/**
 * Função genérica de requisição HTTP.
 * -path: endpoint da API (ex: "/auth/login")
 * -opts: método, headers, body, etc.
 * -retorna o tipo genérico <T> vindo da resposta (ex: LoginResponseDTO)
 */
async function request<T>(
  path: string,
  { auth, headers, ...opts }: Options = {}
): Promise<T> {
  const finalHeaders = new Headers({
    "Content-Type": "application/json",
    ...(headers || {}),
  });

  if (auth) {
    const token = localStorage.getItem("token");
    if (token) finalHeaders.append("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers: finalHeaders,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const err = new Error((data && data.message) || `HTTP ${res.status}`);
    (err as any).status = res.status;
    (err as any).body = data;
    throw err;
  }

  return data as T;
}


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

    update: (payload:  import("../type/dto").UpdateRequest) =>
      request<import("../type/dto").UpdateResponseDTO>("/auth/update", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    me: () =>
      request<{ email: string; pNome: string }>("/auth/me", {
        auth: true,
      }),
  },
};