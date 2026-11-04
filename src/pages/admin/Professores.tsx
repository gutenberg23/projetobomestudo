import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Copy, Edit, Facebook, FileText, Globe, GraduationCap, Instagram, Layers, Plus, Star, StickyNote, Trash2, Twitter, Youtube } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AbasContagem,
  CampoBusca,
  CartoesResumo,
  Contador,
  Etiqueta,
  EstadoVazio,
  FiltrosBarra,
  ListaEsqueleto,
  MenuAcoes,
  PainelListagem,
  RodapePaginacao,
  botaoPrimario,
  copiarTexto,
  normalizar,
  selectClasse,
} from "@/components/admin/ui/listagem";
import { ConfirmarAcao } from "@/components/admin/ui/dialogos";
import ProfessorDialog from "@/components/admin/teachers/ProfessorDialog";
import NotasProfessorDialog from "@/components/admin/teachers/NotasProfessorDialog";
import { FormProfessor, Professor, urlRede } from "@/components/admin/teachers/types";

type Aba = "todos" | "com-conteudo" | "sem-conteudo";
type Ordem = "recentes" | "nome" | "conteudo" | "avaliacao";
const POR_PAGINA = 20;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const paraProfessor = (p: any): Professor => ({
  id: p.id,
  nome: p.nome_completo || "",
  email: p.email || "",
  disciplina: p.disciplina || "",
  youtube: p.link_youtube || "",
  instagram: p.instagram || "",
  twitter: p.twitter || "",
  facebook: p.facebook || "",
  website: p.website || "",
  foto: p.foto_perfil || "",
  rating: p.rating || 0,
  criadoEm: p.data_cadastro || "",
});

const paraLinha = (f: FormProfessor) => ({
  nome_completo: f.nome.trim(),
  email: f.email.trim(),
  disciplina: f.disciplina.trim(),
  link_youtube: f.youtube.trim() || null,
  instagram: f.instagram.trim() || null,
  twitter: f.twitter.trim() || null,
  facebook: f.facebook.trim() || null,
  website: f.website.trim() || null,
  foto_perfil: f.foto || null,
  rating: f.rating || 0,
});

/** Conta quantas linhas de uma tabela apontam para cada professor. */
const contarPorProfessor = async (tabela: "topicos" | "teorias") => {
  const mapa: Record<string, number> = {};
  for (let de = 0; ; de += 1000) {
    const { data, error } = await supabase.from(tabela).select("professor_id").not("professor_id", "is", null).range(de, de + 999);
    if (error) {
      console.error(`Erro ao contar ${tabela}:`, error);
      break;
    }
    for (const r of (data || []) as { professor_id: string | null }[]) if (r.professor_id) mapa[r.professor_id] = (mapa[r.professor_id] || 0) + 1;
    if (!data || data.length < 1000) break;
  }
  return mapa;
};

