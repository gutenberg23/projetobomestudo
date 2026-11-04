import React, { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Plus, Trash2, X } from "lucide-react";
import { nanoid } from "nanoid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FooterConfig, FooterLink, useSiteConfig } from "@/hooks/useSiteConfig";
import { LinhaOpcao, SecaoFormulario } from "@/components/admin/ui/dialogos";
import { ListaEsqueleto, selectClasse } from "@/components/admin/ui/listagem";
import { cn } from "@/lib/utils";
import { AvisoTabela, BarraSalvar, CampoImagem, NaoAplicado, SecaoProps, SiteConfig, salvarCom, useRascunho } from "./comum";

const Carregando = () => (
  <div className="rounded-xl border border-slate-200 bg-white">
    <ListaEsqueleto linhas={4} icone={false} />
  </div>
);

const Campo: React.FC<{ id: string; label: React.ReactNode; dica?: React.ReactNode; children: React.ReactNode; className?: string }> = ({
  id,
  label,
  dica,
  children,
  className,
}) => (
  <div className={cn("space-y-1.5", className)}>
    <Label htmlFor={id}>{label}</Label>
    {children}
    {dica && <p className="text-[11px] text-slate-500">{dica}</p>}
  </div>
);

const Contagem: React.FC<{ n: number; max: number }> = ({ n, max }) => (
  <span className={cn("tabular-nums", n > max ? "text-amber-600" : "text-slate-400")}>
    {n}/{max}
  </span>
);

/* ------------------------------------------------------------------ */
/* Geral e contato                                                    */
/* ------------------------------------------------------------------ */

const formatarWhats = (v: string) => {
  const n = v.replace(/\D/g, "");
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)} ${n.slice(2)}`;
  if (n.length <= 9) return `${n.slice(0, 2)} ${n.slice(2, 4)} ${n.slice(4)}`;
  return `${n.slice(0, 2)} ${n.slice(2, 4)} ${n.slice(4, 9)} ${n.slice(9, 13)}`;
};

export const SecaoGeral: React.FC<SecaoProps> = ({ onSujo }) => {
  const { config, isLoading, updateGeneralConfig } = useSiteConfig();
  const r = useRascunho<SiteConfig["general"]>(config.general, isLoading, onSujo);
  const [salvando, setSalvando] = useState(false);
  const g = r.valor;

  if (isLoading) return <Carregando />;

  const salvar = async () => {
    setSalvando(true);
    await salvarCom(() => updateGeneralConfig(g), "Configurações gerais salvas");
    setSalvando(false);
  };

  const whatsLimpo = g.whatsappNumber.replace(/\D/g, "");

  return (
    <div className="space-y-4">
      <AvisoTabela />
      <SecaoFormulario titulo="Identidade" descricao="Como o site se apresenta no rodapé.">
        <Campo id="cfg-nome" label="Nome do site" dica="Aparece no rodapé e no texto alternativo do logotipo.">
          <Input id="cfg-nome" value={g.siteName} onChange={(e) => r.mudar("siteName", e.target.value)} placeholder="Bom Estudo" />
        </Campo>
        <Campo id="cfg-rodape" label="Texto de direitos autorais" dica="Fica na última linha do rodapé. Vazio usa “© ano Nome do site. Todos os direitos reservados.”">
          <Textarea id="cfg-rodape" rows={2} value={g.footerText} onChange={(e) => r.mudar("footerText", e.target.value)} />
        </Campo>
      </SecaoFormulario>

      <SecaoFormulario titulo="Contato" descricao="Usado no rodapé quando a coluna Contato não tem links próprios.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="cfg-email" label="E-mail de contato">
            <Input id="cfg-email" type="email" value={g.contactEmail} onChange={(e) => r.mudar("contactEmail", e.target.value)} />
          </Campo>
          <Campo
            id="cfg-whats"
            label="WhatsApp"
            dica={
              whatsLimpo.length >= 12 ? (
                <a href={`https://wa.me/${whatsLimpo}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#5f2ebe] hover:underline">
                  Testar o link <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                "Com código do país e DDD, ex.: 55 11 99999 9999"
              )
            }
          >
            <Input id="cfg-whats" inputMode="tel" value={g.whatsappNumber} onChange={(e) => r.mudar("whatsappNumber", formatarWhats(e.target.value))} placeholder="55 11 99999 9999" />
          </Campo>
          <Campo
            id="cfg-suporte"
            label={
              <>
                E-mail de suporte <NaoAplicado />
              </>
            }
          >
            <Input id="cfg-suporte" type="email" value={g.supportEmail} onChange={(e) => r.mudar("supportEmail", e.target.value)} />
          </Campo>
        </div>
      </SecaoFormulario>

      <SecaoFormulario titulo="Funcionamento">
        <LinhaOpcao
          htmlFor="cfg-manut"
          alerta={g.maintenanceMode}
          titulo="Modo de manutenção"
          descricao={g.maintenanceMode ? "Ligado: todas as páginas mostram uma faixa avisando que o site está em manutenção." : "Mostra uma faixa de aviso no topo de todas as páginas."}
        >
          <Switch id="cfg-manut" checked={g.maintenanceMode} onCheckedChange={(v) => r.mudar("maintenanceMode", v)} />
        </LinhaOpcao>
        <div className="border-t border-slate-100" />
        <LinhaOpcao
          htmlFor="cfg-cadastro"
          titulo={
            <>
              Permitir novos cadastros <NaoAplicado />
            </>
          }
          descricao="Deixa pessoas novas criarem conta."
        >
          <Switch id="cfg-cadastro" checked={g.enableRegistration} onCheckedChange={(v) => r.mudar("enableRegistration", v)} />
        </LinhaOpcao>
        <LinhaOpcao
          htmlFor="cfg-coment"
          titulo={
            <>
              Permitir comentários <NaoAplicado />
            </>
          }
          descricao="Comentários no blog e nas aulas."
        >
          <Switch id="cfg-coment" checked={g.enableComments} onCheckedChange={(v) => r.mudar("enableComments", v)} />
        </LinhaOpcao>
      </SecaoFormulario>

      <BarraSalvar sujo={r.sujo} salvando={salvando} onSalvar={salvar} onDescartar={r.descartar} bloqueado={!g.siteName.trim() ? "Informe o nome do site" : undefined} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Rodapé                                                             */
