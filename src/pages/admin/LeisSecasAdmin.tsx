import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit, Eye, EyeOff, Plus, Scale, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AbasContagem,
  CampoBusca,
  Etiqueta,
  EstadoVazio,
  FiltrosBarra,
  ListaEsqueleto,
  MenuAcoes,
  PainelListagem,
  RodapePaginacao,
  botaoPrimario,
  normalizar,
  selectClasse,
} from "@/components/admin/ui/listagem";
import { ConfirmarAcao } from "@/components/admin/ui/dialogos";
import { cn } from "@/lib/utils";
import { EditorLeiSeca, FormLeiSeca } from "./components/leis-secas/EditorLeiSeca";

interface LeiSeca {
  id: string;
  titulo: string;
  conteudo: string;
  palavras_treino: Array<{ palavra: string; posicao: number }>;
  curso_id: string; // Mantido para compatibilidade
  cursos_ids: string[];
  ativo: boolean;
}

interface Curso {
  id: string;
  titulo: string;
}

type Aba = "todas" | "ativas" | "inativas";
const POR_PAGINA = 20;

/** Converte as marcações [treino:x] em palavras com posição no texto limpo. */
const processarPalavrasTreino = (conteudo: string): Array<{ palavra: string; posicao: number }> => {
  const regex = /\[treino:(.*?)\]/g;
  const palavras: Array<{ palavra: string; posicao: number }> = [];
  let match;
  let offset = 0;
  while ((match = regex.exec(conteudo)) !== null) {
    const palavra = match[1];
    palavras.push({ palavra, posicao: match.index - offset });
    offset += match[0].length - palavra.length;
  }
  return palavras;
};

const limparMarcacoes = (conteudo: string) => conteudo.replace(/\[treino:(.*?)\]/g, "$1");

/** Reconstrói o texto com as marcações [treino:] a partir das posições salvas. */
const comMarcacoes = (lei: LeiSeca) => {
  let texto = lei.conteudo;
  [...(lei.palavras_treino || [])]
    .sort((a, b) => b.posicao - a.posicao)
    .forEach((item) => {
      texto = `${texto.substring(0, item.posicao)}[treino:${item.palavra}]${texto.substring(item.posicao + item.palavra.length)}`;
    });
  return texto;
};

const cursosDaLei = (lei: LeiSeca) => (lei.cursos_ids?.length ? lei.cursos_ids : lei.curso_id ? [lei.curso_id] : []);

