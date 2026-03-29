-- Cria o bucket de fotos de alunos (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fotos-alunos',
  'fotos-alunos',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Permite leitura pública das fotos
CREATE POLICY "fotos_alunos_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'fotos-alunos');

-- Permite upload por usuários autenticados
CREATE POLICY "fotos_alunos_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'fotos-alunos');

-- Permite substituição (upsert) por usuários autenticados
CREATE POLICY "fotos_alunos_authenticated_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'fotos-alunos');

-- Permite exclusão por usuários autenticados
CREATE POLICY "fotos_alunos_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'fotos-alunos');
