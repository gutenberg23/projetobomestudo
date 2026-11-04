import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, RefreshCw } from "lucide-react";
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
} from "@/components/admin/ui/listagem";
import { ConfirmarAcao } from "@/components/admin/ui/dialogos";
import { cn } from "@/lib/utils";
import { AulasTable, AdicionarDisciplina, EditAulaModal, Aula } from "./components/aulas";
import { useAulasActions } from "./components/aulas/hooks/useAulasActions";

type Aba = "todas" | "sem-disciplina" | "sem-topicos";
const POR_PAGINA = 15;

const Aulas = () => {
  const {
    aulas,
    topicos,
    disciplinasDaAula,
    loading,
    recarregar,
    salvarAula,
    reordenarTopicos,
    excluirAula,
    duplicarAula,
    criarDisciplina,
  } = useAulasActions();

  const [busca, setBusca] = useState("");
  const [aba, setAba] = useState<Aba>("todas");
  const [pagina, setPagina] = useState(1);
  /** Aulas marcadas, na ordem em que foram marcadas */
  const [selecao, setSelecao] = useState<string[]>([]);
  const [editando, setEditando] = useState<Aula | null>(null);
  const [excluindo, setExcluindo] = useState<Aula | null>(null);

  const base = useMemo(() => {
    const termo = normalizar(busca.trim());
    if (!termo) return aulas;
    return aulas.filter((a) => {
      const nomesTopicos = a.topicosIds.map((id) => topicos.get(id)?.nome || "").join(" ");
      return normalizar(`${a.titulo} ${a.descricao} ${nomesTopicos} ${a.id}`).includes(termo);
    });
  }, [aulas, busca, topicos]);

  const passa = (a: Aula, x: Aba) =>
    x === "sem-disciplina" ? !(disciplinasDaAula.get(a.id) || []).length : x === "sem-topicos" ? a.topicosIds.length === 0 : true;

  const contagens = useMemo(
    () => ({
      todas: base.length,
      "sem-disciplina": base.filter((a) => passa(a, "sem-disciplina")).length,
      "sem-topicos": base.filter((a) => passa(a, "sem-topicos")).length,
    }),
    [base, disciplinasDaAula] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const filtradas = useMemo(() => base.filter((a) => passa(a, aba)), [base, aba, disciplinasDaAula]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setPagina(1), [busca, aba]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtradas.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);

  const alternar = (id: string) => setSelecao((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const alternarPagina = () => {
    const ids = visiveis.map((a) => a.id);
    const todas = ids.every((id) => selecao.includes(id));
    setSelecao((s) => (todas ? s.filter((id) => !ids.includes(id)) : [...s, ...ids.filter((id) => !s.includes(id))]));
  };

  const porId = useMemo(() => new Map(aulas.map((a) => [a.id, a])), [aulas]);
  const selecionadas = selecao.filter((id) => porId.has(id)).map((id) => ({ id, titulo: porId.get(id)!.titulo }));

  const filtroAtivo = !!busca || aba !== "todas";

  return (
    <div className="space-y-4">
      <AdminPageHeader
        titulo="Aulas"
        descricao="Aulas agrupam tópicos em sequência. Marque várias para montar uma disciplina. Para criar uma aula, marque tópicos em Tópicos."
        acoes={
          <Button variant="outline" onClick={recarregar} disabled={loading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Atualizar
          </Button>
        }
      >
        <FluxoConteudo atual="aulas" />
      </AdminPageHeader>

      <PainelListagem
        barra={
          <>
            <AbasContagem<Aba>
              abas={[
                { id: "todas" as const, label: "Todas", n: contagens.todas },
                { id: "sem-disciplina" as const, label: "Fora de disciplinas", n: contagens["sem-disciplina"] },
                { id: "sem-topicos" as const, label: "Sem tópicos", n: contagens["sem-topicos"] },
              ]}
              ativa={aba}
              onChange={setAba}
            />
            <FiltrosBarra>
              <CampoBusca valor={busca} onChange={setBusca} placeholder="Buscar por título, edital ou tópico" rotulo="Buscar aulas" className="sm:w-80" />
            </FiltrosBarra>
          </>
        }
        rodape={
          !loading && (
            <RodapePaginacao pagina={paginaAtual} porPagina={POR_PAGINA} total={filtradas.length} onPagina={setPagina} singular="aula" plural="aulas" />
          )
        }
      >
        {loading ? (
          <ListaEsqueleto icone={false} />
        ) : (
          <AulasTable
            aulas={visiveis}
            selecao={selecao}
            topicos={topicos}
            disciplinasDaAula={disciplinasDaAula}
            onAlternar={alternar}
            onAlternarPagina={alternarPagina}
            onEditar={setEditando}
            onExcluir={setExcluindo}
            onDuplicar={duplicarAula}
            onReordenar={reordenarTopicos}
            vazio={
              <EstadoVazio
                icone={BookOpen}
                titulo={filtroAtivo ? "Nenhuma aula encontrada" : "Nenhuma aula cadastrada"}
                texto={filtroAtivo ? "Tente outra busca ou outra aba." : "Vá em Tópicos, marque os tópicos e crie a aula pela barra no fim da página."}
                acao={
                  filtroAtivo ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBusca("");
                        setAba("todas");
                      }}
                    >
                      Limpar filtros
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/admin/topicos">Ir para Tópicos</Link>
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
        onCriar={async (titulo, rating, banca) => {
          const ok = await criarDisciplina(titulo, rating, banca, selecionadas.map((s) => s.id));
          if (ok) setSelecao([]);
          return ok;
        }}
      />

      <EditAulaModal isOpen={!!editando} onClose={() => setEditando(null)} aula={editando} topicos={topicos} onSave={salvarAula} />

      <ConfirmarAcao
        aberto={!!excluindo}
        onFechar={() => setExcluindo(null)}
        titulo={`Excluir a aula "${excluindo?.titulo || ""}"?`}
        descricao="Essa ação não pode ser desfeita. Os tópicos e as questões continuam cadastrados."
        detalhes={
          excluindo && (disciplinasDaAula.get(excluindo.id) || []).length
            ? [`Ela está em: ${(disciplinasDaAula.get(excluindo.id) || []).map((d) => d.titulo).join(", ")}. Revise essas disciplinas depois.`]
            : undefined
        }
        textoConfirmar="Excluir aula"
        onConfirmar={async () => {
          if (!excluindo) return;
          await excluirAula(excluindo.id);
          setSelecao((s) => s.filter((id) => id !== excluindo.id));
        }}
      />
    </div>
  );
};

export default Aulas;
