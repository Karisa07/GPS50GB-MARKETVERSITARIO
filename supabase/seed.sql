-- ============================================================
-- Marketvesitario - Seed Data (Solo para entorno LOCAL)
-- Para aplicar: pnpm exec supabase db reset
-- ============================================================
-- NOTA: En producción, los usuarios se crean desde el
-- Dashboard de Supabase en Authentication -> Users.
-- Luego se actualiza el profile desde la BD directamente.
-- ============================================================

-- UUIDs fijos para los usuarios de prueba
-- superadmin : 00000000-0000-0000-0000-000000000001
-- admin      : 00000000-0000-0000-0000-000000000002
-- estudiante : 00000000-0000-0000-0000-000000000003

-- ----------------------------------------------------------------
-- 1. Insertar en auth.users (Sistema de autenticación de Supabase)
--    Contraseña para todos: Test1234!
--    (bcrypt hash de "Test1234!")
-- ----------------------------------------------------------------
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'superadmin@marketvesitario.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"nombres":"Super","apellidos":"Admin"}',
    false,
    'authenticated'
),
(
    '00000000-0000-0000-0000-000000000002',
    'admin@marketvesitario.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"nombres":"Admin","apellidos":"Prueba"}',
    false,
    'authenticated'
),
(
    '00000000-0000-0000-0000-000000000003',
    'estudiante@marketvesitario.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"nombres":"Juan","apellidos":"Estudiante"}',
    false,
    'authenticated'
);

-- ----------------------------------------------------------------
-- 2. Insertar los perfiles correspondientes en nuestra tabla
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
    'CC', '1000000001',
    'Super', 'Admin',
    'No especificado', '3000000001',
    'Administración', 'superadmin'
),
(
    '00000000-0000-0000-0000-000000000002',
    'CC', '1000000002',
    'Admin', 'Prueba',
    'No especificado', '3000000002',
    'Sistemas', 'admin'
),
(
    '00000000-0000-0000-0000-000000000003',
    'CC', '1000000003',
    'Juan', 'Estudiante',
    'Masculino', '3000000003',
    'Ingeniería de Sistemas', 'estudiante'
);
