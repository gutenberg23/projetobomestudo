import { useCallback, useEffect, useMemo, useState } from "react";
import { FolderOpen, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader, FluxoConteudo } from "@/components/admin/AdminPageHeader";
import {
  AbasContagem,
  CampoBusca,
  EstadoVazio,
  FiltrosBarra,
  ListaEsqueleto,
  PainelListagem,
  RodapePaginacao,
  botaoPrimario,
  normalizar,
  selectClasse,
} from "@/components/admin/ui/listagem";
import { ConfirmarAcao } from "@/components/admin/ui/dialogos";
import { cn } from "@/lib/utils";
import { CursosTable, CursoDialog, Curso, DadosCurso, DisciplinaOpcao } from "./components/cursos";
import type { TeoriaOpcao } from "./components/cursos/EscolherTeoriasDisciplina";
import { AVISO_MIGRATION_TEORIAS, carregarTeoriasResumo, type TeoriaResumo } from "./components/disciplinas/useDisciplinas";
import { lerTeoriasPorDisciplina, teoriasDaDisciplinaNoCurso } from "@/utils/teoriasDoCurso";

type Aba = "todos" | "sem-disciplinas";
type Ordem = "recentes" | "titulo" | "favoritos";
const POR_PAGINA = 20;

const unicos = (lista: (string | null | undefined)[]) =>
  Array.from(new Set(lista.filter((x): x is string => !!x && x.trim() !== "")));

