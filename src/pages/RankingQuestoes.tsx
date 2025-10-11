import React, { useState, useEffect } from 'react';
import { fetchQuestionAttemptsRanking, QuestionRankingUser, RankingPeriod } from '@/services/rankingService';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Trophy, Check, X, Percent, InfoIcon, XCircle, History, CalendarDays, CalendarRange } from 'lucide-react';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdBanner from '@/components/ads/AdBanner';
import AdBannerList from '@/components/ads/AdBannerList';
import { PublicLayout } from "@/components/layout/PublicLayout";

const RankingQuestoes: React.FC = () => {
  const [rankingData, setRankingData] = useState<QuestionRankingUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFunctionAvailable, setIsFunctionAvailable] = useState<boolean>(true);
  const [activePeriod, setActivePeriod] = useState<RankingPeriod>('all');
  const { user } = useAuth();
  const { config } = useSiteConfig();
  const navigate = useNavigate();

  useEffect(() => {
    if (!config.pages.showQuestionRankingPage) {
      return;
    }
    
    const loadRanking = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`Carregando ranking para o período: ${activePeriod}`);
        const data = await fetchQuestionAttemptsRanking(activePeriod);
        setRankingData(data);
        
        // Se não ocorreu erro, mas não temos dados,
        // verificamos se é porque não há dados ou porque a função não existe
        if (data.length === 0) {
          // Assumimos que a função está indisponível apenas se for o período "all"
          // porque é mais provável que existam dados para esse período
          setIsFunctionAvailable(activePeriod !== 'all');
        } else {
          setIsFunctionAvailable(true);
        }
      } catch (err) {
        console.error("Erro ao carregar ranking:", err);
        setError("Não foi possível carregar o ranking. Tente novamente mais tarde.");
        setIsFunctionAvailable(false);
      } finally {
        setLoading(false);
      }
    };

    loadRanking();
  }, [config.pages.showQuestionRankingPage, activePeriod]);

  // Função para gerar a cor da medalha baseada na posição
  const getMedalColor = (position: number): string => {
    switch (position) {
      case 0: return "text-yellow-500"; // Ouro
      case 1: return "text-gray-400";   // Prata
      case 2: return "text-amber-600";  // Bronze
      default: return "text-slate-300"; // Demais posições
    }
  };

  // Função para renderizar o ícone de posição
  const getPositionIcon = (position: number) => {
    if (position < 3) {
      return <Trophy className={`h-7 w-7 ${getMedalColor(position)}`} />;
    }
    return <span className="flex items-center justify-center w-7 h-7 font-semibold text-slate-500">{position + 1}</span>;
  };

  // Verificar se o usuário atual é o usuário no ranking
  const isCurrentUser = (userId: string) => {
    return user?.id === userId;
  };

  // Função para obter o título do período
  const getPeriodTitle = (): string => {
    switch (activePeriod) {
      case 'week': return 'da Semana';
      case 'month': return 'do Mês';
      case 'all': return 'de Todos os Tempos';
      default: return '';
    }
  };

  const renderSkeleton = () => (
    <div className="space-y-6">
      {[...Array(7)].map((_, index) => (
        <div key={index} className="flex items-center p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center w-full space-x-6">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-[180px] mb-2" />
              <div className="flex items-center space-x-6">
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Função renderRanking removida pois o conteúdo será renderizado inline com anúncios

  if (!config.pages.showQuestionRankingPage) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex flex-col bg-[#f9fafb]">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-16 max-w-5xl">
            <div className="flex flex-col items-center justify-center text-center p-10 bg-white rounded-lg shadow-sm">
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Ranking desativado</h1>
              <p className="text-gray-600 mb-8 max-w-md">
                O ranking de questões está temporariamente desativado pelo administrador.
              </p>
              <button 
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-[#5f2ebe] text-white rounded-md hover:bg-[#4f24a0] transition-colors"
              >
                Voltar para a página inicial
              </button>
            </div>
          </main>
          <Footer />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen flex flex-col bg-[#f9fafb]">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ranking de Questões {getPeriodTitle()}</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Os usuários são classificados com base na quantidade de questões respondidas corretamente.
              Quanto mais questões você acertar, melhor será sua posição no ranking!
            </p>
          </div>
          
          {/* Anúncio na parte superior */}
          <div className="my-6">
            <AdBanner position="ranking_questoes_top" className="rounded-lg" />
          </div>
          
          <div className="mb-6">
            <Tabs defaultValue="all" value={activePeriod} onValueChange={(value) => setActivePeriod(value as RankingPeriod)}>
              <div className="flex justify-center mb-6">
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                  <TabsTrigger value="week" className="flex items-center gap-2">
                    <CalendarRange className="h-4 w-4" />
                    <span>Semanal</span>
                  </TabsTrigger>
                  <TabsTrigger value="month" className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>Mensal</span>
                  </TabsTrigger>
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    <span>Todos</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="week">
                {loading && renderSkeleton()}
                {!loading && !error && isFunctionAvailable && rankingData.length > 0 && (
                  <>
                    <div className="grid grid-cols-1 gap-4 mb-8">
                      <div className="bg-[#5f2ebe]/5 rounded-lg p-6 border border-[#5f2ebe]/10">
                        <h2 className="flex items-center text-xl font-medium text-gray-900 mb-3">
                          <Trophy className="h-5 w-5 text-[#5f2ebe] mr-2" />
                          Como funciona o ranking?
                        </h2>
                        <p className="text-gray-600">
                          Os usuários são classificados principalmente pelo número de questões respondidas corretamente.
                          Em caso de empate, o número total de questões respondidas é considerado. Responda mais questões
                          e melhore seu desempenho para subir no ranking!
                        </p>
                      </div>
                    </div>
                    {rankingData.map((user, index) => (
                      <React.Fragment key={user.user_id}>
                        <div
                          className={`flex items-center p-6 bg-white rounded-lg shadow-sm border-l-4 transition hover:shadow-md ${
                            isCurrentUser(user.user_id) ? 'bg-blue-50 border-blue-500' : 
                            index === 0 ? 'border-yellow-500' : 
                            index === 1 ? 'border-gray-400' : 
                            index === 2 ? 'border-amber-600' : 'border-slate-200'
                          }`}
                        >
                          <div className="flex items-center w-full space-x-6">
                            <div className="flex-shrink-0">
                              {getPositionIcon(index)}
                            </div>
                            <Avatar className="h-14 w-14 border-2 border-white shadow">
                              <AvatarImage src={user.avatar_url ?? undefined} alt={user.display_name ?? 'Avatar'} />
                              <AvatarFallback className="bg-[#5f2ebe]/10 text-[#5f2ebe] font-medium">
                                {(user.display_name ?? 'U').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className={`text-lg font-semibold mb-1 ${isCurrentUser(user.user_id) ? 'text-blue-700' : 'text-gray-900'}`}>
                                {user.display_name || 'Usuário Anônimo'}
                                {isCurrentUser(user.user_id) && (
                                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Você
                                  </span>
                                )}
                              </h3>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1" title="Questões Corretas">
                                  <Check className="h-4 w-4 text-green-500" />
                                  <span className="font-medium">{user.correct_answers}</span>
                                  <span className="text-gray-500">corretas</span>
                                </div>
                                <div className="flex items-center space-x-1" title="Questões Incorretas">
                                  <X className="h-4 w-4 text-red-500" />
                                  <span className="font-medium">{user.wrong_answers}</span>
                                  <span className="text-gray-500">incorretas</span>
                                </div>
                                <div className="flex items-center space-x-1" title="Total de Questões Respondidas">
                                  <span className="font-medium">{user.total_questions}</span>
                                  <span className="text-gray-500">respondidas</span>
                                </div>
                                <div className="flex items-center space-x-1" title="Percentual de Acerto">
                                  <Percent className="h-4 w-4 text-[#5f2ebe]" />
                                  <span className="font-medium">
                                    {user.total_questions > 0 
                                      ? Math.round((user.correct_answers / user.total_questions) * 100) 
                                      : 0}%
                                  </span>
                                  <span className="text-gray-500">acerto</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Mostrar anúncio a cada 10 itens */}
                        {((index + 1) % 10 === 0 && index < rankingData.length - 1) && (
                          <div className="my-4">
                            <AdBannerList 
                              position="ranking_questoes_list" 
                              interval={10} 
                              itemCount={rankingData.length}
                              className="rounded-lg" 
                            />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </>
                )}
                {!loading && !error && isFunctionAvailable && rankingData.length === 0 && (
                  <div className="py-12 px-6 bg-white rounded-lg shadow-sm text-center">
                    <p className="text-lg text-gray-600">
                      Nenhum usuário respondeu questões ainda. Seja o primeiro!
                    </p>
                  </div>
                )}
                {error && (
                  <div className="flex items-center p-6 my-10 bg-red-50 text-red-700 rounded-lg border border-red-100">
                    <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="month">
                {loading && renderSkeleton()}
                {!loading && !error && isFunctionAvailable && rankingData.length > 0 && (
                  <>
                    <div className="grid grid-cols-1 gap-4 mb-8">
                      <div className="bg-[#5f2ebe]/5 rounded-lg p-6 border border-[#5f2ebe]/10">
                        <h2 className="flex items-center text-xl font-medium text-gray-900 mb-3">
                          <Trophy className="h-5 w-5 text-[#5f2ebe] mr-2" />
                          Como funciona o ranking?
                        </h2>
                        <p className="text-gray-600">
                          Os usuários são classificados principalmente pelo número de questões respondidas corretamente.
                          Em caso de empate, o número total de questões respondidas é considerado. Responda mais questões
                          e melhore seu desempenho para subir no ranking!
                        </p>
                      </div>
                    </div>
                    {rankingData.map((user, index) => (
                      <React.Fragment key={user.user_id}>
                        <div
                          className={`flex items-center p-6 bg-white rounded-lg shadow-sm border-l-4 transition hover:shadow-md ${
                            isCurrentUser(user.user_id) ? 'bg-blue-50 border-blue-500' : 
                            index === 0 ? 'border-yellow-500' : 
                            index === 1 ? 'border-gray-400' : 
                            index === 2 ? 'border-amber-600' : 'border-slate-200'
                          }`}
                        >
                          <div className="flex items-center w-full space-x-6">
                            <div className="flex-shrink-0">
                              {getPositionIcon(index)}
                            </div>
                            <Avatar className="h-14 w-14 border-2 border-white shadow">
                              <AvatarImage src={user.avatar_url ?? undefined} alt={user.display_name ?? 'Avatar'} />
                              <AvatarFallback className="bg-[#5f2ebe]/10 text-[#5f2ebe] font-medium">
                                {(user.display_name ?? 'U').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className={`text-lg font-semibold mb-1 ${isCurrentUser(user.user_id) ? 'text-blue-700' : 'text-gray-900'}`}>
                                {user.display_name || 'Usuário Anônimo'}
                                {isCurrentUser(user.user_id) && (
                                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Você
                                  </span>
                                )}
                              </h3>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1" title="Questões Corretas">
                                  <Check className="h-4 w-4 text-green-500" />
                                  <span className="font-medium">{user.correct_answers}</span>
                                  <span className="text-gray-500">corretas</span>
                                </div>
                                <div className="flex items-center space-x-1" title="Questões Incorretas">
                                  <X className="h-4 w-4 text-red-500" />
                                  <span className="font-medium">{user.wrong_answers}</span>
                                  <span className="text-gray-500">incorretas</span>
                                </div>
                                <div className="flex items-center space-x-1" title="Total de Questões Respondidas">
                                  <span className="font-medium">{user.total_questions}</span>
                                  <span className="text-gray-500">respondidas</span>
                                </div>
                                <div className="flex items-center space-x-1" title="Percentual de Acerto">
                                  <Percent className="h-4 w-4 text-[#5f2ebe]" />
                                  <span className="font-medium">
                                    {user.total_questions > 0 
                                      ? Math.round((user.correct_answers / user.total_questions) * 100) 
                                      : 0}%
                                  </span>
                                  <span className="text-gray-500">acerto</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Mostrar anúncio a cada 10 itens */}
                        {((index + 1) % 10 === 0 && index < rankingData.length - 1) && (
                          <div className="my-4">
                            <AdBannerList 
                              position="ranking_questoes_list" 
                              interval={10} 
                              itemCount={rankingData.length}
                              className="rounded-lg" 
                            />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </>
                )}
                {!loading && !error && isFunctionAvailable && rankingData.length === 0 && (
                  <div className="py-12 px-6 bg-white rounded-lg shadow-sm text-center">
                    <p className="text-lg text-gray-600">
                      Nenhum usuário respondeu questões ainda. Seja o primeiro!
                    </p>
                  </div>
                )}
                {error && (
                  <div className="flex items-center p-6 my-10 bg-red-50 text-red-700 rounded-lg border border-red-100">
                    <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="all">
                {loading && renderSkeleton()}
                {!loading && !error && isFunctionAvailable && rankingData.length > 0 && (
                  <>
                    <div className="grid grid-cols-1 gap-4 mb-8">
                      <div className="bg-[#5f2ebe]/5 rounded-lg p-6 border border-[#5f2ebe]/10">
                        <h2 className="flex items-center text-xl font-medium text-gray-900 mb-3">
                          <Trophy className="h-5 w-5 text-[#5f2ebe] mr-2" />
                          Como funciona o ranking?
                        </h2>
                        <p className="text-gray-600">
                          Os usuários são classificados principalmente pelo número de questões respondidas corretamente.
                          Em caso de empate, o número total de questões respondidas é considerado. Responda mais questões
                          e melhore seu desempenho para subir no ranking!
                        </p>
                      </div>
                    </div>
                    {rankingData.map((user, index) => (
                      <React.Fragment key={user.user_id}>
                        <div
                          className={`flex items-center p-6 bg-white rounded-lg shadow-sm border-l-4 transition hover:shadow-md ${
                            isCurrentUser(user.user_id) ? 'bg-blue-50 border-blue-500' : 
                            index === 0 ? 'border-yellow-500' : 
                            index === 1 ? 'border-gray-400' : 
                            index === 2 ? 'border-amber-600' : 'border-slate-200'
                          }`}
                        >
                          <div className="flex items-center w-full space-x-6">
                            <div className="flex-shrink-0">
                              {getPositionIcon(index)}
                            </div>
                            <Avatar className="h-14 w-14 border-2 border-white shadow">
                              <AvatarImage src={user.avatar_url ?? undefined} alt={user.display_name ?? 'Avatar'} />
                              <AvatarFallback className="bg-[#5f2ebe]/10 text-[#5f2ebe] font-medium">
                                {(user.display_name ?? 'U').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className={`text-lg font-semibold mb-1 ${isCurrentUser(user.user_id) ? 'text-blue-700' : 'text-gray-900'}`}>
                                {user.display_name || 'Usuário Anônimo'}
                                {isCurrentUser(user.user_id) && (
                                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Você
                                  </span>
                                )}
                              </h3>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1" title="Questões Corretas">
                                  <Check className="h-4 w-4 text-green-500" />
                                  <span className="font-medium">{user.correct_answers}</span>
                                  <span className="text-gray-500">corretas</span>
                                </div>
                                <div className="flex items-center space-x-1" title="Questões Incorretas">
                                  <X className="h-4 w-4 text-red-500" />
                                  <span className="font-medium">{user.wrong_answers}</span>
                                  <span className="text-gray-500">incorretas</span>
                                </div>
                                <div className="flex items-center space-x-1" title="Total de Questões Respondidas">
                                  <span className="font-medium">{user.total_questions}</span>
                                  <span className="text-gray-500">respondidas</span>
                                </div>
                                <div className="flex items-center space-x-1" title="Percentual de Acerto">
                                  <Percent className="h-4 w-4 text-[#5f2ebe]" />
                                  <span className="font-medium">
                                    {user.total_questions > 0 
                                      ? Math.round((user.correct_answers / user.total_questions) * 100) 
                                      : 0}%
                                  </span>
                                  <span className="text-gray-500">acerto</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Mostrar anúncio a cada 10 itens */}
                        {((index + 1) % 10 === 0 && index < rankingData.length - 1) && (
                          <div className="my-4">
                            <AdBannerList 
                              position="ranking_questoes_list" 
                              interval={10} 
                              itemCount={rankingData.length}
                              className="rounded-lg" 
                            />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </>
                )}
                {!loading && !error && isFunctionAvailable && rankingData.length === 0 && (
                  <div className="py-12 px-6 bg-white rounded-lg shadow-sm text-center">
                    <p className="text-lg text-gray-600">
                      Nenhum usuário respondeu questões ainda. Seja o primeiro!
                    </p>
                  </div>
                )}
                {error && (
                  <div className="flex items-center p-6 my-10 bg-red-50 text-red-700 rounded-lg border border-red-100">
                    <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {!loading && !error && !isFunctionAvailable && (
            <div className="flex items-center p-6 my-10 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
              <InfoIcon className="h-5 w-5 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium">O ranking de questões está sendo implementado</p>
                <p className="mt-1">
                  Esta funcionalidade estará disponível em breve. Enquanto isso, continue respondendo questões
                  para melhorar sua posição quando o ranking for ativado!
                </p>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </PublicLayout>
  );
};

export default RankingQuestoes;