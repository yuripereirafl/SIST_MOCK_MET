# Descritivo Técnico do Banco de Dados - Portal de Metas (D-1)

Este documento descreve detalhadamente a estrutura lógica das tabelas do banco de dados PostgreSQL do **Portal de Metas**, explicando o propósito de cada tabela, chaves de relacionamento, e o modelo de governança de acessos (RBAC).

O script de criação física correspondente está disponível em: `schema_completo_portal.sql`.

---

## 1. Módulos de Dados

O banco de dados é segmentado em cinco módulos funcionais:

```
[ Cadastros Base ]       [ Segurança & RBAC ]      [ Estrutura de Equipes ]
        |                         |                           |
        +------------+------------+------------+--------------+
                     |                         |
                     v                         v
             [ Vendas & D-1 ]         [ Metas & Satisfação ]
```

---

## 2. Dicionário Lógico de Tabelas

### 2.1. Módulo: Cadastros Base
Estruturas globais de clínicas, catálogos de exames/serviços e cargos.

#### 1. `unidades_atendimento`
*   **Propósito:** Cadastro das filiais físicas, clínicas ou laboratórios.
*   **Chave Primária:** `id` (UUID gerado automaticamente).
*   **Relacionamentos:** Utilizado na tabela `guias_vendas` para mapear onde o paciente realizou o exame.

#### 2. `cargos`
*   **Propósito:** Define a tabela salarial básica e o percentual de comissão padrão dos operadores.
*   **Chave Primária:** `id` (UUID).
*   **Relacionamentos:** Ligado a `colaboradores` (1:N).

#### 3. `categorias_servicos`
*   **Propósito:** Linhas de negócios que agrupam os atendimentos (ex: Odonto, Exames, Dr Central). Guarda as cores hexadecimais utilizadas de forma dinâmica na interface (UI).
*   **Chave Primária:** `id` (UUID).
*   **Relacionamentos:** Vincula-se a `servicos` (1:N).

#### 4. `servicos`
*   **Propósito:** Catálogo geral de exames, especialidades médicas ou procedimentos ofertados e seus preços de tabela.
*   **Chave Primária:** `id` (UUID).
*   **Chave Estrangeira:** `categoria_id` (Aponta para `categorias_servicos`).

---

### 2.2. Módulo: Estrutura Organizacional e Vínculos
Gerencia a alocação e relacionamento dos colaboradores nas equipes.

#### 5. `colaboradores`
*   **Propósito:** Cadastro central dos funcionários contendo dados cadastrais, contato e status do contrato.
*   **Chave Primária:** `id` (UUID).
*   **Chave Estrangeira:** `cargo_id` (Aponta para `cargos`).

#### 6. `equipes`
*   **Propósito:** Agrupamento de colaboradores sob uma liderança.
*   **Chave Primária:** `id` (UUID).
*   **Chaves Estrangeiras:**
    *   `lider_id` (Aponta para o `colaboradores` responsável pela equipe).
    *   `gerente_id` (Aponta para o `colaboradores` gerente de nível superior).

#### 7. `historico_vinculos_equipe`
*   **Propósito:** **Crucial para relatórios retroativos.** Registra as datas de início e fim da alocação de um colaborador em uma equipe. Impede que a mudança de equipe de um funcionário hoje altere os dados de performance históricos das equipes no passado.
*   **Chave Primária:** `id` (UUID).
*   **Chaves Estrangeiras:**
    *   `colaborador_id` (Aponta para `colaboradores`).
    *   `equipe_id` (Aponta para `equipes`).

---

### 2.3. Módulo: Controle de Acessos e Segurança (RBAC)
Gerenciamento de credenciais de login, sessões e permissões granulares de visibilidade de dados.

#### 8. `perfis_acesso`
*   **Propósito:** Perfis organizacionais de controle (Administrador, Diretor, Líder, Operador).
*   **Chave Primária:** `id` (UUID).

#### 9. `permissoes`
*   **Propósito:** Cadastro de chaves de acesso a rotas ou botões da interface (ex: `guias:contestar`, `metas:editar`, `contestaçoes:aprovar`).
*   **Chave Primária:** `id` (UUID).

#### 10. `permissoes_perfis`
*   **Propósito:** Tabela de junção N:N para vincular permissões às funções.
*   **Chaves:** `perfil_id` + `permissao_id` formam a chave primária composta.

#### 11. `usuarios_portal`
*   **Propósito:** Cadastro de credenciais ativas para acesso ao portal Web.
*   **Chaves Estrangeiras:**
    *   `colaborador_id` (Aponta para `colaboradores` - opcional se for administrador externo).
    *   `perfil_id` (Aponta para `perfis_acesso`).

#### 12. `registros_acesso`
*   **Propósito:** Trilha de logs para segurança da informação. Registra IPs de conexão, data/hora e o navegador utilizado em cada tentativa de login.

---

### 2.4. Módulo: Transações D-1 e Contestações
O fluxo diário de produção de agendamentos e justificativas de perdas financeiras.