const Cursos = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [disciplinas, setDisciplinas] = useState<DisciplinaOpcao[]>([]);
  const [teorias, setTeorias] = useState<Map<string, TeoriaOpcao>>(new Map());
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [aba, setAba] = useState<Aba>("todos");
  const [ordem, setOrdem] = useState<Ordem>("recentes");
  const [pagina, setPagina] = useState(1);
  const [dialogo, setDialogo] = useState<{ curso: Curso | null } | null>(null);
  const [excluindo, setExcluindo] = useState<Curso | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data, error }, { data: perfis }, { data: discs }, resumo] = await Promise.all([
        supabase.from("cursos").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("cursos_favoritos"),
        supabase.from("disciplinas").select("*").order("titulo"),
        carregarTeoriasResumo().catch((e): TeoriaResumo[] => {
          console.error("Erro ao carregar teorias:", e);
          return [];
        }),
      ]);
      if (error) throw error;

      const favoritos: Record<string, number> = {};
      (perfis || []).forEach((p) => (p.cursos_favoritos || []).forEach((id: string) => (favoritos[id] = (favoritos[id] || 0) + 1)));

      setTeorias(new Map(resumo.map((t) => [t.id, { id: t.id, titulo: t.titulo, assunto: t.assunto, publicada: t.publicada }])));
      const teoriasDe = (d: unknown): string[] => (d as { teorias_ids?: string[] | null }).teorias_ids || [];

      // Disciplinas unificadas em outra não aparecem para escolha
      const ativas = (discs || []).filter((d) => !(d as { unificada_em?: string | null }).unificada_em);
      const teoriasDaDisciplina = new Map((discs || []).map((d) => [d.id, teoriasDe(d)]));
      setDisciplinas(ativas.map((d) => ({ id: d.id, titulo: d.titulo, banca: d.banca, teoriasIds: teoriasDe(d) })));
      setCursos(
        (data || []).map((c) => {
          const disciplinasIds: string[] = c.disciplinas_ids || [];
          const selecao = lerTeoriasPorDisciplina((c as { teorias_por_disciplina?: unknown }).teorias_por_disciplina);
          const totalTeorias = unicos(
            disciplinasIds.flatMap((d) => teoriasDaDisciplinaNoCurso(teoriasDaDisciplina.get(d), selecao, d))
          ).length;
          return {
            id: c.id,
            titulo: c.titulo,
            descricao: c.descricao || "",
            disciplinasIds,
            favoritos: favoritos[c.id] || 0,
            informacoesCurso: c.informacoes_curso || "",
            criadoEm: c.created_at,
            teoriasPorDisciplina: selecao,
            totalTeorias,
            temColunaSelecao: "teorias_por_disciplina" in c,
          };
        })
      );
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
      toast.error("Erro ao carregar os cursos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const nomesDisciplinas = useMemo(() => new Map(disciplinas.map((d) => [d.id, d.titulo])), [disciplinas]);

  const base = useMemo(() => {
    const termo = normalizar(busca.trim());
    if (!termo) return cursos;
    return cursos.filter((c) =>
      normalizar(`${c.titulo} ${c.descricao} ${c.disciplinasIds.map((id) => nomesDisciplinas.get(id) || "").join(" ")} ${c.id}`).includes(termo)
    );
  }, [cursos, busca, nomesDisciplinas]);

  const filtrados = useMemo(() => {
    const lista = base.filter((c) => aba === "todos" || c.disciplinasIds.length === 0);
    if (ordem === "titulo") return [...lista].sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR"));
    if (ordem === "favoritos") return [...lista].sort((a, b) => b.favoritos - a.favoritos);
    return lista;
  }, [base, aba, ordem]);

  useEffect(() => setPagina(1), [busca, aba, ordem]);
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);

  const salvar = async (dados: DadosCurso): Promise<boolean> => {
    const curso = dialogo?.curso;
    const disciplinas_ids = unicos(dados.disciplinasIds);
    const teorias_por_disciplina: Record<string, string[]> = {};
    disciplinas_ids.forEach((id) => {
      if (dados.teoriasPorDisciplina[id]) teorias_por_disciplina[id] = unicos(dados.teoriasPorDisciplina[id]);
    });
    const temSelecao = Object.keys(teorias_por_disciplina).length > 0;
    const campos = {
      titulo: dados.titulo,
      descricao: dados.cargo,
      informacoes_curso: dados.informacoes,
      disciplinas_ids,
      // Antes da migration a coluna não existe: só grava quando há o que gravar
      ...((temSelecao || cursos.some((c) => c.temColunaSelecao)) && { teorias_por_disciplina }),
    };
    const nTeorias = unicos(
      disciplinas_ids.flatMap((d) =>
        teoriasDaDisciplinaNoCurso(disciplinas.find((x) => x.id === d)?.teoriasIds, teorias_por_disciplina, d)
      )
    ).length;
    const resumo = `${disciplinas_ids.length} ${disciplinas_ids.length === 1 ? "disciplina" : "disciplinas"} e ${nTeorias} ${nTeorias === 1 ? "teoria" : "teorias"}`;

    try {
      if (curso) {
        const { error } = await supabase.from("cursos").update(campos).eq("id", curso.id);
        if (error) throw error;
        toast.success(`Curso atualizado: ${resumo}.`);
      } else {
        const { error } = await supabase.from("cursos").insert([campos]);
        if (error) throw error;
        toast.success(disciplinas_ids.length ? `Curso criado com ${resumo}.` : "Curso criado. Adicione disciplinas quando quiser.");
      }
      carregar();
      return true;
    } catch (error) {
      console.error("Erro ao salvar curso:", error);
      const e = error as { code?: string; message?: string };
      toast.error(
        (e.code === "PGRST204" || e.code === "42703") && /teorias_por_disciplina/.test(e.message || "")
          ? AVISO_MIGRATION_TEORIAS
          : "Erro ao salvar o curso"
      );
      return false;
    }
  };

  const excluir = async () => {
    if (!excluindo) return;
    try {
      const { error } = await supabase.from("cursos").delete().eq("id", excluindo.id);
      if (error) throw error;
      setCursos((l) => l.filter((c) => c.id !== excluindo.id));
      toast.success("Curso excluído");
    } catch (error) {
      console.error("Erro ao excluir curso:", error);
      toast.error("Erro ao excluir o curso");
    }
  };

  const filtroAtivo = !!busca || aba !== "todos";
  const semDisciplinas = base.filter((c) => c.disciplinasIds.length === 0).length;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        titulo="Cursos"
        descricao="Cursos reúnem disciplinas. Em cada disciplina você escolhe quais teorias entram no curso."
        acoes={
          <>
            <Button variant="outline" onClick={carregar} disabled={loading}>
              <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
              Atualizar
            </Button>
            <Button onClick={() => setDialogo({ curso: null })} className={botaoPrimario}>
              <Plus className="mr-2 h-4 w-4" />
              Novo curso
            </Button>
          </>
        }
      >
        <FluxoConteudo atual="cursos" />
      </AdminPageHeader>

      <PainelListagem
        barra={
          <>
            <AbasContagem<Aba>
              abas={[
                { id: "todos", label: "Todos", n: base.length },
                { id: "sem-disciplinas", label: "Sem disciplinas", n: semDisciplinas },
              ]}
              ativa={aba}
              onChange={setAba}
            />
            <FiltrosBarra>
              <select value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)} className={selectClasse} aria-label="Ordenar">
                <option value="recentes">Mais recentes</option>
                <option value="titulo">Título (A–Z)</option>
                <option value="favoritos">Mais favoritados</option>
              </select>
              <CampoBusca valor={busca} onChange={setBusca} placeholder="Buscar por título, cargo ou disciplina" rotulo="Buscar cursos" />
            </FiltrosBarra>
          </>
        }
        rodape={
          !loading && (
            <RodapePaginacao pagina={paginaAtual} porPagina={POR_PAGINA} total={filtrados.length} onPagina={setPagina} singular="curso" plural="cursos" />
          )
        }
      >
        {loading ? (
          <ListaEsqueleto />
        ) : (
          <CursosTable
            cursos={visiveis}
            nomesDisciplinas={nomesDisciplinas}
            onEditar={(c) => setDialogo({ curso: c })}
            onExcluir={setExcluindo}
            vazio={
              <EstadoVazio
                icone={FolderOpen}
                titulo={filtroAtivo ? "Nenhum curso encontrado" : "Nenhum curso cadastrado"}
                texto={filtroAtivo ? "Tente outra busca ou outra aba." : "Crie um curso aqui ou marque disciplinas em Disciplinas."}
                acao={
                  filtroAtivo ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBusca("");
                        setAba("todos");
                      }}
                    >
                      Limpar filtros
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => setDialogo({ curso: null })} className={botaoPrimario}>
                      <Plus className="mr-1.5 h-4 w-4" /> Novo curso
                    </Button>
                  )
                }
              />
            }
          />
        )}
      </PainelListagem>

      <CursoDialog
        aberto={!!dialogo}
        curso={dialogo?.curso || null}
        disciplinas={disciplinas}
        teorias={teorias}
        carregandoDisciplinas={loading}
        onFechar={() => setDialogo(null)}
        onSalvar={salvar}
      />

      <ConfirmarAcao
        aberto={!!excluindo}
        onFechar={() => setExcluindo(null)}
        titulo={`Excluir o curso "${excluindo?.titulo || ""}"?`}
        descricao="Essa ação não pode ser desfeita. As disciplinas e as teorias continuam cadastradas."
        detalhes={[
          "O curso deixa de aparecer no site, inclusive para quem o favoritou.",
          excluindo?.favoritos ? `${excluindo.favoritos} ${excluindo.favoritos === 1 ? "aluno favoritou" : "alunos favoritaram"} este curso.` : "",
        ].filter(Boolean)}
        textoConfirmar="Excluir curso"
        onConfirmar={excluir}
      />
    </div>
  );
};

export default Cursos;
