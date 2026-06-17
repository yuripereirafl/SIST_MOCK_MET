-- ============================================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS - PORTAL DE METAS (D-1)
-- SGBD: PostgreSQL (Compatível com versões 12+)
-- Descrição: Contém a estrutura de cadastros, segurança (RBAC), transações 
--            diárias e tabelas de auditoria histórica de vínculos de equipe.
-- ============================================================================

-- Habilitar a extensão para geração automática de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. TABELAS DE CONFIGURAÇÃO E CADASTROS BASE
-- ============================================================================

-- Unidades físicas de atendimento (Clínicas, postos de coleta ou unidades regionais)
CREATE TABLE unidades_atendimento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_unidade VARCHAR(100) NOT NULL UNIQUE,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cargos da empresa para gestão de comissionamento padrão e salários
CREATE TABLE cargos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(100) NOT NULL UNIQUE,
    salario_base NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    comissao_padrao_percentual NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Linhas de negócio / Categorias principais de serviços prestados
CREATE TABLE categorias_servicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_slug VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    cor_hex_ui VARCHAR(7) DEFAULT '#6366f1',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Procedimentos / Exames / Consultas específicos vinculados a uma categoria
CREATE TABLE servicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoria_id UUID NOT NULL REFERENCES categorias_servicos(id) ON DELETE RESTRICT,
    codigo_procedimento VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(150) NOT NULL,
    valor_tabela NUMERIC(10, 2) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. TABELAS DE SEGURANÇA E ACESSO (RBAC)
-- ============================================================================

-- Perfis de acesso que determinam a visibilidade de dados no portal
CREATE TABLE perfis_acesso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_perfil VARCHAR(50) NOT NULL UNIQUE, -- ex: 'Administrador', 'Diretor', 'Lider', 'Operador'
    descricao TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Permissões granulares atribuídas a funcionalidades específicas
CREATE TABLE permissoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chave_permissao VARCHAR(100) NOT NULL UNIQUE, -- ex: 'guias:contestar', 'metas:editar'
    descricao VARCHAR(200) NOT NULL
);

-- Tabela associativa entre perfis e permissões (N:N)
CREATE TABLE permissoes_perfis (
    perfil_id UUID REFERENCES perfis_acesso(id) ON DELETE CASCADE,
    permissao_id UUID REFERENCES permissoes(id) ON DELETE CASCADE,
    PRIMARY KEY (perfil_id, permissao_id)
);

-- ============================================================================
-- 3. ESTRUTURA ORGANIZACIONAL (COLABORADORES E EQUIPES)
-- ============================================================================

-- Cadastro principal de colaboradores da empresa
CREATE TABLE colaboradores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matricula VARCHAR(50) NOT NULL UNIQUE,
    nome_completo VARCHAR(200) NOT NULL,
    nome_exibicao VARCHAR(100) NOT NULL,
    iniciais VARCHAR(4) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    cargo_id UUID NOT NULL REFERENCES cargos(id) ON DELETE RESTRICT,
    nivel_experiencia VARCHAR(50) NOT NULL, -- 'Júnior', 'Pleno', 'Sênior'
    tipo_contrato VARCHAR(50) NOT NULL, -- 'CLT', 'PJ', 'Estagiário'
    status_emprego VARCHAR(50) NOT NULL DEFAULT 'Ativo', -- 'Ativo', 'Afastado', 'Desligado'
    data_admissao DATE NOT NULL,
    data_desligamento DATE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cadastro de equipes de vendas
CREATE TABLE equipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_equipe VARCHAR(100) NOT NULL UNIQUE,
    lider_id UUID REFERENCES colaboradores(id) ON DELETE SET NULL,
    gerente_id UUID REFERENCES colaboradores(id) ON DELETE SET NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Histórico de transições e vínculos de equipe temporal (mantém histórico fidedigno)
