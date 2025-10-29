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

export type ApiErrorDTO = {
  code: string;    // ex: "INVALID_CREDENTIALS"
  message: string; // ex: "Usuário ou senha inválidos"
};

export type RegisterRequestDTO = {
  email: string;
  pNome: string;
  senha: string;
};

export type RegisterResponseDTO = LoginResponseDTO;

export type UpdateRequest = RegisterRequestDTO;

export type UpdateResponseDTO = LoginResponseDTO