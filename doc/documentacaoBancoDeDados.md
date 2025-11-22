# Documentação do Banco de Dados **gymLeague**

Abaixo está a documentação detalhada de todas as tabelas, seus atributos, chaves primárias, chaves estrangeiras e restrições relevantes. O objetivo é fornecer uma visão clara e organizada da estrutura do banco de dados para facilitar o entendimento da equipe.

---

## **Tabela: Usuario**

**Descrição:** Armazena informações básicas dos usuários.

**Atributos:**

* **pNome** (VARCHAR(100)) — *não nulo*. Nome do usuário.
* **email** (VARCHAR(100)) — *PRIMARY KEY*. Identificador único do usuário.
* **senha** (VARCHAR(100)) — *não nulo*. Senha de acesso.
* **dataNascimento** (DATE) — Data de nascimento.
* **peso** (FLOAT) — Peso do usuário. *Deve ser >= 0*.
* **altura** (FLOAT) — Altura do usuário. *Deve ser >= 0*.
* **percentual_gordura** (FLOAT) — Percentual de gordura corporal. *Deve estar entre 0 e 1*.
* **f_nomeRotinaUsando** (VARCHAR(100)) — Nome da rotina que o usuário está seguindo.
* **fEmail_criadorRotina** (VARCHAR(100)) — Email do criador da rotina.

**Chaves Estrangeiras:**

* (**f_nomeRotinaUsando**, **fEmail_criadorRotina**) → **Rotina(nome, fEmail_usuarioCriador)** (*ON DELETE SET NULL*).

**Restrições Importantes:**

* Peso, altura e percentual de gordura não podem ser negativos.
* Percentual de gordura deve ser no máximo 1.

---

## **Tabela: Rotina**

**Descrição:** Representa rotinas de treino criadas por usuários.

**Atributos:**

* **nome** (VARCHAR(100)) — Nome da rotina.
* **fEmail_usuarioCriador** (VARCHAR(100)) — Email do usuário criador.
* **publico** (BOOLEAN) — Indica se a rotina é pública.

**Chave Primária:**

* (**nome**, **fEmail_usuarioCriador**)

**Chaves Estrangeiras:**

* **fEmail_usuarioCriador** → **Usuario(email)** (*ON DELETE CASCADE*)

---

## **Tabela: Metas**

**Descrição:** Metas definidas pelos usuários relacionadas a peso, carga, repetições etc.

**Atributos:**

* **titulo** (VARCHAR(100)) — Título da meta.
* **objetivo** (FLOAT) — *não nulo*, *> 0*. Valor da meta.
* **descricao** (VARCHAR(100)) — Descrição da meta.
* **tipo** (CHAR) — Tipo da meta.
* **fk_emailUsuario** (VARCHAR(100)) — Email do usuário.

**Chave Primária:**

* (**titulo**, **fk_emailUsuario**)

**Chave Estrangeira:**

* **fk_emailUsuario** → **Usuario(email)** (*ON DELETE CASCADE*)

**Restrições:**

* O objetivo deve ser maior que 0.

---

## **Tabela: Treino**

**Descrição:** Lista treinos criados por usuários.

**Atributos:**

* **nome** (VARCHAR(100)) — Nome do treino.
* **fEmail_usuarioCriador** (VARCHAR(100)) — Criador do treino.
* **publico** (BOOLEAN) — Indica se o treino é público.

**Chave Primária:**

* (**nome**, **fEmail_usuarioCriador**)

**Chave Estrangeira:**

* **fEmail_usuarioCriador** → **Usuario(email)** (*ON DELETE CASCADE*)

---

## **Tabela: UsuarioTreino**

**Descrição:** Registra quando um usuário realizou um treino.

**Atributos:**

* **dataDoTreino** (DATE) — *não nulo*. Data da realização.
* **fkEmail_CriadorTreino** (VARCHAR(100)) — Email do criador do treino.
* **fkNomeTreino** (VARCHAR(100)) — Nome do treino.
* **fEmail_UsuarioTreino** (VARCHAR(100)) — Email do usuário que treinou.

**Chave Primária:**

