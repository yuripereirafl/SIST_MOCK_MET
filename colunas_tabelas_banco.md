# Estrutura de Colunas do Banco de Dados (Dicionário de Dados)

Este documento apresenta a estrutura de todas as tabelas em formato de caixas de texto com linhas alinhadas, facilitando a leitura direta pelo editor.

---

## 1. Módulo: Configuração e Cadastros Base

### Tabela: `unidades_atendimento`
```text
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
| Nome da Coluna    | Tipo de Dado  | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                      |
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
| id                | UUID          | Não   | PK     | uuid_generate_v4()| Identificador único da unidade física.   |
| nome_unidade      | VARCHAR(100)  | Não   | Unique | -                 | Nome da unidade (ex: 'Paulista').        |
| cidade            | VARCHAR(100)  | Não   | -      | -                 | Cidade onde a filial está localizada.    |
| estado            | VARCHAR(2)    | Não   | -      | -                 | UF (Sigla do estado com 2 letras).       |
| ativo             | BOOLEAN       | Não   | -      | TRUE              | Status de funcionamento da unidade.      |
| criado_em         | TIMESTAMPTZ   | Não   | -      | CURRENT_TIMESTAMP | Data/hora de registro da unidade.        |
| atualizado_em     | TIMESTAMPTZ   | Não   | -      | CURRENT_TIMESTAMP | Data/hora da última atualização.         |
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
```

### Tabela: `cargos`
```text
+----------------------------+---------------+-------+--------+-------------------+------------------------------------+
| Nome da Coluna             | Tipo de Dado  | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                |
+----------------------------+---------------+-------+--------+-------------------+------------------------------------+
| id                         | UUID          | Não   | PK     | uuid_generate_v4()| Identificador único do cargo.      |
| titulo                     | VARCHAR(100)  | Não   | Unique | -                 | Nome descritivo (ex: 'Operador').  |
| salario_base               | NUMERIC(10,2) | Não   | -      | 0.00              | Salário base mensal bruto.         |
| comissao_padrao_percentual | NUMERIC(5,2)  | Não   | -      | 0.00              | Comissão padrão deste cargo.       |
| criado_em                  | TIMESTAMPTZ   | Não   | -      | CURRENT_TIMESTAMP | Data de cadastro do cargo.         |
+----------------------------+---------------+-------+--------+-------------------+------------------------------------+
```

### Tabela: `categorias_servicos`
```text
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
| Nome da Coluna    | Tipo de Dado  | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                      |
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
| id                | UUID          | Não   | PK     | uuid_generate_v4()| Identificador único da categoria.        |
| codigo_slug       | VARCHAR(50)   | Não   | Unique | -                 | Rótulo em minúsculas (ex: 'odonto').     |
| nome              | VARCHAR(100)  | Não   | -      | -                 | Nome exibido da categoria.               |
| cor_hex_ui        | VARCHAR(7)    | Sim   | -      | '#6366f1'         | Código de cor para os gráficos da UI.    |
| criado_em         | TIMESTAMPTZ   | Não   | -      | CURRENT_TIMESTAMP | Data de cadastro da categoria.           |
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
```

### Tabela: `servicos`
```text
+---------------------+---------------+-------+--------+-------------------+----------------------------------------+
| Nome da Coluna      | Tipo de Dado  | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                    |
+---------------------+---------------+-------+--------+-------------------+----------------------------------------+
| id                  | UUID          | Não   | PK     | uuid_generate_v4()| Identificador único do serviço.        |
| categoria_id        | UUID          | Não   | FK     | -                 | Relacionado com categorias_servicos.   |
| codigo_procedimento | VARCHAR(50)   | Não   | Unique | -                 | Código interno do exame (ex: 'EX-01'). |
| nome                | VARCHAR(150)  | Não   | -      | -                 | Nome do exame (ex: 'Raio-X Tórax').    |
| valor_tabela        | NUMERIC(10,2) | Não   | -      | -                 | Preço base sugerido de faturamento.    |
| ativo               | BOOLEAN       | Não   | -      | TRUE              | Define se serviço está ativo.          |
| criado_em           | TIMESTAMPTZ   | Não   | -      | CURRENT_TIMESTAMP | Data de inserção do serviço.           |
+---------------------+---------------+-------+--------+-------------------+----------------------------------------+
```

---

## 2. Módulo: Segurança e Acesso (RBAC)

