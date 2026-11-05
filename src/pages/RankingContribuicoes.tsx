import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { RankingContribuidor, buscarRankingContribuicoes } from "@/services/correcoesTeoria";
import { ItemRanking, PaginaRanking } from "@/components/ranking/PaginaRanking";

const RankingContribuicoes: React.FC = () => {
  const [dados, setDados] = useState<RankingContribuidor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    buscarRankingContribuicoes(100)
      .then(setDados)
      .catch((e) => {
        console.error("Erro ao carregar ranking de contribuições:", e);
        setErro("Não foi possível carregar o ranking. Tente novamente mais tarde.");
      })
      .finally(() => setCarregando(false));
  }, []);

  const itens = useMemo<ItemRanking[]>(
    () =>
      dados.map((u) => {
        const teorias = Number(u.total_teorias) || 0;
        return {
          id: u.user_id,
          nome: u.display_name || "Usuário",
          avatar: u.avatar_url,
          pontos: Number(u.total_correcoes) || 0,
          detalhes: [{ icone: BookOpen, valor: teorias.toLocaleString("pt-BR"), rotulo: teorias === 1 ? "teoria corrigida" : "teorias corrigidas" }],
        };
      }),
    [dados]
  );

  return (
    <PaginaRanking
      tipo="contribuicoes"
      titulo="Ranking de contribuições"
      descricao="Quem mais ajudou a melhorar as teorias do Bom Estudo com correções aprovadas pela equipe."
      itens={itens}
      carregando={carregando}
      erro={erro}
      unidade={["correção", "correções"]}
      comoFunciona={
        <>
          Abra uma teoria, selecione o trecho com erro e clique em <strong>Sugerir correção</strong>. Cada correção aprovada conta um
          ponto; em caso de empate, vale quem contribuiu com mais teorias diferentes. Seu nome também aparece nos créditos, no fim da
          teoria corrigida.{" "}
          <Link to="/teorias" className="font-semibold text-[#5f2ebe] hover:underline">
            Ver teorias →
          </Link>
        </>
      }
      vazio={{
        titulo: "Ainda não há correções aprovadas",
        texto: "Seja o primeiro a sugerir uma correção e aparecer aqui.",
        acao: (
          <Link to="/teorias" className="rounded-xl bg-[#5f2ebe] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4f25a0]">
            Ver teorias
          </Link>
        ),
      }}
      chamada={{ texto: "Sugira correções nas teorias; cada uma aprovada vale um ponto.", rota: "/teorias", botao: "Ver teorias" }}
    />
  );
};

export default RankingContribuicoes;