export default function LeisSecasAdmin() {
  const [leis, setLeis] = useState<LeiSeca[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  /** null = lista; "nova" = criando; id = editando */
  const [editor, setEditor] = useState<null | "nova" | string>(null);
  const [excluindo, setExcluindo] = useState<LeiSeca | null>(null);
  const [aba, setAba] = useState<Aba>("todas");
  const [busca, setBusca] = useState("");
  const [curso, setCurso] = useState("");
  const [pagina, setPagina] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [{ data: cursosData, error: e1 }, { data: leisData, error: e2 }] = await Promise.all([
        supabase.from("cursos").select("id, titulo").order("titulo"),
        supabase.from("leis_secas").select("*").order("titulo"),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      setCursos(cursosData || []);
      setLeis((leisData || []) as unknown as LeiSeca[]);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast.error("Erro ao carregar as leis secas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const nomeCurso = useMemo(() => new Map(cursos.map((c) => [c.id, c.titulo])), [cursos]);

  const base = useMemo(() => {
    const termo = normalizar(busca.trim());
    return leis.filter((l) => {
      if (curso && !cursosDaLei(l).includes(curso)) return false;
      return !termo || normalizar(`${l.titulo} ${l.conteudo}`).includes(termo);
    });
  }, [leis, busca, curso]);

  const contagens = {
    todas: base.length,
    ativas: base.filter((l) => l.ativo).length,
    inativas: base.filter((l) => !l.ativo).length,
  };
  const filtradas = base.filter((l) => aba === "todas" || (aba === "ativas" ? l.ativo : !l.ativo));
  useEffect(() => setPagina(1), [busca, curso, aba]);
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtradas.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);

  const salvar = async (form: FormLeiSeca) => {
    setSalvando(true);
    try {
      const dados = {
        titulo: form.titulo.trim(),
        conteudo: limparMarcacoes(form.conteudo),
        palavras_treino: processarPalavrasTreino(form.conteudo),
        cursos_ids: form.cursos_ids,
        curso_id: form.cursos_ids[0] || "", // Mantém compatibilidade
        ativo: form.ativo,
      };
      if (editor && editor !== "nova") {
        const { error } = await supabase.from("leis_secas").update(dados).eq("id", editor);
        if (error) throw error;
        toast.success("Lei atualizada");
      } else {
        const { error } = await supabase.from("leis_secas").insert(dados);
        if (error) throw error;
        toast.success("Lei criada");
      }
      setEditor(null);
      fetchData();
    } catch (error) {
      console.error("Erro ao salvar lei:", error);
      toast.error("Erro ao salvar a lei");
    } finally {
      setSalvando(false);
    }
  };

  const alternarAtivo = async (lei: LeiSeca) => {
    const ativo = !lei.ativo;
    setLeis((l) => l.map((x) => (x.id === lei.id ? { ...x, ativo } : x)));
    const { error } = await supabase.from("leis_secas").update({ ativo }).eq("id", lei.id);
    if (error) {
      setLeis((l) => l.map((x) => (x.id === lei.id ? { ...x, ativo: !ativo } : x)));
      toast.error("Não foi possível alterar a visibilidade");
    } else {
      toast.success(ativo ? "Lei visível para os alunos" : "Lei escondida dos alunos");
    }
  };

  const excluir = async () => {
    if (!excluindo) return;
    const { error } = await supabase.from("leis_secas").delete().eq("id", excluindo.id);
    if (error) {
      console.error("Erro ao excluir lei:", error);
      toast.error("Erro ao excluir a lei");
      return;
    }
    setLeis((l) => l.filter((x) => x.id !== excluindo.id));
    toast.success("Lei excluída");
  };

  if (editor) {
    const lei = editor !== "nova" ? leis.find((l) => l.id === editor) : undefined;
    return (
      <EditorLeiSeca
        key={editor}
        editando={!!lei}
        inicial={
          lei
            ? { titulo: lei.titulo, conteudo: comMarcacoes(lei), cursos_ids: cursosDaLei(lei), ativo: lei.ativo }
            : { titulo: "", conteudo: "", cursos_ids: curso ? [curso] : [], ativo: true }
        }
        cursos={cursos}
        salvando={salvando}
        onSalvar={salvar}
        onCancelar={() => setEditor(null)}
      />
    );
  }

  const filtroAtivo = !!busca || !!curso || aba !== "todas";

  return (
    <div className="space-y-4">
      <AdminPageHeader
        titulo="Leis secas"
        descricao="Textos de lei com lacunas para treino. Cada lei aparece na aba Lei seca dos cursos escolhidos."
        acoes={
          <Button onClick={() => setEditor("nova")} className={botaoPrimario}>
            <Plus className="mr-2 h-4 w-4" />
            Nova lei
          </Button>
        }
      />

      <PainelListagem
        barra={
          <>
            <AbasContagem<Aba>
              abas={[
                { id: "todas", label: "Todas", n: contagens.todas },
                { id: "ativas", label: "Visíveis", n: contagens.ativas },
                { id: "inativas", label: "Escondidas", n: contagens.inativas },
              ]}
              ativa={aba}
              onChange={setAba}
            />
            <FiltrosBarra>
              <select value={curso} onChange={(e) => setCurso(e.target.value)} className={cn(selectClasse, "sm:max-w-[14rem]")} aria-label="Filtrar por curso">
                <option value="">Todos os cursos</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.titulo}
                  </option>
                ))}
              </select>
              <CampoBusca valor={busca} onChange={setBusca} placeholder="Buscar no título ou no texto" rotulo="Buscar leis" />
            </FiltrosBarra>
          </>
        }
        rodape={
          !loading && <RodapePaginacao pagina={paginaAtual} porPagina={POR_PAGINA} total={filtradas.length} onPagina={setPagina} singular="lei" plural="leis" />
        }
      >
        {loading ? (
          <ListaEsqueleto />
        ) : visiveis.length === 0 ? (
          <EstadoVazio
            icone={Scale}
            titulo={filtroAtivo ? "Nenhuma lei encontrada" : "Nenhuma lei cadastrada"}
            texto={filtroAtivo ? "Tente outra busca, outro curso ou outra aba." : "Cadastre o texto de uma lei e marque as palavras que o aluno deve completar."}
            acao={
              filtroAtivo ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBusca("");
                    setCurso("");
                    setAba("todas");
                  }}
                >
                  Limpar filtros
                </Button>
              ) : (
                <Button size="sm" onClick={() => setEditor("nova")} className={botaoPrimario}>
                  <Plus className="mr-1.5 h-4 w-4" /> Nova lei
                </Button>
              )
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {visiveis.map((lei) => {
              const ids = cursosDaLei(lei);
              const n = lei.palavras_treino?.length || 0;
              return (
                <li key={lei.id} className="flex items-start gap-3 px-3 py-3.5 transition-colors hover:bg-[#faf8ff] sm:items-center sm:gap-4 sm:px-4">
                  <span
                    className={cn(
                      "hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:flex",
                      lei.ativo ? "bg-[#5f2ebe]/10 text-[#5f2ebe]" : "bg-slate-100 text-slate-400"
                    )}
                    aria-hidden
                  >
                    <Scale className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditor(lei.id)}
                        className="text-left text-sm font-semibold leading-snug text-slate-900 hover:text-[#5f2ebe]"
                      >
                        {lei.titulo}
                      </button>
                      <Etiqueta tom={lei.ativo ? "verde" : "cinza"}>{lei.ativo ? "Visível" : "Escondida"}</Etiqueta>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{lei.conteudo}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      <span className={cn("mr-1 text-[11px] font-medium", n ? "text-[#5f2ebe]" : "text-amber-600")}>
                        {n ? `${n} ${n === 1 ? "lacuna" : "lacunas"}` : "sem lacunas"}
                      </span>
                      {ids.slice(0, 3).map((id) => (
                        <span key={id} className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">
                          {nomeCurso.get(id) || "Curso removido"}
                        </span>
                      ))}
                      {ids.length > 3 && (
                        <span className="text-[11px] text-slate-400" title={ids.map((id) => nomeCurso.get(id)).join(", ")}>
                          +{ids.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditor(lei.id)} className="hidden text-slate-600 sm:inline-flex">
                      <Edit className="mr-1.5 h-4 w-4" />
                      Editar
                    </Button>
                    <MenuAcoes
                      acoes={[
                        { label: "Editar", icone: Edit, onClick: () => setEditor(lei.id), soCelular: true },
                        {
                          label: lei.ativo ? "Esconder dos alunos" : "Mostrar aos alunos",
                          icone: lei.ativo ? EyeOff : Eye,
                          onClick: () => alternarAtivo(lei),
                        },
                        { label: "Excluir", icone: Trash2, onClick: () => setExcluindo(lei), perigo: true, separadorAntes: true },
                      ]}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </PainelListagem>

      <ConfirmarAcao
        aberto={!!excluindo}
        onFechar={() => setExcluindo(null)}
        titulo={`Excluir "${excluindo?.titulo || ""}"?`}
        descricao="A lei sai de todos os cursos. Essa ação não pode ser desfeita. Se quiser só tirar do ar, use Esconder dos alunos."
        textoConfirmar="Excluir lei"
        onConfirmar={excluir}
      />
    </div>
  );
}