### Tabela: `perfis_acesso`
```text
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
| Nome da Coluna    | Tipo de Dado  | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                      |
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
| id                | UUID          | Não   | PK     | uuid_generate_v4()| Identificador único do perfil de acesso. |
| nome_perfil       | VARCHAR(50)   | Não   | Unique | -                 | Função (Administrador, Lider, Operador).|
| descricao         | TEXT          | Sim   | -      | -                 | Descritivo detalhado do perfil.          |
| criado_em         | TIMESTAMPTZ   | Não   | -      | CURRENT_TIMESTAMP | Data de criação do perfil.               |
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
```

### Tabela: `permissoes`
```text
+------------------+--------------+-------+--------+-------------------+--------------------------------------------+
| Nome da Coluna   | Tipo de Dado | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                        |
+------------------+--------------+-------+--------+-------------------+--------------------------------------------+
| id               | UUID         | Não   | PK     | uuid_generate_v4()| Identificador único da permissão.          |
| chave_permissao  | VARCHAR(100) | Não   | Unique | -                 | Código usado no código (ex: 'metas:edit'). |
| descricao        | VARCHAR(200) | Não   | -      | -                 | Descrição amigável da ação permitida.      |
+------------------+--------------+-------+--------+-------------------+--------------------------------------------+
```

### Tabela: `permissoes_perfis`
```text
+------------------+--------------+-------+--------+-------------------+--------------------------------------------+
| Nome da Coluna   | Tipo de Dado | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                        |
+------------------+--------------+-------+--------+-------------------+--------------------------------------------+
| perfil_id        | UUID         | Não   | PK, FK | -                 | Relaciona com perfis_acesso.               |
| permissao_id     | UUID         | Não   | PK, FK | -                 | Relaciona com permissoes.                  |
+------------------+--------------+-------+--------+-------------------+--------------------------------------------+
```

### Tabela: `usuarios_portal`
```text
+-----------------+--------------+-------+--------+-------------------+---------------------------------------------+
| Nome da Coluna  | Tipo de Dado | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                         |
+-----------------+--------------+-------+--------+-------------------+---------------------------------------------+
| id              | UUID         | Não   | PK     | uuid_generate_v4()| Identificador da conta de login.            |
| colaborador_id  | UUID         | Sim   | FK     | -                 | Relaciona com colaboradores (se aplicável). |
| email           | VARCHAR(150) | Não   | Unique | -                 | Endereço de e-mail usado para login.        |
| senha_hash      | VARCHAR(255) | Não   | -      | -                 | Senha armazenada criptografada.             |
| perfil_id       | UUID         | Não   | FK     | -                 | Relaciona com perfis_acesso.                |
| ativo           | BOOLEAN      | Não   | -      | TRUE              | Define se a conta está liberada.            |
| bloqueado_ate   | TIMESTAMPTZ  | Sim   | -      | -                 | Horário até quando o login está suspenso.   |
| criado_em       | TIMESTAMPTZ  | Não   | -      | CURRENT_TIMESTAMP | Data de cadastro do usuário.                |
| atualizado_em   | TIMESTAMPTZ  | Não   | -      | CURRENT_TIMESTAMP | Data da última alteração de senha/dados.    |
+-----------------+--------------+-------+--------+-------------------+---------------------------------------------+
```

### Tabela: `registros_acesso`
```text
+------------------+--------------+-------+--------+-------------------+--------------------------------------------+
| Nome da Coluna   | Tipo de Dado | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                        |
+------------------+--------------+-------+--------+-------------------+--------------------------------------------+
| id               | UUID         | Não   | PK     | uuid_generate_v4()| ID do log de acesso.                       |
| usuario_id       | UUID         | Sim   | FK     | -                 | Usuário que efetuou login.                 |
| ip_origem        | VARCHAR(45)  | Não   | -      | -                 | IP do cliente que efetuou o acesso.        |
| user_agent       | TEXT         | Sim   | -      | -                 | Sistema e navegador do usuário.            |
| sucesso          | BOOLEAN      | Não   | -      | -                 | TRUE se logou com sucesso, FALSE se errou. |
| data_login       | TIMESTAMPTZ  | Não   | -      | CURRENT_TIMESTAMP | Hora exata da tentativa de acesso.         |
+------------------+--------------+-------+--------+-------------------+--------------------------------------------+
```

---

## 3. Módulo: Estrutura Organizacional

