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

  users: {
    get: (email: string) =>
      request<{
        email: string;
        pNome: string;
        dataNascimento: string | null;
        peso: number | null;
        altura: number | null;
        percentual_gordura: number | null;
      }>(`/users/${email}`, { auth: true }),
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

    editar: (nomeAntigo: string, payload: any) =>
    request(`/rotinas/${encodeURIComponent(nomeAntigo)}`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(payload),
    }),
    
  },

  metas: {
    listar: (usuarioEmail: string) =>
      request<any[]>("/metas/", {
        method: "POST",
        auth: true,
        body: JSON.stringify({ usuarioEmail }),
      }),

    criar: (payload: {
      usuarioEmail: string;
      titulo: string;
      descricao: string;
      valorMeta: number;
      tipoMeta: string;
    }) =>
      request("/metas/criar", {
        method: "POST",
        auth: true,
        body: JSON.stringify(payload),
      }),

    editar: (payload: {
      usuarioEmail: string;
      titulo: string;
      valorMeta: number;
      descricao?: string | null;
      tipoMeta?: string | null;
    }) =>
      request<{ mensagem: string }>("/metas/editar", {
        method: "PUT",
        auth: true,
        body: JSON.stringify(payload),
      }),
      
    excluir: (payload: { usuarioEmail: string; titulo: string }) =>
      request<{ mensagem: string }>("/metas/deletar", {
        method: "DELETE",
        auth: true,
        body: JSON.stringify(payload),
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

  ranking: {
    top3: (usuarioEmail: string) =>
        request<{ musculo: string; ranking: string; pontuacao: number }[] >(
            "/ranking/top3",
            {
                method: "POST",
                auth: true,
                body: JSON.stringify({ usuarioEmail })
            }
        ),

    todos: (usuarioEmail: string) =>
      request<{
        grupos: Record<string, { 
          rankingGrupo: string;
          musculos: { musculo: string; ranking: string }[]
        }>
      }>("/ranking/todos", {
          method: "POST",
          auth: true,
          body: JSON.stringify({ usuarioEmail })
      }),
  },
  
  editar: {
    peso: (usuarioEmail: string, peso: number) =>
      request<{ mensagem: string }>("/editar/peso", {
        method: "POST",
        auth: true,
        body: JSON.stringify({ usuarioEmail, peso }),
      }),
    percentualGordura: (usuarioEmail: string, percentual_gordura: number) =>
      request<{ mensagem: string }>("/editar/percentual_gordura", {
        method: "POST",
        auth: true,
        body: JSON.stringify({ usuarioEmail, percentual_gordura }),
      }),
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
  treinar: {
    getTreinosDaRotina: (emailCriador: string, nomeRotina: string) =>
      request<any>(`/treinar/rotina/${encodeURIComponent(emailCriador)}/${encodeURIComponent(nomeRotina)}`, { auth: true }),

    iniciar: (payload: { nome_treino: string; email_criador_treino: string }) =>
      request<any>(`/treinar/iniciar`, { method: "POST", auth: true, body: JSON.stringify(payload) }),

    getExercicios: (emailCriador: string, nomeTreino: string) =>
      request<any>(`/treinar/exercicios/${encodeURIComponent(emailCriador)}/${encodeURIComponent(nomeTreino)}`, { auth: true }),

    getSeries: (emailCriador: string, nomeTreino: string) =>
      request<any>(`/treinar/series/${encodeURIComponent(emailCriador)}/${encodeURIComponent(nomeTreino)}`, { auth: true }),

    inserirSerie: (payload: any) =>
      request<any>(`/treinar/serie`, { method: "POST", auth: true, body: JSON.stringify(payload) }),

    atualizarSerie: (payload: any) =>
      request<any>(`/treinar/serie`, { method: "PUT", auth: true, body: JSON.stringify(payload) }),

    deletarSerie: (payload: any) =>
      request<any>(`/treinar/serie`, { method: "DELETE", auth: true, body: JSON.stringify(payload) }),
  },
  evolucao: {
    pesoCorporal: () =>
      request<{ pesagens: { peso: number; dataPesagem: string }[] }>(
        "/evolucao/pesoCorporal",
        { auth: true }
      ),

    percentualGordura: () =>
      request<{ gordura: { percentual_gordura: number; dataPesagem: string }[] }>(
        "/evolucao/percentualGordura",
        { auth: true }
      ),

    treinoCompletoData: () =>
      request<{
        nomeTreino: string;
        nomeRotina: string | null;
        dataDoTreino: string;
        exercicios: {
          nome: string;
          numeroSeries: number;
          series: {
            numero: number;
            detalhe: string;
            repeticoes: number;
            carga: number;
          }[];
        }[];
      }[]>("/evolucao/treinoCompletoData", { auth: true }),

    exerciciosRealizados: () =>
      request<{
        exercicios: { nome: string; ultimaData: string | null }[];
      }>("/evolucao/exerciciosRealizados", { auth: true }),

    evolucaoExercicio: (nomeExercicio: string) =>
      request<{
        exercicio: string;
        evolucao: {
          data: string;
          nomeTreino: string;
          pesoMaximo: number;
          repeticoes: number[];
        }[];
      }>(`/evolucao/evolucaoExercicio/${encodeURIComponent(nomeExercicio)}`, {
        auth: true,
      }),
  },  
  home: {
    pesoPercentual: () =>
      request<{ peso: number | null; percentual_gordura: number | null }>(
        "/peso_percentual",
        { auth: true }
      ),

    ranking: () => request<{ message?: string }>("/ranking", { auth: true }),

    metas: () =>
      request<{
        meta?: {
          titulo?: string;
          objetivo?: number;
          tipo?: string;
          valorInicial?: number | null;
        };
        usuario?: {
          peso?: number;
          percentual_gordura?: number;
        };
        percentComplete?: number;
        valorAtual?: number;
        message?: string;
      }>("/metas", { auth: true }),
    ultimoTreino: () =>
      request<{
        dataDoTreino?: string;
        nomeDoTreino?: string;
        nomeDaRotina?: string | null;
        proximosTreinos?: string[];
        message?: string;
      }>("/ultimo_treino", { auth: true }),
  },
};
