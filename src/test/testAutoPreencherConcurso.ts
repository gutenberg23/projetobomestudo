// Script para testar o serviço de auto preenchimento de concursos
import { autoPreencherConcurso } from '@/services/autoPreencherConcursoService';

// Função para simular um post e testar a extração
async function testAutoPreencher() {
  try {
    
    // Este é um teste que requer um postId válido
    // Na prática, você precisaria de um ID real de post do banco de dados
    const fakePostId = '00000000-0000-0000-0000-000000000000';
    
    
    // Esta chamada falhará porque o postId é falso, mas serve para testar a estrutura
    const result = await autoPreencherConcurso(fakePostId);
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

// Executar a função
testAutoPreencher();