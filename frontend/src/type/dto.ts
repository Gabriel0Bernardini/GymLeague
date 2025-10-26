// src/types/dto.ts

// req -> o que o front envia no POST /auth/login
export type LoginRequestDTO = {
  username: string;
  password: string;
};

// res -> o que o back devolve se der certo
export type LoginResponseDTO = {
  token: string;
  user: {
    id: string;
    username: string;
    name: string;
  };
};

// erro padronizado (combine com o back)
export type ApiErrorDTO = {
  code: string;    // ex: "INVALID_CREDENTIALS"
  message: string; // ex: "Usuário ou senha inválidos"
};