-- ============================================================================
--  Feedbacks Terapêuticos - Schema do banco de dados (PostgreSQL)
-- ----------------------------------------------------------------------------
--  Rode este arquivo UMA vez no seu banco para criar toda a estrutura:
--
--      psql -h SEU_HOST -p 5432 -U SEU_USUARIO -d NOME_DO_BANCO -f schema.sql
--
--  ou, se estiver usando um container Docker do Postgres:
--
--      docker exec -i NOME_DO_CONTAINER psql -U SEU_USUARIO -d NOME_DO_BANCO < schema.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
--  Tabela: terapeutas (login do sistema)
--    - senha_hash: hash scrypt no formato "salt:hash" (nunca a senha pura)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS terapeutas (
    id           SERIAL       PRIMARY KEY,
    nome         TEXT         NOT NULL UNIQUE,
    senha_hash   TEXT         NOT NULL,
    admin        BOOLEAN      NOT NULL DEFAULT false,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
--  Tabela: pacientes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pacientes (
    id           SERIAL       PRIMARY KEY,
    nome         TEXT         NOT NULL,
    responsavel  TEXT,
    terapeuta    TEXT,
    observacoes  TEXT,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
--  Tabela: feedbacks (registro diário)
--    - status 'normal' = dia normal (com atividades/objetivos/evolução)
--    - status 'faltou' = paciente faltou (sem os demais campos)
--    - UNIQUE (paciente_id, data): um registro por paciente por dia
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedbacks (
    id           SERIAL       PRIMARY KEY,
    paciente_id  INTEGER      NOT NULL REFERENCES pacientes (id) ON DELETE CASCADE,
    data         DATE         NOT NULL,
    terapeuta    TEXT,
    status       TEXT         NOT NULL DEFAULT 'normal'
                              CHECK (status IN ('normal', 'faltou')),
    objetivos    TEXT,
    evolucao     TEXT,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uq_feedback_paciente_data UNIQUE (paciente_id, data)
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_paciente ON feedbacks (paciente_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_data     ON feedbacks (data);

-- ----------------------------------------------------------------------------
--  Tabela: feedback_atividades (lista de atividades de cada feedback)
--    - "ordem" preserva a ordem em que as atividades devem aparecer
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback_atividades (
    id           SERIAL       PRIMARY KEY,
    feedback_id  INTEGER      NOT NULL REFERENCES feedbacks (id) ON DELETE CASCADE,
    descricao    TEXT         NOT NULL,
    ordem        INTEGER      NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_atividades_feedback ON feedback_atividades (feedback_id);