### Tabela: `colaboradores`
```text
+-------------------+--------------+-------+--------+-------------------+-------------------------------------------+
| Nome da Coluna    | Tipo de Dado | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                       |
+-------------------+--------------+-------+--------+-------------------+-------------------------------------------+
| id                | UUID         | Não   | PK     | uuid_generate_v4()| Identificador único do funcionário.       |
| matricula         | VARCHAR(50)  | Não   | Unique | -                 | Matrícula interna da empresa.             |
| nome_completo     | VARCHAR(200) | Não   | -      | -                 | Nome civil completo.                      |
| nome_exibicao     | VARCHAR(100) | Não   | -      | -                 | Nome resumido para uso nas telas.         |
| iniciais          | VARCHAR(4)   | Não   | -      | -                 | Sigla para o avatar (ex: 'MC').           |
| email             | VARCHAR(150) | Não   | Unique | -                 | E-mail do funcionário.                    |
| cpf               | VARCHAR(14)  | Não   | Unique | -                 | CPF do funcionário (formatado).           |
| cargo_id          | UUID         | Não   | FK     | -                 | Relaciona com cargos.                     |
| nivel_experiencia | VARCHAR(50)  | Não   | -      | -                 | Nível (ex: 'Júnior', 'Pleno', 'Sênior').  |
| tipo_contrato     | VARCHAR(50)  | Não   | -      | -                 | Modalidade (ex: 'CLT', 'PJ').             |
| status_emprego    | VARCHAR(50)  | Não   | -      | 'Ativo'           | Situação (ex: 'Ativo', 'Desligado').      |
| data_admissao     | DATE         | Não   | -      | -                 | Data de contratação do colaborador.        |
| data_desligamento | DATE         | Sim   | -      | -                 | Data do encerramento do contrato.         |
| criado_em         | TIMESTAMPTZ  | Não   | -      | CURRENT_TIMESTAMP | Data de inserção do cadastro.             |
| atualizado_em     | TIMESTAMPTZ  | Não   | -      | CURRENT_TIMESTAMP | Data da última alteração de cadastro.     |
+-------------------+--------------+-------+--------+-------------------+-------------------------------------------+
```

### Tabela: `equipes`
```text
+-------------------+--------------+-------+--------+-------------------+-------------------------------------------+
| Nome da Coluna    | Tipo de Dado | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                       |
+-------------------+--------------+-------+--------+-------------------+-------------------------------------------+
| id                | UUID         | Não   | PK     | uuid_generate_v4()| Identificador único do time/equipe.       |
| nome_equipe       | VARCHAR(100) | Não   | Unique | -                 | Nome da equipe (ex: 'Unidade Canoas').    |
| lider_id          | UUID         | Sim   | FK     | -                 | Colaborador líder imediato da equipe.     |
| gerente_id        | UUID         | Sim   | FK     | -                 | Colaborador gerente responsável geral.    |
| ativo             | BOOLEAN      | Não   | -      | TRUE              | Define se a equipe está ativa.            |
| criado_em         | TIMESTAMPTZ  | Não   | -      | CURRENT_TIMESTAMP | Data de registro da equipe.               |
| atualizado_em     | TIMESTAMPTZ  | Não   | -      | CURRENT_TIMESTAMP | Data da última mudança na equipe.         |
+-------------------+--------------+-------+--------+-------------------+-------------------------------------------+
```

### Tabela: `historico_vinculos_equipe`
```text
+-----------------+--------------+-------+--------+-------------------+---------------------------------------------+
| Nome da Coluna  | Tipo de Dado | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                         |
+-----------------+--------------+-------+--------+-------------------+---------------------------------------------+
| id              | UUID         | Não   | PK     | uuid_generate_v4()| Identificador do registro de vínculo.       |
| colaborador_id  | UUID         | Não   | FK     | -                 | Colaborador associado.                      |
| equipe_id       | UUID         | Não   | FK     | -                 | Equipe associada.                           |
| data_inicio     | DATE         | Não   | -      | -                 | Data em que o operador entrou na equipe.    |
| data_fim        | DATE         | Sim   | -      | -                 | Data de saída (NULO se ativo na equipe).    |
| criado_em       | TIMESTAMPTZ  | Não   | -      | CURRENT_TIMESTAMP | Registro do vínculo.                        |
+-----------------+--------------+-------+--------+-------------------+---------------------------------------------+
```

---

## 4. Módulo: Transações D-1 e Contestações

