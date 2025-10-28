// src/types/dto.ts

// req -> o que o front envia no POST /auth/login
export type LoginRequestDTO = {
  email: string;
  senha: string;
};

// res -> o que o back devolve se der certo
export type LoginResponseDTO = {
  token: string;
  user: {
    email: string;
    pNome: string;
  };
};

// erro padronizado (combine com o back)
export type ApiErrorDTO = {
  code: string;    // ex: "INVALID_CREDENTIALS"
  message: string; // ex: "Usuário ou senha inválidos"
};

// cadastro -> o front envia dados completos do usuário
export type RegisterRequestDTO = {
  email: string;
  pNome: string;
  senha: string;
};

// sucesso no cadastro reaproveita o mesmo payload de login
export type RegisterResponseDTO = LoginResponseDTO;