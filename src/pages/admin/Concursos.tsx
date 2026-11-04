import { useCallback, useEffect, useMemo, useState } from "react";
import { Concurso, ConcursoFormData, Estado } from "@/types/concurso";
import { BlogPost } from "@/components/blog/types";
import FormularioConcurso from "./components/concursos/FormularioConcurso";
import ListagemConcursos from "./components/concursos/ListagemConcursos";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Award, Plus, RefreshCw, Search, X } from "lucide-react";
import { concursosService } from "@/services/concursosService";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { paraData, statusConcurso, UFS, nomeCargo } from "./components/concursos/utils";

type Aba = "todos" | "abertos" | "em-breve" | "encerrados" | "destaques";

const ABAS: { id: Aba; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "abertos", label: "Inscrições abertas" },
  { id: "em-breve", label: "Em breve" },
  { id: "encerrados", label: "Encerrados" },
  { id: "destaques", label: "Destaques" },
];

const paraFormData = (c: Concurso): ConcursoFormData => ({
  titulo: c.titulo,
  dataInicioInscricao: c.dataInicioInscricao,
  dataFimInscricao: c.dataFimInscricao,
  dataProva: c.dataProva ?? null,
  prorrogado: c.prorrogado,
  niveis: c.niveis,
  cargos: c.cargos,
  vagas: c.vagas,
  salario: c.salario,
  estados: c.estados,
  postId: c.postId,
  destacar: c.destacar,
});

const tempo = (v?: string | null) => paraData(v)?.getTime() ?? 0;

/** Abertos que terminam primeiro, depois os que abrem logo, depois encerrados recentes. */
const ordenar = (a: Concurso, b: Concurso) => {
  const peso = { aberto: 0, "em-breve": 1, encerrado: 2 } as const;
  const sa = statusConcurso(a);
  const sb = statusConcurso(b);
  if (sa !== sb) return peso[sa] - peso[sb];
  if (sa === "aberto") return tempo(a.dataFimInscricao) - tempo(b.dataFimInscricao);
  if (sa === "em-breve") return tempo(a.dataInicioInscricao) - tempo(b.dataInicioInscricao);
  return tempo(b.dataFimInscricao) - tempo(a.dataFimInscricao);
};

