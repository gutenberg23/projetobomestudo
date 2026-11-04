import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layers, RefreshCw } from "lucide-react";
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

type Aba = "todas" | "sem-curso" | "sem-aulas";
const POR_PAGINA = 15;

const Disciplinas = () => {
  const { disciplinas, aulas, cursosDaDisciplina, loading, recarregar, salvar, reordenarAulas, excluir, criarCurso } =
    useDisciplinas();

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
      const nomesAulas = d.aulasIds.map((id) => aulas.get(id)?.titulo || "").join(" ");
      return normalizar(`${d.titulo} ${d.banca} ${nomesAulas} ${d.id}`).includes(termo);
    });
  }, [disciplinas, busca, banca, aulas]);

  const passa = (d: Disciplina, x: Aba) =>
    x === "sem-curso" ? !(cursosDaDisciplina.get(d.id) || []).length : x === "sem-aulas" ? d.aulasIds.length === 0 : true;

  const contagens = useMemo(
    () => ({
      todas: base.length,
      "sem-curso": base.filter((d) => passa(d, "sem-curso")).length,
      "sem-aulas": base.filter((d) => passa(d, "sem-aulas")).length,
    }),
    [base, cursosDaDisciplina] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const filtradas = useMemo(() => base.filter((d) => passa(d, aba)), [base, aba, cursosDaDisciplina]); // eslint-disable-line react-hooks/exhaustive-deps
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
        descricao="Disciplinas agrupam aulas em sequência. Marque várias para montar um curso. Para criar uma disciplina, marque aulas em Aulas."
        acoes={
          <Button variant="outline" onClick={recarregar} disabled={loading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Atualizar
          </Button>
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
                { id: "sem-curso", label: "Fora de cursos", n: contagens["sem-curso"] },
                { id: "sem-aulas", label: "Sem aulas", n: contagens["sem-aulas"] },
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
              <CampoBusca valor={busca} onChange={setBusca} placeholder="Buscar por título, banca ou aula" rotulo="Buscar disciplinas" />
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
            aulas={aulas}
            cursosDaDisciplina={cursosDaDisciplina}
            onAlternar={alternar}
            onAlternarPagina={alternarPagina}
            onEditar={setEditando}
            onExcluir={setExcluindo}
            onReordenar={reordenarAulas}
            vazio={
              <EstadoVazio
                icone={Layers}
                titulo={filtroAtivo ? "Nenhuma disciplina encontrada" : "Nenhuma disciplina cadastrada"}
                texto={filtroAtivo ? "Tente outra busca, outra banca ou outra aba." : "Vá em Aulas, marque as aulas e crie a disciplina pela barra no fim da página."}
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
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/admin/aulas">Ir para Aulas</Link>
                    </Button>
                  )
                }
              />
            }
          />
        )}
      </PainelListagem>

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

      <EditDisciplinaModal disciplina={editando} aulas={aulas} onClose={() => setEditando(null)} onSave={salvar} />

      <ConfirmarAcao
        aberto={!!excluindo}
        onFechar={() => setExcluindo(null)}
        titulo={`Excluir a disciplina "${excluindo?.titulo || ""}"?`}
        descricao="Essa ação não pode ser desfeita. As aulas, os tópicos e as questões continuam cadastrados."
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
