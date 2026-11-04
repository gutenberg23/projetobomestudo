import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BookMarked,
  Globe2,
  Heart,
  ListChecks,
  Lock,
  LogIn,
  NotebookPen,
  Pencil,
  Plus,
  Search,
  SearchX,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PublicLayout } from "@/components/layout/PublicLayout";
import AdBanner from "@/components/ads/AdBanner";
import { Carregando, EstadoVazio, Metrica, Painel, Segmentos, normalizar } from "@/components/course/ui";
import { ConfirmarAcao } from "@/components/admin/ui/dialogos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ActivityLogger } from "@/services/activity-logger";
import { cn } from "@/lib/utils";

type Aba = "meus" | "publicos" | "favoritos";
type Ordem = "recentes" | "az" | "questoes";

interface Caderno {
  id: string;
  nome: string;
  criadoEm: string;
  atualizadoEm: string;
  userId: string;
  publico: boolean;
  /** null quando não dá para saber (caderno de outra pessoa sem contagem salva) */
  questoes: number | null;
}

const POR_PAGINA = 18;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const paraCaderno = (b: any, contagens?: Map<string, number>): Caderno => {
  const real = contagens?.get(b.id);
  const salvo = typeof b.total_questions === "number" ? b.total_questions : 0;
  return {
    id: b.id,
    nome: b.nome || "Caderno sem nome",
    criadoEm: b.created_at || "",
    atualizadoEm: b.updated_at || b.created_at || "",
    userId: b.user_id,
    publico: b.is_public === true,
    questoes: contagens ? real ?? 0 : salvo > 0 ? salvo : null,
  };
};

const dataCurta = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).replace(/\./g, "") : "";

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

