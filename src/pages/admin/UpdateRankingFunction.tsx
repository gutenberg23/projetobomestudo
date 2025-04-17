import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminGuard } from '@/components/guards/AdminGuard';

const UpdateRankingFunction: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateFunction = async () => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      // SQL para criar/atualizar a função
      const sql = `
      CREATE OR REPLACE FUNCTION public.get_question_attempts_ranking()
      RETURNS TABLE (
          ranking_position INTEGER,
          user_id UUID,
          display_name TEXT,
          avatar_url TEXT,
          total_attempts INTEGER,
          correct_answers INTEGER,
          wrong_answers INTEGER,
          success_rate NUMERIC
      ) AS $$
      BEGIN
          RETURN QUERY
          WITH user_stats AS (
              SELECT
                  uqa.user_id,
                  COUNT(*)::INTEGER as total_attempts,
                  SUM(CASE WHEN uqa.is_correct THEN 1 ELSE 0 END)::INTEGER as correct_answers,
                  SUM(CASE WHEN NOT uqa.is_correct THEN 1 ELSE 0 END)::INTEGER as wrong_answers
              FROM
                  public.user_question_attempts uqa
              GROUP BY
                  uqa.user_id
          ),
          ranked_results AS (
              SELECT
                  ROW_NUMBER() OVER (
                      ORDER BY us.correct_answers DESC, 
                            us.total_attempts DESC, 
                            p.created_at ASC
                  )::INTEGER as ranking_position,
                  us.user_id,
                  p.nome as display_name,
                  p.foto_perfil as avatar_url,
                  us.total_attempts,
                  us.correct_answers,
                  us.wrong_answers,
                  CASE
                      WHEN us.total_attempts > 0 THEN 
                          ROUND((us.correct_answers::NUMERIC / us.total_attempts) * 100, 2)
                      ELSE 0
                  END as success_rate
              FROM
                  user_stats us
              JOIN
                  public.profiles p ON us.user_id = p.id
              WHERE
                  us.total_attempts > 0
          )
          SELECT * FROM ranked_results;
      END;
      $$ LANGUAGE plpgsql;
      
      -- Criar a função de verificação de tabela se não existir
      CREATE OR REPLACE FUNCTION public.check_table_exists(
          table_name TEXT,
          schema_name TEXT DEFAULT 'public'
      )
      RETURNS BOOLEAN AS $$
      DECLARE
          table_exists BOOLEAN;
      BEGIN
          SELECT EXISTS (
              SELECT 1
              FROM information_schema.tables
              WHERE table_schema = schema_name
              AND table_name = check_table_exists.table_name
          ) INTO table_exists;
          
          RETURN table_exists;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      `;

      // Executar o SQL
      const { error } = await supabase.rpc('exec_sql', { sql });

      if (error) {
        console.error('Erro ao atualizar função:', error);
        
        // Se a função exec_sql não existir, mostrar instruções alternativas
        if (error.code === '42883') { // function does not exist
          setError('A função exec_sql não existe. Entre em contato com o administrador do banco de dados para executar o SQL manualmente.');
        } else {
          setError(`Erro ao atualizar função: ${error.message}`);
        }
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error('Exceção ao atualizar função:', err);
      setError('Ocorreu um erro inesperado. Verifique o console para mais detalhes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-[#f9fafb]">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Atualizar Função de Ranking</h1>
            <p className="text-lg text-gray-600">
              Esta página permite atualizar a função SQL que gera o ranking de questões.
              Use apenas quando necessário.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="flex flex-col gap-4">
              {error && (
                <div className="flex items-center p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
                  <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center p-4 bg-green-50 text-green-700 rounded-lg border border-green-100">
                  <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                  <p>Função atualizada com sucesso!</p>
                </div>
              )}

              <Button 
                onClick={updateFunction} 
                disabled={loading}
                className="w-full md:w-auto"
              >
                {loading ? 'Atualizando...' : 'Atualizar Função SQL'}
              </Button>

              <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                <h3 className="font-medium mb-2">O que esta atualização faz?</h3>
                <p>
                  Corrige o nome da coluna do avatar do usuário na função de ranking de questões
                  (alterando de "avatar_url" para "foto_perfil").
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </AdminGuard>
  );
};

export default UpdateRankingFunction; 