* (**fkNomeTreino**, **fkEmail_CriadorTreino**, **fEmail_UsuarioTreino**, **dataDoTreino**)

**Chaves Estrangeiras:**

* **fEmail_UsuarioTreino** → **Usuario(email)** (*ON DELETE CASCADE*)
* (**fkNomeTreino**, **fkEmail_CriadorTreino**) → **Treino(nome, fEmail_usuarioCriador)** (*ON DELETE CASCADE*)

---

## **Tabela: TreinoRotina**

**Descrição:** Liga treinos a rotinas.

**Atributos:**

* **fkEmail_CriadorTreino** (VARCHAR(100))
* **fkNomeTreino** (VARCHAR(100))
* **fkEmail_CriadorRotina** (VARCHAR(100))
* **fkNomeRotina** (VARCHAR(100))

**Chave Primária:**

* (**fkEmail_CriadorTreino**, **fkNomeTreino**, **fkEmail_CriadorRotina**, **fkNomeRotina**)

**Chaves Estrangeiras:**

* (**fkEmail_CriadorTreino**, **fkNomeTreino**) → **Treino(fEmail_usuarioCriador, nome)**
* (**fkEmail_CriadorRotina**, **fkNomeRotina**) → **Rotina(fEmail_usuarioCriador, nome)**

---

## **Tabela: Exercicio**

**Descrição:** Catálogo de exercícios disponíveis.

**Atributos:**

* **nome** (VARCHAR(100)) — *PRIMARY KEY*

---

## **Tabela: TreinoExercicio**

**Descrição:** Liga exercícios a treinos e define número de séries e descrição.

**Atributos:**

* **num_Series** (INT) — *> 0*.
* **descricao** (VARCHAR(100)) — Descrição.
* **fkEmail_CriadorTreino** (VARCHAR(100))
* **fkNomeTreino** (VARCHAR(100))
* **fkNomeExercicio** (VARCHAR(100))

**Chave Primária:**

* (**fkNomeTreino**, **fkEmail_CriadorTreino**, **fkNomeExercicio**)

**Chaves Estrangeiras:**

* (**fkNomeTreino**, **fkEmail_CriadorTreino**) → **Treino(nome, fEmail_usuarioCriador)**
* **fkNomeExercicio** → **Exercicio(nome)**

**Restrições:**

* `num_Series` deve ser maior que 0.

---

## **Tabela: GrupoMuscular**

**Descrição:** Lista grupos musculares disponíveis de forma genérica.

**Atributos:**

* **nome** (VARCHAR(100)) — *PRIMARY KEY*. Nome do grupo muscular.

---

## **Tabela: Musculo**

**Descrição:** Lista músculos e associa cada músculo a um grupo muscular.

**Atributos:**

* **nome** (VARCHAR(100)) — *PRIMARY KEY*. Nome do músculo.
* **fk_nomeGrupoMuscular** (VARCHAR(100)) — Grupo muscular ao qual pertence.

**Chave Estrangeira:**

* **fk_nomeGrupoMuscular** → **GrupoMuscular(nome)** (*ON DELETE CASCADE, ON UPDATE CASCADE*)

---

## **Tabela: ExercicioMusculo**

**Descrição:** Liga exercícios aos músculos trabalhados.

**Atributos:**

* **fk_nomeExercicio** (VARCHAR(100))
* **fk_nomeMusculo** (VARCHAR(100))

**Chave Primária:**

* (**fk_nomeExercicio**, **fk_nomeMusculo**)

**Chaves Estrangeiras:**

* **fk_nomeExercicio** → **Exercicio(nome)**
* **fk_nomeMusculo** → **Musculo(nome)**

---

## **Tabela: Serie**

**Descrição:** Registra séries realizadas em treinos.

**Atributos:**

