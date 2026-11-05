import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Award, ChevronDown, Crown, LogIn, MessageSquare, PenLine, Search, Target, Trophy, XCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PublicLayout } from "@/components/layout/PublicLayout";
import AdBanner from "@/components/ads/AdBanner";
import AdBannerList from "@/components/ads/AdBannerList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EstadoVazio, Painel, normalizar } from "@/components/course/ui";
import { useAuth } from "@/hooks/useAuth";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { cn } from "@/lib/utils";

/**
 * Estrutura comum às páginas de ranking (questões, comentários e
 * contribuições): topo com troca entre rankings, "sua posição", pódio dos
 * três primeiros e a lista com busca por nome.
 */

export type TipoRanking = "questoes" | "comentarios" | "contribuicoes";

export interface DetalheItem {
  icone?: React.ElementType;
  valor: React.ReactNode;
  rotulo: string;
  classe?: string;
}

export interface ItemRanking {
  id: string;
  nome: string;
  avatar: string | null;
  /** Número principal, que define a posição. */
  pontos: number;
  detalhes: DetalheItem[];
  /** Barra opcional (0 a 100), usada no aproveitamento. */
  barra?: number;
}

const fmt = (n: number) => Number(n || 0).toLocaleString("pt-BR");

const iniciais = (nome: string) =>
  nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "U";

const MEDALHAS = [
  { anel: "ring-amber-300", fundo: "from-amber-50 to-white", selo: "bg-amber-400 text-white", texto: "text-amber-600", altura: "sm:pt-0" },
  { anel: "ring-slate-300", fundo: "from-slate-50 to-white", selo: "bg-slate-400 text-white", texto: "text-slate-500", altura: "sm:pt-8" },
  { anel: "ring-orange-300", fundo: "from-orange-50 to-white", selo: "bg-orange-400 text-white", texto: "text-orange-600", altura: "sm:pt-12" },
];

export const AvatarRanking: React.FC<{ nome: string; url: string | null; className?: string }> = ({ nome, url, className }) => (
  <Avatar className={cn("h-10 w-10", className)}>
    <AvatarImage src={url ?? undefined} alt={nome} className="object-cover" />
    <AvatarFallback className="bg-[#5f2ebe]/10 text-sm font-semibold text-[#5f2ebe]">{iniciais(nome)}</AvatarFallback>
  </Avatar>
);

const ABAS: Array<{ tipo: TipoRanking; rotulo: string; rota: string; icone: React.ElementType }> = [
  { tipo: "questoes", rotulo: "Questões", rota: "/ranking-questoes", icone: Target },
  { tipo: "comentarios", rotulo: "Comentários", rota: "/ranking-comentarios", icone: MessageSquare },
  { tipo: "contribuicoes", rotulo: "Contribuições", rota: "/ranking-contribuicoes", icone: PenLine },
];

const NavRankings: React.FC<{ atual: TipoRanking }> = ({ atual }) => {
  const { config } = useSiteConfig();
  const visiveis = ABAS.filter(
    (a) =>
      a.tipo === atual ||
      (a.tipo === "questoes" && config.pages.showQuestionRankingPage) ||
      (a.tipo === "comentarios" && config.pages.showCommentRankingPage) ||
      a.tipo === "contribuicoes"
  );
  if (visiveis.length < 2) return null;
  return (
    <nav aria-label="Rankings" className="inline-flex max-w-full overflow-x-auto rounded-xl bg-slate-100 p-1">
      {visiveis.map((a) => (
        <Link
          key={a.tipo}
          to={a.rota}
          aria-current={a.tipo === atual ? "page" : undefined}
          className={cn(
            "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            a.tipo === atual ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
          )}
        >
          <a.icone className={cn("h-4 w-4", a.tipo === atual && "text-[#5f2ebe]")} />
          {a.rotulo}
        </Link>
      ))}
    </nav>
  );
};