#### 13. `pacientes`
*   **Propósito:** Evita redundância de dados cadastrais de pacientes na tabela de transações.
*   **Chave Primária:** `id` (UUID).

#### 14. `guias_vendas`
*   **Propósito:** O coração transacional do sistema. Armazena guias agendadas ontem com seus status, valores e as informações de contestação (para casos onde o faturamento registra a guia erroneamente como cancelada).
*   **Chave Primária:** `id` (UUID).
*   **Chaves Estrangeiras:**
    *   `colaborador_id` (Aponta para o operador que realizou a venda).
    *   `paciente_id` (Aponta para o cliente).
    *   `servico_id` (Aponta para o procedimento agendado).
    *   `unidade_id` (Aponta para a clínica física).

#### 15. `historico_status_guias`
*   **Propósito:** Auditoria e compliance. Registra cada mudança de status das guias, gravando o estado anterior, o novo status, o usuário que alterou e a justificativa (essencial para evitar fraudes em comissionamento).

---

### 2.5. Módulo: Metas, Satisfação e Ocorrências
Indicadores de metas individuais e produtividade.

#### 16. `metas_colaboradores`
*   **Propósito:** Define a meta do ciclo mensal e a meta diluída por dia útil para cada colaborador.
*   **Chave Primária:** `id` (UUID).
*   **Chave Estrangeira:** `colaborador_id` (Aponta para `colaboradores`).

#### 17. `avaliacoes_satisfacao`
*   **Propósito:** Consolida as pesquisas pós-consulta (NPS e CSAT). Alimenta o indicador de estrelas e a nota de 0 a 5 do colaborador.
*   **Chave Primária:** `id` (UUID).
*   **Chaves Estrangeiras:**
    *   `guia_id` (Guia que gerou a pesquisa).
    *   `colaborador_id` (Operador que recebe a nota).

#### 18. `ocorrencias`
*   **Propósito:** Cadastro de ausências justificadas ou atestados médicos. Permite que o portal ajuste o cálculo de ritmo individual de metas descontando os dias que o funcionário estava afastado.

---

### 2.6. Módulo: Campanhas e Comissões
Gestão de bônus, gamificação e regras imutáveis de remuneração.

#### 19. `campanhas_incentivo`, `campanhas_regras` e `campanhas_participacoes`
*   **Propósito:** Criação de campanhas sazonais ou de conversão. A tabela `campanhas_incentivo` define a campanha, `campanhas_regras` define os critérios para ganhar e `campanhas_participacoes` acompanha quem bateu a meta e ganhou o prêmio.

#### 20. `regras_comissao` e `extrato_comissoes`
*   **Propósito:** `regras_comissao` define quanto cada cargo ganha percentualmente sobre os tipos de exames. `extrato_comissoes` congela esse cálculo ao fim do mês para o repasse ao RH, de modo que futuras alterações de regras não quebrem o registro do passado.

---

### 2.7. Módulo: Fechamento Seguro e Auditoria
Congelamento de dados e registro de ações críticas.

#### 21. `snapshots_diarios`
*   **Propósito:** Tira uma "fotografia" do D-1 na madrugada. Fundamental para que aprovações tardias de contestações não mudem o resultado passado (compliance).
*   **Chave Primária:** `id` (UUID).

#### 22. `calendario_feriados` e `dias_uteis_mes`
*   **Propósito:** Mapeia os dias exatos de operação de cada unidade (considerando feriados locais) para calcular com precisão a meta diária sem penalizar o colaborador injustamente.

#### 23. `auditoria_sistema`
*   **Propósito:** Registra qualquer alteração sensível no sistema, como aprovações manuais ou deleções, capturando IP, dados antigos e os dados novos (JSON) para rastreabilidade de segurança.

---

### 2.8. Módulo: Configuração e Sessões
Parametrização dinâmica e tokens de autenticação stateful.

#### 24. `configuracoes_sistema` e `notificacoes`
*   **Propósito:** `configuracoes_sistema` armazena variáveis sem precisar mexer no código do frontend (ex: 'margem de tolerância da meta'). `notificacoes` permite enviar mensagens na interface via "sininho".

#### 25. `tokens_sessao` e `tokens_recuperacao_senha`
*   **Propósito:** Gerencia a persistência de login segura (sessão ativa) e a geração de links para "Esqueci minha senha".

---

## 3. Principais Regras de Relacionamento (Integridade Referencial)


1.  **Exclusão com Restrição (`ON DELETE RESTRICT`):**
    *   Serviços, Categorias e Unidades de Atendimento não podem ser excluídos se houver histórico de vendas associado a eles. Isso protege a base de dados de perder integridade nos relatórios anuais.
2.  **Exclusão Cascata (`ON DELETE CASCADE`):**
    *   Ao excluir o cadastro de um usuário, seus logs de acesso em `registros_acesso` e seu histórico de vínculos são apagados automaticamente para manter o banco limpo.
3.  **Índices de Performance:**
    *   O banco foi configurado com índices compostos de datas e status. Consultas de evolução e projeções mensais vão rodar em milissegundos, independente do tamanho das tabelas transacionais.