* **numero** (INT) — Número identificador da série.
* **detalhe** (VARCHAR(100)) — Descrição opcional.
* **repeticoes** (INT) — *não nulo*, *>= 0*.
* **carga** (FLOAT) — *não nulo*, *>= 0*.
* **fk_nomeExercicio** (VARCHAR(100)) — Exercício usado.
* **fkNomeTreino** (VARCHAR(100)) — Treino.
* **fkEmail_CriadorTreino** (VARCHAR(100)) — Criador do treino.
* **fEmail_UsuarioTreino** (VARCHAR(100)) — Usuário que treinou.
* **fk_dataDoTreino** (DATE) — Data do treino.
* **fk_tituloMeta** (VARCHAR(100)) — Meta vinculada.

**Chave Primária:**

* (**numero**, **fk_nomeExercicio**, **fkNomeTreino**, **fkEmail_CriadorTreino**, **fEmail_UsuarioTreino**, **fk_dataDoTreino**)

**Chaves Estrangeiras:**

* (**fk_tituloMeta**, **fEmail_UsuarioTreino**) → **Metas(titulo, fk_emailUsuario)**
* **fk_nomeExercicio** → **Exercicio(nome)**
* (**fkNomeTreino**, **fkEmail_CriadorTreino**, **fEmail_UsuarioTreino**, **fk_dataDoTreino**) → **UsuarioTreino**

**Restrições:**

* Repetições e carga devem ser >= 0.

---

## **Tabela: ExercicioMetaSerie**

**Descrição:** Relaciona metas com exercícios e séries concluídas.

**Atributos:**

* **dataConclusao** (DATE) — Data de conclusão.
* **descricao** (VARCHAR(100)) — Detalhes.
* **fk_tituloMeta** (VARCHAR(100))
* **fk_nomeExercicio** (VARCHAR(100))
* **fk_numeroSerie** (INT)

**Chave Primária:**

* (**fk_tituloMeta**, **fk_nomeExercicio**, **fk_numeroSerie**)

**Chaves Estrangeiras:**

* **fk_tituloMeta** → **Metas(titulo)**
* **fk_nomeExercicio** → **Exercicio(nome)**
* **fk_numeroSerie** → **Serie(numero)**

---

## **Tabela: HistoricoUsuario**

**Descrição:** Armazena o histórico de peso dos usuários ao longo do tempo.

**Atributos:**

* **peso** (FLOAT) — Peso registrado do usuário.
* **dataPesagem** (DATE) — Data da pesagem.
* **fkEmailUsuario** (VARCHAR(100)) — Email do usuário.

**Chave Primária:**

* (**peso**, **dataPesagem**, **fkEmailUsuario**)

**Chave Estrangeira:**

* **fkEmailUsuario** → **Usuario(email)** (*ON DELETE CASCADE, ON UPDATE CASCADE*)

---

## **Tabela: RankingMusculo**

**Descrição:** Armazena o ranking de cada músculo para cada usuário.

**Atributos:**

* **ranking** (VARCHAR(100)) — Nível de ranking atribuído ao músculo pelo usuário.
* **f_emailUsuario** (VARCHAR(100)) — Email do usuário.
* **f_nomeMusculo** (VARCHAR(100)) — Nome do músculo.

**Chave Primária:**

* (**f_emailUsuario**, **f_nomeMusculo**)

**Chaves Estrangeiras:**

* **f_emailUsuario** → **Usuario(email)** (*ON DELETE CASCADE, ON UPDATE CASCADE*)
* **f_nomeMusculo** → **Musculo(nome)** (*ON DELETE CASCADE, ON UPDATE CASCADE*)

---

## **Tabela: RankingGrupoMuscular**

**Descrição:** Armazena o ranking de cada grupo muscular para cada usuário.

**Atributos:**

* **ranking** (VARCHAR(100)) — Nível de ranking atribuído ao grupo pelo usuário.
* **f_emailUsuario** (VARCHAR(100)) — Email do usuário.
* **f_nomeGrupo** (VARCHAR(100)) — Nome do grupo muscular.

**Chave Primária:**

* (**f_emailUsuario**, **f_nomeGrupo**)

**Chaves Estrangeiras:**

* **f_emailUsuario** → **Usuario(email)** (*ON DELETE CASCADE, ON UPDATE CASCADE*)
* **f_nomeGrupo** → **GrupoMuscular(nome)** (*ON DELETE CASCADE, ON UPDATE CASCADE*)
