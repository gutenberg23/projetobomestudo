import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal, Search, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/*
 * Peças visuais compartilhadas pelas listagens do admin
 * (mesmo acabamento de /admin/concursos, /admin/teorias e /admin/posts).
 */

export const COR_PRIMARIA = "#5f2ebe";
export const botaoPrimario = "bg-[#ea2be2] text-white hover:bg-[#d029d5]";
export const selectClasse =
  "h-9 rounded-md border border-input bg-white px-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5f2ebe]/30";

/** Cartão branco que envolve barra de filtros, lista e rodapé. */
export const PainelListagem: React.FC<{
  barra?: React.ReactNode;
  rodape?: React.ReactNode;
  className?: string;
  /** Filtros numa linha acima das abas (quando há muitas abas) */
  empilhada?: boolean;
  children: React.ReactNode;
}> = ({ barra, rodape, className, empilhada, children }) => (
  <div className={cn("overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]", className)}>
    {barra && (
      <div
        className={cn(
          "flex gap-3 border-b border-slate-100 px-3 pt-3 sm:px-4",
          empilhada ? "flex-col-reverse gap-0" : "flex-col xl:flex-row xl:items-end xl:justify-between"
        )}
      >
        {barra}
      </div>
    )}
    {children}
    {rodape}
  </div>
);

export interface AbaContagem<T extends string> {
  id: T;
  label: string;
  n?: number;
}

