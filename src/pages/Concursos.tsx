import { useState, useEffect } from 'react';
import { Concurso, Estado } from '../types/concurso';
import { Badge } from '../components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { concursosService } from '@/services/concursosService';
import { fetchBlogPostById } from '@/services/blogService';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// Lista de estados brasileiros para o filtro
const ESTADOS: Estado[] = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR',
  'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
  'Federal', 'Nacional'
];

const Concursos = () => {
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState<Estado | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Carregar concursos do banco de dados
  useEffect(() => {
    const carregarConcursos = async () => {
      setLoading(true);
      try {
        // Carregar apenas concursos ativos
        const concursosCarregados = await concursosService.listarConcursos(true);
        setConcursos(concursosCarregados);
      } catch (error) {
        console.error('Erro ao carregar concursos:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarConcursos();
  }, []);

  // Filtrar concursos por estado
  const concursosFiltrados = filtroAtivo
    ? concursos.filter(concurso => concurso.estados.includes(filtroAtivo))
    : concursos;

  // Formatar período de inscrição
  const formatarPeriodo = (dataInicio: string, dataFim: string) => {
    return `${format(new Date(dataInicio), 'dd/MM/yyyy', { locale: ptBR })} a ${format(new Date(dataFim), 'dd/MM/yyyy', { locale: ptBR })}`;
  };

  // Navegar para a página do post do blog com detalhes do concurso
  const navegarParaPost = async (postId: string) => {
    try {
      const post = await fetchBlogPostById(postId);
      if (post && post.slug) {
        navigate(`/blog/${post.slug}`);
      } else {
        // Fallback para o ID direto se não conseguir obter o slug
        navigate(`/blog/${postId}`);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do post:', error);
      navigate(`/blog/${postId}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-6">Concursos abertos</h1>
          
          {/* Filtro por estados */}
          <div className="flex flex-wrap gap-2 mb-8">
            {ESTADOS.map(estado => (
              <button
                key={estado}
                onClick={() => setFiltroAtivo(filtroAtivo === estado ? null : estado)}
                className={`px-3 py-1 border rounded-md ${
                  filtroAtivo === estado 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {estado}
              </button>
            ))}
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="text-center py-10">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando concursos...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {concursosFiltrados.length > 0 ? (
                concursosFiltrados.map(concurso => {
                  const dataFim = new Date(concurso.dataFimInscricao);
                  const hoje = new Date();
                  const diasRestantes = Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
                  const isUrgente = diasRestantes <= 7 && diasRestantes > 0;
                  
                  return (
                    <div 
                      key={concurso.id} 
                      className="border rounded-lg p-6 hover:bg-gray-50 transition-colors cursor-pointer relative overflow-hidden"
                      onClick={() => concurso.postId && navegarParaPost(concurso.postId)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-bold mb-2">{concurso.titulo}</h2>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-gray-600">Inscrições: </span>
                            <span>{formatarPeriodo(concurso.dataInicioInscricao, concurso.dataFimInscricao)}</span>
                            {concurso.prorrogado && (
                              <Badge className="bg-purple-600">PRORROGADO</Badge>
                            )}
                            {isUrgente && (
                              <Badge variant="destructive">
                                {diasRestantes === 1 ? 'ÚLTIMO DIA' : `${diasRestantes} DIAS RESTANTES`}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-0 mb-2">
                            <div>
                              <span className="text-gray-600">Cargos: </span>
                              <span>{concurso.cargos.join(', ')}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {concurso.niveis.map((nivel) => (
                                <Badge key={nivel} variant="outline" className="font-normal">
                                  {nivel}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-bold mb-1 text-lg">VAGAS: {concurso.vagas.toLocaleString()}</div>
                          <div className="text-gray-600">{concurso.salario}</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-gray-500">
                  {filtroAtivo ? 
                    `Nenhum concurso encontrado para o estado ${filtroAtivo}.` :
                    'Nenhum concurso disponível no momento.'
                  }
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Concursos; 