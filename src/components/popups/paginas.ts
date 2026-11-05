/**
 * Páginas onde um popup pode aparecer. O código é o que fica salvo em
 * popups.pagina; a função paginaDaRota traduz o endereço atual para ele.
 */

export interface PaginaPopup {
  codigo: string;
  rotulo: string;
  /** Endereço de exemplo, para abrir e conferir */
  rota: string;
  descricao: string;
}

export const PAGINA_TODAS = "todas";

export const PAGINAS_POPUP: PaginaPopup[] = [
  { codigo: PAGINA_TODAS, rotulo: "Todas as páginas", rota: "/", descricao: "Qualquer página pública do site (fora login e admin)" },
  { codigo: "home", rotulo: "Página inicial", rota: "/", descricao: "/" },
  { codigo: "dashboard", rotulo: "Painel do aluno", rota: "/dashboard", descricao: "/dashboard" },
  { codigo: "meus-cursos", rotulo: "Meus cursos", rota: "/my-courses", descricao: "/my-courses" },
  { codigo: "cursos", rotulo: "Página do curso", rota: "/explore", descricao: "/course/…" },
  { codigo: "explorar", rotulo: "Explorar", rota: "/explore", descricao: "/explore" },
  { codigo: "questoes", rotulo: "Questões", rota: "/questions", descricao: "/questions" },
  { codigo: "cadernos", rotulo: "Cadernos", rota: "/cadernos", descricao: "/cadernos e cadernos abertos" },
  { codigo: "simulados", rotulo: "Simulados", rota: "/explore", descricao: "/simulado/… e ranking do simulado" },
  { codigo: "concursos", rotulo: "Concursos", rota: "/concursos", descricao: "/concursos e detalhes" },
  { codigo: "teorias", rotulo: "Teorias", rota: "/teorias", descricao: "/teorias e /teoria/…" },
  { codigo: "blog", rotulo: "Blog", rota: "/blog", descricao: "/blog e notícias" },
  { codigo: "ranking", rotulo: "Rankings", rota: "/ranking-questoes", descricao: "/ranking-questoes, comentários e contribuições" },
];

const porCodigo = new Map(PAGINAS_POPUP.map((p) => [p.codigo, p]));
export const rotuloPagina = (codigo: string) => porCodigo.get(codigo)?.rotulo || codigo;
export const paginaConhecida = (codigo: string) => porCodigo.has(codigo);

/** Rotas onde nenhum popup aparece. */
const SEM_POPUP = ["/admin", "/login", "/esqueci-senha", "/redefinir-senha", "/reset-password"];

/** Código da página para o endereço atual, ou null quando popups não devem aparecer. */
export const paginaDaRota = (path: string): string | null => {
  const p = path.replace(/\/+$/, "") || "/";
  if (SEM_POPUP.some((r) => p === r || p.startsWith(`${r}/`))) return null;
  if (p === "/" || p === "/index.html") return "home";
  const comeca = (r: string) => p === r || p.startsWith(`${r}/`);
  if (comeca("/dashboard")) return "dashboard";
  if (comeca("/my-courses")) return "meus-cursos";
  if (comeca("/course")) return "cursos";
  if (comeca("/explore")) return "explorar";
  if (comeca("/questions")) return "questoes";
  if (comeca("/cadernos")) return "cadernos";
  if (comeca("/simulado") || comeca("/simulado-ranking")) return "simulados";
  if (comeca("/concursos")) return "concursos";
  if (comeca("/teorias") || comeca("/teoria")) return "teorias";
  if (comeca("/blog")) return "blog";
  if (p.startsWith("/ranking")) return "ranking";
  return "outras";
};
