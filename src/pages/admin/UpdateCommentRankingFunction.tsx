import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Container,
  Divider,
  Heading,
  Text,
  useToast,
  VStack,
  Code,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/layout/Layout';

const UpdateCommentRankingFunction = () => {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se o usuário é admin
    if (user && !isAdmin) {
      router.push('/');
      toast({
        title: 'Acesso negado',
        description: 'Você não tem permissão para acessar esta página.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [user, isAdmin, router, toast]);

  const handleUpdateFunction = async () => {
    if (!isAdmin) return;

    setIsUpdating(true);
    try {
      // SQL para atualizar a função
      const sqlFunction = `
CREATE OR REPLACE FUNCTION public.get_comment_ranking()
RETURNS TABLE (
    user_id UUID,
    display_name TEXT,
    avatar_url TEXT,
    comment_count BIGINT,
    total_likes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH comment_stats AS (
        SELECT
            cq.usuario_id as user_id,
            COUNT(cq.id) AS comment_count,
            COUNT(DISTINCT lc.id) AS total_likes
        FROM
            public.comentarios_questoes cq
        LEFT JOIN
            public.likes_comentarios lc ON cq.id = lc.comentario_id
        GROUP BY
            cq.usuario_id
    )
    SELECT
        cs.user_id,
        p.nome AS display_name,
        p.foto_perfil AS avatar_url,
        cs.comment_count,
        cs.total_likes
    FROM
        comment_stats cs
    JOIN
        public.profiles p ON cs.user_id = p.id
    ORDER BY
        cs.total_likes DESC,
        cs.comment_count DESC;
END;
$$ LANGUAGE plpgsql;
      `;

      // Executar a query SQL
      const { error } = await supabase.rpc('execute_sql', { sql_query: sqlFunction });

      if (error) {
        throw error;
      }

      setResult('Função atualizada com sucesso!');
      toast({
        title: 'Sucesso!',
        description: 'A função de ranking de comentários foi atualizada.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Erro ao atualizar função:', error);
      setResult(`Erro: ${error.message || JSON.stringify(error)}`);
      toast({
        title: 'Erro',
        description: `Não foi possível atualizar a função: ${error.message || JSON.stringify(error)}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user || !isAdmin) {
    return null; // Não renderiza nada se o usuário não for admin
  }

  return (
    <Layout title="Atualizar Função de Ranking de Comentários" showNavbarAndFooter>
      <Container maxW="container.md" py={8}>
        <VStack spacing={6} align="stretch">
          <Heading as="h1" size="xl">
            Atualizar Função de Ranking de Comentários
          </Heading>
          <Divider />
          
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Atualização de Função SQL</AlertTitle>
              <AlertDescription>
                Esta página permite atualizar a função SQL que calcula o ranking de comentários.
                A atualização vai corrigir o problema das tabelas incorretas no ranking.
              </AlertDescription>
            </Box>
          </Alert>

          <Box bg="gray.50" p={4} borderRadius="md" whiteSpace="pre-wrap" overflowX="auto">
            <Text fontWeight="bold" mb={2}>
              Alterações:
            </Text>
            <Code display="block" whiteSpace="pre" p={2} borderRadius="md">
{`- Usando tabela comentarios_questoes em vez de blog_comments
- Usando likes_comentarios para contar curtidas
- Mantendo p.foto_perfil como avatar_url
- Mantendo p.nome como display_name`}
            </Code>
          </Box>

          <Button
            colorScheme="blue"
            onClick={handleUpdateFunction}
            isLoading={isUpdating}
            loadingText="Atualizando..."
            size="lg"
          >
            Atualizar Função SQL
          </Button>

          {result && (
            <Alert
              status={result.includes('Erro') ? 'error' : 'success'}
              variant="subtle"
              borderRadius="md"
            >
              <AlertIcon />
              <AlertDescription>{result}</AlertDescription>
            </Alert>
          )}
        </VStack>
      </Container>
    </Layout>
  );
};

export default UpdateCommentRankingFunction; 