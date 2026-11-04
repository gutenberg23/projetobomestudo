import {
  Award,
  Book,
  BookMarked,
  BookOpen,
  Calendar,
  ClipboardCheck,
  FileText,
  Folders,
  FolderTree,
  HelpCircle,
  Kanban,
  LayoutDashboard,
  Layers,
  LucideIcon,
  Megaphone,
  MessageSquareWarning,
  Newspaper,
  Scale,
  Settings,
  Users,
  Youtube,
} from "lucide-react";

export interface AdminNavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  /** Texto curto exibido na busca do menu e na paleta de comandos */
  descricao?: string;
  /** Palavras extras para a busca (sinônimos) */
  palavras?: string;
  showForJornalista?: boolean;
  /** Chave do contador de pendências mostrado ao lado do item */
  badge?: "moderacao";
}

export interface AdminNavGroup {
  id: string;
  label: string;
  items: AdminNavItem[];
}

/**
 * Navegação do admin, organizada pela ordem de trabalho:
 * o conteúdo do curso vai de teoria → tópico → aula → disciplina → curso.
 */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    id: "geral",
    label: "Visão geral",
    items: [
      { path: "/admin", label: "Dashboard", icon: LayoutDashboard, descricao: "Números e atalhos" },
      { path: "/admin/kanban", label: "Kanban", icon: Kanban, descricao: "Tarefas da equipe", palavras: "tarefas quadro" },
    ],
  },
  {
    id: "conteudo",
    label: "Conteúdo do curso",
    items: [
      { path: "/admin/teorias", label: "Teorias", icon: FileText, descricao: "Aulas em texto", palavras: "texto pdf editor", showForJornalista: true },
      { path: "/admin/topicos", label: "Tópicos", icon: FolderTree, descricao: "Vídeo, teoria e materiais", palavras: "topico" },
      { path: "/admin/aulas", label: "Aulas", icon: BookMarked, descricao: "Conjuntos de tópicos" },
      { path: "/admin/disciplinas", label: "Disciplinas", icon: Layers, descricao: "Conjuntos de aulas" },
      { path: "/admin/cursos", label: "Cursos", icon: Folders, descricao: "Conjuntos de disciplinas" },
      { path: "/admin/edital", label: "Edital verticalizado", icon: BookOpen, palavras: "edital" },
      { path: "/admin/leis-secas", label: "Leis secas", icon: Scale, palavras: "lei legislação" },
    ],
  },
  {
    id: "comunidade",
    label: "Comunidade",
    items: [
      {
        path: "/admin/moderacao",
        label: "Moderação",
        icon: ClipboardCheck,
        descricao: "Envios e correções de usuários",
        palavras: "aprovar contribuições correções envios",
        badge: "moderacao",
      },
    ],
  },
  {
    id: "questoes",
    label: "Questões e simulados",
    items: [
      { path: "/admin/questoes", label: "Questões", icon: HelpCircle },
      { path: "/admin/cadernos", label: "Cadernos de questões", icon: Book },
      { path: "/admin/simulados", label: "Simulados", icon: Calendar },
    ],
  },
  {
    id: "blog",
    label: "Blog e notícias",
    items: [
      { path: "/admin/posts", label: "Posts", icon: Newspaper, palavras: "notícias blog rss", showForJornalista: true },
      { path: "/admin/concursos", label: "Concursos", icon: Award, showForJornalista: true },
    ],
  },
  {
    id: "pessoas",
    label: "Pessoas",
    items: [
      { path: "/admin/usuarios", label: "Usuários", icon: Users, palavras: "alunos contas permissões" },
      { path: "/admin/professores", label: "Professores", icon: Youtube },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    items: [
      { path: "/admin/anuncios", label: "Anúncios", icon: Megaphone, palavras: "ads banner" },
      { path: "/admin/popups", label: "Popups", icon: MessageSquareWarning },
    ],
  },
  {
    id: "sistema",
    label: "Sistema",
    items: [{ path: "/admin/configuracoes", label: "Configurações", icon: Settings, palavras: "site páginas" }],
  },
];

/** Item ativo: igualdade exata no Dashboard, prefixo nos demais (ex.: /admin/teorias/123/edit). */
export const itemAtivo = (path: string, pathname: string) =>
  path === "/admin" ? pathname === "/admin" || pathname === "/admin/" : pathname === path || pathname.startsWith(path + "/");

export const filtrarNavPorPapel = (grupos: AdminNavGroup[], jornalista: boolean) =>
  grupos
    .map((g) => ({ ...g, items: jornalista ? g.items.filter((i) => i.showForJornalista) : g.items }))
    .filter((g) => g.items.length > 0);

export const encontrarItem = (pathname: string, grupos: AdminNavGroup[] = ADMIN_NAV) => {
  for (const g of grupos) {
    // Prefere o caminho mais longo que combina (ex.: /admin/teorias antes de /admin)
    const item = [...g.items].sort((a, b) => b.path.length - a.path.length).find((i) => itemAtivo(i.path, pathname));
    if (item && item.path !== "/admin") return { grupo: g, item };
  }
  if (itemAtivo("/admin", pathname)) return { grupo: grupos[0], item: grupos[0].items[0] };
  return null;
};
