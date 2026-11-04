import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, BookOpen, PenLine, Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { RankingContribuidor, buscarRankingContribuicoes } from "@/services/correcoesTeoria";

const corMedalha = (pos: number) =>
  pos === 0 ? "text-yellow-500" : pos === 1 ? "text-gray-400" : pos === 2 ? "text-amber-600" : "text-slate-300";

const corBorda = (pos: number) =>
  pos === 0 ? "border-yellow-500" : pos === 1 ? "border-gray-400" : pos === 2 ? "border-amber-600" : "border-slate-200";

const RankingContribuicoes: React.FC = () => {
  const [ranking, setRanking] = useState<RankingContribuidor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    buscarRankingContribuicoes(100)
      .then(setRanking)
      .catch((e) => {
        console.error("Erro ao carregar ranking de contribuições:", e);
        setErro("Não foi possível carregar o ranking. Tente novamente mais tarde.");
      })
      .finally(() => setCarregando(false));
  }, []);

  return (
    <PublicLayout>
      <div className="min-h-screen flex flex-col bg-[#f9fafb]">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ranking de Contribuições</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Quem mais ajudou a melhorar as teorias do Bom Estudo com correções aprovadas pela equipe.
            </p>
          </div>

          <div className="bg-[#5f2ebe]/5 rounded-lg p-6 border border-[#5f2ebe]/10 mb-8">
            <h2 className="flex items-center text-xl font-medium text-gray-900 mb-3">
              <Trophy className="h-5 w-5 text-[#5f2ebe] mr-2" />
              Como entrar no ranking?
            </h2>
            <p className="text-gray-600">
              Abra uma teoria, selecione o trecho com erro e clique em "Sugerir correção". Cada correção aprovada conta
              um ponto; em caso de empate, vale quem contribuiu com mais teorias diferentes. Seu nome também aparece
              nos créditos, no fim da teoria corrigida.
            </p>
            <Link to="/teorias" className="inline-block mt-3 text-sm font-medium text-[#5f2ebe] hover:underline">
              Ver teorias →
            </Link>
          </div>

          {carregando && (
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
          )}

          {erro && (
            <div className="flex items-center p-6 bg-red-50 text-red-700 rounded-lg border border-red-100">
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              <p>{erro}</p>
            </div>
          )}

          {!carregando && !erro && ranking.length === 0 && (
            <div className="py-12 px-6 bg-white rounded-lg shadow-sm text-center">
              <p className="text-lg text-gray-600">
                Ainda não há correções aprovadas. Seja o primeiro a contribuir e aparecer aqui!
              </p>
            </div>
          )}

          {!carregando && !erro && ranking.length > 0 && (
            <div className="space-y-4">
              {ranking.map((u, i) => (
                <div
                  key={u.user_id}
                  className={`flex items-center p-5 bg-white rounded-lg shadow-sm border-l-4 transition hover:shadow-md ${corBorda(i)}`}
                >
                  <div className="flex items-center w-full gap-5">
                    <div className="flex-shrink-0 w-7 flex justify-center">
                      {i < 3 ? (
                        <Trophy className={`h-7 w-7 ${corMedalha(i)}`} />
                      ) : (
                        <span className="font-semibold text-slate-500">{i + 1}</span>
                      )}
                    </div>
                    <Avatar className="h-12 w-12 border-2 border-white shadow">
                      <AvatarImage src={u.avatar_url ?? undefined} alt={u.display_name ?? "Avatar"} />
                      <AvatarFallback className="bg-[#5f2ebe]/10 text-[#5f2ebe] font-medium">
                        {(u.display_name ?? "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{u.display_name || "Usuário"}</h3>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-600">
                        <span className="flex items-center gap-2" title="Correções aprovadas">
                          <PenLine className="h-4 w-4 text-[#5f2ebe]" />
                          <span className="font-medium">{u.total_correcoes}</span>
                          <span className="text-gray-500">{u.total_correcoes === 1 ? "correção" : "correções"}</span>
                        </span>
                        <span className="flex items-center gap-2" title="Teorias diferentes corrigidas">
                          <BookOpen className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{u.total_teorias}</span>
                          <span className="text-gray-500">{u.total_teorias === 1 ? "teoria" : "teorias"}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </PublicLayout>
  );
};

export default RankingContribuicoes;
