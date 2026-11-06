import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, FlaskConical, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  fetchInstrucoesIA,
  InstrucoesIASalvas,
  RSSItem,
  saveInstrucoesIA,
  testarInstrucoesIA,
  TesteInstrucoesIA,
} from "@/services/rssService";
import { InstrucoesIA, INSTRUCOES_IA_PADRAO } from "./instrucoesIAPadrao";

type Campo = keyof InstrucoesIA["campos"];

const CAMPOS: { id: Campo; rotulo: string; ajuda: string }[] = [
  { id: "title", rotulo: "Título", ajuda: "Vira o H1 e o título do post." },
  { id: "summary", rotulo: "Resumo", ajuda: "Aparece na listagem do blog e na descrição do Google." },
  { id: "content", rotulo: "Corpo do post", ajuda: "As regras detalhadas ficam em “Regras de redação”." },
  { id: "tags", rotulo: "Tags", ajuda: "Lista de tags do post." },
  { id: "metaKeywords", rotulo: "Palavras-chave (SEO)", ajuda: "Lista usada nas metatags." },
  { id: "city", rotulo: "Cidade", ajuda: "Usada para buscar a foto destaque." },
];

const MAX = { sistema: 8000, instrucoes: 12000, campo: 600 };

const clone = (c: InstrucoesIA): InstrucoesIA => ({ ...c, campos: { ...c.campos } });

/** Completa o que foi salvo com o padrão (mesma regra da Edge Function). */
function completar(salvo: InstrucoesIASalvas): InstrucoesIA {
  const p = INSTRUCOES_IA_PADRAO;
  const txt = (v: unknown, d: string) => (typeof v === "string" && v.trim() ? v : d);
  const t = Number(salvo.temperatura);
  return {
    sistema: txt(salvo.sistema, p.sistema),
    instrucoes: txt(salvo.instrucoes, p.instrucoes),
    campos: Object.fromEntries(CAMPOS.map(({ id }) => [id, txt(salvo.campos?.[id], p.campos[id])])) as InstrucoesIA["campos"],
    temperatura: typeof salvo.temperatura === "number" && Number.isFinite(t) ? Math.min(1, Math.max(0, t)) : p.temperatura,
  };
}

/** Guarda só o que difere do padrão, para que melhorias futuras no padrão continuem valendo. */
function diferencas(c: InstrucoesIA): InstrucoesIASalvas {
  const p = INSTRUCOES_IA_PADRAO;
  const out: InstrucoesIASalvas = {};
  const mudou = (a: string, b: string) => a.trim() && a.trim() !== b.trim();
  if (mudou(c.sistema, p.sistema)) out.sistema = c.sistema.trim();
  if (mudou(c.instrucoes, p.instrucoes)) out.instrucoes = c.instrucoes.trim();
  const campos: NonNullable<InstrucoesIASalvas["campos"]> = {};
  for (const { id } of CAMPOS) if (mudou(c.campos[id], p.campos[id])) campos[id] = c.campos[id].trim();
  if (Object.keys(campos).length) out.campos = campos;
  if (c.temperatura !== p.temperatura) out.temperatura = c.temperatura;
  return out;
}

