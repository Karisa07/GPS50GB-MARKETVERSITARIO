-- ============================================================
-- Migración: Módulos de Chat, Disponibilidad y Agenda de Tutorías
-- ============================================================

-- 1. TABLA CHATS
CREATE TABLE IF NOT EXISTS chats (
    id_chat         SERIAL PRIMARY KEY,
    id_usuario_1    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    id_usuario_2    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_chat_users UNIQUE (id_usuario_1, id_usuario_2)
);

-- Habilitar RLS en chats
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir select a participantes en chats" ON chats
    FOR SELECT USING (auth.uid() = id_usuario_1 OR auth.uid() = id_usuario_2);

CREATE POLICY "Permitir insert a autenticados en chats" ON chats
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 2. TABLA MENSAJES
CREATE TABLE IF NOT EXISTS mensajes (
    id_mensaje      SERIAL PRIMARY KEY,
    id_chat         INT NOT NULL REFERENCES chats(id_chat) ON DELETE CASCADE,
    id_remitente    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    mensaje         TEXT NOT NULL,
    leido           BOOLEAN NOT NULL DEFAULT false,
    fecha           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS en mensajes
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir select a participantes del chat" ON mensajes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chats 
            WHERE chats.id_chat = mensajes.id_chat 
            AND (chats.id_usuario_1 = auth.uid() OR chats.id_usuario_2 = auth.uid())
        )
    );

CREATE POLICY "Permitir insert a remitente en mensajes" ON mensajes
    FOR INSERT WITH CHECK (auth.uid() = id_remitente);

-- 3. TABLA DISPONIBILIDAD TUTOR
CREATE TABLE IF NOT EXISTS disponibilidad_tutor (
    id              SERIAL PRIMARY KEY,
    id_usuario      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    dia_semana      INT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Dom, 1=Lun, etc.
    hora_inicio     TIME NOT NULL,
    hora_fin        TIME NOT NULL,
    UNIQUE (id_usuario, dia_semana, hora_inicio, hora_fin)
);

-- Habilitar RLS en disponibilidad_tutor
ALTER TABLE disponibilidad_tutor ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir select público en disponibilidad" ON disponibilidad_tutor
    FOR SELECT USING (true);

CREATE POLICY "Permitir todo al tutor dueño de su disponibilidad" ON disponibilidad_tutor
    FOR ALL USING (auth.uid() = id_usuario);

-- 4. MODIFICAR TABLA SOLICITUDES PARA AGENDAR FECHA Y HORAS
ALTER TABLE solicitudes 
    ADD COLUMN IF NOT EXISTS fecha_agenda DATE,
    ADD COLUMN IF NOT EXISTS hora_inicio TIME,
    ADD COLUMN IF NOT EXISTS hora_fin TIME;