### Tabela: `pacientes`
```text
+-------------------+--------------+-------+--------+-------------------+-------------------------------------------+
| Nome da Coluna    | Tipo de Dado | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                       |
+-------------------+--------------+-------+--------+-------------------+-------------------------------------------+
| id                | UUID         | Não   | PK     | uuid_generate_v4()| Identificador único do paciente.          |
| codigo_prontuario | VARCHAR(50)  | Não   | Unique | -                 | Código de cadastro médico/prontuário.     |
| nome              | VARCHAR(200) | Não   | -      | -                 | Nome completo do cliente/paciente.        |
| telefone          | VARCHAR(20)  | Sim   | -      | -                 | Telefone principal de contato.            |
| criado_em         | TIMESTAMPTZ  | Não   | -      | CURRENT_TIMESTAMP | Data de inclusão na base de dados.        |
+-------------------+--------------+-------+--------+-------------------+-------------------------------------------+
```

### Tabela: `guias_vendas`
```text
+-----------------------------+---------------+-------+--------+-------------------+------------------------------------+
| Nome da Coluna              | Tipo de Dado  | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                |
+-----------------------------+---------------+-------+--------+-------------------+------------------------------------+
| id                          | UUID          | Não   | PK     | uuid_generate_v4()| ID único do agendamento/venda.     |
| guia_numero                 | VARCHAR(100)  | Não   | Unique | -                 | Número/Identificação da guia.      |
| colaborador_id              | UUID          | Não   | FK     | -                 | Vendedor associado.                |
| paciente_id                 | UUID          | Não   | FK     | -                 | Paciente agendado.                 |
| servico_id                  | UUID          | Não   | FK     | -                 | Procedimento agendado.             |
| unidade_id                  | UUID          | Não   | FK     | -                 | Local físico do atendimento.       |
| valor_venda                 | NUMERIC(10,2) | Não   | -      | -                 | Valor real da venda efetuada (R$). |
| data_agendamento            | DATE          | Não   | -      | -                 | Data em que o exame ocorreria.     |
| horario_agendamento         | TIME          | Não   | -      | -                 | Horário do procedimento.           |
| status_atual                | VARCHAR(30)   | Não   | -      | -                 | Confirmado, Cancelado, No-show etc.|
| motivo_cancelamento_no_show | TEXT          | Sim   | -      | -                 | Motivo da não conclusão da venda.  |
| contestada                  | BOOLEAN       | Não   | -      | FALSE             | TRUE se o operador abriu disputa.  |
| justificativa_contestacao   | TEXT          | Sim   | -      | -                 | Justificativa do operador.         |
| status_contestacao          | VARCHAR(30)   | Sim   | -      | 'Nenhuma'         | Pendente, Aprovada, Recusada.      |
| data_contestacao            | TIMESTAMPTZ   | Sim   | -      | -                 | Horário de abertura da disputa.    |
| resposta_liderança          | TEXT          | Sim   | -      | -                 | Justificativa do Líder na decisão. |
| criado_em                   | TIMESTAMPTZ   | Não   | -      | CURRENT_TIMESTAMP | Inserção do registro de venda.     |
| atualizado_em               | TIMESTAMPTZ   | Não   | -      | CURRENT_TIMESTAMP | Data da última mudança de status.  |
+-----------------------------+---------------+-------+--------+-------------------+------------------------------------+
```

### Tabela: `historico_status_guias`
```text
+---------------------+--------------+-------+--------+-------------------+-----------------------------------------+
| Nome da Coluna      | Tipo de Dado | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                     |
+---------------------+--------------+-------+--------+-------------------+-----------------------------------------+
| id                  | UUID         | Não   | PK     | uuid_generate_v4()| Identificador único do log de status.   |
| guia_id             | UUID         | Não   | FK     | -                 | Relacionado a guias_vendas.             |
| status_anterior     | VARCHAR(30)  | Sim   | -      | -                 | Status antigo.                          |
| status_novo         | VARCHAR(30)  | Não   | -      | -                 | Novo status aplicado.                   |
| usuario_modificador | VARCHAR(100) | Não   | -      | -                 | Nome ou ID de quem realizou a alteração.|
| data_modificacao    | TIMESTAMPTZ  | Não   | -      | CURRENT_TIMESTAMP | Data exata da mudança (Auditoria).      |
| motivo_alteracao    | TEXT         | Não   | -      | -                 | Motivo justificado para a alteração.    |
+---------------------+--------------+-------+--------+-------------------+-----------------------------------------+
```

