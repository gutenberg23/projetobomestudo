import React, { useState, useEffect, useRef } from 'react';
import { Concurso, Estado, Cargo } from '../types/concurso';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { concursosService } from '@/services/concursosService';
import { fetchBlogPostById } from '@/services/blogService';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import AdBannerList from '@/components/ads/AdBannerList';
import { PublicLayout } from '@/components/layout/PublicLayout';

// Importando ícones
import { CalendarIcon } from "@heroicons/react/24/outline";
import { BriefcaseIcon } from "@heroicons/react/24/outline";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

// Lista de estados brasileiros para o filtro
const ESTADOS: { id: string; name: string }[] = [
  { id: 'Federal', name: 'Federal' },
  { id: 'Nacional', name: 'Nacional' },
  { id: 'AC', name: 'AC' },
  { id: 'AL', name: 'AL' },
  { id: 'AM', name: 'AM' },
  { id: 'AP', name: 'AP' },
  { id: 'BA', name: 'BA' },
  { id: 'CE', name: 'CE' },
  { id: 'DF', name: 'DF' },
  { id: 'ES', name: 'ES' },
  { id: 'GO', name: 'GO' },
  { id: 'MA', name: 'MA' },
  { id: 'MG', name: 'MG' },
  { id: 'MS', name: 'MS' },
  { id: 'MT', name: 'MT' },
  { id: 'PA', name: 'PA' },
  { id: 'PB', name: 'PB' },
  { id: 'PE', name: 'PE' },
  { id: 'PI', name: 'PI' },
  { id: 'PR', name: 'PR' },
  { id: 'RJ', name: 'RJ' },
  { id: 'RN', name: 'RN' },
  { id: 'RO', name: 'RO' },
  { id: 'RR', name: 'RR' },
  { id: 'RS', name: 'RS' },
  { id: 'SC', name: 'SC' },
  { id: 'SE', name: 'SE' },
  { id: 'SP', name: 'SP' },
  { id: 'TO', name: 'TO' }
];

// Lista de estados ordenados alfabeticamente para exibição
const ESTADOS_ORDENADOS: { id: string; name: string }[] = [
  { id: 'Nacional', name: 'Nacional' },
  { id: 'AC', name: 'Acre' },
  { id: 'AL', name: 'Alagoas' },
  { id: 'AP', name: 'Amapá' },
  { id: 'AM', name: 'Amazonas' },
  { id: 'BA', name: 'Bahia' },
  { id: 'CE', name: 'Ceará' },
  { id: 'DF', name: 'Distrito Federal' },
  { id: 'ES', name: 'Espírito Santo' },
  { id: 'GO', name: 'Goiás' },
  { id: 'MA', name: 'Maranhão' },
  { id: 'MT', name: 'Mato Grosso' },
  { id: 'MS', name: 'Mato Grosso do Sul' },
  { id: 'MG', name: 'Minas Gerais' },
  { id: 'PA', name: 'Pará' },
  { id: 'PB', name: 'Paraíba' },
  { id: 'PR', name: 'Paraná' },
  { id: 'PE', name: 'Pernambuco' },
  { id: 'PI', name: 'Piauí' },
  { id: 'RJ', name: 'Rio de Janeiro' },
  { id: 'RN', name: 'Rio Grande do Norte' },
  { id: 'RS', name: 'Rio Grande do Sul' },
  { id: 'RO', name: 'Rondônia' },
  { id: 'RR', name: 'Roraima' },
  { id: 'SC', name: 'Santa Catarina' },
  { id: 'SP', name: 'São Paulo' },
  { id: 'SE', name: 'Sergipe' },
  { id: 'TO', name: 'Tocantins' },
  { id: 'Federal', name: 'Federal' }
];

