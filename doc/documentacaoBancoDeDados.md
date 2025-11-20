# Documentação do Banco de Dados **gymLeague**

Abaixo está a documentação detalhada de todas as tabelas, seus atributos, chaves primárias, chaves estrangeiras e restrições relevantes. O objetivo é fornecer uma visão clara e organizada da estrutura do banco de dados para facilitar o entendimento da equipe.

---

## **Tabela: Usuario**
**Descrição:** Armazena informações básicas dos usuários.

**Atributos:**
- **pNome** (VARCHAR(100)) — *não nulo*. Nome do usuário.
- **email** (VARCHAR(100)) — *PRIMARY KEY*. Identificador único do usuário.
- **senha** (VARCHAR(100)) — *não nulo*. Senha de acesso.
- **dataNascimento** (DATE) — Data de nascimento.
- **peso** (FLOAT) — Peso do usuário. *Deve ser >= 0*.
- **altura** (FLOAT) — Altura do usuário. *Deve ser >= 0*.
- **percentual_gordura** (FLOAT) — Percentual de gordura corporal. *Deve estar entre 0 e 1*.
- **f_nomeRotinaUsando** (VARCHAR(100)) — Nome da rotina que o usuário está seguindo.
- **fEmail_criadorRotina** (VARCHAR(100)) — Email do criador da rotina.

**Chaves Estrangeiras:**
- (**f_nomeRotinaUsando**, **fEmail_criadorRotina**) → **Rotina(nome, fEmail_usuarioCriador)** (*ON DELETE SET NULL*).

**Restrições Importantes:**
- Peso, altura e percentual de gordura não podem ser negativos.
- Percentual de gordura deve ser no máximo 1.

---

## **Tabela: Rotina**
**Descrição:** Representa rotinas de treino criadas por usuários.

**Atributos:**
- **nome** (VARCHAR(100)) — Nome da rotina.
- **fEmail_usuarioCriador** (VARCHAR(100)) — Email do usuário criador.

**Chave Primária:**
- (**nome**, **fEmail_usuarioCriador**)

**Chaves Estrangeiras:**
- **fEmail_usuarioCriador** → **Usuario(email)** (*ON DELETE CASCADE*)

---

## **Tabela: Metas**
**Descrição:** Metas definidas pelos usuários relacionadas a peso, carga, repetições etc.

**Atributos:**
- **titulo** (VARCHAR(100)) — Título da meta.
- **objetivo** (FLOAT) — *não nulo*, *> 0*. Valor da meta.
- **descricao** (VARCHAR(100)) — Descrição da meta.
- **tipo** (CHAR) — Tipo da meta.
- **fk_emailUsuario** (VARCHAR(100)) — Email do usuário.

**Chave Primária:**
- (**titulo**, **fk_emailUsuario**)

**Chave Estrangeira:**
- **fk_emailUsuario** → **Usuario(email)** (*ON DELETE CASCADE*)

**Restrições:**
- O objetivo deve ser maior que 0.

---

## **Tabela: Treino**
**Descrição:** Lista treinos criados por usuários.

**Atributos:**
- **nome** (VARCHAR(100)) — Nome do treino.
- **fEmail_usuarioCriador** (VARCHAR(100)) — Criador do treino.

**Chave Primária:**
- (**nome**, **fEmail_usuarioCriador**)

**Chave Estrangeira:**
- **fEmail_usuarioCriador** → **Usuario(email)** (*ON DELETE CASCADE*)

---

## **Tabela: UsuarioTreino**
**Descrição:** Registra quando um usuário realizou um treino.

**Atributos:**
- **dataDoTreino** (DATE) — *não nulo*. Data da realização.
- **fkEmail_CriadorTreino** (VARCHAR(100)) — Email do criador do treino.
- **fkNomeTreino** (VARCHAR(100)) — Nome do treino.
- **fEmail_UsuarioTreino** (VARCHAR(100)) — Email do usuário que treinou.

**Chave Primária:**
- (**fkNomeTreino**, **fkEmail_CriadorTreino**, **fEmail_UsuarioTreino**, **dataDoTreino**)

**Chaves Estrangeiras:**
- **fEmail_UsuarioTreino** → **Usuario(email)** (*ON DELETE CASCADE*)
- (**fkNomeTreino**, **fkEmail_CriadorTreino**) → **Treino(nome, fEmail_usuarioCriador)** (*ON DELETE CASCADE*)

---