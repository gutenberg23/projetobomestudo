import { useEffect, useMemo, useState } from "react";
import { Combine, Layers, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader, FluxoConteudo } from "@/components/admin/AdminPageHeader";
import {
  AbasContagem,
  CampoBusca,
  EstadoVazio,
  FiltrosBarra,
  ListaEsqueleto,
  PainelListagem,
  RodapePaginacao,
  normalizar,
  selectClasse,
} from "@/components/admin/ui/listagem";
import { ConfirmarAcao } from "@/components/admin/ui/dialogos";
import { cn } from "@/lib/utils";
import { DisciplinasTable, AdicionarDisciplina, EditDisciplinaModal, Disciplina } from "./components/disciplinas";
import { useDisciplinas } from "./components/disciplinas/useDisciplinas";
import { UnificarDisciplinasDialog } from "./components/disciplinas/UnificarDisciplinasDialog";

type Aba = "todas" | "repetidas" | "sem-curso" | "sem-teorias";
const POR_PAGINA = 15;
/** Formulário vazio para criar uma disciplina */
const NOVA: Disciplina = { id: "", titulo: "", descricao: "", banca: "", disciplinaQuestoes: "", teoriasIds: [] };

const Disciplinas = () => {
  const { disciplinas, teorias, cursosDaDisciplina, loading, recarregar, salvar, reordenarTeorias, excluir, criarCurso, unificar } =
    useDisciplinas();
  const [unificando, setUnificando] = useState<Disciplina[] | null>(null);

  // Quantas disciplinas têm cada nome (ignorando acentos e maiúsculas)
  const nomeChave = (t: string) => normalizar(t).replace(/\s+/g, " ").trim();
  const porNome = useMemo(() => {
    const m = new Map<string, number>();
    disciplinas.forEach((d) => m.set(nomeChave(d.titulo), (m.get(nomeChave(d.titulo)) || 0) + 1));
    return m;
  }, [disciplinas]);

  const [busca, setBusca] = useState("");
  const [banca, setBanca] = useState("");
  const [aba, setAba] = useState<Aba>("todas");
  const [pagina, setPagina] = useState(1);
  const [selecao, setSelecao] = useState<string[]>([]);
  const [editando, setEditando] = useState<Disciplina | null>(null);
  const [excluindo, setExcluindo] = useState<Disciplina | null>(null);

  const bancas = useMemo(
    () => Array.from(new Set(disciplinas.map((d) => (d.banca || "").trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [disciplinas]
  );

  const base = useMemo(() => {
    const termo = normalizar(busca.trim());
    return disciplinas.filter((d) => {
      if (banca && (d.banca || "").trim() !== banca) return false;
      if (!termo) return true;
      const nomesTeorias = d.teoriasIds.map((id) => teorias.get(id)?.titulo || "").join(" ");
      return normalizar(`${d.titulo} ${d.banca} ${nomesTeorias} ${d.id}`).includes(termo);
    });
  }, [disciplinas, busca, banca, teorias]);

  const passa = (d: Disciplina, x: Aba) =>
    x === "sem-curso"
      ? !(cursosDaDisciplina.get(d.id) || []).length
      : x === "sem-teorias"
        ? d.teoriasIds.length === 0
        : x === "repetidas"
          ? (porNome.get(nomeChave(d.titulo)) || 0) > 1
          : true;

  const contagens = useMemo(
    () => ({
      todas: base.length,
      repetidas: base.filter((d) => passa(d, "repetidas")).length,
      "sem-curso": base.filter((d) => passa(d, "sem-curso")).length,
      "sem-teorias": base.filter((d) => passa(d, "sem-teorias")).length,
    }),
    [base, cursosDaDisciplina, porNome] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const filtradas = useMemo(() => {
    const lista = base.filter((d) => passa(d, aba));
    // Na aba de repetidas, as de mesmo nome ficam juntas
    return aba === "repetidas" ? [...lista].sort((a, b) => nomeChave(a.titulo).localeCompare(nomeChave(b.titulo), "pt-BR")) : lista;
  }, [base, aba, cursosDaDisciplina, porNome]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setPagina(1), [busca, banca, aba]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtradas.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);

  const alternar = (id: string) => setSelecao((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const alternarPagina = () => {
    const ids = visiveis.map((d) => d.id);
    const todas = ids.every((id) => selecao.includes(id));
    setSelecao((s) => (todas ? s.filter((id) => !ids.includes(id)) : [...s, ...ids.filter((id) => !s.includes(id))]));
  };
  const porId = useMemo(() => new Map(disciplinas.map((d) => [d.id, d])), [disciplinas]);
  const selecionadas = selecao.filter((id) => porId.has(id)).map((id) => ({ id, titulo: porId.get(id)!.titulo }));

  const filtroAtivo = !!busca || !!banca || aba !== "todas";
  const cursosExcluindo = excluindo ? cursosDaDisciplina.get(excluindo.id) || [] : [];

  return (
    <div className="space-y-4">
      <AdminPageHeader
        titulo="Disciplinas"
        descricao="Disciplinas são listas de teorias em sequência. Uma disciplina serve para vários cursos: no curso você escolhe quais teorias entram. Marque disciplinas repetidas para unificá-las."
        acoes={
          <>
            <Button variant="outline" onClick={recarregar} disabled={loading}>
              <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
              Atualizar
            </Button>
            <Button onClick={() => setEditando(NOVA)} className="bg-[#5f2ebe] text-white hover:bg-[#4f25a0]">
              <Plus className="mr-2 h-4 w-4" />
              Nova disciplina
            </Button>
          </>
        }
      >
        <FluxoConteudo atual="disciplinas" />
      </AdminPageHeader>

      <PainelListagem
        barra={
          <>
            <AbasContagem<Aba>
              abas={[
                { id: "todas", label: "Todas", n: contagens.todas },
                { id: "repetidas", label: "Repetidas", n: contagens.repetidas },
                { id: "sem-curso", label: "Fora de cursos", n: contagens["sem-curso"] },
                { id: "sem-teorias", label: "Sem teorias", n: contagens["sem-teorias"] },
              ]}
              ativa={aba}
              onChange={setAba}
            />
            <FiltrosBarra>
              {bancas.length > 0 && (
                <select value={banca} onChange={(e) => setBanca(e.target.value)} className={selectClasse} aria-label="Filtrar por banca">
                  <option value="">Todas as bancas</option>
                  {bancas.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              )}
              <CampoBusca valor={busca} onChange={setBusca} placeholder="Buscar por título, banca ou teoria" rotulo="Buscar disciplinas" />
            </FiltrosBarra>
          </>
        }
        rodape={
          !loading && (
            <RodapePaginacao pagina={paginaAtual} porPagina={POR_PAGINA} total={filtradas.length} onPagina={setPagina} singular="disciplina" plural="disciplinas" />
          )
        }
      >
        {loading ? (
          <ListaEsqueleto icone={false} />
        ) : (
          <DisciplinasTable
            disciplinas={visiveis}
            selecao={selecao}
            teorias={teorias}
            cursosDaDisciplina={cursosDaDisciplina}
            onAlternar={alternar}
            onAlternarPagina={alternarPagina}
            onEditar={setEditando}
            onExcluir={setExcluindo}
            onReordenar={reordenarTeorias}
            vazio={
              <EstadoVazio
                icone={Layers}
                titulo={filtroAtivo ? "Nenhuma disciplina encontrada" : "Nenhuma disciplina cadastrada"}
                texto={filtroAtivo ? "Tente outra busca, outra banca ou outra aba." : "Clique em Nova disciplina e escolha as teorias que fazem parte dela."}
                acao={
                  filtroAtivo ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBusca("");
                        setBanca("");
                        setAba("todas");
                      }}
                    >
                      Limpar filtros
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setEditando(NOVA)}>
                      Nova disciplina
                    </Button>
                  )
                }
              />
            }
          />
        )}
      </PainelListagem>

      {selecionadas.length >= 2 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
          <p className="text-slate-600">
            São a mesma disciplina com recortes diferentes? Junte numa só e escolha as teorias em cada curso.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUnificando(selecao.map((id) => porId.get(id)).filter((d): d is Disciplina => !!d))}
            className="border-[#5f2ebe]/30 text-[#5f2ebe]"
          >
            <Combine className="mr-1.5 h-4 w-4" />
            Unificar {selecionadas.length} disciplinas
          </Button>
        </div>
      )}

      <AdicionarDisciplina
        selecionadas={selecionadas}
        onRemover={alternar}
        onLimpar={() => setSelecao([])}
        onCriar={async (titulo, cargo, info) => {
          const ok = await criarCurso(titulo, cargo, info, selecionadas.map((s) => s.id));
          if (ok) setSelecao([]);
          return ok;
        }}
      />

      <UnificarDisciplinasDialog
        disciplinas={unificando}
        cursosDaDisciplina={cursosDaDisciplina}
        onFechar={() => setUnificando(null)}
        onUnificar={async (principal, repetidas) => {
          const ok = await unificar(principal, repetidas);
          if (ok) setSelecao([]);
          return ok;
        }}
      />

      <EditDisciplinaModal disciplina={editando} teorias={teorias} onClose={() => setEditando(null)} onSave={salvar} />

      <ConfirmarAcao
        aberto={!!excluindo}
        onFechar={() => setExcluindo(null)}
        titulo={`Excluir a disciplina "${excluindo?.titulo || ""}"?`}
        descricao="Essa ação não pode ser desfeita. As teorias continuam cadastradas."
        detalhes={
          cursosExcluindo.length
            ? [`Ela está em ${cursosExcluindo.length === 1 ? "um curso" : `${cursosExcluindo.length} cursos`}: ${cursosExcluindo.map((c) => c.titulo).join(", ")}. O progresso dos alunos e o edital desses cursos podem ser afetados.`]
            : undefined
        }
        textoConfirmar="Excluir disciplina"
        onConfirmar={async () => {
          if (!excluindo) return;
          await excluir(excluindo.id);
          setSelecao((s) => s.filter((id) => id !== excluindo.id));
        }}
      />
    </div>
  );
};

export default Disciplinas;