const Concursos = () => {
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState<string | null>(null);
  const [termoPesquisa, setTermoPesquisa] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
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

  // Função para scroll horizontal
  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Função para verificar se o concurso contém o termo de pesquisa
  const concursoContemTermo = (concurso: Concurso, termo: string): boolean => {
    if (!termo.trim()) return true;
    
    const termoBusca = termo.trim().toLowerCase();
    
    // Verifica no título
    if (concurso.titulo.toLowerCase().includes(termoBusca)) return true;
    
    // Verifica nos cargos
    if (concurso.cargos.some(cargo => 
      typeof cargo === 'string'
        ? cargo.toLowerCase().includes(termoBusca)
        : cargo.nome.toLowerCase().includes(termoBusca)
    )) return true;
    
    // Verifica nos estados
    if (concurso.estados.some(estado => estado.toLowerCase().includes(termoBusca))) return true;
    
    // Verifica no salário
    if (concurso.salario.toLowerCase().includes(termoBusca)) return true;
    
    // Verifica nos níveis de ensino
    if (concurso.niveis.some(nivel => nivel.toLowerCase().includes(termoBusca))) return true;
    
    return false;
  };

  // Aplicar filtros (estado e termo de pesquisa)
  const concursosFiltrados = concursos
    .filter(concurso => !filtroAtivo || concurso.estados.includes(filtroAtivo as Estado))
    .filter(concurso => concursoContemTermo(concurso, termoPesquisa));

  // Organizar concursos por estados
  const concursosPorEstado = () => {
    const resultado: Record<string, Concurso[]> = {};
    
    // Se houver filtro ativo ou termo de pesquisa, manter a lista simples
    if (filtroAtivo || termoPesquisa) {
      return { 'Filtrados': concursosFiltrados };
    }
    
    // Para cada concurso, adicioná-lo a todos os seus estados
    concursosFiltrados.forEach(concurso => {
      concurso.estados.forEach(estado => {
        if (!resultado[estado]) {
          resultado[estado] = [];
        }
        resultado[estado].push(concurso);
      });
    });
    
    return resultado;
  };

  // Formatar período de inscrição
  const formatarPeriodo = (dataInicio: string, dataFim: string) => {
    return `${format(new Date(dataInicio), 'dd/MM/yyyy', { locale: ptBR })} a ${format(new Date(dataFim), 'dd/MM/yyyy', { locale: ptBR })}`;
  };

  // Helper para exibir texto do cargo
  const exibirTextoCargo = (cargo: Cargo): string => {
    return typeof cargo === 'string' ? cargo : cargo.nome;
  };

  // Limpar a pesquisa
  const limparPesquisa = () => {
    setTermoPesquisa('');
  };

  // Navegar para o post do blog relacionado ao concurso
  const navegarParaPost = async (concurso: Concurso) => {
    if (!concurso.postId) {
      // Se não tiver postId, redireciona para página de detalhes do concurso
      navigate(`/concursos/${concurso.id}`);
      return;
    }

    try {
      // Tenta buscar informações do post para obter o slug
      const post = await fetchBlogPostById(concurso.postId);
      if (post && post.slug) {
        navigate(`/blog/${post.slug}`);
      } else {
        // Caso não encontre o slug, usa o ID do post
        navigate(`/blog/${concurso.postId}`);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do post:', error);
      navigate(`/blog/${concurso.postId}`);
    }
  };

  // Obter o nome completo do estado
  const getNomeEstado = (estadoId: string) => {
    const estado = ESTADOS_ORDENADOS.find(e => e.id === estadoId);
    return estado ? estado.name : estadoId;
  };

  // Renderizar concursos organizados por estado
  const renderizarConcursosPorEstado = () => {
    const concursosAgrupados = concursosPorEstado();
    
    // Se houver filtro ativo ou termo de pesquisa, mostrar lista simples
    if (filtroAtivo || termoPesquisa) {
      return (
        <div className="grid grid-cols-1 gap-6">
          {concursosFiltrados.map((concurso, index) => (
            <React.Fragment key={concurso.id}>
              {renderizarCardConcurso(concurso, index)}
            </React.Fragment>
          ))}
        </div>
      );
    }
    
    // Ordenar estados alfabeticamente
    const estadosComConcursos = Object.keys(concursosAgrupados)
      .filter(estado => concursosAgrupados[estado].length > 0);
      
    const estadosOrdenados = ESTADOS_ORDENADOS
      .filter(estado => estadosComConcursos.includes(estado.id))
      .map(estado => estado.id);
      
    // Adicionar estados que não estão na lista padrão
    const estadosRestantes = estadosComConcursos
      .filter(estado => !ESTADOS_ORDENADOS.some(e => e.id === estado))
      .sort();
      
    const todosEstadosOrdenados = [...estadosOrdenados, ...estadosRestantes];
    
    return (
      <div className="space-y-8">
        {todosEstadosOrdenados.map(estadoId => {
          const concursosDoEstado = concursosAgrupados[estadoId] || [];
          if (concursosDoEstado.length === 0) return null;
          
          return (
            <div key={estadoId}>
              <h2 className="text-xl font-bold text-[#272f3c] mb-4">{getNomeEstado(estadoId)}</h2>
              <div className="grid grid-cols-1 gap-6">
                {concursosDoEstado.map((concurso, index) => (
                  <React.Fragment key={`${estadoId}-${concurso.id}`}>
                    {renderizarCardConcurso(concurso, index)}
                  </React.Fragment>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Renderizar card de concurso
  const renderizarCardConcurso = (concurso: Concurso, index: number) => {
    // Contar quantos concursos já foram renderizados para calcular a posição dos anúncios
    const totalConcursosRenderizados = (() => {
      const concursosAgrupados = concursosPorEstado();
      if (filtroAtivo || termoPesquisa) {
        return index;
      }
      
      let count = 0;
      const estados = Object.keys(concursosAgrupados);
      const estadosOrdenados = ESTADOS_ORDENADOS
        .filter(estado => estados.includes(estado.id))
        .map(estado => estado.id);
        
      const estadosRestantes = estados
        .filter(estado => !ESTADOS_ORDENADOS.some(e => e.id === estado))
        .sort();
        
      const todosEstadosOrdenados = [...estadosOrdenados, ...estadosRestantes];
      
      for (const estado of todosEstadosOrdenados) {
        const concursosDoEstado = concursosAgrupados[estado] || [];
        for (let i = 0; i < concursosDoEstado.length; i++) {
          if (concursosDoEstado[i].id === concurso.id) {
            return count + i;
          }
        }
        count += concursosDoEstado.length;
      }
      return index;
    })();
    
    return (
      <>
        <div
          className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              <div>
                <button 
                  onClick={() => navegarParaPost(concurso)}
                  className="text-left text-base sm:text-lg md:text-xl font-bold text-[#5f2ebe] hover:text-[#4924a1] transition-colors line-clamp-2 text-sm md:text-lg"
                >
                  {concurso.titulo}
                </button>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-2.5">
                  {/* Coluna da esquerda */}
                  <div className="space-y-3 sm:space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <div className="flex items-center text-[#5f2ebe] min-w-[90px]">
                        <CalendarIcon className="h-4 w-4 mr-1.5" />
                        <span className="text-xs font-medium">Inscrições:</span>
                      </div>
                      <span className="text-xs text-gray-700">
                        {formatarPeriodo(concurso.dataInicioInscricao, concurso.dataFimInscricao)}
                        {concurso.prorrogado && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Prorrogado
                          </span>
                        )}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <div className="flex items-center text-[#5f2ebe] min-w-[90px]">
                        <BriefcaseIcon className="h-4 w-4 mr-1.5" />
                        <span className="text-xs font-medium">Cargos:</span>
                      </div>
                      <span className="text-xs text-gray-700 line-clamp-1">
                        {concurso.cargos.map(cargo => exibirTextoCargo(cargo)).join(', ')}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <div className="flex items-center text-[#5f2ebe] min-w-[90px]">
                        <MapPinIcon className="h-4 w-4 mr-1.5" />
                        <span className="text-xs font-medium">Estados:</span>
                      </div>
                      <span className="text-xs text-gray-700">
                        {concurso.estados.join(', ')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Coluna da direita */}
                  <div className="space-y-3 sm:space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <div className="flex items-center text-[#5f2ebe] min-w-[90px]">
                        <CurrencyDollarIcon className="h-4 w-4 mr-1.5" />
                        <span className="text-xs font-medium">Salário:</span>
                      </div>
                      <span className="text-xs text-gray-700">
                        Até {concurso.salario}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <div className="flex items-center text-[#5f2ebe] min-w-[90px]">
                        <BriefcaseIcon className="h-4 w-4 mr-1.5" />
                        <span className="text-xs font-medium">Vagas:</span>
                      </div>
                      <span className="text-xs text-gray-700">
                        {concurso.vagas}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mostrar anúncio a cada 5 concursos */}
        {((totalConcursosRenderizados + 1) % 5 === 0) && (
          <div className="my-4">
            <AdBannerList 
              position="concursos_list" 
              interval={5} 
              itemCount={concursosFiltrados.length}
              className="rounded-lg" 
            />
          </div>
        )}
      </>
    );
  };

  return (
    <PublicLayout>
      <div className="min-h-screen flex flex-col bg-[rgb(242,244,246)]">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl text-[#272f3c] font-extrabold md:text-2xl mb-2 text-xl">Concursos abertos</h1>
            
            {/* Campo de pesquisa */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 p-2.5"
                  placeholder="Pesquisar concursos (título, cargo, estado, etc)"
                  value={termoPesquisa}
                  onChange={(e) => setTermoPesquisa(e.target.value)}
                />
                {termoPesquisa && (
                  <button
                    type="button"
                    onClick={limparPesquisa}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Filtro por estados - estilo idêntico ao blog */}
            <div className="relative mb-6 w-full">
              <button 
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 rounded-full p-1 shadow-md"
                aria-label="Rolar para a esquerda"
              >
                <ChevronLeftIcon className="h-5 w-5 text-[#67748a]" />
              </button>
              
              <div 
                ref={containerRef}
                className="flex overflow-x-auto scrollbar-hide py-2 px-6 space-x-2 w-full"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {ESTADOS.map((estado) => (
                  <button
                    key={estado.id}
                    onClick={() => setFiltroAtivo(filtroAtivo === estado.id ? null : estado.id)}
                    className={cn(
                      "px-3 py-1 text-sm font-medium rounded-md whitespace-nowrap transition-colors text-center",
                      estado.id === 'Federal' || estado.id === 'Nacional' ? "min-w-[80px]" : "min-w-[40px]",
                      filtroAtivo === estado.id
                        ? "bg-[#5f2ebe]/20 text-[#5f2ebe] border border-[#5f2ebe]"
                        : "bg-gray-100 hover:bg-gray-200 text-[#67748a]"
                    )}
                  >
                    {estado.name}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 rounded-full p-1 shadow-md"
                aria-label="Rolar para a direita"
              >
                <ChevronRightIcon className="h-5 w-5 text-[#67748a]" />
              </button>
            </div>

            {/* Lista de concursos organizados por estado */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="loader"></div>
              </div>
            ) : concursosFiltrados.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-base text-gray-600 text-xs md:text-sm">Nenhum concurso encontrado.</p>
                {(filtroAtivo || termoPesquisa) && (
                  <div className="mt-4 flex justify-center gap-4">
                    {filtroAtivo && (
                      <button 
                        onClick={() => setFiltroAtivo(null)}
                        className="text-[#5f2ebe] hover:underline text-xs md:text-sm"
                      >
                        Limpar filtro de estado
                      </button>
                    )}
                    {termoPesquisa && (
                      <button 
                        onClick={limparPesquisa}
                        className="text-[#5f2ebe] hover:underline text-xs md:text-sm"
                      >
                        Limpar pesquisa
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              renderizarConcursosPorEstado()
            )}
          </div>
        </main>
        <Footer />
      </div>
    </PublicLayout>
  );
};

export default Concursos;