ALTER TABLE public.alunos 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS course text,
ADD COLUMN IF NOT EXISTS face_descriptor real[],
ADD COLUMN IF NOT EXISTS presence_count integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_classes integer NOT NULL DEFAULT 0;