export default function QuestionBooks() {
  const { user, loading: carregandoAuth } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const abaUrl = params.get("aba");
  const aba: Aba = abaUrl === "publicos" || abaUrl === "favoritos" ? abaUrl : "meus";

  const [meus, setMeus] = useState<Caderno[]>([]);
  const [publicos, setPublicos] = useState<Caderno[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<Ordem>("recentes");
  const [limite, setLimite] = useState(POR_PAGINA);

  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Caderno | null>(null);
  const [nome, setNome] = useState("");
  const [publico, setPublico] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState<Caderno | null>(null);

  const carregar = useCallback(async () => {
    if (!user) {
      setCarregando(false);
      return;
    }
    setCarregando(true);
    try {
      const [meusRes, publicosRes, perfilRes, questoesRes] = await Promise.all([
        supabase.from("cadernos_questoes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("cadernos_questoes").select("*").eq("is_public", true).neq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("profiles").select("cadernos_favoritos").eq("id", user.id).single(),
        supabase.from("questoes_caderno").select("caderno_id").eq("user_id", user.id),
      ]);
      if (meusRes.error) throw meusRes.error;
      if (publicosRes.error) throw publicosRes.error;

      // A contagem salva no caderno nem sempre acompanha as questões adicionadas pela página de questões,
      // então nos cadernos do próprio aluno contamos direto na tabela de vínculo.
      const contagens = new Map<string, number>();
      (questoesRes.data || []).forEach((q: { caderno_id: string }) => contagens.set(q.caderno_id, (contagens.get(q.caderno_id) || 0) + 1));
      const listaMeus = (meusRes.data || []).map((b) => paraCaderno(b, questoesRes.error ? undefined : contagens));
      setMeus(listaMeus);
      setPublicos((publicosRes.data || []).map((b) => paraCaderno(b)));
      setFavoritos(perfilRes.data?.cadernos_favoritos || []);

      // Corrige a contagem salva (é ela que outros alunos veem nos cadernos públicos)
      if (!questoesRes.error) {
        (meusRes.data || [])
          .filter((b) => (b.total_questions || 0) !== (contagens.get(b.id) || 0))
          .forEach((b) => {
            supabase
              .from("cadernos_questoes")
              .update({ total_questions: contagens.get(b.id) || 0 })
              .eq("id", b.id)
              .then(({ error }) => error && console.warn("Não foi possível atualizar a contagem do caderno", error));
          });
      }
    } catch (e) {
      console.error("Erro ao carregar cadernos:", e);
      toast.error("Não foi possível carregar os cadernos.");
    } finally {
      setCarregando(false);
    }
  }, [user]);

  useEffect(() => {
    if (!carregandoAuth) carregar();
  }, [carregandoAuth, carregar]);

  const trocarAba = (a: Aba) => {
    const p = new URLSearchParams(params);
    if (a === "meus") p.delete("aba");
    else p.set("aba", a);
    setParams(p, { replace: true });
    setLimite(POR_PAGINA);
  };

  const listaFavoritos = useMemo(() => {
    const todos = new Map([...publicos, ...meus].map((c) => [c.id, c]));
    return favoritos.map((id) => todos.get(id)).filter(Boolean) as Caderno[];
  }, [favoritos, publicos, meus]);

  const daAba = aba === "meus" ? meus : aba === "publicos" ? publicos : listaFavoritos;
  const termo = normalizar(busca);
  const visiveis = useMemo(() => {
    const lista = daAba.filter((c) => !termo || normalizar(c.nome).includes(termo));
    if (ordem === "az") lista.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    else if (ordem === "questoes") lista.sort((a, b) => (b.questoes ?? -1) - (a.questoes ?? -1));
    else lista.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
    return lista;
  }, [daAba, termo, ordem]);

  useEffect(() => setLimite(POR_PAGINA), [termo, ordem]);

  const totalQuestoes = meus.reduce((s, c) => s + (c.questoes || 0), 0);
  const compartilhados = meus.filter((c) => c.publico).length;

  const abrirNovo = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setEditando(null);
    setNome("");
    setPublico(false);
    setFormAberto(true);
  };

  const abrirEdicao = (c: Caderno) => {
    setEditando(c);
    setNome(c.nome);
    setPublico(c.publico);
    setFormAberto(true);
  };

  const salvar = async () => {
    if (!user) return;
    const limpo = nome.trim();
    if (!limpo) {
      toast.error("Dê um nome ao caderno.");
      return;
    }
    setSalvando(true);
    try {
      if (editando) {
        const { error } = await supabase
          .from("cadernos_questoes")
          .update({ nome: limpo, is_public: publico, updated_at: new Date().toISOString() })
          .eq("id", editando.id);
        if (error) throw error;
        setMeus((p) => p.map((c) => (c.id === editando.id ? { ...c, nome: limpo, publico } : c)));
        toast.success("Caderno atualizado.");
      } else {
        const { data, error } = await supabase
          .from("cadernos_questoes")
          .insert({ nome: limpo, user_id: user.id, is_public: publico })
          .select()
          .single();
        if (error) throw error;
        setMeus((p) => [paraCaderno(data, new Map()), ...p]);
        if (aba !== "meus") trocarAba("meus");
        toast.success("Caderno criado. Agora adicione questões a ele.");
        await ActivityLogger.logNotebookCreate(data.id, data.nome);
      }
      setFormAberto(false);
    } catch (e) {
      console.error("Erro ao salvar caderno:", e);
      toast.error("Não foi possível salvar o caderno.");
    } finally {
      setSalvando(false);
    }
  };

  const alternarVisibilidade = async (c: Caderno) => {
    const novo = !c.publico;
    setMeus((p) => p.map((x) => (x.id === c.id ? { ...x, publico: novo } : x)));
    const { error } = await supabase
      .from("cadernos_questoes")
      .update({ is_public: novo, updated_at: new Date().toISOString() })
      .eq("id", c.id);
    if (error) {
      setMeus((p) => p.map((x) => (x.id === c.id ? { ...x, publico: !novo } : x)));
      toast.error("Não foi possível mudar a visibilidade.");
    } else toast.success(novo ? "Caderno agora é público." : "Caderno agora é privado.");
  };

  const excluir = async () => {
    if (!excluindo) return;
    const { error } = await supabase.from("cadernos_questoes").delete().eq("id", excluindo.id);
    if (error) {
      toast.error("Não foi possível excluir o caderno.");
      throw error;
    }
    setMeus((p) => p.filter((c) => c.id !== excluindo.id));
    toast.success("Caderno excluído.");
  };

  const alternarFavorito = async (c: Caderno) => {
    if (!user) return;
    const eraFavorito = favoritos.includes(c.id);
    const novos = eraFavorito ? favoritos.filter((id) => id !== c.id) : [...favoritos, c.id];
    setFavoritos(novos);
    const { error } = await supabase.from("profiles").update({ cadernos_favoritos: novos }).eq("id", user.id);
    if (error) {
      setFavoritos(favoritos);
      toast.error("Não foi possível atualizar os favoritos.");
    } else toast.success(eraFavorito ? "Removido dos favoritos." : "Adicionado aos favoritos.");
  };

  const conteudo = () => {
    if (carregandoAuth || (user && carregando)) return <Carregando texto="Carregando cadernos..." />;

    if (!user)
      return (
        <EstadoVazio
          icone={LogIn}
          titulo="Entre para usar os cadernos"
          texto="Com uma conta você monta cadernos com as questões que quer revisar e acessa os cadernos compartilhados por outros alunos."
          acao={
            <Button asChild className="bg-[#5f2ebe] hover:bg-[#4f25a0]">
              <Link to="/login">Entrar ou criar conta</Link>
            </Button>
          }
        />
      );

    if (daAba.length === 0) {
      if (aba === "meus") return <PrimeiroCaderno onNovo={abrirNovo} />;
      return (
        <EstadoVazio
          icone={aba === "favoritos" ? Heart : Users}
          titulo={aba === "favoritos" ? "Nenhum caderno favorito" : "Nenhum caderno público ainda"}
          texto={
            aba === "favoritos"
              ? "Na aba Públicos, toque no coração de um caderno para guardá-lo aqui."
              : "Quando outros alunos compartilharem cadernos, eles aparecem aqui. Que tal tornar um dos seus público?"
          }
          acao={
            aba === "favoritos" ? (
              <Button variant="outline" onClick={() => trocarAba("publicos")}>
                Ver cadernos públicos
              </Button>
            ) : undefined
          }
        />
      );
    }

    if (visiveis.length === 0)
      return (
        <EstadoVazio
          icone={SearchX}
          titulo={`Nenhum caderno com "${busca.trim()}"`}
          texto="Tente outro termo."
          acao={
            <Button variant="outline" onClick={() => setBusca("")}>
              Limpar busca
            </Button>
          }
        />
      );

    return (
      <>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visiveis.slice(0, limite).map((c) => (
            <CartaoCaderno
              key={c.id}
              caderno={c}
              meu={c.userId === user.id}
              favorito={favoritos.includes(c.id)}
              onFavoritar={() => alternarFavorito(c)}
              onEditar={() => abrirEdicao(c)}
              onVisibilidade={() => alternarVisibilidade(c)}
              onExcluir={() => setExcluindo(c)}
            />
          ))}
        </div>
        {visiveis.length > limite && (
          <div className="flex justify-center pt-2">
            <Button variant="outline" onClick={() => setLimite((l) => l + POR_PAGINA)}>
              Mostrar mais ({visiveis.length - limite} restantes)
            </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <PublicLayout>
      <div className="flex min-h-screen flex-col bg-[rgb(242,244,246)]">
        <Header />
        <main className="flex-1">
          <section className="relative overflow-hidden border-b border-slate-200/70 bg-white">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#5f2ebe]/15 to-[#ea2be2]/10 blur-2xl" />
            <div className="container relative mx-auto px-4 py-8 md:py-10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#5f2ebe]">Cadernos de questões</p>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Suas questões, do seu jeito</h1>
                  <p className="mt-1 max-w-xl text-sm text-slate-500">
                    Junte as questões que quer revisar em cadernos e resolva quando quiser. Compartilhe os seus ou use os da comunidade.
                  </p>
                </div>
                {user && (
                  <Button onClick={abrirNovo} className="shrink-0 gap-2 rounded-xl bg-[#5f2ebe] hover:bg-[#4f25a0]">
                    <Plus className="h-4 w-4" />
                    Novo caderno
                  </Button>
                )}
              </div>

              {user && !carregando && (
                <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <Metrica rotulo="Meus cadernos" valor={meus.length} icone={NotebookPen} />
                  <Metrica rotulo="Questões salvas" valor={totalQuestoes} icone={ListChecks} tom="azul" />
                  <Metrica rotulo="Compartilhados" valor={compartilhados} icone={Globe2} tom="verde" />
                  <Metrica rotulo="Favoritos" valor={favoritos.length} icone={Heart} tom="rosa" />
                </div>
              )}
            </div>
          </section>

          <div className="container mx-auto space-y-5 px-4 py-6">
            <AdBanner position="question_books_top" className="rounded-lg" />

            {user && (
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <Segmentos<Aba>
                  valor={aba}
                  onChange={trocarAba}
                  opcoes={[
                    { valor: "meus", rotulo: "Meus cadernos", contagem: carregando ? undefined : meus.length },
                    { valor: "publicos", rotulo: "Públicos", contagem: carregando ? undefined : publicos.length },
                    { valor: "favoritos", rotulo: "Favoritos", contagem: carregando ? undefined : listaFavoritos.length },
                  ]}
                />
                <div className="flex items-center gap-2">
                  <div className="relative min-w-0 flex-1 lg:w-72 lg:flex-none">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Buscar caderno"
                      aria-label="Buscar caderno"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-800 outline-none transition focus:border-[#5f2ebe] focus:ring-2 focus:ring-[#5f2ebe]/15"
                    />
                    {busca && (
                      <button
                        type="button"
                        aria-label="Limpar busca"
                        onClick={() => setBusca("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <select
                    value={ordem}
                    onChange={(e) => setOrdem(e.target.value as Ordem)}
                    aria-label="Ordenar"
                    className="h-10 rounded-xl border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none focus:border-[#5f2ebe]"
                  >
                    <option value="recentes">Mais recentes</option>
                    <option value="az">Nome (A–Z)</option>
                    <option value="questoes">Mais questões</option>
                  </select>
                </div>
              </div>
            )}

            {conteudo()}
          </div>
        </main>
        <Footer />
      </div>

      <Dialog open={formAberto} onOpenChange={(o) => !salvando && setFormAberto(o)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar caderno" : "Novo caderno"}</DialogTitle>
            <DialogDescription>
              {editando ? "Mude o nome ou quem pode ver este caderno." : "Depois de criar, adicione questões pelo botão Caderno de Questões em cada questão."}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              salvar();
            }}
          >
            <div className="space-y-1.5">
              <label htmlFor="caderno-nome" className="text-sm font-medium text-slate-800">
                Nome
              </label>
              <Input
                id="caderno-nome"
                value={nome}
                autoFocus
                maxLength={120}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: Português — erros de crase"
              />
            </div>
            <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 p-3">
              <div>
                <label htmlFor="caderno-publico" className="text-sm font-medium text-slate-800">
                  Caderno público
                </label>
                <p className="text-xs text-slate-500">Outros alunos podem encontrar e resolver este caderno.</p>
              </div>
              <Switch id="caderno-publico" checked={publico} onCheckedChange={setPublico} />
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => setFormAberto(false)} disabled={salvando}>
                Cancelar
              </Button>
              <Button type="submit" disabled={salvando} className="bg-[#5f2ebe] hover:bg-[#4f25a0]">
                {salvando ? "Salvando..." : editando ? "Salvar" : "Criar caderno"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmarAcao
        aberto={!!excluindo}
        onFechar={() => setExcluindo(null)}
        titulo={`Excluir "${excluindo?.nome ?? ""}"?`}
        descricao="As questões continuam no banco de questões; só o caderno e a lista dele são apagados."
        detalhes={excluindo?.publico ? ["Quem favoritou este caderno deixa de vê-lo."] : undefined}
        onConfirmar={excluir}
      />
    </PublicLayout>
  );
}

const PrimeiroCaderno: React.FC<{ onNovo: () => void }> = ({ onNovo }) => (
  <Painel className="px-6 py-10 text-center sm:py-12">
    <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5f2ebe]/10 text-[#5f2ebe]">
      <BookMarked className="h-7 w-7" />
    </span>
    <h3 className="text-lg font-semibold text-slate-900">Monte seu primeiro caderno</h3>
    <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Leva menos de um minuto e ajuda a revisar exatamente o que você mais erra.</p>
    <ol className="mx-auto mt-6 grid max-w-2xl gap-3 text-left sm:grid-cols-3">
      {[
        ["Crie o caderno", "Dê um nome, como a matéria ou o assunto."],
        ["Adicione questões", "Em Questões, use o botão Caderno de Questões."],
        ["Resolva e revise", "Abra o caderno quando quiser treinar."],
      ].map(([t, d], i) => (
        <li key={t} className="flex gap-3 rounded-xl bg-slate-50 p-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#5f2ebe] text-xs font-bold text-white">{i + 1}</span>
          <span>
            <span className="block text-sm font-semibold text-slate-800">{t}</span>
            <span className="block text-xs text-slate-500">{d}</span>
          </span>
        </li>
      ))}
    </ol>
    <div className="mt-6 flex flex-wrap justify-center gap-2">
      <Button onClick={onNovo} className="gap-2 bg-[#5f2ebe] hover:bg-[#4f25a0]">
        <Plus className="h-4 w-4" />
        Criar caderno
      </Button>
      <Button variant="outline" asChild>
        <Link to="/questions">Ir para Questões</Link>
      </Button>
    </div>
  </Painel>
);

const CartaoCaderno: React.FC<{
  caderno: Caderno;
  meu: boolean;
  favorito: boolean;
  onFavoritar: () => void;
  onEditar: () => void;
  onVisibilidade: () => void;
  onExcluir: () => void;
}> = ({ caderno: c, meu, favorito, onFavoritar, onEditar, onVisibilidade, onExcluir }) => {
  const acao = "relative z-10 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700";
  return (
    <Painel className="group relative flex flex-col p-4 transition hover:-translate-y-0.5 hover:border-[#5f2ebe]/30 hover:shadow-md">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#5f2ebe]/10 text-[#5f2ebe]">
          <NotebookPen className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <Link to={`/cadernos/${c.id}`} className="after:absolute after:inset-0 after:rounded-2xl focus:outline-none">
            <h3 className="line-clamp-2 font-semibold leading-snug text-slate-900 group-hover:text-[#5f2ebe]">{c.nome}</h3>
          </Link>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
            {meu ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
                  c.publico ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                )}
              >
                {c.publico ? <Globe2 className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                {c.publico ? "Público" : "Privado"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 font-medium text-sky-700">
                <Users className="h-3 w-3" />
                Comunidade
              </span>
            )}
            {c.criadoEm && <span className="text-slate-400">criado em {dataCurta(c.criadoEm)}</span>}
          </div>
        </div>
        {!meu && (
          <button
            type="button"
            onClick={onFavoritar}
            aria-pressed={favorito}
            aria-label={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            title={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            className={cn(
              "relative z-10 -mr-1 -mt-1 rounded-lg p-1.5 transition-colors",
              favorito ? "text-[#ea2be2] hover:bg-[#ea2be2]/10" : "text-slate-300 hover:bg-slate-100 hover:text-slate-500"
            )}
          >
            <Heart className={cn("h-5 w-5", favorito && "fill-current")} />
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
          <ListChecks className="h-4 w-4 text-slate-400" />
          {c.questoes === null ? "Questões" : plural(c.questoes, "questão", "questões")}
        </span>
        <div className="flex items-center gap-0.5">
          {meu && (
            <>
              <button type="button" onClick={onVisibilidade} className={acao} title={c.publico ? "Tornar privado" : "Tornar público"} aria-label={c.publico ? "Tornar privado" : "Tornar público"}>
                {c.publico ? <Lock className="h-4 w-4" /> : <Globe2 className="h-4 w-4" />}
              </button>
              <button type="button" onClick={onEditar} className={acao} title="Editar" aria-label="Editar caderno">
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onExcluir}
                className={cn(acao, "hover:bg-red-50 hover:text-red-600")}
                title="Excluir"
                aria-label="Excluir caderno"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
          <span className="ml-1 inline-flex items-center gap-1 text-sm font-semibold text-[#5f2ebe]">
            Abrir
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Painel>
  );
};
