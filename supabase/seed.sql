-- ============================================================
-- Marketvesitario - Seed Data (Solo para entorno LOCAL)
-- Para aplicar: pnpm exec supabase db reset
-- ============================================================
-- NOTA: En producción, los usuarios se crean desde el
-- Dashboard de Supabase en Authentication -> Users,
-- luego se actualiza el profile directamente desde la BD.
-- ============================================================

-- Habilitar extensión para hashear contraseñas
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- UUIDs fijos para los usuarios de prueba
-- superadmin : 00000000-0000-0000-0000-000000000001
-- admin      : 00000000-0000-0000-0000-000000000002
-- estudiante : 00000000-0000-0000-0000-000000000003
-- Contraseña para todos: Test1234!

-- ----------------------------------------------------------------
-- 1. Insertar en auth.users
-- ----------------------------------------------------------------
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES
(
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'superadmin@marketvesitario.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"nombres":"Super","apellidos":"Admin"}',
    NOW(), NOW(), '', '', '', ''
),
(
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'admin@marketvesitario.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"nombres":"Admin","apellidos":"Prueba"}',
    NOW(), NOW(), '', '', '', ''
),
(
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000003',
    'authenticated',
    'authenticated',
    'estudiante@marketvesitario.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"nombres":"Juan","apellidos":"Estudiante"}',
    NOW(), NOW(), '', '', '', ''
);

-- ----------------------------------------------------------------
-- 2. Insertar los perfiles en nuestra tabla
-- ----------------------------------------------------------------
INSERT INTO profiles (
    id,
    tipo_documento,
    documento_identidad,
    nombres,
    apellidos,
    genero,
    telefono,
    programa_academico,
    rol
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'CC', '1000000001', 'Super', 'Admin',
    'No especificado', '3000000001', 'Administración', 'superadmin'
),
(
    '00000000-0000-0000-0000-000000000002',
    'CC', '1000000002', 'Admin', 'Prueba',
    'No especificado', '3000000002', 'Sistemas', 'admin'
),
(
    '00000000-0000-0000-0000-000000000003',
    'CC', '1000000003', 'Juan', 'Estudiante',
    'Masculino', '3000000003', 'Ingeniería de Sistemas', 'estudiante'
);