const iniciais = (nome: string) => {
  const p = nome.trim().split(/\s+/);
  return ((p[0]?.[0] || "?") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
};

const Professores = () => {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [topicos, setTopicos] = useState<Record<string, number>>({});
  const [teorias, setTeorias] = useState<Record<string, number>>({});
  const [carregando, setCarregando] = useState(true);

  const [aba, setAba] = useState<Aba>("todos");
  const [disciplina, setDisciplina] = useState("");
  const [ordem, setOrdem] = useState<Ordem>("nome");
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);

  const [form, setForm] = useState<{ aberto: boolean; professor: Professor | null }>({ aberto: false, professor: null });
  const [notas, setNotas] = useState<Professor | null>(null);
  const [excluindo, setExcluindo] = useState<Professor | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [{ data, error }, tp, te] = await Promise.all([
        supabase.from("professores").select("*").order("data_cadastro", { ascending: false }),
        contarPorProfessor("topicos"),
        contarPorProfessor("teorias"),
      ]);
      if (error) throw error;
      setProfessores((data || []).map(paraProfessor));
      setTopicos(tp);
      setTeorias(te);
    } catch (error) {
      console.error("Erro ao buscar professores:", error);
      toast.error("Não foi possível carregar os professores");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => setPagina(1), [aba, disciplina, busca, ordem]);

  const conteudo = useCallback((p: Professor) => (topicos[p.id] || 0) + (teorias[p.id] || 0), [topicos, teorias]);

  const disciplinas = useMemo(
    () => Array.from(new Set(professores.map((p) => p.disciplina.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [professores]
  );

  const base = useMemo(() => {
    const t = normalizar(busca.trim());
    return professores.filter(
      (p) => (!disciplina || p.disciplina.trim() === disciplina) && (!t || normalizar(`${p.nome} ${p.email} ${p.disciplina}`).includes(t))
    );
  }, [professores, disciplina, busca]);

  const filtrados = useMemo(() => {
    const l = base.filter((p) => aba === "todos" || (aba === "com-conteudo" ? conteudo(p) > 0 : conteudo(p) === 0));
    if (ordem === "nome") l.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    else if (ordem === "conteudo") l.sort((a, b) => conteudo(b) - conteudo(a));
    else if (ordem === "avaliacao") l.sort((a, b) => b.rating - a.rating);
    else l.sort((a, b) => (b.criadoEm || "").localeCompare(a.criadoEm || ""));
    return l;
  }, [base, aba, ordem, conteudo]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);
  const filtroAtivo = !!busca || !!disciplina || aba !== "todos";

  const resumo = useMemo(
    () => ({
      total: professores.length,
      disciplinas: disciplinas.length,
      topicos: Object.values(topicos).reduce((a, b) => a + b, 0),
      teorias: Object.values(teorias).reduce((a, b) => a + b, 0),
      semConteudo: professores.filter((p) => conteudo(p) === 0).length,
    }),
    [professores, disciplinas, topicos, teorias, conteudo]
  );

  const salvar = async (f: FormProfessor, id?: string) => {
    const linha = paraLinha(f);
    if (id) {
      const { error } = await supabase.from("professores").update(linha).eq("id", id);
      if (error) {
        console.error("Erro ao atualizar professor:", error);
        toast.error("Não foi possível salvar. " + error.message);
        return false;
      }
      setProfessores((l) => l.map((p) => (p.id === id ? { ...p, ...f, nome: linha.nome_completo, email: linha.email, disciplina: linha.disciplina } : p)));
      toast.success("Professor atualizado");
      return true;
    }
    const { data, error } = await supabase.from("professores").insert(linha).select().single();
    if (error) {
      console.error("Erro ao adicionar professor:", error);
      toast.error("Não foi possível adicionar. " + error.message);
      return false;
    }
    setProfessores((l) => [paraProfessor(data), ...l]);
    toast.success("Professor adicionado");
    return true;
  };

  const excluir = async () => {
    if (!excluindo) return;
    const { error } = await supabase.from("professores").delete().eq("id", excluindo.id);
    if (error) {
      console.error("Erro ao excluir professor:", error);
      toast.error("Não foi possível excluir. " + error.message);
      return;
    }
    setProfessores((l) => l.filter((p) => p.id !== excluindo.id));
    toast.success("Professor excluído");
  };

  const redes = (p: Professor) =>
    [
      { url: urlRede(p.youtube), icone: Youtube, nome: "YouTube" },
      { url: urlRede(p.instagram, "https://instagram.com/"), icone: Instagram, nome: "Instagram" },
      { url: urlRede(p.twitter, "https://x.com/"), icone: Twitter, nome: "X / Twitter" },
      { url: urlRede(p.facebook), icone: Facebook, nome: "Facebook" },
      { url: urlRede(p.website), icone: Globe, nome: "Site" },
    ].filter((r) => r.url);

  const usoExcluindo = excluindo ? { tp: topicos[excluindo.id] || 0, te: teorias[excluindo.id] || 0 } : { tp: 0, te: 0 };

  return (
    <div className="space-y-4">
      <AdminPageHeader
        titulo="Professores"
        descricao="Quem assina os tópicos e as teorias. A foto e as redes aparecem para os alunos."
        acoes={
          <Button onClick={() => setForm({ aberto: true, professor: null })} className={botaoPrimario}>
            <Plus className="mr-1.5 h-4 w-4" />
            Novo professor
          </Button>
        }
      />

      <CartoesResumo
        carregando={carregando}
        itens={[
          { rotulo: "Professores", valor: resumo.total, icone: GraduationCap, detalhe: `${resumo.disciplinas} disciplinas` },
          { rotulo: "Tópicos com professor", valor: resumo.topicos.toLocaleString("pt-BR"), icone: Layers, tom: "rosa" },
          { rotulo: "Teorias com professor", valor: resumo.teorias.toLocaleString("pt-BR"), icone: FileText, tom: "verde" },
          { rotulo: "Sem conteúdo", valor: resumo.semConteudo, icone: BookOpen, tom: resumo.semConteudo ? "ambar" : "cinza", detalhe: "nenhum tópico ou teoria" },
        ]}
      />

      <PainelListagem
        barra={
          <>
            <AbasContagem<Aba>
              abas={[
                { id: "todos", label: "Todos", n: base.length },
                { id: "com-conteudo", label: "Com conteúdo", n: base.filter((p) => conteudo(p) > 0).length },
                { id: "sem-conteudo", label: "Sem conteúdo", n: base.filter((p) => conteudo(p) === 0).length },
              ]}
              ativa={aba}
              onChange={setAba}
            />
            <FiltrosBarra>
              <select value={disciplina} onChange={(e) => setDisciplina(e.target.value)} className={selectClasse} aria-label="Disciplina">
                <option value="">Todas as disciplinas</option>
                {disciplinas.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)} className={selectClasse} aria-label="Ordenar">
                <option value="nome">Nome (A–Z)</option>
                <option value="conteudo">Mais conteúdo</option>
                <option value="avaliacao">Melhor avaliação</option>
                <option value="recentes">Mais recentes</option>
              </select>
              <CampoBusca valor={busca} onChange={setBusca} placeholder="Buscar professor" rotulo="Buscar professores" />
            </FiltrosBarra>
          </>
        }
        rodape={
          !carregando && (
            <RodapePaginacao pagina={paginaAtual} porPagina={POR_PAGINA} total={filtrados.length} onPagina={setPagina} singular="professor" plural="professores" />
          )
        }
      >
        {carregando ? (
          <ListaEsqueleto redondo />
        ) : visiveis.length === 0 ? (
          <EstadoVazio
            icone={GraduationCap}
            titulo={filtroAtivo ? "Nenhum professor encontrado" : "Nenhum professor ainda"}
            texto={filtroAtivo ? "Tente outra busca, disciplina ou aba." : "Cadastre um professor para escolher nos tópicos e teorias."}
            acao={
              filtroAtivo ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBusca("");
                    setDisciplina("");
                    setAba("todos");
                  }}
                >
                  Limpar filtros
                </Button>
              ) : (
                <Button size="sm" onClick={() => setForm({ aberto: true, professor: null })} className={botaoPrimario}>
                  Novo professor
                </Button>
              )
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {visiveis.map((p) => {
              const links = redes(p);
              return (
                <li key={p.id} className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-[#faf8ff] sm:gap-4 sm:px-4">
                  <Avatar className="h-10 w-10 shrink-0">
                    {p.foto && <AvatarImage src={p.foto} alt="" className="object-cover" />}
                    <AvatarFallback className="bg-[#5f2ebe]/10 text-xs font-semibold text-[#5f2ebe]">{iniciais(p.nome)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <button
                        type="button"
                        onClick={() => setForm({ aberto: true, professor: p })}
                        className="truncate text-left text-sm font-semibold text-slate-900 hover:text-[#5f2ebe]"
                      >
                        {p.nome}
                      </button>
                      {p.disciplina && <Etiqueta tom="roxo">{p.disciplina}</Etiqueta>}
                    </div>
                    <div className="mt-0.5 flex min-w-0 items-center gap-2 text-xs text-slate-500">
                      <span className="truncate">{p.email}</span>
                      {links.length > 0 && (
                        <span className="hidden shrink-0 items-center gap-1 sm:flex">
                          {links.map((r) => (
                            <a
                              key={r.nome}
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={r.nome}
                              aria-label={`${r.nome} de ${p.nome}`}
                              className="rounded p-0.5 text-slate-400 hover:bg-[#5f2ebe]/10 hover:text-[#5f2ebe]"
                            >
                              <r.icone className="h-3.5 w-3.5" />
                            </a>
                          ))}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="hidden shrink-0 items-center gap-3 md:flex">
                    <Contador icone={Layers} n={topicos[p.id] || 0} titulo="tópicos" />
                    <Contador icone={FileText} n={teorias[p.id] || 0} titulo="teorias" />
                  </div>
                  <div className="hidden w-[84px] shrink-0 items-center gap-0.5 lg:flex" title={p.rating ? `${p.rating.toLocaleString("pt-BR")} de 5` : "Sem avaliação"}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={n <= Math.round(p.rating) ? "h-3.5 w-3.5 fill-amber-400 text-amber-400" : "h-3.5 w-3.5 text-slate-200"} />
                    ))}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setForm({ aberto: true, professor: p })} className="hidden text-slate-600 sm:inline-flex">
                      <Edit className="mr-1.5 h-4 w-4" />
                      Editar
                    </Button>
                    <MenuAcoes
                      acoes={[
                        { label: "Editar", icone: Edit, onClick: () => setForm({ aberto: true, professor: p }), soCelular: true },
                        { label: "Notas da equipe", icone: StickyNote, onClick: () => setNotas(p) },
                        {
                          label: "Copiar e-mail",
                          icone: Copy,
                          onClick: async () => {
                            if (await copiarTexto(p.email)) toast.success("E-mail copiado");
                          },
                          oculto: !p.email,
                        },
                        { label: "Excluir", icone: Trash2, onClick: () => setExcluindo(p), perigo: true, separadorAntes: true },
                      ]}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </PainelListagem>

      <ProfessorDialog
        aberto={form.aberto}
        professor={form.professor}
        disciplinas={disciplinas}
        onFechar={() => setForm({ aberto: false, professor: null })}
        onSalvar={salvar}
      />

      <NotasProfessorDialog professor={notas} onFechar={() => setNotas(null)} />

      <ConfirmarAcao
        aberto={!!excluindo}
        onFechar={() => setExcluindo(null)}
        titulo={`Excluir ${excluindo?.nome || "o professor"}?`}
        descricao={
          usoExcluindo.tp + usoExcluindo.te > 0
            ? `Ele aparece em ${usoExcluindo.tp} tópico(s) e ${usoExcluindo.te} teoria(s). Troque o professor desses itens antes de excluir.`
            : "Ele não aparece em nenhum tópico ou teoria. Essa ação não pode ser desfeita."
        }
        textoConfirmar="Excluir professor"
        perigo
        onConfirmar={excluir}
      />
    </div>
  );
};

export default Professores;
