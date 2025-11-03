-- Alter teorias table to change disciplina_id and assunto_id from UUID to TEXT
ALTER TABLE public.teorias 
ALTER COLUMN disciplina_id TYPE TEXT USING disciplina_id::TEXT,
ALTER COLUMN assunto_id TYPE TEXT USING assunto_id::TEXT;