---

## 5. Módulo: Metas, Avaliações e Produtividade

### Tabela: `metas_colaboradores`
```text
+-------------------+---------------+-------+--------+-------------------+----------------------------------------+
| Nome da Coluna    | Tipo de Dado  | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                    |
+-------------------+---------------+-------+--------+-------------------+----------------------------------------+
| id                | UUID          | Não   | PK     | uuid_generate_v4()| Identificador único da meta do ciclo.  |
| colaborador_id    | UUID          | Não   | FK     | -                 | Relaciona com colaboradores.           |
| ano_mes           | VARCHAR(7)    | Não   | Unique*| -                 | Mês e ano da meta (ex: '2026-06').     |
| meta_mensal       | NUMERIC(10,2) | Não   | -      | -                 | Meta mensal global em Reais.           |
| meta_diaria       | NUMERIC(10,2) | Não   | -      | -                 | Meta diária por dia útil trabalhado.   |
| criado_em         | TIMESTAMPTZ   | Não   | -      | CURRENT_TIMESTAMP | Inserção do registro no banco.         |
| atualizado_em     | TIMESTAMPTZ   | Não   | -      | CURRENT_TIMESTAMP | Última alteração na meta.              |
+-------------------+---------------+-------+--------+-------------------+----------------------------------------+
* Nota: A combinação de colaborador_id + ano_mes possui restrição UNIQUE composta.
```

### Tabela: `avaliacoes_satisfacao`
```text
+----------------+--------------+-------+--------+-------------------+----------------------------------------------+
| Nome da Coluna | Tipo de Dado | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                          |
+----------------+--------------+-------+--------+-------------------+----------------------------------------------+
| id             | UUID         | Não   | PK     | uuid_generate_v4()| Identificador único do retorno de satisfação.|
| guia_id        | UUID         | Não   | FK, UQ | -                 | Relaciona com guias_vendas (1:1).            |
| colaborador_id | UUID         | Não   | FK     | -                 | Relaciona com colaboradores (quem atendeu).  |
| nota_nps       | INT          | Sim   | Check  | -                 | Nota avaliada de 0 a 10.                     |
| nota_csat      | INT          | Sim   | Check  | -                 | Estrelas avaliadas de 1 a 5.                 |
| comentario     | TEXT         | Sim   | -      | -                 | Comentários adicionais deixados pelo cliente.|
| data_registro  | TIMESTAMPTZ  | Não   | -      | CURRENT_TIMESTAMP | Data da captação do feedback.                |
+----------------+--------------+-------+--------+-------------------+----------------------------------------------+
```

### Tabela: `ocorrencias`
```text
+------------------+--------------+-------+--------+-------------------+--------------------------------------------+
| Nome da Coluna   | Tipo de Dado | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                        |
+------------------+--------------+-------+--------+-------------------+--------------------------------------------+
| id               | UUID         | Não   | PK     | uuid_generate_v4()| Identificador único da ocorrência.         |
| colaborador_id   | UUID         | Não   | FK     | -                 | Colaborador afastado/em falta.             |
| tipo_ocorrencia  | VARCHAR(50)  | Não   | -      | -                 | Tipo (Atestado médico, Falta, Férias etc.).|
| data_inicio      | DATE         | Não   | -      | -                 | Primeiro dia de ausência.                  |
| data_fim         | DATE         | Não   | -      | -                 | Último dia de ausência.                    |
| observacoes      | TEXT         | Sim   | -      | -                 | Detalhes adicionais (CID do atestado etc.).|
| criado_em        | TIMESTAMPTZ  | Não   | -      | CURRENT_TIMESTAMP | Criação do registro.                       |
+------------------+--------------+-------+--------+-------------------+--------------------------------------------+
```

---

## 6. Módulo: Segurança Avançada e Sessão (Login)

### Tabela: `tokens_sessao`
```text
+----------------+--------------+-------+--------+-------------------+------------------------------------------+
| Nome da Coluna | Tipo de Dado | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                      |
+----------------+--------------+-------+--------+-------------------+------------------------------------------+
| id             | UUID         | Não   | PK     | uuid_generate_v4()| ID único do token.                       |
| usuario_id     | UUID         | Não   | FK     | -                 | Usuário logado.                          |
| token_hash     | VARCHAR(255) | Não   | Unique | -                 | Token JWT ou hash da sessão.             |
| ip_origem      | VARCHAR(45)  | Sim   | -      | -                 | IP que gerou o token.                    |
| user_agent     | TEXT         | Sim   | -      | -                 | Navegador/Dispositivo logado.            |
| expira_em      | TIMESTAMPTZ  | Não   | -      | -                 | Data e hora que a sessão expira.         |
| criado_em      | TIMESTAMPTZ  | Não   | -      | CURRENT_TIMESTAMP | Início da sessão.                        |
+----------------+--------------+-------+--------+-------------------+------------------------------------------+
```