/** Cartão "Sua posição" do topo. */
export const SuaPosicao: React.FC<{
  itens: ItemRanking[];
  carregando: boolean;
  unidade: [string, string];
  chamada: { texto: string; rota: string; botao: string };
}> = ({ itens, carregando, unidade, chamada }) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4">
        <p className="text-sm font-semibold text-slate-800">Entre para ver sua posição</p>
        <p className="mt-1 text-xs text-slate-500">Quem está logado vê onde aparece no ranking e quanto falta para subir.</p>
        <Link
          to="/login"
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#5f2ebe] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#4f25a0]"
        >
          <LogIn className="h-3.5 w-3.5" /> Entrar
        </Link>
      </div>
    );
  }

  if (carregando) return <Skeleton className="h-[124px] rounded-2xl" />;

  const indice = itens.findIndex((i) => i.id === user.id);
  const eu = itens[indice];

  if (!eu) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sua posição</span>
          <Award className="h-4 w-4 text-[#5f2ebe]" />
        </div>
        <p className="mt-2 text-sm font-semibold text-slate-800">Você ainda não aparece aqui</p>
        <p className="mt-0.5 text-xs text-slate-500">{chamada.texto}</p>
        <Link to={chamada.rota} className="mt-3 inline-block text-xs font-semibold text-[#5f2ebe] hover:underline">
          {chamada.botao} →
        </Link>
      </div>
    );
  }

  const acima = indice > 0 ? itens[indice - 1] : null;
  const falta = acima ? acima.pontos - eu.pontos : 0;

  return (
    <div className="rounded-2xl border border-[#5f2ebe]/20 bg-white/90 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sua posição</span>
        <Award className="h-4 w-4 text-[#5f2ebe]" />
      </div>
      <div className="mt-2 flex items-end gap-5">
        <div>
          <div className="text-2xl font-bold tabular-nums text-[#5f2ebe]">{indice + 1}º</div>
          <div className="text-xs text-slate-500">de {fmt(itens.length)}</div>
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums text-slate-900">{fmt(eu.pontos)}</div>
          <div className="text-xs text-slate-500">{eu.pontos === 1 ? unidade[0] : unidade[1]}</div>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {acima ? (
          <>
            {falta <= 0 ? "Empatado com " : `${falta === 1 ? "Falta" : "Faltam"} ${fmt(falta)} ${falta === 1 ? unidade[0] : unidade[1]} para passar `}
            <strong className="font-semibold text-slate-700">{acima.nome}</strong>.
          </>
        ) : (
          "Você está no topo. Continue assim!"
        )}
      </p>
    </div>
  );
};

export const Podio: React.FC<{ itens: ItemRanking[]; meuId?: string; unidade: [string, string] }> = ({ itens, meuId, unidade }) => {
  // No computador o 1º fica no meio; no celular a ordem é 1, 2, 3
  const ordem = [1, 0, 2].filter((i) => itens[i]);
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
      {ordem.map((i) => {
        const item = itens[i];
        const m = MEDALHAS[i];
        const sou = item.id === meuId;
        return (
          <div key={item.id} className={cn(i === 0 ? "order-1 sm:order-2" : i === 1 ? "order-2 sm:order-1" : "order-3", m.altura)}>
            <Painel
              className={cn(
                "relative flex items-center gap-3 bg-gradient-to-b p-4 sm:flex-col sm:gap-2 sm:px-3 sm:pb-5 sm:pt-6 sm:text-center",
                m.fundo,
                sou && "border-[#5f2ebe]/40"
              )}
            >
              {i === 0 && <Crown className="absolute right-3 top-3 h-5 w-5 text-amber-400 sm:left-1/2 sm:right-auto sm:-top-3 sm:h-6 sm:w-6 sm:-translate-x-1/2" />}
              <div className="relative shrink-0">
                <AvatarRanking nome={item.nome} url={item.avatar} className={cn("ring-4 ring-offset-2", m.anel, i === 0 ? "h-14 w-14 sm:h-20 sm:w-20" : "h-12 w-12 sm:h-16 sm:w-16")} />
                <span className={cn("absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shadow sm:left-1/2 sm:right-auto sm:-translate-x-1/2", m.selo)}>
                  {i + 1}
                </span>
              </div>
              <div className="min-w-0 flex-1 sm:mt-2 sm:w-full">
                <p className="truncate font-semibold text-slate-900" title={item.nome}>
                  {item.nome}
                  {sou && <span className="ml-1.5 rounded-full bg-[#5f2ebe] px-1.5 py-0.5 align-middle text-[10px] font-semibold text-white">Você</span>}
                </p>
                <p className={cn("text-lg font-bold tabular-nums sm:text-2xl", m.texto)}>
                  {fmt(item.pontos)} <span className="text-xs font-medium text-slate-500">{item.pontos === 1 ? unidade[0] : unidade[1]}</span>
                </p>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500 sm:justify-center">
                  {item.detalhes.map((d) => (
                    <span key={d.rotulo} className="inline-flex items-center gap-1" title={d.rotulo}>
                      {d.icone && <d.icone className="h-3 w-3" />}
                      <span className={cn("font-semibold tabular-nums text-slate-700", d.classe)}>{d.valor}</span> {d.rotulo}
                    </span>
                  ))}
                </div>
              </div>
            </Painel>
          </div>
        );
      })}
    </div>
  );
};

