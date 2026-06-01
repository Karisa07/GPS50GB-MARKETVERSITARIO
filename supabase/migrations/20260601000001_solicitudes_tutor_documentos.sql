-- ============================================================
-- Marketversitario — Ampliación solicitudes_tutor
-- Agrega área de interés y URL del archivo de notas
-- ============================================================

-- 1. Nuevas columnas en solicitudes_tutor
ALTER TABLE solicitudes_tutor
  ADD COLUMN IF NOT EXISTS area_interes TEXT,
  ADD COLUMN IF NOT EXISTS url_notas    TEXT;

-- 2. Bucket para los archivos de notas de solicitudes de tutor
INSERT INTO storage.buckets (id, name, public)
VALUES ('notas-tutor', 'notas-tutor', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Política: cualquier autenticado puede subir su propio archivo
CREATE POLICY IF NOT EXISTS "Subir notas propias tutor"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'notas-tutor');

-- 4. Lectura pública (admins y el propio usuario revisan el archivo)
CREATE POLICY IF NOT EXISTS "Leer notas tutor"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'notas-tutor');