/** Abas sublinhadas com contador, usadas no topo das listagens. */
export function AbasContagem<T extends string>({
  abas,
  ativa,
  onChange,
  rotulo = "Filtrar",
}: {
  abas: AbaContagem<T>[];
  ativa: T;
  onChange: (id: T) => void;
  rotulo?: string;
}) {
  return (
    <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label={rotulo}>
      {abas.map((a) => {
        const sel = ativa === a.id;
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onChange(a.id)}
            aria-current={sel ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition-colors",
              sel ? "border-[#5f2ebe] text-[#5f2ebe]" : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            {a.label}
            {a.n !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[11px] tabular-nums",
                  sel ? "bg-[#5f2ebe]/10 text-[#5f2ebe]" : "bg-slate-100 text-slate-500"
                )}
              >
                {a.n.toLocaleString("pt-BR")}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

/** Área à direita da barra (busca e selects). */
export const FiltrosBarra: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("flex flex-col gap-2 pb-3 sm:flex-row sm:items-center", className)}>{children}</div>
);

/** Campo de busca com ícone e botão de limpar. */
export const CampoBusca: React.FC<{
  valor: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
  rotulo?: string;
  autoFocus?: boolean;
}> = ({ valor, onChange, placeholder, className, rotulo, autoFocus }) => (
  <div className={cn("relative sm:w-72", className)}>
    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
    <Input
      className="h-9 bg-white pl-9 pr-8"
      placeholder={placeholder}
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      aria-label={rotulo || placeholder}
      autoFocus={autoFocus}
    />
    {valor && (
      <button
        type="button"
        onClick={() => onChange("")}
        className="absolute right-2 top-2 rounded p-0.5 text-slate-400 hover:text-slate-700"
        aria-label="Limpar busca"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
);

/** Linhas cinzas pulsando enquanto a lista carrega. */
export const ListaEsqueleto: React.FC<{ linhas?: number; icone?: boolean; redondo?: boolean }> = ({
  linhas = 6,
  icone = true,
  redondo = false,
}) => (
  <ul className="divide-y divide-slate-100" aria-busy="true" aria-label="Carregando">
    {Array.from({ length: linhas }, (_, i) => (
      <li key={i} className="flex items-center gap-4 px-4 py-3.5">
        {icone && <div className={cn("h-10 w-10 shrink-0 animate-pulse bg-slate-100", redondo ? "rounded-full" : "rounded-lg")} />}
        <div className="flex-1 space-y-2">
          <div className="h-4 animate-pulse rounded bg-slate-100" style={{ width: `${55 + ((i * 17) % 30)}%` }} />
          <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
        </div>
      </li>
    ))}
  </ul>
);

/** Estado vazio com ícone, explicação e ação. */
export const EstadoVazio: React.FC<{
  icone: LucideIcon;
  titulo: string;
  texto?: React.ReactNode;
  acao?: React.ReactNode;
  className?: string;
}> = ({ icone: Icone, titulo, texto, acao, className }) => (
  <div className={cn("flex flex-col items-center gap-3 px-4 py-14 text-center", className)}>
    <span className="rounded-full bg-slate-100 p-3 text-slate-400">
      <Icone className="h-6 w-6" />
    </span>
    <div>
      <p className="font-medium text-slate-700">{titulo}</p>
      {texto && <p className="mt-1 max-w-md text-sm text-slate-500">{texto}</p>}
    </div>
    {acao}
  </div>
);

export const paginasVisiveis = (atual: number, total: number): (number | "...")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const paginas: (number | "...")[] = [1];
  const inicio = Math.max(2, atual - 1);
  const fim = Math.min(total - 1, atual + 1);
  if (inicio > 2) paginas.push("...");
  for (let i = inicio; i <= fim; i++) paginas.push(i);
  if (fim < total - 1) paginas.push("...");
  paginas.push(total);
  return paginas;
};

/** Rodapé com "1–20 de 130 itens" e paginação numerada. */
export const RodapePaginacao: React.FC<{
  pagina: number;
  porPagina: number;
  total: number;
  onPagina: (p: number) => void;
  singular: string;
  plural: string;
  extra?: React.ReactNode;
}> = ({ pagina, porPagina, total, onPagina, singular, plural, extra }) => {
  if (total === 0) return null;
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  const atual = Math.min(pagina, totalPaginas);
  const inicio = (atual - 1) * porPagina + 1;
  const fim = Math.min(atual * porPagina, total);
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500 sm:flex-row">
      <p className="tabular-nums">
        {totalPaginas > 1 ? `${inicio}–${fim} de ` : ""}
        {total.toLocaleString("pt-BR")} {total === 1 ? singular : plural}
        {extra}
      </p>
      {totalPaginas > 1 && (
        <nav className="flex items-center gap-1" aria-label="Paginação">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={atual === 1}
            onClick={() => onPagina(atual - 1)}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {paginasVisiveis(atual, totalPaginas).map((p, i) =>
            p === "..." ? (
              <span key={`r${i}`} className="px-1 text-slate-400">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPagina(p)}
                aria-current={p === atual ? "page" : undefined}
                className={cn(
                  "h-8 min-w-8 rounded-md px-2 text-sm tabular-nums",
                  p === atual ? "bg-[#5f2ebe] font-semibold text-white" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {p}
              </button>
            )
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={atual === totalPaginas}
            onClick={() => onPagina(atual + 1)}
            aria-label="Próxima página"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      )}
    </div>
  );
};

export type TomEtiqueta = "verde" | "ambar" | "cinza" | "roxo" | "azul" | "vermelho" | "rosa" | "ciano";

const TONS: Record<TomEtiqueta, string> = {
  verde: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  ambar: "bg-amber-50 text-amber-700 ring-amber-200",
  cinza: "bg-slate-100 text-slate-600 ring-slate-200",
  roxo: "bg-[#5f2ebe]/10 text-[#5f2ebe] ring-[#5f2ebe]/20",
  azul: "bg-sky-50 text-sky-700 ring-sky-200",
  vermelho: "bg-red-50 text-red-700 ring-red-200",
  rosa: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200",
  ciano: "bg-teal-50 text-teal-700 ring-teal-200",
};

/** Etiqueta arredondada (status, papel etc.). */
export const Etiqueta: React.FC<{ tom?: TomEtiqueta; children: React.ReactNode; className?: string; title?: string }> = ({
  tom = "cinza",
  children,
  className,
  title,
}) => (
  <span title={title} className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1", TONS[tom], className)}>
    {children}
  </span>
);

/** Ícone + número discreto (ex.: 12 tópicos). Fica apagado quando é zero. */
export const Contador: React.FC<{ icone: LucideIcon; n: number; titulo: string; className?: string }> = ({
  icone: Icone,
  n,
  titulo,
  className,
}) => (
  <span
    title={`${n.toLocaleString("pt-BR")} ${titulo}`}
    className={cn("inline-flex items-center gap-1 tabular-nums", n > 0 ? "text-slate-600" : "text-slate-300", className)}
  >
    <Icone className="h-3.5 w-3.5" />
    {n.toLocaleString("pt-BR")}
  </span>
);

/** Números de resumo no topo da página. */
export const CartoesResumo: React.FC<{
  itens: { rotulo: string; valor: React.ReactNode; detalhe?: React.ReactNode; icone?: LucideIcon; tom?: "roxo" | "verde" | "ambar" | "cinza" | "rosa" }[];
  carregando?: boolean;
}> = ({ itens, carregando }) => {
  const cores = {
    roxo: "bg-[#5f2ebe]/10 text-[#5f2ebe]",
    verde: "bg-emerald-50 text-emerald-600",
    ambar: "bg-amber-50 text-amber-600",
    cinza: "bg-slate-100 text-slate-500",
    rosa: "bg-fuchsia-50 text-fuchsia-600",
  };
  return (
    <div className={cn("grid gap-3", itens.length >= 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-3")}>
      {itens.map((i) => {
        const Icone = i.icone;
        return (
          <div key={i.rotulo} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            {Icone && (
              <span className={cn("hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:flex", cores[i.tom || "roxo"])}>
                <Icone className="h-4 w-4" />
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-slate-500">{i.rotulo}</p>
              {carregando ? (
                <div className="mt-1 h-6 w-12 animate-pulse rounded bg-slate-100" />
              ) : (
                <p className="text-xl font-bold leading-tight tabular-nums text-slate-900">{i.valor}</p>
              )}
              {i.detalhe && !carregando && <p className="truncate text-[11px] text-slate-400">{i.detalhe}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export interface AcaoMenu {
  label: string;
  icone?: LucideIcon;
  onClick?: () => void;
  href?: string;
  /** Abre em nova aba (para href) */
  externo?: boolean;
  perigo?: boolean;
  separadorAntes?: boolean;
  /** Só aparece no celular (quando o botão principal some) */
  soCelular?: boolean;
  oculto?: boolean;
}

/** Botão "…" com o menu de ações da linha. */
export const MenuAcoes: React.FC<{ acoes: AcaoMenu[]; rotulo?: string }> = ({ acoes, rotulo = "Mais ações" }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500" aria-label={rotulo}>
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      {acoes
        .filter((a) => !a.oculto)
        .map((a) => {
          const Icone = a.icone;
          const conteudo = (
            <>
              {Icone && <Icone className="mr-2 h-4 w-4" />}
              {a.label}
            </>
          );
          const cls = cn(a.perigo && "text-red-600 focus:bg-red-50 focus:text-red-700", a.soCelular && "sm:hidden");
          return (
            <React.Fragment key={a.label}>
              {a.separadorAntes && <DropdownMenuSeparator />}
              {a.href ? (
                <DropdownMenuItem asChild className={cls}>
                  <a href={a.href} target={a.externo ? "_blank" : undefined} rel={a.externo ? "noopener noreferrer" : undefined}>
                    {conteudo}
                  </a>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={a.onClick} className={cls}>
                  {conteudo}
                </DropdownMenuItem>
              )}
            </React.Fragment>
          );
        })}
    </DropdownMenuContent>
  </DropdownMenu>
);

/** Caixa de seleção nativa no padrão visual do admin. */
export const CaixaSelecao: React.FC<{
  marcado: boolean | "indeterminado";
  onChange: () => void;
  rotulo: string;
  className?: string;
}> = ({ marcado, onChange, rotulo, className }) => (
  <input
    type="checkbox"
    aria-label={rotulo}
    checked={marcado === true}
    ref={(el) => {
      if (el) el.indeterminate = marcado === "indeterminado";
    }}
    onChange={onChange}
    className={cn("h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-[#5f2ebe]", className)}
  />
);

/** Ordena textos em português ignorando acentos e maiúsculas. */
export const normalizar = (t: string) =>
  (t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Copia um texto e avisa. */
export const copiarTexto = async (texto: string) => {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    return false;
  }
};
