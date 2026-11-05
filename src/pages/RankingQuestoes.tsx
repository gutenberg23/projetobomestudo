import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, InfoIcon, Percent, X } from "lucide-react";
import { fetchQuestionAttemptsRanking, QuestionRankingUser, RankingPeriod } from "@/services/rankingService";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Segmentos } from "@/components/course/ui";
import { ItemRanking, PaginaRanking, RankingDesativado } from "@/components/ranking/PaginaRanking";

const PERIODOS: Array<{ valor: RankingPeriod; rotulo: string; titulo: string }> = [
  { valor: "week", rotulo: "Semana", titulo: "da semana" },
  { valor: "month", rotulo: "Mês", titulo: "do mês" },
  { valor: "all", rotulo: "Geral", titulo: "de todos os tempos" },
];

type LinhaQuestoes = QuestionRankingUser & { total_questions?: number };

const RankingQuestoes: React.FC = () => {
  const { config } = useSiteConfig();
  const ativo = config.pages.showQuestionRankingPage;
  const [periodo, setPeriodo] = useState<RankingPeriod>("all");
  const [dados, setDados] = useState<LinhaQuestoes[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [indisponivel, setIndisponivel] = useState(false);

  useEffect(() => {
    if (!ativo) return;
    let cancelado = false;
    setCarregando(true);
    setErro(null);
    fetchQuestionAttemptsRanking(periodo)
      .then((d) => {
        if (cancelado) return;
        setDados(d as LinhaQuestoes[]);
        // Lista vazia no período "geral" quase sempre quer dizer que a função do banco não existe
        setIndisponivel(d.length === 0 && periodo === "all");
      })
      .catch((e) => {
        console.error("Erro ao carregar ranking:", e);
        if (!cancelado) setErro("Não foi possível carregar o ranking. Tente novamente mais tarde.");
      })
      .finally(() => !cancelado && setCarregando(false));
    return () => {
      cancelado = true;
    };
  }, [ativo, periodo]);

  const itens = useMemo<ItemRanking[]>(
    () =>
      dados.map((u) => {
        const acertos = Number(u.correct_answers) || 0;
        const erros = Number(u.wrong_answers) || 0;
        const total = Number(u.total_attempts ?? u.total_questions) || acertos + erros;
        const taxa = total > 0 ? Math.round((acertos / total) * 100) : 0;
        return {
          id: u.user_id,
          nome: u.display_name || "Usuário",
          avatar: u.avatar_url,
          pontos: acertos,
          barra: taxa,
          detalhes: [
            { icone: Check, valor: total.toLocaleString("pt-BR"), rotulo: "resolvidas" },
            { icone: X, valor: erros.toLocaleString("pt-BR"), rotulo: "erros", classe: "text-red-500" },
            { icone: Percent, valor: `${taxa}%`, rotulo: "de acerto", classe: "text-emerald-600" },
          ],
        };
      }),
    [dados]
  );

  if (!ativo) return <RankingDesativado nome="questões" />;

  const titulo = PERIODOS.find((p) => p.valor === periodo)!.titulo;

  return (
    <PaginaRanking
      tipo="questoes"
      titulo={`Ranking de questões ${titulo}`}
      descricao="Quem mais acertou questões no Bom Estudo. Resolva questões para subir na classificação."
      itens={itens}
      carregando={carregando}
      erro={erro}
      unidade={["acerto", "acertos"]}
      anuncioTopo="ranking_questoes_top"
      anuncioLista="ranking_questoes_list"
      controles={
        <Segmentos<RankingPeriod>
          valor={periodo}
          onChange={setPeriodo}
          className="bg-slate-200/60"
          opcoes={PERIODOS.map((p) => ({ valor: p.valor, rotulo: p.rotulo }))}
        />
      }
      comoFunciona={
        <>
          A classificação segue o número de questões respondidas corretamente no período escolhido. Em caso de empate, vale quem
          resolveu mais questões. O ranking semanal e o mensal recomeçam a cada semana e a cada mês.
        </>
      }
      vazio={{
        titulo: periodo === "week" ? "Ninguém resolveu questões esta semana" : periodo === "month" ? "Ninguém resolveu questões este mês" : "Ninguém resolveu questões ainda",
        texto: "Resolva algumas questões e apareça no topo do ranking.",
        acao: (
          <Link to="/questions" className="rounded-xl bg-[#5f2ebe] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4f25a0]">
            Resolver questões
          </Link>
        ),
      }}
      chamada={{ texto: "Responda questões para entrar na classificação.", rota: "/questions", botao: "Resolver questões" }}
      aviso={
        !carregando && !erro && indisponivel ? (
          <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-800">
            <InfoIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">O ranking de questões ainda está sendo preparado</p>
              <p className="mt-0.5 text-sky-700">Continue resolvendo questões: suas respostas já contam para quando ele for ativado.</p>
            </div>
          </div>
        ) : undefined
      }
    />
  );
};

export default RankingQuestoes;