CREATE TABLE historico_vinculos_equipe (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    equipe_id UUID NOT NULL REFERENCES equipes(id) ON DELETE CASCADE,
    data_inicio DATE NOT NULL,
    data_fim DATE, -- Fica nulo se o colaborador estiver ativo nesta equipe
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Credenciais de autenticação no portal vinculadas aos colaboradores
CREATE TABLE usuarios_portal (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    colaborador_id UUID UNIQUE REFERENCES colaboradores(id) ON DELETE CASCADE, -- Nulo apenas se administrador externo
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    perfil_id UUID NOT NULL REFERENCES perfis_acesso(id) ON DELETE RESTRICT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    bloqueado_ate TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Logs de auditoria de login e segurança de acessos
CREATE TABLE registros_acesso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios_portal(id) ON DELETE CASCADE,
    ip_origem VARCHAR(45) NOT NULL,
    user_agent TEXT,
    sucesso BOOLEAN NOT NULL,
    data_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. TABELAS TRANSACIONAIS (PACIENTES, VENDAS E ACOMPANHAMENTO D-1)
-- ============================================================================

-- Clientes cadastrados para evitar redundâncias na tabela de guias
CREATE TABLE pacientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_prontuario VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(200) NOT NULL,
    telefone VARCHAR(20),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Registro de cada guia (venda efetuada ou tentativa perdida D-1)
CREATE TABLE guias_vendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guia_numero VARCHAR(100) NOT NULL UNIQUE,
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE RESTRICT,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE RESTRICT,
    servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE RESTRICT,
    unidade_id UUID NOT NULL REFERENCES unidades_atendimento(id) ON DELETE RESTRICT,
    valor_venda NUMERIC(10, 2) NOT NULL,
    data_agendamento DATE NOT NULL,
    horario_agendamento TIME NOT NULL,
    status_atual VARCHAR(30) NOT NULL, -- 'Confirmado', 'Cancelado', 'Reagendado', 'No-show', 'Em análise'
    motivo_cancelamento_no_show TEXT,
    
    -- Controle do fluxo de contestações
    contestada BOOLEAN NOT NULL DEFAULT FALSE,
    justificativa_contestacao TEXT,
    status_contestacao VARCHAR(30) DEFAULT 'Nenhuma', -- 'Pendente', 'Aprovada', 'Recusada', 'Nenhuma'
    data_contestacao TIMESTAMP WITH TIME ZONE,
    resposta_liderança TEXT,
    
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trilha de auditoria das mudanças de status das guias (Faturamento vs. Contestações)
CREATE TABLE historico_status_guias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guia_id UUID NOT NULL REFERENCES guias_vendas(id) ON DELETE CASCADE,
    status_anterior VARCHAR(30),
    status_novo VARCHAR(30) NOT NULL,
    usuario_modificador VARCHAR(100) NOT NULL,
    data_modificacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    motivo_alteracao TEXT NOT NULL
);

-- ============================================================================
-- 5. METAS, AVALIAÇÕES E PRODUTIVIDADE
-- ============================================================================

-- Cadastro de metas individuais por operador por competência (Mês/Ano)
CREATE TABLE metas_colaboradores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    ano_mes VARCHAR(7) NOT NULL, -- Formato: 'YYYY-MM'
    meta_mensal NUMERIC(10, 2) NOT NULL,
    meta_diaria NUMERIC(10, 2) NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_colab_meta_periodo UNIQUE (colaborador_id, ano_mes)
);

-- Avaliações de NPS e CSAT deixadas por pacientes após o agendamento
CREATE TABLE avaliacoes_satisfacao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guia_id UUID NOT NULL UNIQUE REFERENCES guias_vendas(id) ON DELETE CASCADE,
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    nota_nps INT CHECK (nota_nps BETWEEN 0 AND 10),
    nota_csat INT CHECK (nota_csat BETWEEN 1 AND 5),
    comentario TEXT,
    data_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ocorrências de trabalho que impactam o cálculo do ritmo do colaborador
CREATE TABLE ocorrencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    tipo_ocorrencia VARCHAR(50) NOT NULL, -- 'Falta Justificada', 'Atestado', 'Férias', etc.
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. ÍNDICES DE PERFORMANCE DE CONSULTAS (INDEXING)
-- ============================================================================
CREATE INDEX idx_guias_data_status ON guias_vendas (data_agendamento, status_atual);
CREATE INDEX idx_guias_colaborador ON guias_vendas (colaborador_id);
CREATE INDEX idx_metas_periodo ON metas_colaboradores (colaborador_id, ano_mes);
CREATE INDEX idx_historico_ativo ON historico_vinculos_equipe (colaborador_id) WHERE data_fim IS NULL;

-- ============================================================================
-- 7. TABELAS ADICIONAIS DE LONGO PRAZO (CORPORATIVO)
-- ============================================================================

