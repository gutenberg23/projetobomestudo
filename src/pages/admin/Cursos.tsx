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
import { buscarEmLotes, calcularComposicaoCurso } from "./components/cursos/composicaoCurso";
import type { AulaOpcao } from "./components/cursos/EscolherAulasDisciplina";
import { lerAulasPorDisciplina } from "@/utils/aulasDoCurso";

type Aba = "todos" | "sem-disciplinas";
type Ordem = "recentes" | "titulo" | "favoritos";
const POR_PAGINA = 20;

const unicos = (lista: (string | null | undefined)[]) =>
  Array.from(new Set(lista.filter((x): x is string => !!x && x.trim() !== "")));

const Cursos = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [disciplinas, setDisciplinas] = useState<DisciplinaOpcao[]>([]);
  const [aulas, setAulas] = useState<Map<string, AulaOpcao>>(new Map());
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
      const [{ data, error }, { data: perfis }, { data: discs }] = await Promise.all([
        supabase.from("cursos").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("cursos_favoritos"),
        supabase.from("disciplinas").select("*").order("titulo"),
      ]);
      if (error) throw error;

      const favoritos: Record<string, number> = {};
      (perfis || []).forEach((p) => (p.cursos_favoritos || []).forEach((id: string) => (favoritos[id] = (favoritos[id] || 0) + 1)));

      // Questões dos tópicos, numa consulta em lote
      const idsTopicos = unicos((data || []).flatMap((c) => c.topicos_ids || []));
      const topicos = idsTopicos.length ? await buscarEmLotes("topicos", "id, questoes_ids", idsTopicos) : [];
      const questoesTopico = new Map(topicos.map((t) => [t.id, (t.questoes_ids || []) as string[]]));

      // Disciplinas unificadas em outra não aparecem para escolha
      const ativas = (discs || []).filter((d) => !(d as { unificada_em?: string | null }).unificada_em);
      const idsAulas = unicos(ativas.flatMap((d) => d.aulas_ids || []));
      const linhasAulas = idsAulas.length ? await buscarEmLotes("aulas", "id, titulo", idsAulas) : [];
      setAulas(new Map(linhasAulas.map((a) => [a.id, { id: a.id, titulo: (a as { titulo?: string }).titulo || "Aula sem título" }])));
      setDisciplinas(
        ativas.map((d) => ({
          id: d.id,
          titulo: d.titulo,
          banca: d.banca,
          aulas: (d.aulas_ids || []).length,
          aulasIds: d.aulas_ids || [],
        }))
      );
      setCursos(
        (data || []).map((c) => {
          const topicosIds: string[] = c.topicos_ids || [];
          const questoes = unicos([...(c.questoes_ids || []), ...topicosIds.flatMap((id) => questoesTopico.get(id) || [])]);
          return {
            id: c.id,
            titulo: c.titulo,
            descricao: c.descricao || "",
            disciplinasIds: c.disciplinas_ids || [],
            aulasIds: c.aulas_ids || [],
            topicosIds,
            questoesIds: c.questoes_ids || [],
            totalQuestoes: questoes.length,
            favoritos: favoritos[c.id] || 0,
            informacoesCurso: c.informacoes_curso || "",
            criadoEm: c.created_at,
            aulasPorDisciplina: lerAulasPorDisciplina((c as { aulas_por_disciplina?: unknown }).aulas_por_disciplina),
            temColunaSelecao: "aulas_por_disciplina" in c,
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
    try {
      const chave = (m: Record<string, string[]>) => JSON.stringify(Object.keys(m).sort().map((k) => [k, [...m[k]].sort()]));
      const mudou =
        !curso ||
        curso.disciplinasIds.join(",") !== dados.disciplinasIds.join(",") ||
        chave(curso.aulasPorDisciplina) !== chave(dados.aulasPorDisciplina);
      const calculada = mudou ? await calcularComposicaoCurso(dados.disciplinasIds, dados.aulasPorDisciplina) : null;
      let composicao: Omit<NonNullable<typeof calculada>, "aulas_por_disciplina"> | null = null;
      let selecao: { aulas_por_disciplina?: Record<string, string[]> } = {};
      if (calculada) {
        const { aulas_por_disciplina, ...resto } = calculada;
        composicao = resto;
        const temSelecao = Object.keys(aulas_por_disciplina).length > 0;
        // Antes da migration a coluna não existe: só grava quando há o que gravar
        if (temSelecao || cursos.some((c) => c.temColunaSelecao)) selecao = { aulas_por_disciplina };
      }
      const campos = {
        titulo: dados.titulo,
        descricao: dados.cargo,
        informacoes_curso: dados.informacoes,
        ...(composicao || {}),
        ...selecao,
      };

      if (curso) {
        const { error } = await supabase.from("cursos").update(campos).eq("id", curso.id);
        if (error) throw error;
        toast.success(
          composicao
            ? `Curso atualizado: ${composicao.aulas_ids.length} aulas, ${composicao.topicos_ids.length} tópicos e ${composicao.questoes_ids.length} questões.`
            : "Curso atualizado"
        );
      } else {
        const { error } = await supabase.from("cursos").insert([campos]);
        if (error) throw error;
        toast.success(
          composicao && composicao.disciplinas_ids.length
            ? `Curso criado com ${composicao.disciplinas_ids.length} disciplinas, ${composicao.aulas_ids.length} aulas e ${composicao.questoes_ids.length} questões.`
            : "Curso criado. Adicione disciplinas quando quiser."
        );
      }
      carregar();
      return true;
    } catch (error) {
      console.error("Erro ao salvar curso:", error);
      toast.error("Erro ao salvar o curso");
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
        descricao="Cursos reúnem disciplinas. Em cada disciplina você escolhe quais aulas entram no curso; tópicos e questões vêm junto."
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
        aulas={aulas}
        carregandoDisciplinas={loading}
        onFechar={() => setDialogo(null)}
        onSalvar={salvar}
      />

      <ConfirmarAcao
        aberto={!!excluindo}
        onFechar={() => setExcluindo(null)}
        titulo={`Excluir o curso "${excluindo?.titulo || ""}"?`}
        descricao="Essa ação não pode ser desfeita. As disciplinas, aulas, tópicos e questões continuam cadastrados."
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