### Tabela: `tokens_recuperacao_senha`
```text
+----------------+--------------+-------+--------+-------------------+------------------------------------------+
| Nome da Coluna | Tipo de Dado | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                      |
+----------------+--------------+-------+--------+-------------------+------------------------------------------+
| id             | UUID         | Não   | PK     | uuid_generate_v4()| ID único da solicitação.                 |
| usuario_id     | UUID         | Não   | FK     | -                 | Usuário solicitante.                     |
| token_hash     | VARCHAR(255) | Não   | Unique | -                 | Token enviado por e-mail.                |
| utilizado      | BOOLEAN      | Não   | -      | FALSE             | Marca se o token já foi consumido.       |
| expira_em      | TIMESTAMPTZ  | Não   | -      | -                 | Validade do link (ex: 2 horas).          |
| criado_em      | TIMESTAMPTZ  | Não   | -      | CURRENT_TIMESTAMP | Data da solicitação.                     |
+----------------+--------------+-------+--------+-------------------+------------------------------------------+
```

---

## 7. Módulo: Corporativo de Longo Prazo

### Tabela: `historico_cargos_colaborador`
```text
+----------------+--------------+-------+--------+-------------------+------------------------------------------+
| Nome da Coluna | Tipo de Dado | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                      |
+----------------+--------------+-------+--------+-------------------+------------------------------------------+
| id             | UUID         | Não   | PK     | uuid_generate_v4()| ID único do histórico.                   |
| colaborador_id | UUID         | Não   | FK     | -                 | Colaborador promovido/alterado.          |
| cargo_id       | UUID         | Não   | FK     | -                 | Novo cargo assumido.                     |
| data_inicio    | DATE         | Não   | -      | -                 | Início da vigência do cargo.             |
| data_fim       | DATE         | Sim   | -      | -                 | Fim da vigência (Nulo se atual).         |
| motivo         | TEXT         | Sim   | -      | -                 | Justificativa (ex: 'Promoção').          |
| criado_em      | TIMESTAMPTZ  | Não   | -      | CURRENT_TIMESTAMP | Data de inserção.                        |
+----------------+--------------+-------+--------+-------------------+------------------------------------------+
```

### Tabela: `metas_equipes`
```text
+----------------+---------------+-------+--------+-------------------+------------------------------------------+
| Nome da Coluna | Tipo de Dado  | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                      |
+----------------+---------------+-------+--------+-------------------+------------------------------------------+
| id             | UUID          | Não   | PK     | uuid_generate_v4()| ID único da meta consolidada.            |
| equipe_id      | UUID          | Não   | FK     | -                 | Equipe avaliada.                         |
| ano_mes        | VARCHAR(7)    | Não   | Unique*| -                 | Ciclo mensal ('YYYY-MM').                |
| meta_mensal    | NUMERIC(10,2) | Não   | -      | -                 | Meta global do grupo.                    |
| meta_diaria    | NUMERIC(10,2) | Não   | -      | -                 | Ritmo exigido por dia para o time todo.  |
| criado_em      | TIMESTAMPTZ   | Não   | -      | CURRENT_TIMESTAMP | Data do cadastro.                        |
+----------------+---------------+-------+--------+-------------------+------------------------------------------+
```

### Tabela: `snapshots_diarios`
```text
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
| Nome da Coluna    | Tipo de Dado  | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                      |
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
| id                | UUID          | Não   | PK     | uuid_generate_v4()| ID do retrato consolidado.               |
| colaborador_id    | UUID          | Não   | FK     | -                 | Vendedor apurado.                        |
| data_referencia   | DATE          | Não   | Unique*| -                 | Dia fechado (ex: ontem).                 |
| total_guias       | INT           | Não   | -      | 0                 | Volume total de guias no dia.            |
| total_confirmadas | INT           | Não   | -      | 0                 | Guias convertidas no dia.                |
| valor_produzido   | NUMERIC(10,2) | Não   | -      | 0                 | Receita em R$ do dia.                    |
| valor_perdido     | NUMERIC(10,2) | Não   | -      | 0                 | Gap financeiro (No-show + Cancelados).   |
| gerado_em         | TIMESTAMPTZ   | Não   | -      | CURRENT_TIMESTAMP | Momento em que o robô salvou o dia.      |
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
```

