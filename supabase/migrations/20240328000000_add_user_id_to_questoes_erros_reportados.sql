-- Adicionar a coluna user_id se ela não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'questoes_erros_reportados' 
        AND column_name = 'user_id'
    ) THEN
        -- Primeiro adicionar a coluna como nullable
        ALTER TABLE "public"."questoes_erros_reportados"
        ADD COLUMN "user_id" uuid REFERENCES auth.users(id) ON DELETE CASCADE;

        -- Atualizar registros existentes com um usuário padrão (admin)
        UPDATE "public"."questoes_erros_reportados"
        SET "user_id" = (
            SELECT id 
            FROM auth.users 
            WHERE email = 'admin@bomestudo.com.br'
            LIMIT 1
        )
        WHERE "user_id" IS NULL;

        -- Agora tornar a coluna NOT NULL
        ALTER TABLE "public"."questoes_erros_reportados"
        ALTER COLUMN "user_id" SET NOT NULL;

        -- Criar a relação explicitamente
        ALTER TABLE "public"."questoes_erros_reportados"
        ADD CONSTRAINT questoes_erros_reportados_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Atualizar as políticas de segurança
DROP POLICY IF EXISTS "Usuários podem reportar erros" ON "public"."questoes_erros_reportados";

CREATE POLICY "Usuários podem reportar erros"
ON "public"."questoes_erros_reportados"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Adicionar política para visualização
CREATE POLICY "Usuários podem ver erros reportados"
ON "public"."questoes_erros_reportados"
FOR SELECT
TO authenticated
USING (true); 