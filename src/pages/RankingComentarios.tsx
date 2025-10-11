import React, { useState, useEffect } from 'react';
import { fetchCommentRanking, CommentRankingUser } from '@/services/commentService';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ThumbsUp, MessageSquare, Trophy, XCircle } from 'lucide-react';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useNavigate } from 'react-router-dom';
import AdBanner from '@/components/ads/AdBanner';
import AdBannerList from '@/components/ads/AdBannerList';
import { PublicLayout } from "@/components/layout/PublicLayout";

const RankingComentarios: React.FC = () => {
  const [rankingData, setRankingData] = useState<CommentRankingUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { config } = useSiteConfig();
  const navigate = useNavigate();

  useEffect(() => {
    if (!config.pages.showCommentRankingPage) {
      return;
    }

    const loadRanking = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCommentRanking();
        setRankingData(data);
      } catch (err) {
        console.error("Erro ao carregar ranking:", err);
        setError("Não foi possível carregar o ranking. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    loadRanking();
  }, [config.pages.showCommentRankingPage]);

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

  const renderSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center p-6 bg-white rounded-lg shadow-sm">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="ml-6 flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  if (!config.pages.showCommentRankingPage) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex flex-col bg-[#f9fafb]">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-16 max-w-5xl">
            <div className="flex flex-col items-center justify-center text-center p-10 bg-white rounded-lg shadow-sm">
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Ranking desativado</h1>
              <p className="text-gray-600 mb-8 max-w-md">
                O ranking de comentários está temporariamente desativado pelo administrador.
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
          <div className="mb-12 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ranking de Comentários</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Conheça os usuários mais ativos e que mais contribuem com comentários na nossa plataforma. 
              O ranking é ordenado pela quantidade de curtidas recebidas e número de comentários feitos.
            </p>
          </div>
          
          {/* Anúncio na parte superior */}
          <div className="my-6">
            <AdBanner position="ranking_comentarios_top" className="rounded-lg" />
          </div>

          {loading && (
            <div className="my-10">
              {renderSkeleton()}
            </div>
          )}

          {error && (
            <div className="flex items-center p-6 my-10 bg-red-50 text-red-700 rounded-lg border border-red-100">
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && rankingData.length === 0 && (
            <div className="py-12 px-6 bg-white rounded-lg shadow-sm text-center my-10">
              <p className="text-lg text-gray-600">
                Nenhum comentário foi feito ainda. Seja o primeiro a comentar e aparecer no ranking!
              </p>
            </div>
          )}

          {!loading && !error && rankingData.length > 0 && (
            <div className="my-10">
              <div className="grid grid-cols-1 gap-4 mb-8">
                <div className="bg-[#5f2ebe]/5 rounded-lg p-6 border border-[#5f2ebe]/10">
                  <h2 className="flex items-center text-xl font-medium text-gray-900 mb-3">
                    <Trophy className="h-5 w-5 text-[#5f2ebe] mr-2" />
                    Como funciona o ranking?
                  </h2>
                  <p className="text-gray-600">
                    Os usuários são classificados primeiro pelo número total de curtidas recebidas em seus comentários, 
                    seguido pelo número total de comentários feitos. Participe ativamente com comentários relevantes 
                    para subir no ranking!
                  </p>
                </div>
              </div>

              {rankingData.map((user, index) => (
                <React.Fragment key={user.user_id}>
                  <div
                    className={`flex items-center p-6 bg-white rounded-lg shadow-sm border-l-4 transition hover:shadow-md ${
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{user.display_name || 'Usuário Anônimo'}</h3>
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center space-x-2" title="Total de Likes Recebidos">
                            <ThumbsUp className="h-4 w-4 text-[#5f2ebe]" />
                            <span className="font-medium">{user.total_likes}</span>
                            <span className="text-gray-500">likes</span>
                          </div>
                          <div className="flex items-center space-x-2" title="Total de Comentários Feitos">
                            <MessageSquare className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{user.comment_count}</span>
                            <span className="text-gray-500">comentários</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mostrar anúncio a cada 10 itens */}
                  {((index + 1) % 10 === 0 && index < rankingData.length - 1) && (
                    <div className="my-4">
                      <AdBannerList 
                        position="ranking_comentarios_list" 
                        interval={10} 
                        itemCount={rankingData.length}
                        className="rounded-lg" 
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </PublicLayout>
  );
};

export default RankingComentarios;