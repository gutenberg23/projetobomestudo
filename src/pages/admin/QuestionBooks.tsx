import { useCallback, useEffect, useMemo, useState } from "react";
import { BookMarked, CopyPlus, Edit, ExternalLink, Globe, Lock, NotebookPen, Target, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AbasContagem,
  CampoBusca,
  CartoesResumo,
  Etiqueta,
  EstadoVazio,
  FiltrosBarra,
  ListaEsqueleto,
  MenuAcoes,
  PainelListagem,
  RodapePaginacao,
  normalizar,
  selectClasse,
} from "@/components/admin/ui/listagem";
import { ConfirmarAcao } from "@/components/admin/ui/dialogos";
import { cn } from "@/lib/utils";

export interface QuestionBook {
  id: string;
  nome: string;
  created_at: string;
  user_id: string;
  is_public: boolean;
  total_questions: number;
  answered_questions: number;
  correct_answers: number;
  wrong_answers: number;
  user_email: string;
}

type Aba = "todos" | "publicos" | "privados";
type Ordem = "recentes" | "questoes" | "nome";
const POR_PAGINA = 20;

export const aproveitamento = (b: Pick<QuestionBook, "answered_questions" | "correct_answers">) =>
  b.answered_questions ? Math.round((b.correct_answers / b.answered_questions) * 100) : null;

const tomAproveitamento = (p: number | null) => (p === null ? "cinza" : p >= 70 ? "verde" : p >= 50 ? "ambar" : "vermelho");

/** Formulário de nome e visibilidade do caderno (usado no modal e na página de edição). */
export const FormCaderno: React.FC<{
  nome: string;
  publico: boolean;
  onNome: (v: string) => void;
  onPublico: (v: boolean) => void;
}> = ({ nome, publico, onNome, onPublico }) => (
  <div className="space-y-4">
    <div className="space-y-1.5">
      <Label htmlFor="caderno-nome">Nome do caderno</Label>
      <Input id="caderno-nome" value={nome} onChange={(e) => onNome(e.target.value)} />
    </div>
    <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-3">
      <div>
        <label htmlFor="caderno-publico" className="text-sm font-medium text-slate-800">
          Caderno público
        </label>
        <p className="text-xs text-slate-500">Outros alunos também podem ver este caderno.</p>
      </div>
      <Switch id="caderno-publico" checked={publico} onCheckedChange={onPublico} />
    </div>
  </div>
);

