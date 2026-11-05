import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { fetchCommentRanking, CommentRankingUser } from "@/services/commentService";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { ItemRanking, PaginaRanking, RankingDesativado } from "@/components/ranking/PaginaRanking";

const RankingComentarios: React.FC = () => {
  const { config } = useSiteConfig();
  const ativo = config.pages.showCommentRankingPage;
  const [dados, setDados] = useState<CommentRankingUser[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!ativo) return;
    setCarregando(true);
    setErro(null);
    fetchCommentRanking()
      .then(setDados)
      .catch((e) => {
        console.error("Erro ao carregar ranking:", e);
        setErro("Não foi possível carregar o ranking. Tente novamente mais tarde.");
      })
      .finally(() => setCarregando(false));
  }, [ativo]);

  const itens = useMemo<ItemRanking[]>(
    () =>
      dados.map((u) => {
        const comentarios = Number(u.comment_count) || 0;
        return {
          id: u.user_id,
          nome: u.display_name || "Usuário",
          avatar: u.avatar_url,
          pontos: Number(u.total_likes) || 0,
          detalhes: [{ icone: MessageSquare, valor: comentarios.toLocaleString("pt-BR"), rotulo: comentarios === 1 ? "comentário" : "comentários" }],
        };
      }),
    [dados]
  );

  if (!ativo) return <RankingDesativado nome="comentários" />;

  return (
    <PaginaRanking
      tipo="comentarios"
      titulo="Ranking de comentários"
      descricao="Quem mais ajuda a comunidade explicando questões. Comentários úteis recebem curtidas e sobem na classificação."
      itens={itens}
      carregando={carregando}
      erro={erro}
      unidade={["curtida", "curtidas"]}
      anuncioTopo="ranking_comentarios_top"
      anuncioLista="ranking_comentarios_list"
      comoFunciona={
        <>
          A classificação segue o total de curtidas recebidas nos seus comentários. Em caso de empate, vale quem comentou mais.
          Explique o raciocínio da questão, cite a lei ou a jurisprudência e ajude outros alunos: são esses comentários que recebem
          curtidas.
        </>
      }
      vazio={{
        titulo: "Nenhum comentário ainda",
        texto: "Comente uma questão e seja o primeiro a aparecer aqui.",
        acao: (
          <Link to="/questions" className="rounded-xl bg-[#5f2ebe] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4f25a0]">
            Ir para as questões
          </Link>
        ),
      }}
      chamada={{ texto: "Comente questões e receba curtidas para entrar na classificação.", rota: "/questions", botao: "Comentar questões" }}
    />
  );
};

export default RankingComentarios;