const umaLinha = (s: string) => s.replace(/\s+/g, " ").replace(/"/g, "'").trim();

/** Montagem igual à de supabase/functions/_shared/news.ts, só para visualizar. */
function montarPrompt(c: InstrucoesIA): string {
  const f = c.campos;
  return `[Mensagem de sistema]
${c.sistema.trim()}

Responda somente com um objeto JSON válido.

[Mensagem com a notícia]
Reescreva a notícia abaixo para o blog.

Título original: {título da notícia}
Site de origem (não cite e não crie links para ele): {site}

Conteúdo original (pode conter menus e rodapés do site, ignore o que não for a notícia):
"""
{texto da notícia, até 12 mil caracteres}
"""

Devolva exatamente este JSON:
{
  "title": "${umaLinha(f.title)}",
  "summary": "${umaLinha(f.summary)}",
  "content": "${umaLinha(f.content)}",
  "tags": ["${umaLinha(f.tags)}"],
  "region": "norte | nordeste | centro-oeste | sul | sudeste | nacional | federal",
  "state": "sigla da UF em maiúsculas, ou vazio se for nacional/federal",
  "metaKeywords": ["${umaLinha(f.metaKeywords)}"],
  "city": "${umaLinha(f.city)}"
}

${c.instrucoes.trim()}`;
}

function rotuloTemperatura(t: number): string {
  if (t <= 0.3) return "fiel ao original";
  if (t <= 0.6) return "equilibrado";
  return "mais criativo";
}

const textareaCls =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-[12.5px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5f2ebe]/30";

const Restaurar: React.FC<{ visivel: boolean; onClick: () => void }> = ({ visivel, onClick }) =>
  visivel ? (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1 text-xs font-medium text-[#5f2ebe] hover:underline">
      <RotateCcw className="h-3 w-3" /> Restaurar padrão
    </button>
  ) : null;

const Alterado: React.FC<{ visivel: boolean }> = ({ visivel }) =>
  visivel ? <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">alterado</span> : null;

interface Props {
  aberto: boolean;
  onFechar: () => void;
  /** Notícias já carregadas na aba Notícias, para usar no teste. */
  noticias?: (RSSItem & { feed: string })[] | null;
}

export const InstrucoesIADialog: React.FC<Props> = ({ aberto, onFechar, noticias }) => {
  const [carregando, setCarregando] = useState(false);
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [salvo, setSalvo] = useState<InstrucoesIA>(clone(INSTRUCOES_IA_PADRAO));
  const [form, setForm] = useState<InstrucoesIA>(clone(INSTRUCOES_IA_PADRAO));
  const [atualizadoEm, setAtualizadoEm] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [verCompleto, setVerCompleto] = useState(false);

  const [testeAberto, setTesteAberto] = useState(false);
  const [testeTitulo, setTesteTitulo] = useState("");
  const [testeTexto, setTesteTexto] = useState("");
  const [testando, setTestando] = useState(false);
  const [teste, setTeste] = useState<TesteInstrucoesIA | null>(null);
  const [erroTeste, setErroTeste] = useState<string | null>(null);

  useEffect(() => {
    if (!aberto) return;
    let ativo = true;
    setCarregando(true);
    setErroCarga(null);
    fetchInstrucoesIA()
      .then(({ config, updated_at }) => {
        if (!ativo) return;
        const c = completar(config);
        setSalvo(clone(c));
        setForm(clone(c));
        setAtualizadoEm(updated_at && Object.keys(config).length ? updated_at : null);
      })
      .catch((e) => {
        if (!ativo) return;
        console.error("Erro ao carregar instruções da IA:", e);
        const msg = String(e?.message || e);
        setErroCarga(
          /ia_instrucoes|relation|schema cache/i.test(msg)
            ? "A tabela das instruções ainda não existe. Rode a migration 20251116000000_ia_instrucoes.sql no SQL Editor do Supabase."
            : msg,
        );
      })
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [aberto]);

  const padrao = INSTRUCOES_IA_PADRAO;
  const sujo = useMemo(() => JSON.stringify(form) !== JSON.stringify(salvo), [form, salvo]);
  const alteracoes = useMemo(() => diferencas(form), [form]);
  const nAlteracoes =
    (alteracoes.sistema ? 1 : 0) +
    (alteracoes.instrucoes ? 1 : 0) +
    Object.keys(alteracoes.campos || {}).length +
    (alteracoes.temperatura !== undefined ? 1 : 0);
  const vazios = !form.sistema.trim() || !form.instrucoes.trim() || CAMPOS.some(({ id }) => !form.campos[id].trim());

  const fechar = () => {
    if (salvando) return;
    if (sujo && !window.confirm("Descartar as alterações não salvas?")) return;
    onFechar();
  };

  const salvar = async () => {
    if (vazios) {
      toast({ title: "Há campos vazios", description: "Preencha ou restaure o padrão antes de salvar.", variant: "destructive" });
      return;
    }
    setSalvando(true);
    try {
      const quando = await saveInstrucoesIA(alteracoes);
      setSalvo(clone(form));
      setAtualizadoEm(nAlteracoes ? quando : null);
      toast({ title: "Instruções salvas", description: "Valem para as próximas notícias reescritas pela IA." });
      onFechar();
    } catch (e) {
      console.error("Erro ao salvar instruções da IA:", e);
      toast({ title: "Não foi possível salvar", description: String((e as Error)?.message || e), variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  };

  const testar = async () => {
    setTestando(true);
    setTeste(null);
    setErroTeste(null);
    try {
      setTeste(await testarInstrucoesIA(alteracoes, testeTitulo.trim(), testeTexto.trim()));
    } catch (e) {
      setErroTeste(String((e as Error)?.message || e));
    } finally {
      setTestando(false);
    }
  };

  const usarNoticia = (idx: string) => {
    const n = noticias?.[Number(idx)];
    if (!n) return;
    setTesteTitulo(n.title);
    setTesteTexto(n.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
  };

  const setCampo = (id: Campo, v: string) => setForm((f) => ({ ...f, campos: { ...f.campos, [id]: v.slice(0, MAX.campo) } }));

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && fechar()}>
      <DialogContent className="flex max-h-[92vh] w-[calc(100vw-20px)] max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="space-y-1 border-b border-slate-100 px-4 py-4 text-left sm:px-6">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-[#5f2ebe]" /> Instruções da IA
          </DialogTitle>
          <DialogDescription className="text-xs">
            O que a IA recebe ao reescrever cada notícia do RSS. As mudanças valem para as próximas notícias, na
            sincronização automática e no botão “Criar post”.
            {atualizadoEm ? ` Última alteração em ${new Date(atualizadoEm).toLocaleString("pt-BR")}.` : " Usando o texto padrão."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5 sm:px-6">
          {carregando ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando instruções...
            </div>
          ) : erroCarga ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erroCarga}</div>
          ) : (
            <>
              {/* Sistema */}
              <section className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Label htmlFor="ia-sistema" className="text-sm font-semibold text-slate-900">Papel e regras gerais</Label>
                  <Alterado visivel={!!alteracoes.sistema} />
                  <span className="flex-1" />
                  <Restaurar visivel={form.sistema !== padrao.sistema} onClick={() => setForm((f) => ({ ...f, sistema: padrao.sistema }))} />
                </div>
                <p className="text-xs text-slate-500">Quem a IA é e o que nunca pode fazer (inventar dados, citar a fonte, escrever em caixa alta...).</p>
                <textarea
                  id="ia-sistema"
                  rows={9}
                  value={form.sistema}
                  maxLength={MAX.sistema}
                  onChange={(e) => setForm((f) => ({ ...f, sistema: e.target.value }))}
                  className={textareaCls}
                />
                <p className="text-right text-[11px] text-slate-400">{form.sistema.length.toLocaleString("pt-BR")} / {MAX.sistema.toLocaleString("pt-BR")}</p>
              </section>

              {/* Regras de redação */}
              <section className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Label htmlFor="ia-instrucoes" className="text-sm font-semibold text-slate-900">Regras de redação do post</Label>
                  <Alterado visivel={!!alteracoes.instrucoes} />
                  <span className="flex-1" />
                  <Restaurar visivel={form.instrucoes !== padrao.instrucoes} onClick={() => setForm((f) => ({ ...f, instrucoes: padrao.instrucoes }))} />
                </div>
                <p className="text-xs text-slate-500">
                  Estrutura, seções, tabelas, links e tom do texto. Por segurança, o site sempre remove tags fora desta lista: h2, h3, h4, p,
                  listas, strong, em, tabelas, links, blockquote e br.
                </p>
                <textarea
                  id="ia-instrucoes"
                  rows={14}
                  value={form.instrucoes}
                  maxLength={MAX.instrucoes}
                  onChange={(e) => setForm((f) => ({ ...f, instrucoes: e.target.value }))}
                  className={textareaCls}
                />
                <p className="text-right text-[11px] text-slate-400">{form.instrucoes.length.toLocaleString("pt-BR")} / {MAX.instrucoes.toLocaleString("pt-BR")}</p>
              </section>

              {/* Campos */}
              <section className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">O que escrever em cada campo</h3>
                  <p className="text-xs text-slate-500">Tamanho, formato e estilo de cada parte do post. Região e estado são escolhidos automaticamente.</p>
                </div>
                <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {CAMPOS.map(({ id, rotulo, ajuda }) => (
                    <div key={id} className="space-y-1.5 px-3 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Label htmlFor={`ia-campo-${id}`} className="text-[13px] font-medium text-slate-800">{rotulo}</Label>
                        <Alterado visivel={!!alteracoes.campos?.[id]} />
                        <span className="text-[11px] text-slate-400">{ajuda}</span>
                        <span className="flex-1" />
                        <Restaurar visivel={form.campos[id] !== padrao.campos[id]} onClick={() => setCampo(id, padrao.campos[id])} />
                      </div>
                      <textarea
                        id={`ia-campo-${id}`}
                        rows={2}
                        value={form.campos[id]}
                        onChange={(e) => setCampo(id, e.target.value)}
                        className={cn(textareaCls, "font-sans text-[13px]")}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Temperatura */}
              <section className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Label htmlFor="ia-temp" className="text-sm font-semibold text-slate-900">Criatividade</Label>
                  <Alterado visivel={alteracoes.temperatura !== undefined} />
                  <span className="flex-1" />
                  <Restaurar visivel={form.temperatura !== padrao.temperatura} onClick={() => setForm((f) => ({ ...f, temperatura: padrao.temperatura }))} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">Fiel</span>
                  <input
                    id="ia-temp"
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={form.temperatura}
                    onChange={(e) => setForm((f) => ({ ...f, temperatura: Math.round(Number(e.target.value) * 10) / 10 }))}
                    className="h-2 flex-1 cursor-pointer accent-[#5f2ebe]"
                  />
                  <span className="text-xs text-slate-500">Criativo</span>
                  <span className="w-28 text-right text-xs font-medium text-slate-700">
                    {form.temperatura.toFixed(1)} · {rotuloTemperatura(form.temperatura)}
                  </span>
                </div>
              </section>

              {/* Visualização */}
              <section className="rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setVerCompleto((v) => !v)}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-slate-800"
                  aria-expanded={verCompleto}
                >
                  <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", verCompleto && "rotate-180")} />
                  Ver o texto completo enviado à IA
                </button>
                {verCompleto && (
                  <div className="border-t border-slate-100 px-3 py-3">
                    <p className="mb-2 text-xs text-slate-500">
                      As partes entre chaves são preenchidas com cada notícia. O bloco da notícia, as chaves do JSON e o pedido de responder em JSON
                      são fixos, porque o site depende deles para montar o post.
                    </p>
                    <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 font-mono text-[11.5px] leading-relaxed text-slate-700">
                      {montarPrompt(form)}
                    </pre>
                  </div>
                )}
              </section>

              {/* Teste */}
              <section className="rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setTesteAberto((v) => !v)}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-slate-800"
                  aria-expanded={testeAberto}
                >
                  <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", testeAberto && "rotate-180")} />
                  <FlaskConical className="h-4 w-4 text-[#5f2ebe]" /> Testar antes de salvar
                </button>
                {testeAberto && (
                  <div className="space-y-3 border-t border-slate-100 px-3 py-3">
                    <p className="text-xs text-slate-500">
                      Reescreve um texto de exemplo com as instruções acima, sem salvar e sem criar post. Gasta uma chamada da cota gratuita da IA.
                    </p>
                    {!!noticias?.length && (
                      <div className="space-y-1">
                        <Label htmlFor="ia-teste-noticia" className="text-xs text-slate-600">Usar uma notícia do feed (texto resumido do RSS)</Label>
                        <select
                          id="ia-teste-noticia"
                          defaultValue=""
                          onChange={(e) => usarNoticia(e.target.value)}
                          className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-800"
                        >
                          <option value="" disabled>Escolha uma notícia...</option>
                          {noticias.slice(0, 50).map((n, i) => (
                            <option key={n.guid || n.link} value={i}>{n.feed} · {n.title}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label htmlFor="ia-teste-titulo" className="text-xs text-slate-600">Título da notícia</Label>
                      <Input id="ia-teste-titulo" value={testeTitulo} onChange={(e) => setTesteTitulo(e.target.value)} className="h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="ia-teste-texto" className="text-xs text-slate-600">Texto da notícia (cole o texto completo para um teste fiel)</Label>
                      <textarea id="ia-teste-texto" rows={6} value={testeTexto} onChange={(e) => setTesteTexto(e.target.value)} className={cn(textareaCls, "font-sans text-[13px]")} />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={testar}
                      disabled={testando || vazios || !testeTitulo.trim() || testeTexto.trim().length < 200}
                      className="h-8 gap-1.5"
                    >
                      {testando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FlaskConical className="h-3.5 w-3.5" />}
                      {testando ? "Reescrevendo..." : "Testar"}
                    </Button>
                    {testeTexto.trim() && testeTexto.trim().length < 200 && (
                      <p className="text-xs text-slate-500">O texto precisa ter pelo menos 200 caracteres.</p>
                    )}
                    {erroTeste && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{erroTeste}</div>}
                    {teste && (
                      <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3">
                        <p className="text-[11px] text-slate-400">
                          Resultado {teste.provider ? `(${teste.provider}${teste.model ? ` / ${teste.model}` : ""})` : ""}
                          {teste.state ? ` · ${teste.state}` : ""}{teste.city ? ` · ${teste.city}` : ""}
                        </p>
                        <h4 className="text-base font-semibold leading-snug text-slate-900">{teste.title}</h4>
                        <p className="text-sm text-slate-600">{teste.summary}</p>
                        {!!teste.tags?.length && (
                          <div className="flex flex-wrap gap-1">
                            {teste.tags.map((t) => (
                              <span key={t} className="rounded bg-white px-1.5 py-0.5 text-[11px] text-slate-600 ring-1 ring-slate-200">{t}</span>
                            ))}
                          </div>
                        )}
                        {/* HTML já sanitizado pela Edge Function */}
                        <div
                          className="prose prose-sm max-w-none rounded-md bg-white p-3 prose-headings:text-slate-900 prose-table:text-xs"
                          dangerouslySetInnerHTML={{ __html: teste.content }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        <DialogFooter className="flex-col-reverse gap-2 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:space-x-0 sm:px-6">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setForm(clone(padrao))}
            disabled={carregando || !!erroCarga || salvando || nAlteracoes === 0}
            className="h-8 gap-1.5 text-slate-600"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Restaurar tudo ao padrão
          </Button>
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={fechar} disabled={salvando} className="h-8">
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="flat"
              onClick={salvar}
              disabled={carregando || !!erroCarga || salvando || !sujo}
              className="h-8 bg-[#ea2be2] px-3 text-sm tracking-normal hover:bg-[#d029d5] sm:text-sm"
            >
              {salvando && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Salvar instruções
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
