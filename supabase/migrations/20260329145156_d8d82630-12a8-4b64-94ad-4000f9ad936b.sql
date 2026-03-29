
-- Create alunos table
CREATE TABLE public.alunos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula text NOT NULL UNIQUE,
  nome text NOT NULL,
  foto text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

-- Authenticated users can manage their own alunos
CREATE POLICY "Users can insert alunos" ON public.alunos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can select alunos" ON public.alunos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update alunos" ON public.alunos FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete alunos" ON public.alunos FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Storage RLS policies for fotos-alunos bucket
CREATE POLICY "Authenticated users can upload photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'fotos-alunos');
CREATE POLICY "Authenticated users can read photos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'fotos-alunos');
CREATE POLICY "Public can read photos" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'fotos-alunos');
CREATE POLICY "Authenticated users can update photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'fotos-alunos') WITH CHECK (bucket_id = 'fotos-alunos');
CREATE POLICY "Authenticated users can delete photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'fotos-alunos');
