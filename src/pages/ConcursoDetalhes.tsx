import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Concurso, Cargo } from '../types/concurso';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { concursosService } from '@/services/concursosService';
import { fetchBlogPostById } from '@/services/blogService';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Link } from 'react-router-dom';
import { PublicLayout } from "@/components/layout/PublicLayout";

// Importando de forma individual para evitar conflitos
import { CalendarIcon } from '@heroicons/react/24/outline';
import { BriefcaseIcon } from '@heroicons/react/24/outline';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const ConcursoDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const [concurso, setConcurso] = useState<Concurso | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [blogPost, setBlogPost] = useState<any | null>(null);
  const [blogPostLoading, setBlogPostLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  // Carregar detalhes do concurso
  useEffect(() => {
    const carregarConcurso = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const concursoCarregado = await concursosService.buscarConcurso(id);
        setConcurso(concursoCarregado);
        
        // Se o concurso tiver um post associado, carregá-lo
        if (concursoCarregado?.postId) {
          setBlogPostLoading(true);
          try {
            const post = await fetchBlogPostById(concursoCarregado.postId);
            setBlogPost(post);
          } catch (error) {
            console.error('Erro ao carregar post do blog:', error);
          } finally {
            setBlogPostLoading(false);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar concurso:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarConcurso();
  }, [id]);

  // Navegar para a página do post do blog com detalhes do concurso
  const navegarParaPost = () => {
    if (blogPost?.slug) {
      navigate(`/blog/${blogPost.slug}`);
    } else if (concurso?.postId) {
      navigate(`/blog/${concurso.postId}`);
    }
  };

  // Formatar período de inscrição
  const formatarPeriodo = (dataInicio: string, dataFim: string) => {
    return `${format(new Date(dataInicio), 'dd/MM/yyyy', { locale: ptBR })} a ${format(new Date(dataFim), 'dd/MM/yyyy', { locale: ptBR })}`;
  };

  // Helper para exibir texto do cargo
  const exibirTextoCargo = (cargo: Cargo): string => {
    return typeof cargo === 'string' ? cargo : cargo.nome;
  };

  // Verificar se inscrições estão abertas
  const inscricoesAbertas = () => {
    if (!concurso) return false;
    
    const hoje = new Date();
    const fimInscricao = new Date(concurso.dataFimInscricao);
    
    return hoje <= fimInscricao;
  };

  return (
    <PublicLayout>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="loader"></div>
              </div>
            ) : !concurso ? (
              <div className="bg-white rounded-lg p-8 text-center shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Concurso não encontrado</h2>
                <p className="text-gray-600 mb-6">O concurso que você está procurando não existe ou foi removido.</p>
                <Link 
                  to="/concursos" 
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Voltar para a lista de concursos
                </Link>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <Link 
                    to="/concursos" 
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Voltar para todos os concursos
                  </Link>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
                  <div className="p-6 sm:p-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{concurso.titulo}</h1>
                    
                    {/* Status das inscrições */}
                    <div className="mb-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        inscricoesAbertas() 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {inscricoesAbertas() ? 'Inscrições abertas' : 'Inscrições encerradas'}
                      </span>
                      {concurso.prorrogado && (
                        <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          Prorrogado
                        </span>
                      )}
                    </div>
                    
                    {/* Detalhes do concurso */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            <CalendarIcon className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-900">Período de inscrição</h3>
                            <p className="mt-1 text-sm text-gray-600">
                              {formatarPeriodo(concurso.dataInicioInscricao, concurso.dataFimInscricao)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            <BookOpenIcon className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-900">Níveis de escolaridade</h3>
                            <div className="mt-1 text-sm text-gray-600">
                              {concurso.niveis.map((nivel, index) => (
                                <span key={nivel} className="mr-2 inline-block">
                                  {nivel}{index < concurso.niveis.length - 1 ? ',' : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-900">Salário</h3>
                            <p className="mt-1 text-sm text-gray-600">
                              Até {concurso.salario}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            <BriefcaseIcon className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-900">Cargos</h3>
                            <div className="mt-1 text-sm text-gray-600">
                              {concurso.cargos.map((cargo, index) => (
                                <span key={`cargo-${index}`} className="mr-2 inline-block">
                                  {exibirTextoCargo(cargo)}{index < concurso.cargos.length - 1 ? ',' : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            <MapPinIcon className="h-5 w-5 text-red-600" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-900">Estados</h3>
                            <div className="mt-1 text-sm text-gray-600">
                              {concurso.estados.map((estado, index) => (
                                <span key={`estado-${index}`} className="mr-2 inline-block">
                                  {estado}{index < concurso.estados.length - 1 ? ',' : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            <InformationCircleIcon className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-900">Vagas</h3>
                            <p className="mt-1 text-sm text-gray-600">
                              {concurso.vagas}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Informações adicionais do concurso */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Adicionais</h2>
                      <div className="prose max-w-none text-gray-600">
                        {concurso.descricao ? (
                          <div dangerouslySetInnerHTML={{ __html: concurso.descricao }} />
                        ) : (
                          <p>Nenhuma informação adicional disponível para este concurso.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Post do blog relacionado ao concurso */}
                {concurso.postId && (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6 sm:p-8">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-3 flex-1">
                          <h2 className="text-lg font-semibold text-gray-900">Detalhes Complementares</h2>
                          <p className="mt-1 text-sm text-gray-600">
                            Este concurso possui informações detalhadas em nosso blog. 
                            Clique no botão abaixo para acessar o conteúdo completo.
                          </p>
                          <div className="mt-4">
                            <button
                              onClick={navegarParaPost}
                              className="mt-2 text-blue-800 font-medium hover:underline inline-flex items-center"
                            >
                              {blogPostLoading ? (
                                'Carregando...'
                              ) : (
                                <>
                                  {blogPost?.title || 'Ver mais detalhes sobre o concurso'}
                                  <ArrowLeftIcon className="ml-1 h-4 w-4 rotate-180" />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </PublicLayout>
  );
};

export default ConcursoDetalhes;