/* ------------------------------------------------------------------ */

const COLUNAS: { id: keyof FooterConfig; titulo: string; descricao: string }[] = [
  { id: "navegacao", titulo: "Navegação", descricao: "Atalhos para as páginas do site." },
  { id: "concurso", titulo: "Concursos", descricao: "Concursos em destaque." },
  { id: "contato", titulo: "Contato", descricao: "Vazio mostra o e-mail e o WhatsApp da seção Geral." },
];

const urlValida = (u: string) => !u || u === "#" || /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(u.trim());

export const SecaoRodape: React.FC<SecaoProps> = ({ onSujo }) => {
  const { config, isLoading, updateFooterConfig } = useSiteConfig();
  const r = useRascunho<FooterConfig>(config.footer, isLoading, onSujo);
  const [salvando, setSalvando] = useState(false);

  if (isLoading) return <Carregando />;

  const editar = (col: keyof FooterConfig, fn: (l: FooterLink[]) => FooterLink[]) => r.setValor((v) => ({ ...v, [col]: fn(v[col]) }));
  const mover = (col: keyof FooterConfig, i: number, d: -1 | 1) =>
    editar(col, (l) => {
      const n = [...l];
      [n[i], n[i + d]] = [n[i + d], n[i]];
      return n;
    });

  const incompletos = COLUNAS.flatMap((c) => r.valor[c.id]).filter((l) => !l.text.trim() || !l.url.trim() || !urlValida(l.url)).length;

  const salvar = async () => {
    setSalvando(true);
    await salvarCom(() => updateFooterConfig(r.valor), "Rodapé salvo");
    setSalvando(false);
  };

  return (
    <div className="space-y-4">
      <AvisoTabela />
      {COLUNAS.map((c) => {
        const links = r.valor[c.id];
        return (
          <SecaoFormulario
            key={c.id}
            titulo={`Coluna “${c.titulo}”`}
            descricao={c.descricao}
            acoes={
              <Button type="button" variant="outline" size="sm" onClick={() => editar(c.id, (l) => [...l, { id: nanoid(), text: "", url: "" }])}>
                <Plus className="mr-1 h-4 w-4" />
                Link
              </Button>
            }
          >
            {links.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhum link nesta coluna.</p>
            ) : (
              <ul className="space-y-2">
                {links.map((l, i) => {
                  const ruim = !!l.url && !urlValida(l.url);
                  return (
                    <li key={l.id} className="flex items-start gap-2">
                      <div className="flex shrink-0 flex-col pt-0.5">
                        <button
                          type="button"
                          onClick={() => mover(c.id, i, -1)}
                          disabled={i === 0}
                          className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                          aria-label="Subir link"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => mover(c.id, i, 1)}
                          disabled={i === links.length - 1}
                          className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                          aria-label="Descer link"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[1fr_1.4fr]">
                        <Input
                          value={l.text}
                          onChange={(e) => editar(c.id, (ls) => ls.map((x) => (x.id === l.id ? { ...x, text: e.target.value } : x)))}
                          placeholder="Texto"
                          aria-label="Texto do link"
                          className={cn(!l.text.trim() && "border-amber-300")}
                        />
                        <div>
                          <Input
                            value={l.url}
                            onChange={(e) => editar(c.id, (ls) => ls.map((x) => (x.id === l.id ? { ...x, url: e.target.value } : x)))}
                            placeholder="/explore ou https://..."
                            aria-label="Endereço do link"
                            className={cn((!l.url.trim() || ruim) && "border-amber-300")}
                          />
                          {ruim && <p className="mt-1 text-[11px] text-amber-700">Comece com /, https://, mailto: ou tel:</p>}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => editar(c.id, (ls) => ls.filter((x) => x.id !== l.id))}
                        className="mt-1.5 rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remover ${l.text || "link"}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </SecaoFormulario>
        );
      })}
      <BarraSalvar
        sujo={r.sujo}
        salvando={salvando}
        onSalvar={salvar}
        onDescartar={r.descartar}
        bloqueado={incompletos ? `${incompletos} link(s) sem texto ou com endereço inválido` : undefined}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Páginas e abas                                                     */
/* ------------------------------------------------------------------ */

type Pages = SiteConfig["pages"];
type Tabs = SiteConfig["tabs"];

const PAGINAS: { id: keyof Pages; titulo: string; rota: string; descricao: string; naoAplicado?: boolean; grupo: string }[] = [
  { id: "showExplorePage", titulo: "Explorar", rota: "/explore", descricao: "Vitrine de cursos.", grupo: "Estudo" },
  { id: "showMyCoursesPage", titulo: "Meus cursos", rota: "/my-courses", descricao: "Cursos favoritos do aluno.", grupo: "Estudo" },
  { id: "showTeoriasPage", titulo: "Teorias", rota: "/teorias", descricao: "Lista e leitura das teorias.", grupo: "Estudo" },
  {
    id: "showQuestionsPage",
    titulo: "Questões",
    rota: "/questions",
    descricao: "Também controla os cadernos e os rankings de questões e de comentários.",
    grupo: "Questões",
  },
  { id: "showQuestionBooksPage", titulo: "Cadernos de questões", rota: "/cadernos", descricao: "Hoje segue a opção Questões.", naoAplicado: true, grupo: "Questões" },
  { id: "showQuestionRankingPage", titulo: "Ranking de questões", rota: "/ranking-questoes", descricao: "Quem mais resolve questões.", grupo: "Questões" },
  { id: "showCommentRankingPage", titulo: "Ranking de comentários", rota: "/ranking-comentarios", descricao: "Quem mais comenta.", grupo: "Questões" },
  { id: "showSimuladoRankingPage", titulo: "Ranking de simulados", rota: "/simulado-ranking", descricao: "Classificação de cada simulado.", grupo: "Questões" },
  { id: "showBlogPage", titulo: "Blog e concursos", rota: "/blog", descricao: "Notícias, posts e a página de concursos.", grupo: "Conteúdo aberto" },
];

const ABAS: { id: keyof Tabs; titulo: string; descricao: string }[] = [
  { id: "showDisciplinasTab", titulo: "Disciplinas", descricao: "Lista de disciplinas, aulas e progresso." },
  { id: "showEditalTab", titulo: "Edital verticalizado", descricao: "Tópicos do edital com marcação de estudo." },
  { id: "showSimuladosTab", titulo: "Simulados", descricao: "Simulados ligados ao curso." },
  { id: "showCicloTab", titulo: "Ciclo de estudos", descricao: "Planejamento de horas por disciplina." },
];

export const SecaoPaginas: React.FC<SecaoProps> = ({ onSujo }) => {
  const { config, isLoading, updatePagesConfig } = useSiteConfig();
  const r = useRascunho<Pages>(config.pages, isLoading, onSujo);
  const [salvando, setSalvando] = useState(false);

  if (isLoading) return <Carregando />;

  const salvar = async () => {
    setSalvando(true);
    await salvarCom(() => updatePagesConfig(r.valor), "Páginas salvas");
    setSalvando(false);
  };

  const grupos = Array.from(new Set(PAGINAS.map((p) => p.grupo)));
  const desligadas = PAGINAS.filter((p) => !r.valor[p.id] && !p.naoAplicado).length;

  return (
    <div className="space-y-4">
      <AvisoTabela />
      <p className="text-sm text-slate-500">
        Página desligada some do menu e quem abrir o endereço volta para a página inicial.
        {desligadas > 0 && <span className="font-medium text-amber-700"> {desligadas} desligada(s) agora.</span>}
      </p>
      {grupos.map((gr) => (
        <SecaoFormulario key={gr} titulo={gr}>
          {PAGINAS.filter((p) => p.grupo === gr).map((p, i) => (
            <React.Fragment key={p.id}>
              {i > 0 && <div className="border-t border-slate-100" />}
              <LinhaOpcao
                htmlFor={`pg-${p.id}`}
                titulo={
                  <>
                    {p.titulo}
                    <a
                      href={p.rota}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1.5 inline-flex items-center gap-0.5 align-middle font-mono text-[11px] font-normal text-slate-400 hover:text-[#5f2ebe]"
                    >
                      {p.rota}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    {p.naoAplicado && <NaoAplicado />}
                  </>
                }
                descricao={p.descricao}
              >
                <Switch id={`pg-${p.id}`} checked={r.valor[p.id]} onCheckedChange={(v) => r.mudar(p.id, v)} />
              </LinhaOpcao>
            </React.Fragment>
          ))}
        </SecaoFormulario>
      ))}
      <BarraSalvar sujo={r.sujo} salvando={salvando} onSalvar={salvar} onDescartar={r.descartar} />
    </div>
  );
};

export const SecaoCurso: React.FC<SecaoProps> = ({ onSujo }) => {
  const { config, isLoading, updateTabsConfig } = useSiteConfig();
  const r = useRascunho<Tabs>(config.tabs, isLoading, onSujo);
  const [salvando, setSalvando] = useState(false);

  if (isLoading) return <Carregando />;

  const salvar = async () => {
    setSalvando(true);
    await salvarCom(() => updateTabsConfig(r.valor), "Abas do curso salvas");
    setSalvando(false);
  };

  const ligadas = ABAS.filter((a) => r.valor[a.id]);

  return (
    <div className="space-y-4">
      <AvisoTabela />
      <SecaoFormulario titulo="Abas da página do curso" descricao="Valem para todos os cursos.">
        {ABAS.map((a, i) => (
          <React.Fragment key={a.id}>
            {i > 0 && <div className="border-t border-slate-100" />}
            <LinhaOpcao htmlFor={`aba-${a.id}`} titulo={a.titulo} descricao={a.descricao}>
              <Switch id={`aba-${a.id}`} checked={r.valor[a.id]} onCheckedChange={(v) => r.mudar(a.id, v)} />
            </LinhaOpcao>
          </React.Fragment>
        ))}
      </SecaoFormulario>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Prévia</p>
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
          {ligadas.length === 0 ? (
            <span className="px-3 py-2 text-sm text-slate-400">Nenhuma aba ligada</span>
          ) : (
            ligadas.map((a, i) => (
              <span
                key={a.id}
                className={cn("-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium", i === 0 ? "border-[#5f2ebe] text-[#5f2ebe]" : "border-transparent text-slate-500")}
              >
                {a.titulo}
              </span>
            ))
          )}
        </div>
      </div>

      <BarraSalvar
        sujo={r.sujo}
        salvando={salvando}
        onSalvar={salvar}
        onDescartar={r.descartar}
        bloqueado={ligadas.length === 0 ? "Deixe pelo menos uma aba ligada" : undefined}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Aparência                                                          */
/* ------------------------------------------------------------------ */

const CORES: { id: "primaryColor" | "secondaryColor" | "accentColor"; titulo: string; padrao: string }[] = [
  { id: "primaryColor", titulo: "Primária", padrao: "#5f2ebe" },
  { id: "secondaryColor", titulo: "Secundária", padrao: "#272f3c" },
  { id: "accentColor", titulo: "Destaque", padrao: "#f97316" },
];

export const SecaoAparencia: React.FC<SecaoProps> = ({ onSujo }) => {
  const { config, isLoading, updateVisualConfig } = useSiteConfig();
  const r = useRascunho<SiteConfig["visual"]>(config.visual, isLoading, onSujo);
  const [salvando, setSalvando] = useState(false);
  const v = r.valor;

  if (isLoading) return <Carregando />;

  const salvar = async () => {
    setSalvando(true);
    await salvarCom(() => updateVisualConfig(v), "Aparência salva");
    setSalvando(false);
  };

  const corOk = (c: string) => /^#[0-9a-f]{6}$/i.test(c);

  return (
    <div className="space-y-4">
      <AvisoTabela />
      <SecaoFormulario titulo="Ícones">
        <Campo id="cfg-favicon" label="Favicon" dica="Ícone da aba do navegador. Use PNG quadrado (32×32 ou maior) ou .ico.">
          <CampoImagem id="cfg-favicon" url={v.faviconUrl} pasta="site" onChange={(u) => r.mudar("faviconUrl", u)} />
        </Campo>
        <Campo
          id="cfg-logo"
          label={
            <>
              Logotipo <NaoAplicado />
            </>
          }
          dica="O cabeçalho e o rodapé usam o logotipo que está no código do site."
        >
          <CampoImagem id="cfg-logo" url={v.logoUrl} pasta="site" formato="largo" onChange={(u) => r.mudar("logoUrl", u)} />
        </Campo>
      </SecaoFormulario>

      <SecaoFormulario
        titulo="Cores, fonte e estilo"
        descricao={
          <>
            Guardados para um tema futuro. <NaoAplicado />
          </>
        }
        acoes={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => r.setValor((x) => ({ ...x, primaryColor: "#5f2ebe", secondaryColor: "#272f3c", accentColor: "#f97316", fontFamily: "Inter, sans-serif", buttonStyle: "rounded", darkMode: false }))}
          >
            Restaurar padrão
          </Button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {CORES.map((c) => (
            <div key={c.id} className="space-y-1.5">
              <Label htmlFor={`cor-${c.id}`}>{c.titulo}</Label>
              <div className="flex items-center gap-2 rounded-md border border-input px-2 py-1.5">
                <input
                  type="color"
                  value={corOk(v[c.id]) ? v[c.id] : c.padrao}
                  onChange={(e) => r.mudar(c.id, e.target.value)}
                  className="h-7 w-7 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
                  aria-label={`Escolher cor ${c.titulo}`}
                />
                <input
                  id={`cor-${c.id}`}
                  value={v[c.id]}
                  onChange={(e) => r.mudar(c.id, e.target.value)}
                  className={cn("min-w-0 flex-1 bg-transparent font-mono text-sm uppercase focus:outline-none", !corOk(v[c.id]) && "text-red-600")}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo id="cfg-fonte" label="Fonte">
            <select id="cfg-fonte" value={v.fontFamily} onChange={(e) => r.mudar("fontFamily", e.target.value)} className={cn(selectClasse, "w-full")}>
              <option value="Inter, sans-serif">Inter</option>
              <option value="Roboto, sans-serif">Roboto</option>
              <option value="Poppins, sans-serif">Poppins</option>
              <option value="Montserrat, sans-serif">Montserrat</option>
              <option value="'Open Sans', sans-serif">Open Sans</option>
            </select>
          </Campo>
          <Campo id="cfg-botao" label="Estilo dos botões">
            <select
              id="cfg-botao"
              value={v.buttonStyle}
              onChange={(e) => r.mudar("buttonStyle", e.target.value as typeof v.buttonStyle)}
              className={cn(selectClasse, "w-full")}
            >
              <option value="rounded">Arredondado</option>
              <option value="square">Quadrado</option>
              <option value="pill">Pílula</option>
            </select>
          </Campo>
        </div>
        <LinhaOpcao htmlFor="cfg-escuro" titulo="Modo escuro">
          <Switch id="cfg-escuro" checked={v.darkMode} onCheckedChange={(x) => r.mudar("darkMode", x)} />
        </LinhaOpcao>
      </SecaoFormulario>

      <BarraSalvar
        sujo={r.sujo}
        salvando={salvando}
        onSalvar={salvar}
        onDescartar={r.descartar}
        bloqueado={CORES.some((c) => !corOk(v[c.id])) ? "Use cores no formato #RRGGBB" : undefined}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* SEO                                                                */
/* ------------------------------------------------------------------ */

export const SecaoSeo: React.FC<SecaoProps> = ({ onSujo }) => {
  const { config, isLoading, updateSeoConfig } = useSiteConfig();
  const r = useRascunho<SiteConfig["seo"]>(config.seo, isLoading, onSujo);
  const [salvando, setSalvando] = useState(false);
  const [palavra, setPalavra] = useState("");
  const [robotsAtual, setRobotsAtual] = useState<string | null>(null);
  const s = r.valor;

  useEffect(() => {
    fetch("/robots.txt")
      .then((res) => (res.ok ? res.text() : null))
      .then((t) => setRobotsAtual(t && !t.trim().startsWith("<") ? t : null))
      .catch(() => setRobotsAtual(null));
  }, []);

  if (isLoading) return <Carregando />;

  const salvar = async () => {
    setSalvando(true);
    await salvarCom(() => updateSeoConfig(s), "SEO salvo");
    setSalvando(false);
  };

  const addPalavra = () => {
    const novas = palavra
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p && !s.siteKeywords.includes(p));
    if (novas.length) r.mudar("siteKeywords", [...s.siteKeywords, ...novas]);
    setPalavra("");
  };

  return (
    <div className="space-y-4">
      <AvisoTabela />
      <SecaoFormulario titulo="Busca no Google" descricao="Título e descrição padrão das páginas que não definem os próprios.">
        <Campo id="seo-titulo" label={<span className="flex w-full justify-between">Título <Contagem n={s.siteTitle.length} max={60} /></span>}>
          <Input id="seo-titulo" value={s.siteTitle} onChange={(e) => r.mudar("siteTitle", e.target.value)} />
        </Campo>
        <Campo id="seo-desc" label={<span className="flex w-full justify-between">Descrição <Contagem n={s.siteDescription.length} max={160} /></span>}>
          <Textarea id="seo-desc" rows={3} value={s.siteDescription} onChange={(e) => r.mudar("siteDescription", e.target.value)} />
        </Campo>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5" aria-label="Prévia no Google">
          <p className="text-[11px] text-slate-500">bomestudo.com.br</p>
          <p className="truncate text-base text-[#1a0dab]">{s.siteTitle || "Título do site"}</p>
          <p className="line-clamp-2 text-xs text-slate-600">{s.siteDescription || "Descrição do site"}</p>
        </div>
        <Campo id="seo-palavra" label="Palavras-chave" dica="Separe por vírgula ou pressione Enter.">
          <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input px-2 py-1.5">
            {s.siteKeywords.map((k) => (
              <span key={k} className="inline-flex items-center gap-1 rounded-full bg-[#5f2ebe]/10 py-0.5 pl-2 pr-1 text-xs text-[#5f2ebe]">
                {k}
                <button
                  type="button"
                  onClick={() => r.mudar("siteKeywords", s.siteKeywords.filter((x) => x !== k))}
                  className="rounded-full p-0.5 hover:bg-[#5f2ebe]/20"
                  aria-label={`Remover ${k}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              id="seo-palavra"
              value={palavra}
              onChange={(e) => setPalavra(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addPalavra();
                }
              }}
              onBlur={addPalavra}
              placeholder={s.siteKeywords.length ? "" : "concursos, questões..."}
              className="min-w-[120px] flex-1 bg-transparent py-0.5 text-sm focus:outline-none"
            />
          </div>
        </Campo>
      </SecaoFormulario>

      <SecaoFormulario titulo="Compartilhamento" descricao="Imagem e perfil usados quando um link do site é compartilhado.">
        <Campo id="seo-og" label="Imagem de compartilhamento" dica="1200×630 px funciona bem no WhatsApp, Facebook e X.">
          <CampoImagem id="seo-og" url={s.ogImageUrl} pasta="seo" formato="largo" onChange={(u) => r.mudar("ogImageUrl", u)} />
        </Campo>
        <Campo id="seo-x" label="Perfil no X / Twitter">
          <Input id="seo-x" value={s.twitterHandle} onChange={(e) => r.mudar("twitterHandle", e.target.value)} placeholder="@bomestudo" />
        </Campo>
      </SecaoFormulario>

      <SecaoFormulario titulo="Indexação e medição">
        <LinhaOpcao
          htmlFor="seo-index"
          alerta={!s.enableIndexing}
          titulo="Aparecer nos buscadores"
          descricao={s.enableIndexing ? "Google e outros podem listar o site." : "Desligado: as páginas pedem para não serem listadas no Google."}
        >
          <Switch id="seo-index" checked={s.enableIndexing} onCheckedChange={(x) => r.mudar("enableIndexing", x)} />
        </LinhaOpcao>
        <LinhaOpcao
          htmlFor="seo-struct"
          titulo={
            <>
              Dados estruturados <NaoAplicado />
            </>
          }
          descricao="Informações extras para o Google entender o site."
        >
          <Switch id="seo-struct" checked={s.structuredData} onCheckedChange={(x) => r.mudar("structuredData", x)} />
        </LinhaOpcao>
        <Campo id="seo-ga" label="Google Analytics" dica="ID da propriedade, ex.: G-XXXXXXXXXX. Vazio desliga.">
          <Input id="seo-ga" value={s.googleAnalyticsId} onChange={(e) => r.mudar("googleAnalyticsId", e.target.value.trim())} placeholder="G-XXXXXXXXXX" className="font-mono" />
        </Campo>
      </SecaoFormulario>

      <SecaoFormulario
        titulo="robots.txt"
        descricao="O arquivo servido vem de public/robots.txt no código. Esta é só uma leitura do que está no ar."
      >
        <pre className="max-h-48 overflow-auto rounded-lg bg-slate-900 px-3 py-2.5 font-mono text-xs leading-relaxed text-slate-100">
          {robotsAtual ?? "Não foi possível ler /robots.txt."}
        </pre>
      </SecaoFormulario>

      <BarraSalvar sujo={r.sujo} salvando={salvando} onSalvar={salvar} onDescartar={r.descartar} />
    </div>
  );
};