export const LinhaRanking: React.FC<{ item: ItemRanking; posicao: number; sou: boolean; unidade: [string, string] }> = ({ item, posicao, sou, unidade }) => (
  <li
    className={cn(
      "flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4",
      sou ? "bg-[#5f2ebe]/[0.06]" : "hover:bg-slate-50/80"
    )}
  >
    <span className={cn("w-8 shrink-0 text-center text-sm font-bold tabular-nums", sou ? "text-[#5f2ebe]" : "text-slate-400")}>{posicao}º</span>
    <AvatarRanking nome={item.nome} url={item.avatar} className="h-9 w-9 sm:h-10 sm:w-10" />
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-slate-900" title={item.nome}>
        {item.nome}
        {sou && <span className="ml-1.5 rounded-full bg-[#5f2ebe] px-1.5 py-0.5 align-middle text-[10px] font-semibold text-white">Você</span>}
      </p>
      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
        {item.detalhes.map((d) => (
          <span key={d.rotulo} className="inline-flex items-center gap-1" title={d.rotulo}>
            {d.icone && <d.icone className="h-3 w-3" />}
            <span className={cn("font-semibold tabular-nums text-slate-600", d.classe)}>{d.valor}</span>
            <span className="hidden sm:inline">{d.rotulo}</span>
          </span>
        ))}
      </div>
      {item.barra !== undefined && (
        <div className="mt-1.5 h-1 w-full max-w-[220px] overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(0, Math.min(100, item.barra))}%` }} />
        </div>
      )}
    </div>
    <div className="shrink-0 text-right">
      <div className="text-base font-bold tabular-nums text-slate-900 sm:text-lg">{fmt(item.pontos)}</div>
      <div className="text-[11px] text-slate-400">{item.pontos === 1 ? unidade[0] : unidade[1]}</div>
    </div>
  </li>
);

export const ListaCarregando = () => (
  <div className="space-y-4">
    <div className="grid gap-3 sm:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-24 rounded-2xl sm:h-48" />
      ))}
    </div>
    <Painel className="divide-y divide-slate-100">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-4 w-6" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-6 w-10" />
        </div>
      ))}
    </Painel>
  </div>
);

export const RankingDesativado: React.FC<{ nome: string }> = ({ nome }) => {
  const navigate = useNavigate();
  return (
    <PublicLayout>
      <div className="flex min-h-screen flex-col bg-[rgb(242,244,246)]">
        <Header />
        <main className="container mx-auto flex-1 px-4 py-16">
          <EstadoVazio
            icone={XCircle}
            titulo="Ranking desativado"
            texto={`O ranking de ${nome} está temporariamente desativado pelo administrador.`}
            className="mx-auto max-w-xl"
            acao={
              <button
                type="button"
                onClick={() => navigate("/")}
                className="rounded-xl bg-[#5f2ebe] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4f25a0]"
              >
                Voltar para o início
              </button>
            }
          />
        </main>
        <Footer />
      </div>
    </PublicLayout>
  );
};

export interface PaginaRankingProps {
  tipo: TipoRanking;
  titulo: string;
  descricao: string;
  itens: ItemRanking[];
  carregando: boolean;
  erro?: string | null;
  /** Singular e plural da medida principal, ex.: ["acerto", "acertos"]. */
  unidade: [string, string];
  /** Controles extras na barra da lista (ex.: período). */
  controles?: React.ReactNode;
  comoFunciona: React.ReactNode;
  vazio: { titulo: string; texto: string; acao?: React.ReactNode };
  chamada: { texto: string; rota: string; botao: string };
  anuncioTopo?: string;
  anuncioLista?: string;
  /** Aviso extra acima da lista (ex.: ranking ainda não configurado). */
  aviso?: React.ReactNode;
}