-- Tokens de Sessão Ativa (Login e Autenticação JWT/Stateful)
CREATE TABLE tokens_sessao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios_portal(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    ip_origem VARCHAR(45),
    user_agent TEXT,
    expira_em TIMESTAMP WITH TIME ZONE NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tokens para Recuperação de Senha
CREATE TABLE tokens_recuperacao_senha (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios_portal(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    utilizado BOOLEAN NOT NULL DEFAULT FALSE,
    expira_em TIMESTAMP WITH TIME ZONE NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Histórico de Cargos do Colaborador (Rastreabilidade de promoção/comissão)
CREATE TABLE historico_cargos_colaborador (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    cargo_id UUID NOT NULL REFERENCES cargos(id) ON DELETE RESTRICT,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    motivo_alteracao TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Metas Agregadas por Equipe (Acompanhamento Consolidado da Liderança)
CREATE TABLE metas_equipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipe_id UUID NOT NULL REFERENCES equipes(id) ON DELETE CASCADE,
    ano_mes VARCHAR(7) NOT NULL,
    meta_mensal NUMERIC(10, 2) NOT NULL,
    meta_diaria NUMERIC(10, 2) NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_meta_equipe_periodo UNIQUE (equipe_id, ano_mes)
);

-- Snapshots Diários (Congelamento de status de D-1 para fechamento mensal inviolável)
CREATE TABLE snapshots_diarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE RESTRICT,
    data_referencia DATE NOT NULL,
    total_guias INT NOT NULL DEFAULT 0,
    total_confirmadas INT NOT NULL DEFAULT 0,
    total_canceladas INT NOT NULL DEFAULT 0,
    total_noshow INT NOT NULL DEFAULT 0,
    valor_produzido NUMERIC(10, 2) NOT NULL DEFAULT 0,
    valor_perdido NUMERIC(10, 2) NOT NULL DEFAULT 0,
    gerado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_snapshot_colab_data UNIQUE (colaborador_id, data_referencia)
);

-- Cadastro de Campanhas de Incentivo/Bônus
CREATE TABLE campanhas_incentivo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) NOT NULL, -- 'Volume', 'Conversao', 'Categoria_Especifica'
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Regras das Campanhas (ex: 10 procedimentos X = Bônus Y)
CREATE TABLE campanhas_regras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campanha_id UUID NOT NULL REFERENCES campanhas_incentivo(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES categorias_servicos(id),
    quantidade_minima INT DEFAULT 1,
    valor_bonus NUMERIC(10, 2) NOT NULL,
    percentual_bonus NUMERIC(5, 2) DEFAULT 0
);

-- Participação e Premiação de Colaboradores nas Campanhas
CREATE TABLE campanhas_participacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campanha_id UUID NOT NULL REFERENCES campanhas_incentivo(id) ON DELETE CASCADE,
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    total_apurado NUMERIC(10, 2) NOT NULL DEFAULT 0,
    bonus_ganho NUMERIC(10, 2) NOT NULL DEFAULT 0,
    elegivel BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_participacao_campanha_colab UNIQUE (campanha_id, colaborador_id)
);

-- Regras Dinâmicas de Comissão (Percentual por cargo e categoria com vigência)
CREATE TABLE regras_comissao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cargo_id UUID REFERENCES cargos(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES categorias_servicos(id) ON DELETE CASCADE,
    percentual NUMERIC(5, 2) NOT NULL,
    vigencia_inicio DATE NOT NULL,
    vigencia_fim DATE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Extrato Consolidado de Comissões (Fechamento mensal por colaborador)
CREATE TABLE extrato_comissoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    ano_mes VARCHAR(7) NOT NULL,
    valor_producao NUMERIC(10, 2) NOT NULL DEFAULT 0,
    valor_campanhas NUMERIC(10, 2) NOT NULL DEFAULT 0,
    valor_dr_central NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_comissao NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status_pagamento VARCHAR(20) NOT NULL DEFAULT 'Pendente',
    fechado_em TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_extrato_colab_periodo UNIQUE (colaborador_id, ano_mes)
);

-- Feriados e Dias Especiais
CREATE TABLE calendario_feriados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data DATE NOT NULL,
    descricao VARCHAR(150) NOT NULL,
    abrangencia VARCHAR(20) NOT NULL DEFAULT 'Nacional',
    estado VARCHAR(2),
    cidade VARCHAR(100),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_feriado_data_local UNIQUE (data, estado, cidade)
);

-- Total de Dias Úteis pré-calculados por mês/unidade
CREATE TABLE dias_uteis_mes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ano_mes VARCHAR(7) NOT NULL,
    unidade_id UUID REFERENCES unidades_atendimento(id) ON DELETE CASCADE,
    total_dias_uteis INT NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_diasuteis_mes_unidade UNIQUE (ano_mes, unidade_id)
);

-- Central de Notificações Internas (Alertas para os usuários)
CREATE TABLE notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios_portal(id) ON DELETE CASCADE,
    equipe_id UUID REFERENCES equipes(id) ON DELETE CASCADE,
    tipo VARCHAR(30) NOT NULL, -- 'danger', 'warning', 'success', 'info'
    titulo VARCHAR(150) NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN NOT NULL DEFAULT FALSE,
    link_acao VARCHAR(255),
    expira_em TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Configurações Gerais do Sistema (Parametrização Flexível)
CREATE TABLE configuracoes_sistema (
    chave VARCHAR(100) PRIMARY KEY,
    valor TEXT NOT NULL,
    descricao VARCHAR(255),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_por VARCHAR(100)
);

-- Carga inicial de Configurações Básicas
INSERT INTO configuracoes_sistema (chave, valor, descricao) VALUES
('alerta_meta_pct_minimo', '0.80', 'Percentual mínimo da meta para não gerar alerta vermelho'),
('dias_uteis_padrao_mes', '22', 'Média de dias úteis por mês quando não há calendário cadastrado'),
('prazo_contestacao_dias', '3', 'Quantos dias o operador tem para contestar uma guia D-1'),
('max_tentativas_login', '5', 'Tentativas de login antes de bloquear a conta');

-- Auditoria Geral do Sistema para Conformidade (Compliance)
CREATE TABLE auditoria_sistema (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios_portal(id) ON DELETE SET NULL,
    acao VARCHAR(100) NOT NULL,
    tabela_afetada VARCHAR(100),
    registro_id UUID,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_origem VARCHAR(45),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