### Tabelas: `campanhas_incentivo`, `campanhas_regras` & `campanhas_participacoes`
```text
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
| Tabela / Coluna   | Tipo de Dado  | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                      |
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
| campanhas_incentivo                                                                                               |
| id                | UUID          | Não   | PK     | uuid_generate_v4()| ID da campanha.                          |
| nome              | VARCHAR(150)  | Não   | -      | -                 | Nome da campanha.                        |
| descricao         | TEXT          | Sim   | -      | -                 | Descrição detalhada.                     |
| tipo              | VARCHAR(50)   | Não   | -      | -                 | 'Volume', 'Conversao', etc.              |
| data_inicio       | DATE          | Não   | -      | -                 | Início da validade.                      |
| data_fim          | DATE          | Não   | -      | -                 | Fim da validade.                         |
| ativa             | BOOLEAN       | Não   | -      | TRUE              | Se a campanha está rodando.              |
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
| campanhas_regras                                                                                                  |
| id                | UUID          | Não   | PK     | uuid_generate_v4()| ID da regra.                             |
| campanha_id       | UUID          | Não   | FK     | -                 | Relaciona com campanhas_incentivo.       |
| categoria_id      | UUID          | Sim   | FK     | -                 | Categoria exigida (Nulo = todas).        |
| quantidade_minima | INT           | Sim   | -      | 1                 | Quantidade para bater a meta.            |
| valor_bonus       | NUMERIC(10,2) | Não   | -      | -                 | Valor ganho em R$.                       |
| percentual_bonus  | NUMERIC(5,2)  | Sim   | -      | 0                 | Percentual ganho (se aplicável).         |
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
| campanhas_participacoes                                                                                           |
| id                | UUID          | Não   | PK     | uuid_generate_v4()| ID do registro do participante.          |
| campanha_id       | UUID          | Não   | FK     | -                 | Campanha participada.                    |
| colaborador_id    | UUID          | Não   | FK     | -                 | Colaborador participante.                |
| total_apurado     | NUMERIC(10,2) | Não   | -      | 0                 | Saldo ou quantidade apurada.             |
| bonus_ganho       | NUMERIC(10,2) | Não   | -      | 0                 | Valor de bônus acumulado.                |
| elegivel          | BOOLEAN       | Não   | -      | FALSE             | Se já atingiu a cota mínima.             |
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
```

### Tabelas: `regras_comissao` & `extrato_comissoes`
```text
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
| Tabela / Coluna   | Tipo de Dado  | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                      |
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
| regras_comissao                                                                                                   |
| id                | UUID          | Não   | PK     | uuid_generate_v4()| ID da regra.                             |
| cargo_id          | UUID          | Sim   | FK     | -                 | Cargo afetado.                           |
| categoria_id      | UUID          | Sim   | FK     | -                 | Categoria do serviço.                    |
| percentual        | NUMERIC(5,2)  | Não   | -      | -                 | Percentual da comissão.                  |
| vigencia_inicio   | DATE          | Não   | -      | -                 | Data em que a regra passa a valer.       |
| vigencia_fim      | DATE          | Sim   | -      | -                 | Data final (Nulo se ainda em vigor).     |
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
| extrato_comissoes                                                                                                 |
| id                | UUID          | Não   | PK     | uuid_generate_v4()| ID do extrato.                           |
| colaborador_id    | UUID          | Não   | FK     | -                 | Dono do extrato.                         |
| ano_mes           | VARCHAR(7)    | Não   | Unique*| -                 | Mês de fechamento.                       |
| valor_producao    | NUMERIC(10,2) | Não   | -      | 0                 | Base de cálculo.                         |
| valor_campanhas   | NUMERIC(10,2) | Não   | -      | 0                 | Bônus de campanhas.                      |
| valor_dr_central  | NUMERIC(10,2) | Não   | -      | 0                 | Bônus específicos de categorias.         |
| total_comissao    | NUMERIC(10,2) | Não   | -      | 0                 | Total fechado do mês.                    |
| status_pagamento  | VARCHAR(20)   | Não   | -      | 'Pendente'        | Status do repasse ao RH.                 |
| fechado_em        | TIMESTAMPTZ   | Sim   | -      | -                 | Data exata que o extrato foi selado.     |
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
```