export default function AdminQuestionBooks() {
  const [books, setBooks] = useState<QuestionBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [aba, setAba] = useState<Aba>("todos");
  const [ordem, setOrdem] = useState<Ordem>("recentes");
  const [pagina, setPagina] = useState(1);
  const [editando, setEditando] = useState<QuestionBook | null>(null);
  const [nome, setNome] = useState("");
  const [publico, setPublico] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState<QuestionBook | null>(null);

  const fetchBooks = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("admin_list_cadernos");
      if (error) throw error;
      setBooks(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data || []).map((b: any) => ({
          id: b.id,
          nome: b.nome,
          created_at: b.created_at,
          user_id: b.user_id,
          is_public: b.is_public,
          total_questions: b.total_questions || 0,
          answered_questions: b.answered_questions || 0,
          correct_answers: b.correct_answers || 0,
          wrong_answers: b.wrong_answers || 0,
          user_email: b.user_email || "",
        }))
      );
    } catch (error) {
      console.error("Erro ao buscar cadernos:", error);
      toast.error("Erro ao carregar os cadernos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const base = useMemo(() => {
    const termo = normalizar(busca.trim());
    return books.filter((b) => !termo || normalizar(`${b.nome} ${b.user_email}`).includes(termo));
  }, [books, busca]);

  const filtrados = useMemo(() => {
    const lista = base.filter((b) => aba === "todos" || (aba === "publicos" ? b.is_public : !b.is_public));
    if (ordem === "questoes") return [...lista].sort((a, b) => b.total_questions - a.total_questions);
    if (ordem === "nome") return [...lista].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    return [...lista].sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  }, [base, aba, ordem]);

  useEffect(() => setPagina(1), [busca, aba, ordem]);
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);

  const resumo = useMemo(() => {
    const respondidas = books.reduce((s, b) => s + b.answered_questions, 0);
    const acertos = books.reduce((s, b) => s + b.correct_answers, 0);
    return {
      total: books.length,
      publicos: books.filter((b) => b.is_public).length,
      autores: new Set(books.map((b) => b.user_id)).size,
      questoes: books.reduce((s, b) => s + b.total_questions, 0),
      media: respondidas ? Math.round((acertos / respondidas) * 100) : null,
    };
  }, [books]);

  const abrirEdicao = (b: QuestionBook) => {
    setEditando(b);
    setNome(b.nome);
    setPublico(b.is_public);
  };

  const atualizar = async (b: QuestionBook, novoNome: string, novoPublico: boolean) => {
    const { error } = await supabase.rpc("admin_update_caderno", { p_caderno_id: b.id, p_nome: novoNome, p_is_public: novoPublico });
    if (error) throw error;
    setBooks((l) => l.map((x) => (x.id === b.id ? { ...x, nome: novoNome, is_public: novoPublico } : x)));
  };

  const salvarEdicao = async () => {
    if (!editando || !nome.trim()) return;
    setSalvando(true);
    try {
      await atualizar(editando, nome.trim(), publico);
      toast.success("Caderno atualizado");
      setEditando(null);
    } catch (error) {
      console.error("Erro ao atualizar caderno:", error);
      toast.error("Erro ao atualizar o caderno");
    } finally {
      setSalvando(false);
    }
  };

  const alternarPublico = async (b: QuestionBook) => {
    try {
      await atualizar(b, b.nome, !b.is_public);
      toast.success(b.is_public ? "Caderno agora é privado" : "Caderno agora é público");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível alterar a visibilidade");
    }
  };

  const duplicar = async (b: QuestionBook) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Usuário não autenticado");
      const { error } = await supabase.rpc("admin_duplicate_caderno", {
        p_caderno_id: b.id,
        p_novo_nome: `${b.nome} (cópia)`,
        p_novo_user_id: user.id,
        p_is_public: b.is_public,
      });
      if (error) throw error;
      await fetchBooks();
      toast.success("Caderno duplicado na sua conta");
    } catch (error) {
      console.error("Erro ao duplicar caderno:", error);
      toast.error("Erro ao duplicar o caderno");
    }
  };

  const excluir = async () => {
    if (!excluindo) return;
    const { error } = await supabase.rpc("admin_delete_caderno", { p_caderno_id: excluindo.id });
    if (error) {
      console.error("Erro ao excluir caderno:", error);
      toast.error("Erro ao excluir o caderno");
      return;
    }
    setBooks((l) => l.filter((x) => x.id !== excluindo.id));
    toast.success("Caderno excluído");
  };

  const filtroAtivo = !!busca || aba !== "todos";

  return (
    <div className="space-y-4">
      <AdminPageHeader titulo="Cadernos de questões" descricao="Cadernos que os alunos montaram. Você pode renomear, mudar a visibilidade, copiar para sua conta ou excluir." />

      <CartoesResumo
        carregando={loading}
        itens={[
          { rotulo: "Cadernos", valor: resumo.total.toLocaleString("pt-BR"), icone: NotebookPen, detalhe: `${resumo.publicos} públicos` },
          { rotulo: "Alunos com caderno", valor: resumo.autores.toLocaleString("pt-BR"), icone: Users, tom: "cinza" },
          { rotulo: "Questões nos cadernos", valor: resumo.questoes.toLocaleString("pt-BR"), icone: BookMarked, tom: "rosa" },
          {
            rotulo: "Aproveitamento médio",
            valor: resumo.media === null ? "—" : `${resumo.media}%`,
            icone: Target,
            tom: resumo.media === null ? "cinza" : resumo.media >= 70 ? "verde" : "ambar",
          },
        ]}
      />

      <PainelListagem
        barra={
          <>
            <AbasContagem<Aba>
              abas={[
                { id: "todos", label: "Todos", n: base.length },
                { id: "publicos", label: "Públicos", n: base.filter((b) => b.is_public).length },
                { id: "privados", label: "Privados", n: base.filter((b) => !b.is_public).length },
              ]}
              ativa={aba}
              onChange={setAba}
            />
            <FiltrosBarra>
              <select value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)} className={selectClasse} aria-label="Ordenar">
                <option value="recentes">Mais recentes</option>
                <option value="questoes">Mais questões</option>
                <option value="nome">Nome (A–Z)</option>
              </select>
              <CampoBusca valor={busca} onChange={setBusca} placeholder="Buscar por nome ou e-mail do aluno" rotulo="Buscar cadernos" />
            </FiltrosBarra>
          </>
        }
        rodape={
          !loading && <RodapePaginacao pagina={paginaAtual} porPagina={POR_PAGINA} total={filtrados.length} onPagina={setPagina} singular="caderno" plural="cadernos" />
        }
      >
        {loading ? (
          <ListaEsqueleto />
        ) : visiveis.length === 0 ? (
          <EstadoVazio
            icone={NotebookPen}
            titulo={filtroAtivo ? "Nenhum caderno encontrado" : "Nenhum caderno ainda"}
            texto={filtroAtivo ? "Tente outra busca ou outra aba." : "Os cadernos aparecem aqui quando os alunos criarem."}
            acao={
              filtroAtivo && (
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
              )
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {visiveis.map((b) => {
              const p = aproveitamento(b);
              const progresso = b.total_questions ? Math.min(100, Math.round((b.answered_questions / b.total_questions) * 100)) : 0;
              return (
                <li key={b.id} className="flex items-start gap-3 px-3 py-3.5 transition-colors hover:bg-[#faf8ff] sm:items-center sm:gap-4 sm:px-4">
                  <span
                    className={cn(
                      "hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:flex",
                      b.is_public ? "bg-[#5f2ebe]/10 text-[#5f2ebe]" : "bg-slate-100 text-slate-500"
                    )}
                    aria-hidden
                  >
                    <NotebookPen className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => abrirEdicao(b)}
                        className="text-left text-sm font-semibold leading-snug text-slate-900 hover:text-[#5f2ebe]"
                      >
                        {b.nome}
                      </button>
                      <Etiqueta tom={b.is_public ? "roxo" : "cinza"}>
                        {b.is_public ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                        {b.is_public ? "Público" : "Privado"}
                      </Etiqueta>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {b.user_email || <span className="italic">aluno não encontrado</span>}
                      {b.created_at && <> · criado em {new Date(b.created_at).toLocaleDateString("pt-BR")}</>}
                    </p>
                  </div>

                  <div className="hidden w-44 shrink-0 md:block" title={`${b.answered_questions} de ${b.total_questions} respondidas`}>
                    <div className="mb-1 flex justify-between text-[11px] tabular-nums text-slate-500">
                      <span>
                        {b.answered_questions}/{b.total_questions} respondidas
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-[#5f2ebe]" style={{ width: `${progresso}%` }} />
                    </div>
                  </div>

                  <div className="hidden w-[92px] shrink-0 text-right sm:block" title={`${b.correct_answers} acertos e ${b.wrong_answers} erros`}>
                    <Etiqueta tom={tomAproveitamento(p)} className="whitespace-nowrap tabular-nums">
                      {p === null ? "sem respostas" : `${p}% acertos`}
                    </Etiqueta>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => abrirEdicao(b)} className="hidden text-slate-600 sm:inline-flex">
                      <Edit className="mr-1.5 h-4 w-4" />
                      Editar
                    </Button>
                    <MenuAcoes
                      acoes={[
                        { label: "Editar", icone: Edit, onClick: () => abrirEdicao(b), soCelular: true },
                        { label: "Abrir no site", icone: ExternalLink, href: `/cadernos/${b.id}`, externo: true },
                        { label: b.is_public ? "Tornar privado" : "Tornar público", icone: b.is_public ? Lock : Globe, onClick: () => alternarPublico(b) },
                        { label: "Copiar para minha conta", icone: CopyPlus, onClick: () => duplicar(b) },
                        { label: "Excluir", icone: Trash2, onClick: () => setExcluindo(b), perigo: true, separadorAntes: true },
                      ]}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </PainelListagem>

      <Dialog open={!!editando} onOpenChange={(o) => !o && !salvando && setEditando(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar caderno</DialogTitle>
            <DialogDescription>{editando?.user_email ? `Caderno de ${editando.user_email}` : "Caderno de um aluno"}</DialogDescription>
          </DialogHeader>
          <FormCaderno nome={nome} publico={publico} onNome={setNome} onPublico={setPublico} />
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setEditando(null)} disabled={salvando}>
              Cancelar
            </Button>
            <Button onClick={salvarEdicao} disabled={salvando || !nome.trim()} className="bg-[#ea2be2] text-white hover:bg-[#d029d5]">
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmarAcao
        aberto={!!excluindo}
        onFechar={() => setExcluindo(null)}
        titulo={`Excluir o caderno "${excluindo?.nome || ""}"?`}
        descricao="O caderno é apagado da conta do aluno. Essa ação não pode ser desfeita."
        textoConfirmar="Excluir caderno"
        onConfirmar={excluir}
      />
    </div>
  );
}