export const PaginaRanking: React.FC<PaginaRankingProps> = ({
  tipo,
  titulo,
  descricao,
  itens,
  carregando,
  erro,
  unidade,
  controles,
  comoFunciona,
  vazio,
  chamada,
  anuncioTopo,
  anuncioLista,
  aviso,
}) => {
  const { user } = useAuth();
  const [busca, setBusca] = useState("");
  const [comoAberto, setComoAberto] = useState(false);

  const termo = normalizar(busca);
  const filtrados = useMemo(
    () => itens.map((item, i) => ({ item, posicao: i + 1 })).filter(({ item }) => !termo || normalizar(item.nome).includes(termo)),
    [itens, termo]
  );

  const mostrarPodio = !termo && itens.length >= 3;
  const lista = mostrarPodio ? filtrados.slice(3) : filtrados;

  return (
    <PublicLayout>
      <div className="flex min-h-screen flex-col bg-[rgb(242,244,246)]">
        <Header />
        <main className="flex-1">
          {/* Topo */}
          <section className="relative overflow-hidden border-b border-slate-200/70 bg-white">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#5f2ebe]/15 to-[#ea2be2]/10 blur-2xl" />
            <div className="container relative mx-auto grid max-w-5xl gap-6 px-4 py-8 md:py-10 lg:grid-cols-[1fr_300px] lg:items-end">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#5f2ebe]">
                  <Trophy className="h-3.5 w-3.5" /> Rankings
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{titulo}</h1>
                <p className="mt-1 max-w-xl text-sm text-slate-500">{descricao}</p>
                <div className="mt-5">
                  <NavRankings atual={tipo} />
                </div>
              </div>
              <SuaPosicao itens={itens} carregando={carregando} unidade={unidade} chamada={chamada} />
            </div>
          </section>

          <div className="container mx-auto max-w-5xl space-y-5 px-4 py-6">
            {anuncioTopo && <AdBanner position={anuncioTopo} className="rounded-lg" />}

            {/* Barra da lista */}
            <div className="flex flex-wrap items-center gap-2">
              {controles}
              <label className="relative ml-auto w-full sm:w-64">
                <span className="sr-only">Procurar pelo nome</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Procurar pelo nome"
                  className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#5f2ebe] focus:ring-2 focus:ring-[#5f2ebe]/15"
                />
              </label>
            </div>

            {/* Como funciona */}
            <Painel className="overflow-hidden">
              <button
                type="button"
                onClick={() => setComoAberto((v) => !v)}
                aria-expanded={comoAberto}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#5f2ebe]/10 text-[#5f2ebe]">
                  <Trophy className="h-3.5 w-3.5" />
                </span>
                Como funciona este ranking?
                <ChevronDown className={cn("ml-auto h-4 w-4 text-slate-400 transition-transform", comoAberto && "rotate-180")} />
              </button>
              {comoAberto && <div className="border-t border-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-600">{comoFunciona}</div>}
            </Painel>

            {aviso}

            {carregando ? (
              <ListaCarregando />
            ) : erro ? (
              <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {erro}
              </div>
            ) : itens.length === 0 ? (
              aviso ? null : <EstadoVazio icone={Trophy} titulo={vazio.titulo} texto={vazio.texto} acao={vazio.acao} />
            ) : (
              <>
                {mostrarPodio && <Podio itens={itens.slice(0, 3)} meuId={user?.id} unidade={unidade} />}

                {filtrados.length === 0 ? (
                  <EstadoVazio icone={Search} titulo="Ninguém com esse nome" texto="Confira a grafia ou procure só pelo primeiro nome." />
                ) : (
                  lista.length > 0 && (
                    <Painel className="overflow-hidden">
                      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <span>{termo ? `${fmt(filtrados.length)} encontrado${filtrados.length === 1 ? "" : "s"}` : "Classificação"}</span>
                        <span className="capitalize">{unidade[1]}</span>
                      </div>
                      <ol className="divide-y divide-slate-100">
                        {lista.map(({ item, posicao }, i) => (
                          <React.Fragment key={item.id}>
                            <LinhaRanking item={item} posicao={posicao} sou={item.id === user?.id} unidade={unidade} />
                            {anuncioLista && !termo && (i + 1) % 10 === 0 && i < lista.length - 1 && (
                              <li className="p-3 empty:hidden">
                                <AdBannerList position={anuncioLista} indice={(i + 1) / 10 - 1} />
                              </li>
                            )}
                          </React.Fragment>
                        ))}
                      </ol>
                    </Painel>
                  )
                )}
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </PublicLayout>
  );
};