### Tabelas: `calendario_feriados` & `dias_uteis_mes`
```text
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
| Tabela / Coluna   | Tipo de Dado  | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                      |
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
| calendario_feriados                                                                                               |
| id                | UUID          | Não   | PK     | uuid_generate_v4()| ID do feriado.                           |
| data              | DATE          | Não   | -      | -                 | Data no calendário.                      |
| descricao         | VARCHAR(150)  | Não   | -      | -                 | Ex: 'Natal', 'Feriado Municipal'.        |
| abrangencia       | VARCHAR(20)   | Não   | -      | 'Nacional'        | Nacional, Estadual ou Municipal.         |
| estado            | VARCHAR(2)    | Sim   | -      | -                 | UF do feriado (se estadual).             |
| cidade            | VARCHAR(100)  | Sim   | -      | -                 | Cidade (se municipal).                   |
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
| dias_uteis_mes                                                                                                    |
| id                | UUID          | Não   | PK     | uuid_generate_v4()| ID da contagem.                          |
| ano_mes           | VARCHAR(7)    | Não   | Unique*| -                 | Período (Mês/Ano).                       |
| unidade_id        | UUID          | Sim   | FK, UQ*| -                 | Para qual unidade vale essa contagem.    |
| total_dias_uteis  | INT           | Não   | -      | -                 | Soma de dias efetivos de trabalho.       |
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
```

### Tabelas: `notificacoes`, `configuracoes_sistema` & `auditoria_sistema`
```text
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
| Tabela / Coluna   | Tipo de Dado  | Nulo? | Chave  | Valor Padrão      | Descrição / Detalhe                      |
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
| notificacoes                                                                                                      |
| id                | UUID          | Não   | PK     | uuid_generate_v4()| ID da notificação.                       |
| usuario_id        | UUID          | Sim   | FK     | -                 | Destinatário específico (Nulo=Geral).    |
| equipe_id         | UUID          | Sim   | FK     | -                 | Destinatário em grupo.                   |
| tipo              | VARCHAR(30)   | Não   | -      | -                 | 'danger', 'warning', 'success', 'info'   |
| titulo            | VARCHAR(150)  | Não   | -      | -                 | Título do alerta.                        |
| mensagem          | TEXT          | Não   | -      | -                 | Corpo do alerta.                         |
| lida              | BOOLEAN       | Não   | -      | FALSE             | Confirmação de leitura do usuário.       |
| link_acao         | VARCHAR(255)  | Sim   | -      | -                 | URL atalho na notificação.               |
| expira_em         | TIMESTAMPTZ   | Sim   | -      | -                 | Autodestruição do aviso.                 |
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
| configuracoes_sistema                                                                                             |
| chave             | VARCHAR(100)  | Não   | PK     | -                 | ID textual da config (ex: 'dias_uteis')  |
| valor             | TEXT          | Não   | -      | -                 | O dado em si (ex: '22').                 |
| descricao         | VARCHAR(255)  | Sim   | -      | -                 | Explicação do parâmetro.                 |
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
| auditoria_sistema                                                                                                 |
| id                | UUID          | Não   | PK     | uuid_generate_v4()| ID do log de trilha de auditoria.        |
| usuario_id        | UUID          | Sim   | FK     | -                 | Autor da alteração no sistema.           |
| acao              | VARCHAR(100)  | Não   | -      | -                 | Ex: 'UPDATE', 'DELETE'.                  |
| tabela_afetada    | VARCHAR(100)  | Sim   | -      | -                 | Nome da tabela modificada.               |
| registro_id       | UUID          | Sim   | -      | -                 | ID da linha modificada.                  |
| dados_anteriores  | JSONB         | Sim   | -      | -                 | Estado do banco ANTES.                   |
| dados_novos       | JSONB         | Sim   | -      | -                 | Estado do banco DEPOIS.                  |
| ip_origem         | VARCHAR(45)   | Sim   | -      | -                 | IP do causador da alteração.             |
| criado_em         | TIMESTAMPTZ   | Não   | -      | CURRENT_TIMESTAMP | Momento do log de auditoria.             |
+-------------------+---------------+-------+--------+-------------------+------------------------------------------+
```
