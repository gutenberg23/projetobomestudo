import { useQuestionStatsFromLink } from "@/hooks/useQuestionStatsFromLink";

interface TestStatsComponentProps {
  userId: string;
}

export const TestStatsComponent = ({ userId }: TestStatsComponentProps) => {
  // Link de teste com filtros simples
  const testLink = "https://bomestudo.com.br/questions?disciplines=%5B%22L%C3%ADngua%20Portuguesa%22%5D&institutions=%5B%22FGV%20-%20Funda%C3%A7%C3%A3o%20Get%C3%BAlio%20Vargas%22%5D";
  
  const { stats, isLoading } = useQuestionStatsFromLink(testLink, userId);

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3 className="font-bold mb-2">Teste de Estatísticas</h3>
      <p>Usuário: {userId}</p>
      <p>Link: {testLink}</p>
      <p>Carregando: {isLoading ? 'Sim' : 'Não'}</p>
      <div className="mt-2">
        <p>Total de questões: {stats.totalQuestions}</p>
        <p>Total de tentativas: {stats.totalAttempts}</p>
        <p>Acertos: {stats.correctAnswers}</p>
        <p>Erros: {stats.wrongAnswers}</p>
      </div>
    </div>
  );
};