const ConcursosAdmin = () => {
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [postIdsUtilizados, setPostIdsUtilizados] = useState<Set<string>>(new Set());
  const [editando, setEditando] = useState<Concurso | null>(null);
  const [criando, setCriando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [aba, setAba] = useState<Aba>("todos");
  const [busca, setBusca] = useState("");
  const [uf, setUf] = useState<Estado | "">("");
  const { isJornalista } = usePermissions();

  const erro = (titulo: string, error: unknown) =>
    toast({ title: titulo, description: (error as Error)?.message, variant: "destructive" });

  const carregarConcursos = useCallback(async () => {
    setLoading(true);
    try {
      setConcursos(await concursosService.listarConcursos());
    } catch (error) {
      erro("Erro ao carregar concursos", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const carregarPosts = useCallback(async () => {
    try {
      const postsData = await concursosService.listarPostsBlog(isJornalista());
      setPosts(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        postsData.map((post: any): BlogPost => ({
          id: post.id,
          title: post.title,
          summary: "",
          content: "",
          author: post.author || "",
          commentCount: 0,
          likesCount: 0,
          viewCount: 0,
          createdAt: post.created_at || "",
          slug: post.slug || "",
          category: post.category,
          isDraft: post.is_draft ?? false,
        }))
      );
    } catch (error) {
      erro("Erro ao carregar posts do blog", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarPostIdsUtilizados = useCallback(async () => {
    try {
      setPostIdsUtilizados(new Set(await concursosService.listarPostIdsUtilizados()));
    } catch (error) {
      console.error("Erro ao carregar posts utilizados:", error);
    }
  }, []);

  useEffect(() => {
    carregarConcursos();
    carregarPosts();
    carregarPostIdsUtilizados();
  }, [carregarConcursos, carregarPosts, carregarPostIdsUtilizados]);

  const postsPorId = useMemo(() => new Map(posts.map((p) => [p.id, p])), [posts]);

  const contagens = useMemo(() => {
    const c: Record<Aba, number> = { todos: concursos.length, abertos: 0, "em-breve": 0, encerrados: 0, destaques: 0 };
    for (const k of concursos) {
      const s = statusConcurso(k);
      if (s === "aberto") c.abertos++;
      else if (s === "em-breve") c["em-breve"]++;
      else c.encerrados++;
      if (k.destacar) c.destaques++;
    }
    return c;
  }, [concursos]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return concursos
      .filter((c) => {
        const s = statusConcurso(c);
        if (aba === "abertos" && s !== "aberto") return false;
        if (aba === "em-breve" && s !== "em-breve") return false;
        if (aba === "encerrados" && s !== "encerrado") return false;
        if (aba === "destaques" && !c.destacar) return false;
        if (uf && !c.estados.includes(uf)) return false;
        if (termo) {
          const alvo = `${c.titulo} ${c.cargos.map(nomeCargo).join(" ")}`.toLowerCase();
          if (!alvo.includes(termo)) return false;
        }
        return true;
      })
      .sort(ordenar);
  }, [concursos, aba, busca, uf]);

  const fecharFormulario = () => {
    setCriando(false);
    setEditando(null);
    document.querySelector(".admin-content")?.scrollTo({ top: 0 });
  };

  const salvarConcurso = async (formData: ConcursoFormData): Promise<boolean> => {
    setSalvando(true);
    try {
      if (editando) {
        await concursosService.atualizarConcurso(editando.id, formData);
        setConcursos((lista) =>
          lista.map((c) => (c.id === editando.id ? { ...c, ...formData, dataProva: formData.dataProva ?? undefined, updatedAt: new Date().toISOString() } : c))
        );
        toast({ title: "Concurso atualizado" });
      } else {
        const novo = await concursosService.criarConcurso(formData);
        setConcursos((lista) => [novo, ...lista]);
        toast({ title: "Concurso criado" });
      }
      carregarPostIdsUtilizados();
      fecharFormulario();
      return true;
    } catch (error) {
      erro("Erro ao salvar o concurso", error);
      return false;
    } finally {
      setSalvando(false);
    }
  };

  const excluirConcurso = async (id: string) => {
    const concurso = concursos.find((c) => c.id === id);
    if (!window.confirm(`Excluir o concurso "${concurso?.titulo || ""}"? Essa ação não pode ser desfeita.`)) return;
    try {
      await concursosService.excluirConcurso(id);
      setConcursos((lista) => lista.filter((c) => c.id !== id));
      carregarPostIdsUtilizados();
      toast({ title: "Concurso excluído" });
    } catch (error) {
      erro("Erro ao excluir o concurso", error);
    }
  };

  const toggleDestaque = async (concurso: Concurso) => {
    const destacar = !concurso.destacar;
    setConcursos((lista) => lista.map((c) => (c.id === concurso.id ? { ...c, destacar } : c)));
    try {
      await concursosService.atualizarConcurso(concurso.id, { ...paraFormData(concurso), destacar });
      toast({ title: destacar ? "Concurso destacado na página inicial" : "Destaque removido" });
    } catch (error) {
      setConcursos((lista) => lista.map((c) => (c.id === concurso.id ? { ...c, destacar: !destacar } : c)));
      erro("Erro ao alterar o destaque", error);
    }
  };

  if (criando || editando) {
    return (
      <FormularioConcurso
        posts={posts}
        postIdsUtilizados={postIdsUtilizados}
        concursoInicial={editando}
        salvando={salvando}
        onSalvar={salvarConcurso}
        onCancelar={fecharFormulario}
      />
    );
  }

  const filtroAtivo = busca || uf;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        titulo="Concursos"
        descricao="Concursos exibidos no site, com prazos, vagas e o post do blog relacionado."
        acoes={
          <>
            <Button
              variant="outline"
              onClick={() => {
                carregarConcursos();
                carregarPosts();
                carregarPostIdsUtilizados();
              }}
              disabled={loading}
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
              Atualizar
            </Button>
            <Button onClick={() => setCriando(true)} className="bg-[#ea2be2] text-white hover:bg-[#d029d5]">
              <Plus className="mr-2 h-4 w-4" />
              Novo concurso
            </Button>
          </>
        }
      />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-3 pt-3 sm:px-4 xl:flex-row xl:items-end xl:justify-between">
          <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Filtrar por situação">
            {ABAS.map((a) => {
              const ativa = aba === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAba(a.id)}
                  aria-current={ativa ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition-colors",
                    ativa ? "border-[#5f2ebe] text-[#5f2ebe]" : "border-transparent text-slate-500 hover:text-slate-800"
                  )}
                >
                  {a.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[11px] tabular-nums",
                      ativa ? "bg-[#5f2ebe]/10 text-[#5f2ebe]" : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {contagens[a.id]}
                  </span>
                </button>
              );
            })}
          </nav>
          <div className="flex gap-2 pb-3">
            <div className="relative flex-1 xl:w-72">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                className="h-9 pl-9 pr-8"
                placeholder="Buscar por órgão ou cargo"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                aria-label="Buscar concursos"
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca("")}
                  className="absolute right-2 top-2 rounded p-0.5 text-slate-400 hover:text-slate-700"
                  aria-label="Limpar busca"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <select
              value={uf}
              onChange={(e) => setUf(e.target.value as Estado | "")}
              aria-label="Filtrar por estado"
              className="h-9 rounded-md border border-input bg-background px-2 text-sm text-slate-700"
            >
              <option value="">Todos os estados</option>
              <option value="Nacional">Nacional</option>
              <option value="Federal">Federal</option>
              {UFS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <ul className="divide-y divide-slate-100" aria-busy="true">
            {Array.from({ length: 5 }, (_, i) => (
              <li key={i} className="flex items-center gap-4 px-4 py-3.5">
                <div className="h-14 w-14 animate-pulse rounded-lg bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ListagemConcursos
            concursos={filtrados}
            postsPorId={postsPorId}
            onEditar={(c) => setEditando(c)}
            onExcluir={excluirConcurso}
            onToggleDestaque={toggleDestaque}
            vazio={
              <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
                <span className="rounded-full bg-slate-100 p-3 text-slate-400">
                  <Award className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-medium text-slate-700">{filtroAtivo ? "Nenhum concurso encontrado" : "Nenhum concurso nesta aba"}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {filtroAtivo ? "Tente outra busca ou outro estado." : "Cadastre um concurso e preencha os dados com a IA a partir de um post."}
                  </p>
                </div>
                {filtroAtivo ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBusca("");
                      setUf("");
                    }}
                  >
                    Limpar filtros
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setCriando(true)} className="bg-[#ea2be2] text-white hover:bg-[#d029d5]">
                    <Plus className="mr-1.5 h-4 w-4" /> Novo concurso
                  </Button>
                )}
              </div>
            }
          />
        )}

        {!loading && filtrados.length > 0 && (
          <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
            {filtrados.length} {filtrados.length === 1 ? "concurso" : "concursos"}
            {filtrados.length !== concursos.length && ` de ${concursos.length}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConcursosAdmin;
