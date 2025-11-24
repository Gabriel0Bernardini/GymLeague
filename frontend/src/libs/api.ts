import type { Musculo, GrupoMuscular } from "../pages/InserirExercicio";
import type { Rotina } from "../components/ModalVerRotinas";

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
    ...(headers || {}),
  });

  // só adiciona Content-Type se tiver body (POST/PUT/PATCH)
  if (opts.body) {
    finalHeaders.append("Content-Type", "application/json");
  }

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

  explorarRotinas: {
        listar: () => request<{ rotinas: Rotina[] }>("/explorar-rotinas/", { auth: true }),

        copiar: (rotina: Rotina, novoEmail: string) =>
        request<{ mensagem: string }>("/explorar-rotinas/copiar", {
            method: "POST",
            auth: true, 
            body: JSON.stringify({ rotina, usuarioEmail: novoEmail }),
        }),
    },

  rotinas: {
    listar: () =>
      request<{ id: number; nome: string }[]>("/rotinas/", {
        auth: true,
      }),
    criar: (payload: any) =>
      request("/rotinas/", {
        method: "POST",
        auth: true,
        body: JSON.stringify(payload),
      }),
    
    obter: (nome: string) =>
      request(`/rotinas/${nome}`, {
        auth: true,
    }),
    excluir: (nome: string) =>
    request(`/rotinas/${nome}`, {
      method: "DELETE",
      auth: true,
    }),
    
  },

  exercicios: {
    listar: () => request("/exercicios/", { auth: true }),
  },

  gruposMusculares: {
    listar: () => request("/grupos-musculares/", { auth: true }),
  },

  musculos: {
    listarPorGrupo: (grupo: string) =>
      request(`/musculos/${grupo}`, { auth: true }),
  },
  
  inserirExercicio: {
    carregarDados: () =>
      request<{
        gruposMusculares: GrupoMuscular[];
        musculos: Musculo[];
      }>("/inserirExercicio/", { auth: true }),
    
    criar: (payload: { nome: string; musculos: string[] }) =>
    request("/inserirExercicio/", {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }),
  },
};
