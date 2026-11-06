import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Edit,
  ExternalLink,
  Loader2,
  MoreHorizontal,
  Newspaper,
  Plus,
  RefreshCw,
  Rss,
  Search,
  Send,
  Settings2,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  deleteRSSConfig,
  fetchAllRSSPosts,
  fetchAllTransmittedRSSItems,
  fetchRSSConfigs,
  fetchRSSFeed,
  processIndividualRSSItem,
  RSSConfig,
  RSSItem,
  saveRSSConfig,
  SyncResult,
  syncAllRSSFeeds,
  updateRSSConfig,
} from "@/services/rssService";
import { InstrucoesIADialog } from "./InstrucoesIADialog";

interface GerenciadorRSSProps {
  onFechar: () => void;
  /** Avisa a lista de posts que entraram posts novos. */
  onPostsCriados?: () => void;
}

type Aba = "feeds" | "noticias";
type FiltroNoticias = "todas" | "novas" | "transmitidas" | "erro";
type Situacao = { status: "rascunho" | "publicado" | "erro"; erro?: string | null };
type Noticia = RSSItem & { feed: string };
type Teste = { ok: true; texto: string } | { ok: false; texto: string };

const FORM_VAZIO = { name: "", url: "", active: true, auto_publish: false };

function haQuanto(iso?: string | null): string {
  if (!iso) return "nunca";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const min = Math.round((Date.now() - d.getTime()) / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const dias = Math.round(h / 24);
  if (dias < 30) return `há ${dias} ${dias === 1 ? "dia" : "dias"}`;
  return d.toLocaleDateString("pt-BR");
}

const MOTIVOS_PARADA: Record<string, string> = {
  limite: "Atingiu o limite de posts por execução; o restante entra na próxima rodada.",
  tempo: "O tempo da função acabou; o restante entra na próxima rodada.",
  "limite-ia": "Atingiu o limite gratuito da IA; o restante entra na próxima rodada.",
};

/** Painel dos feeds RSS dentro de /admin/posts: feeds, sincronização e notícias para transmitir. */
export const GerenciadorRSS: React.FC<GerenciadorRSSProps> = ({ onFechar, onPostsCriados }) => {
  const [aba, setAba] = useState<Aba>("feeds");
  const [feeds, setFeeds] = useState<RSSConfig[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [sincronizando, setSincronizando] = useState(false);
  const [resultado, setResultado] = useState<SyncResult | null>(null);

  // Formulário (novo feed ou edição)
  const [form, setForm] = useState<typeof FORM_VAZIO & { id?: string }>(FORM_VAZIO);
  const [formAberto, setFormAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [testando, setTestando] = useState<string | null>(null);
  const [testes, setTestes] = useState<Record<string, Teste>>({});
  const [excluir, setExcluir] = useState<RSSConfig | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  // Notícias
  const [noticias, setNoticias] = useState<Noticia[] | null>(null);
  const [instrucoesAbertas, setInstrucoesAbertas] = useState(false);
  const [carregandoNoticias, setCarregandoNoticias] = useState(false);
  const [feedsComErro, setFeedsComErro] = useState<string[]>([]);
  const [situacoes, setSituacoes] = useState<Map<string, Situacao>>(new Map());
  const [transmitindo, setTransmitindo] = useState<Set<string>>(new Set());
  const [filtro, setFiltro] = useState<FiltroNoticias>("novas");
  const [feedFiltro, setFeedFiltro] = useState("");
  const [busca, setBusca] = useState("");

  const carregarFeeds = useCallback(async () => {
    setCarregando(true);
    setFeeds(await fetchRSSConfigs());
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregarFeeds();
  }, [carregarFeeds]);

  const ativos = feeds.filter((f) => f.active);
  const ultimaSync = feeds.map((f) => f.last_sync || f.lastSync).filter(Boolean).sort().pop();

  /* ------------------------------------------------------------ feeds */

  const abrirForm = (f?: RSSConfig) => {
    setForm(f ? { id: f.id, name: f.name, url: f.url, active: f.active, auto_publish: !!f.auto_publish } : FORM_VAZIO);
    setFormAberto(true);
  };

  const testar = async (url: string) => {
    if (!url.trim()) return;
    setTestando(url);
    try {
      const feed = await fetchRSSFeed(url.trim());
      setTestes((t) => ({
        ...t,
        [url]: feed ? { ok: true, texto: `“${feed.title || "Feed"}” · ${feed.items.length} itens` } : { ok: false, texto: "Não foi possível ler este feed." },
      }));
    } catch (e) {
      setTestes((t) => ({ ...t, [url]: { ok: false, texto: (e as Error).message || "Não foi possível ler este feed." } }));
    } finally {
      setTestando(null);
    }
  };

  const salvar = async () => {
    if (!form.name.trim() || !form.url.trim()) {
      toast({ title: "Preencha o nome e a URL do feed", variant: "destructive" });
      return;
    }
    setSalvando(true);
    const dados = { name: form.name.trim(), url: form.url.trim(), active: form.active, auto_publish: form.auto_publish };
    const salvo = form.id ? await updateRSSConfig(form.id, dados) : await saveRSSConfig(dados);
    setSalvando(false);
    if (!salvo) {
      toast({ title: "Não foi possível salvar o feed", variant: "destructive" });
      return;
    }
    setFeeds((l) => (form.id ? l.map((f) => (f.id === form.id ? salvo : f)) : [salvo, ...l]));
    setFormAberto(false);
    setForm(FORM_VAZIO);
    toast({ title: form.id ? "Feed atualizado" : "Feed adicionado" });
  };

  const alterar = async (f: RSSConfig, campos: Partial<RSSConfig>, aviso: string) => {
    setFeeds((l) => l.map((x) => (x.id === f.id ? { ...x, ...campos } : x)));
    const salvo = await updateRSSConfig(f.id!, campos);
    if (!salvo) {
      setFeeds((l) => l.map((x) => (x.id === f.id ? f : x)));
      toast({ title: "Não foi possível atualizar o feed", variant: "destructive" });
      return;
    }
    toast({ title: aviso });
  };

  const confirmarExclusao = async () => {
    if (!excluir) return;
    setExcluindo(true);
    const ok = await deleteRSSConfig(excluir.id!);
    setExcluindo(false);
    if (!ok) {
      toast({ title: "Não foi possível excluir o feed", variant: "destructive" });
      return;
    }
    setFeeds((l) => l.filter((f) => f.id !== excluir.id));
    setExcluir(null);
    toast({ title: "Feed excluído" });
  };

  const sincronizar = async () => {
    setSincronizando(true);
    setResultado(null);
    try {
      const r = await syncAllRSSFeeds();
      setResultado(r);
      if (r.created.length) onPostsCriados?.();
      await carregarFeeds();
      if (noticias) carregarSituacoes();
    } catch (e) {
      toast({ title: "Não foi possível sincronizar", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSincronizando(false);
    }
  };

  /* ---------------------------------------------------------- notícias */

  const carregarSituacoes = async () => {
    const itens = await fetchAllTransmittedRSSItems();
    const m = new Map<string, Situacao>();
    for (const i of itens) {
      const s: Situacao = { status: i.status === "publicado" ? "publicado" : i.status === "erro" ? "erro" : "rascunho", erro: i.error };
      m.set(i.rss_item_guid, s);
      m.set(i.rss_item_link, s);
    }
    setSituacoes(m);
  };

  const carregarNoticias = async () => {
    setCarregandoNoticias(true);
    try {
      const [porFeed] = await Promise.all([fetchAllRSSPosts(), carregarSituacoes()]);
      const lista = porFeed.flatMap((f) => f.items.map((i) => ({ ...i, feed: f.feedName })));
      lista.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      setNoticias(lista);
      setFeedsComErro(porFeed.filter((f) => f.error).map((f) => f.feedName));
    } catch (e) {
      toast({ title: "Não foi possível ler os feeds", description: (e as Error).message, variant: "destructive" });
    } finally {
      setCarregandoNoticias(false);
    }
  };

  const abrirNoticias = () => {
    setAba("noticias");
    if (!noticias && !carregandoNoticias) carregarNoticias();
  };

  const situacaoDe = (n: Noticia) => situacoes.get(n.guid) || situacoes.get(n.link);

  const transmitir = async (n: Noticia, publicar: boolean) => {
    const chave = n.guid || n.link;
    setTransmitindo((s) => new Set(s).add(chave));
    const r = await processIndividualRSSItem(
      { title: n.title, link: n.link, description: n.description, pubDate: n.pubDate, guid: n.guid },
      n.feed,
      publicar
    );
    setSituacoes((m) => {
      const novo = new Map(m);
      const s: Situacao = r.ok ? { status: r.published ? "publicado" : "rascunho" } : { status: "erro", erro: r.error };
      novo.set(n.guid, s);
      novo.set(n.link, s);
      return novo;
    });
    setTransmitindo((s) => {
      const novo = new Set(s);
      novo.delete(chave);
      return novo;
    });
    if (r.ok) {
      onPostsCriados?.();
      toast({
        title: r.published ? "Post publicado" : "Post criado em Rascunhos",
        description: `“${r.title || n.title}” foi reescrito${r.provider ? ` com ${r.provider}` : ""}.`,
      });
    } else {
      toast({ title: r.rateLimited ? "Limite gratuito da IA atingido" : "Não foi possível transmitir", description: r.error, variant: "destructive" });
    }
  };

  const nomesFeeds = useMemo(() => [...new Set((noticias || []).map((n) => n.feed))], [noticias]);
  const contagem = useMemo(() => {
    const c = { todas: 0, novas: 0, transmitidas: 0, erro: 0 };
    for (const n of noticias || []) {
      if (feedFiltro && n.feed !== feedFiltro) continue;
      const s = situacaoDe(n);
      c.todas++;
      if (!s) c.novas++;
      else if (s.status === "erro") c.erro++;
      else c.transmitidas++;
    }
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noticias, situacoes, feedFiltro]);

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return (noticias || []).filter((n) => {
      if (feedFiltro && n.feed !== feedFiltro) return false;
      const s = situacaoDe(n);
      if (filtro === "novas" && s) return false;
      if (filtro === "transmitidas" && (!s || s.status === "erro")) return false;
      if (filtro === "erro" && s?.status !== "erro") return false;
      return !termo || n.title.toLowerCase().includes(termo) || n.description.toLowerCase().includes(termo);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noticias, situacoes, filtro, feedFiltro, busca]);

  /* ------------------------------------------------------------ render */

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]" aria-label="Feeds RSS">
      {/* Cabeçalho */}
      <header className="flex flex-col gap-3 border-b border-slate-100 px-3 py-3 sm:flex-row sm:items-center sm:px-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="rounded-lg bg-[#5f2ebe]/[0.07] p-2 text-[#5f2ebe]">
            <Rss className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900">Feeds RSS</h2>
            <p className="text-xs text-slate-500">
              {ativos.length
                ? `${ativos.length} ${ativos.length === 1 ? "feed ativo" : "feeds ativos"} · o servidor confere a cada 30 min e reescreve as notícias novas com IA · última sincronização ${haQuanto(ultimaSync)}`
                : "Adicione um feed para trazer notícias para o blog automaticamente."}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setInstrucoesAbertas(true)}
            className="h-8 gap-1.5"
            title="Editar as instruções enviadas à IA para criar os posts"
          >
            <Settings2 className="h-3.5 w-3.5" /> Instruções da IA
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={sincronizar} disabled={sincronizando || !ativos.length} className="h-8 gap-1.5">
            <RefreshCw className={cn("h-3.5 w-3.5", sincronizando && "animate-spin")} />
            {sincronizando ? "Sincronizando..." : "Sincronizar agora"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="flat"
            onClick={() => abrirForm()}
            className="h-8 gap-1.5 px-3 text-sm tracking-normal sm:text-sm"
          >
            <Plus className="h-3.5 w-3.5" /> Feed
          </Button>
          <Button type="button" size="icon" variant="ghost" onClick={onFechar} aria-label="Fechar feeds RSS" className="h-8 w-8 text-slate-500">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Resultado da sincronização */}
      {(sincronizando || resultado) && (
        <div className="border-b border-slate-100 px-3 py-3 sm:px-4">
          {sincronizando ? (
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin text-[#5f2ebe]" />
              Lendo os feeds e reescrevendo as notícias novas. Isso pode levar alguns minutos...
            </p>
          ) : (
            resultado && (
              <div className="space-y-2 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-medium text-slate-800">Sincronização concluída</span>
                    <span className="text-emerald-700">{resultado.created.length} criados</span>
                    <span className="text-slate-500">{resultado.skipped} já existiam</span>
                    {resultado.failed.length > 0 && <span className="text-red-600">{resultado.failed.length} com erro</span>}
                    {resultado.feedErrors.length > 0 && <span className="text-red-600">{resultado.feedErrors.length} {resultado.feedErrors.length === 1 ? "feed fora do ar" : "feeds fora do ar"}</span>}
                  </p>
                  <button type="button" onClick={() => setResultado(null)} aria-label="Fechar resultado" className="rounded p-0.5 text-slate-400 hover:text-slate-700">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                {resultado.stoppedBy && <p className="text-xs text-amber-700">{MOTIVOS_PARADA[resultado.stoppedBy]}</p>}
                {resultado.created.length > 0 && (
                  <ul className="space-y-0.5 text-xs text-slate-600">
                    {resultado.created.map((c, i) => (
                      <li key={c.postId || i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        <span className="truncate">{c.title}</span>
                        <span className="shrink-0 text-slate-400">· {c.published ? "publicado" : "rascunho"}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {[...resultado.failed.map((f) => `${f.title}: ${f.error}`), ...resultado.feedErrors.map((f) => `${f.feed}: ${f.error}`)].length > 0 && (
                  <ul className="space-y-0.5 text-xs text-red-600">
                    {[...resultado.failed.map((f) => `${f.title}: ${f.error}`), ...resultado.feedErrors.map((f) => `${f.feed}: ${f.error}`)].map((t, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-2">{t}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* Abas */}
      <nav className="-mb-px flex gap-1 border-b border-slate-100 px-3 pt-2 sm:px-4" aria-label="Seções do RSS">
        {(
          [
            { id: "feeds", label: "Feeds", n: feeds.length, onClick: () => setAba("feeds") },
            { id: "noticias", label: "Notícias dos feeds", n: noticias ? contagem.novas : undefined, onClick: abrirNoticias },
          ] as const
        ).map((a) => {
          const ativa = aba === a.id;
          return (
            <button
              key={a.id}
              type="button"
              onClick={a.onClick}
              aria-current={ativa ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-1.5 border-b-2 px-3 pb-2 pt-1 text-sm font-medium transition-colors",
                ativa ? "border-[#5f2ebe] text-[#5f2ebe]" : "border-transparent text-slate-500 hover:text-slate-800"
              )}
            >
              {a.label}
              {a.n !== undefined && (
                <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", ativa ? "bg-[#5f2ebe]/10" : "bg-slate-100")}>
                  {a.n}
                  {a.id === "noticias" && " novas"}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {aba === "feeds" ? (
        <div>
          {formAberto && (
            <div className="space-y-3 border-b border-slate-100 bg-[#faf8ff] px-3 py-3 sm:px-4">
              <p className="text-sm font-medium text-slate-800">{form.id ? "Editar feed" : "Novo feed"}</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                <div className="space-y-1.5">
                  <Label htmlFor="rss-nome" className="text-xs font-medium text-slate-600">
                    Nome
                  </Label>
                  <Input id="rss-nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: PCI Concursos" className="h-9 bg-white" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rss-url" className="text-xs font-medium text-slate-600">
                    Endereço do feed
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="rss-url"
                      value={form.url}
                      onChange={(e) => setForm({ ...form, url: e.target.value })}
                      placeholder="https://exemplo.com/feed"
                      className="h-9 bg-white"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => testar(form.url)} disabled={!form.url.trim() || testando === form.url} className="h-9 bg-white">
                      {testando === form.url ? <Loader2 className="h-4 w-4 animate-spin" /> : "Testar"}
                    </Button>
                  </div>
                  {testes[form.url] && <ResultadoTeste teste={testes[form.url]} />}
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                    Ativo
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <Switch checked={form.auto_publish} onCheckedChange={(v) => setForm({ ...form, auto_publish: v })} />
                    Publicar sozinho <span className="text-xs text-slate-400">(desligado = vai para Rascunhos)</span>
                  </label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" size="sm" variant="ghost" onClick={() => setFormAberto(false)} className="h-8">
                    Cancelar
                  </Button>
                  <Button type="button" size="sm" variant="flat" onClick={salvar} disabled={salvando} className="h-8 bg-[#ea2be2] px-3 text-sm tracking-normal hover:bg-[#d029d5] sm:text-sm">
                    {salvando && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                    {form.id ? "Salvar" : "Adicionar feed"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {carregando ? (
            <div className="flex justify-center py-10 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : feeds.length === 0 ? (
            !formAberto && (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <span className="rounded-full bg-[#5f2ebe]/[0.07] p-3 text-[#5f2ebe]">
                  <Rss className="h-5 w-5" />
                </span>
                <p className="font-medium text-slate-700">Nenhum feed cadastrado</p>
                <p className="max-w-sm text-sm text-slate-500">Cole o endereço RSS de um site de notícias de concursos para começar.</p>
                <Button type="button" size="sm" variant="flat" onClick={() => abrirForm()} className="mt-1 h-8 bg-[#ea2be2] px-3 text-sm tracking-normal hover:bg-[#d029d5] sm:text-sm">
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Adicionar feed
                </Button>
              </div>
            )
          ) : (
            <ul className="divide-y divide-slate-100">
              {feeds.map((f) => {
                const teste = testes[f.url];
                return (
                  <li key={f.id} className="flex flex-col gap-3 px-3 py-3 sm:px-4 lg:flex-row lg:items-center">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2">
                        <span
                          className={cn("h-2 w-2 shrink-0 rounded-full", !f.active ? "bg-slate-300" : f.last_error ? "bg-red-500" : "bg-emerald-500")}
                          aria-hidden
                        />
                        <span className={cn("truncate font-medium", f.active ? "text-slate-900" : "text-slate-500")}>{f.name}</span>
                        {!f.active && <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">Pausado</span>}
                        {f.active && f.auto_publish && (
                          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">Publica sozinho</span>
                        )}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 pl-4 text-xs text-slate-500">
                        <a href={f.url} target="_blank" rel="noreferrer" className="inline-flex min-w-0 max-w-full items-center gap-1 hover:text-[#5f2ebe]">
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span className="truncate">{f.url.replace(/^https?:\/\//, "")}</span>
                        </a>
                        <span className="inline-flex shrink-0 items-center gap-1">
                          <Clock className="h-3 w-3" /> {haQuanto(f.last_sync || f.lastSync)}
                        </span>
                      </p>
                      {f.last_error && (
                        <p className="mt-1 flex items-start gap-1 pl-4 text-xs text-red-600" title={f.last_error}>
                          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                          <span className="line-clamp-2">{f.last_error}</span>
                        </p>
                      )}
                      {teste && (
                        <div className="pl-4">
                          <ResultadoTeste teste={teste} />
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 pl-4 lg:pl-0">
                      <label className="flex items-center gap-2 text-xs text-slate-600">
                        <Switch
                          checked={f.active}
                          onCheckedChange={(v) => alterar(f, { active: v }, v ? "Feed ativado" : "Feed pausado")}
                          aria-label={`Ativo: ${f.name}`}
                        />
                        Ativo
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-600" title="Desligado: cria rascunhos para revisar. Ligado: publica direto no blog.">
                        <Switch
                          checked={!!f.auto_publish}
                          onCheckedChange={(v) =>
                            alterar(f, { auto_publish: v }, v ? "As notícias deste feed serão publicadas sozinhas" : "As notícias deste feed irão para Rascunhos")
                          }
                          aria-label={`Publicar sozinho: ${f.name}`}
                        />
                        Publicar sozinho
                      </label>
                      <div className="flex items-center">
                        <Button type="button" size="sm" variant="ghost" onClick={() => testar(f.url)} disabled={testando === f.url} className="h-8 text-slate-600">
                          {testando === f.url ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Testar"}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button type="button" variant="ghost" size="icon" aria-label={`Mais ações: ${f.name}`} className="h-8 w-8 text-slate-500">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => abrirForm(f)}>
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setExcluir(f)} className="text-red-600 focus:bg-red-50 focus:text-red-700">
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        <div>
          <div className="flex flex-col gap-2 border-b border-slate-100 px-3 py-2 sm:px-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-1" role="group" aria-label="Filtrar notícias">
              {(
                [
                  ["novas", "Novas", contagem.novas],
                  ["transmitidas", "Já viraram post", contagem.transmitidas],
                  ["erro", "Com erro", contagem.erro],
                  ["todas", "Todas", contagem.todas],
                ] as const
              ).map(([id, rotulo, n]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={filtro === id}
                  onClick={() => setFiltro(id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    filtro === id ? "bg-[#5f2ebe] text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  )}
                >
                  {rotulo} {noticias && <span className="tabular-nums opacity-70">{n}</span>}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {nomesFeeds.length > 1 && (
                <div className="relative">
                  <select
                    value={feedFiltro}
                    onChange={(e) => setFeedFiltro(e.target.value)}
                    aria-label="Filtrar por feed"
                    className="h-8 appearance-none rounded-md border border-input bg-background pl-2.5 pr-7 text-xs text-slate-700"
                  >
                    <option value="">Todos os feeds</option>
                    {nomesFeeds.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>
              )}
              <div className="relative flex-1 lg:w-56 lg:flex-none">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar notícia..." aria-label="Buscar notícia" className="h-8 pl-8 text-xs" />
              </div>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={carregarNoticias}
                disabled={carregandoNoticias}
                aria-label="Ler os feeds de novo"
                title="Ler os feeds de novo"
                className="h-8 w-8 shrink-0"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", carregandoNoticias && "animate-spin")} />
              </Button>
            </div>
          </div>

          {feedsComErro.length > 0 && (
            <p className="flex items-center gap-1.5 border-b border-slate-100 bg-red-50/60 px-3 py-2 text-xs text-red-700 sm:px-4">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Não foi possível ler: {feedsComErro.join(", ")}
            </p>
          )}

          {carregandoNoticias && !noticias ? (
            <p className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Lendo os feeds ativos...
            </p>
          ) : visiveis.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <span className="rounded-full bg-emerald-50 p-3 text-emerald-500">
                <Newspaper className="h-5 w-5" />
              </span>
              <p className="text-sm font-medium text-slate-700">
                {!ativos.length ? "Nenhum feed ativo" : filtro === "novas" ? "Nenhuma notícia nova" : "Nada por aqui"}
              </p>
              <p className="max-w-sm text-xs text-slate-500">
                {filtro === "novas" && ativos.length ? "Tudo o que está nos feeds já virou post. A sincronização traz as próximas." : "Tente outro filtro."}
              </p>
            </div>
          ) : (
            <ul className="max-h-[32rem] divide-y divide-slate-100 overflow-y-auto">
              {visiveis.map((n) => {
                const s = situacaoDe(n);
                const ocupado = transmitindo.has(n.guid || n.link);
                return (
                  <li key={n.guid || n.link} className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-start sm:px-4">
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium text-slate-900">{n.title}</p>
                      {n.description && <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.description}</p>}
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{n.feed}</span>
                        <span>{haQuanto(n.pubDate)}</span>
                        <a href={n.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-[#5f2ebe]">
                          <ExternalLink className="h-3 w-3" /> Original
                        </a>
                      </p>
                      {s?.status === "erro" && s.erro && <p className="mt-1 line-clamp-2 text-xs text-red-600">{s.erro}</p>}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {s && <Selo situacao={s} />}
                      <div className="flex">
                        <Button
                          type="button"
                          size="sm"
                          variant={s && s.status !== "erro" ? "outline" : "flat"}
                          onClick={() => transmitir(n, false)}
                          disabled={ocupado}
                          className={cn("h-8 gap-1.5 rounded-r-none px-3 text-xs tracking-normal sm:text-xs", !(s && s.status !== "erro") && "bg-[#ea2be2] hover:bg-[#d029d5]")}
                        >
                          {ocupado ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                          {ocupado ? "Reescrevendo..." : s?.status === "erro" ? "Tentar de novo" : s ? "Transmitir de novo" : "Transmitir"}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              size="sm"
                              variant={s && s.status !== "erro" ? "outline" : "flat"}
                              disabled={ocupado}
                              aria-label="Outras formas de transmitir"
                              className={cn(
                                "h-8 rounded-l-none border-l border-l-white/30 px-1.5",
                                !(s && s.status !== "erro") && "bg-[#ea2be2] hover:bg-[#d029d5]"
                              )}
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem onClick={() => transmitir(n, false)}>
                              <Send className="mr-2 h-4 w-4" /> Reescrever como rascunho
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => transmitir(n, true)}>
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Reescrever e publicar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <InstrucoesIADialog aberto={instrucoesAbertas} onFechar={() => setInstrucoesAbertas(false)} noticias={noticias} />

      <Dialog open={!!excluir} onOpenChange={(v) => !v && !excluindo && setExcluir(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir o feed “{excluir?.name}”?</DialogTitle>
            <DialogDescription>Os posts que já vieram dele continuam no blog. Ele só deixa de ser lido nas próximas sincronizações.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setExcluir(null)} disabled={excluindo}>
              Cancelar
            </Button>
            <Button variant="flat" onClick={confirmarExclusao} disabled={excluindo} className="bg-red-600 text-sm tracking-normal hover:bg-red-700 sm:text-sm">
              {excluindo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir feed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

const ResultadoTeste: React.FC<{ teste: Teste }> = ({ teste }) => (
  <p className={cn("mt-1 flex items-center gap-1 text-xs", teste.ok ? "text-emerald-700" : "text-red-600")}>
    {teste.ok ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
    <span className="truncate">{teste.ok ? `Feed funcionando: ${teste.texto}` : teste.texto}</span>
  </p>
);

const Selo: React.FC<{ situacao: Situacao }> = ({ situacao }) => (
  <span
    className={cn(
      "whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium",
      situacao.status === "publicado" ? "bg-emerald-50 text-emerald-700" : situacao.status === "erro" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
    )}
  >
    {situacao.status === "publicado" ? "Publicado" : situacao.status === "erro" ? "Erro" : "Rascunho"}
  </span>
);
