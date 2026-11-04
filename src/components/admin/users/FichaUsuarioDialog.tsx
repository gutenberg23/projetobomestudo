import React, { useCallback, useEffect, useState } from "react";
import { Activity, LogIn, StickyNote, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ListaEsqueleto } from "@/components/admin/ui/listagem";
import { cn } from "@/lib/utils";
import { UserData, UserNote, dataBR, rotuloTipo, tempoRelativo } from "./types";
import { AvatarUsuario } from "./AvatarUsuario";

export type AbaFicha = "notas" | "atividade";

interface Atividade {
  id: string;
  descricao: string;
  detalhe?: string;
  em: string;
  login?: boolean;
}

interface FichaUsuarioDialogProps {
  usuario: UserData | null;
  aba: AbaFicha;
  onAba: (a: AbaFicha) => void;
  onFechar: () => void;
}

const dataHora = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
};

/** Ficha do usuário: notas internas da equipe e histórico de atividade. */
const FichaUsuarioDialog: React.FC<FichaUsuarioDialogProps> = ({ usuario, aba, onAba, onFechar }) => {
  const { user } = useAuth();
  const [notas, setNotas] = useState<UserNote[]>([]);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [apagando, setApagando] = useState<string | null>(null);

  const carregarNotas = useCallback(async (id: string) => {
    const { data, error } = await supabase.from("notas_usuarios").select("*").eq("usuario_id", id).order("data_criacao", { ascending: false });
    if (error) {
      console.error("Erro ao carregar notas:", error);
      toast.error("Não foi possível carregar as notas");
      return;
    }
    setNotas((data || []) as UserNote[]);
  }, []);

  const carregarAtividade = useCallback(async (id: string) => {
    // Tabelas fora dos tipos gerados
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const [a, b] = await Promise.all([
      db.from("user_activity_logs").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(200),
      db.from("auth_logs").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(200),
    ]);
    if (a.error) console.error("Erro ao carregar atividade:", a.error);
    if (b.error) console.error("Erro ao carregar logins:", b.error);
    const lista: Atividade[] = [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(a.data || []).map((l: any) => ({
        id: `a-${l.id}`,
        descricao: l.description || l.event_type,
        detalhe: [l.page, l.resource_type].filter(Boolean).join(" · "),
        em: l.created_at,
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(b.data || []).map((l: any) => ({
        id: `b-${l.id}`,
        descricao: l.event_type === "login" ? "Entrou no site" : l.event_type === "signup" ? "Criou a conta" : l.event_type,
        em: l.created_at,
        login: true,
      })),
    ].sort((x, y) => new Date(y.em).getTime() - new Date(x.em).getTime());
    setAtividades(lista);
  }, []);

  useEffect(() => {
    if (!usuario) return;
    setTexto("");
    setApagando(null);
    setNotas([]);
    setAtividades([]);
    setCarregando(true);
    Promise.all([carregarNotas(usuario.id), carregarAtividade(usuario.id)]).finally(() => setCarregando(false));
  }, [usuario, carregarNotas, carregarAtividade]);

  const adicionar = async () => {
    if (!usuario || !texto.trim()) return;
    setEnviando(true);
    const { error } = await supabase.from("notas_usuarios").insert([{ usuario_id: usuario.id, conteudo: texto.trim(), criado_por: user?.id }]);
    setEnviando(false);
    if (error) {
      console.error("Erro ao adicionar nota:", error);
      toast.error("Não foi possível salvar a nota");
      return;
    }
    setTexto("");
    carregarNotas(usuario.id);
  };

  const apagar = async (id: string) => {
    const { error } = await supabase.from("notas_usuarios").delete().eq("id", id);
    setApagando(null);
    if (error) {
      console.error("Erro ao excluir nota:", error);
      toast.error("Não foi possível excluir a nota");
      return;
    }
    setNotas((l) => l.filter((n) => n.id !== id));
  };

  return (
    <Dialog open={!!usuario} onOpenChange={(o) => !o && onFechar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        {usuario && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <AvatarUsuario usuario={usuario} className="h-11 w-11" />
                <div className="min-w-0 text-left">
                  <DialogTitle className="truncate">{usuario.nome || "Sem nome"}</DialogTitle>
                  <DialogDescription className="truncate">{usuario.email}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg bg-slate-50 px-3 py-2.5 text-xs sm:grid-cols-4">
              <div>
                <dt className="text-slate-500">Função</dt>
                <dd className="font-medium text-slate-800">{rotuloTipo(usuario.tipo)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Cadastro</dt>
                <dd className="font-medium text-slate-800">{dataBR(usuario.criadoEm) || "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Último acesso</dt>
                <dd className="font-medium text-slate-800" title={usuario.ultimoLogin ? dataHora(usuario.ultimoLogin) : undefined}>
                  {tempoRelativo(usuario.ultimoLogin) || "nunca"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Premium</dt>
                <dd className="font-medium text-slate-800">
                  {usuario.assinante ? (usuario.terminoAssinatura ? `até ${dataBR(usuario.terminoAssinatura)}` : "sem término") : "não"}
                </dd>
              </div>
            </dl>

            <div role="tablist" className="flex gap-1 border-b border-slate-200">
              {(
                [
                  { id: "notas", label: "Notas da equipe", n: notas.length, icone: StickyNote },
                  { id: "atividade", label: "Atividade", n: atividades.length, icone: Activity },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  type="button"
                  aria-selected={aba === t.id}
                  onClick={() => onAba(t.id)}
                  className={cn(
                    "-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                    aba === t.id ? "border-[#5f2ebe] text-[#5f2ebe]" : "border-transparent text-slate-500 hover:text-slate-800"
                  )}
                >
                  <t.icone className="h-4 w-4" />
                  {t.label}
                  {!carregando && <span className="rounded-full bg-slate-100 px-1.5 text-[11px] tabular-nums text-slate-600">{t.n}</span>}
                </button>
              ))}
            </div>

            {carregando ? (
              <ListaEsqueleto linhas={3} icone={false} />
            ) : aba === "notas" ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Textarea
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Anote algo sobre esta pessoa. Só a equipe vê."
                    className="min-h-[80px]"
                    aria-label="Nova nota"
                  />
                  <div className="flex justify-end">
                    <Button size="sm" onClick={adicionar} disabled={!texto.trim() || enviando} className="bg-[#5f2ebe] text-white hover:bg-[#4f25a0]">
                      {enviando ? "Salvando..." : "Adicionar nota"}
                    </Button>
                  </div>
                </div>
                {notas.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-400">Nenhuma nota ainda.</p>
                ) : (
                  <ul className="space-y-2">
                    {notas.map((n) => (
                      <li key={n.id} className="group rounded-lg border border-slate-200 px-3 py-2.5">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-400">{dataHora(n.data_criacao)}</span>
                          {apagando === n.id ? (
                            <span className="flex items-center gap-1">
                              <button type="button" onClick={() => setApagando(null)} className="rounded px-1.5 py-0.5 text-xs text-slate-500 hover:bg-slate-100">
                                Cancelar
                              </button>
                              <button type="button" onClick={() => apagar(n.id)} className="rounded bg-red-600 px-1.5 py-0.5 text-xs font-medium text-white hover:bg-red-700">
                                Excluir
                              </button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setApagando(n.id)}
                              className="rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-600"
                              aria-label="Excluir nota"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-slate-700">{n.conteudo}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : atividades.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">Nenhuma atividade registrada.</p>
            ) : (
              <ol className="relative ml-2 space-y-3 border-l border-slate-200 pl-4">
                {atividades.map((a) => (
                  <li key={a.id} className="relative">
                    <span
                      className={cn(
                        "absolute -left-[22px] top-1 flex h-3 w-3 items-center justify-center rounded-full ring-4 ring-white",
                        a.login ? "bg-slate-300" : "bg-[#5f2ebe]"
                      )}
                    />
                    <p className="flex items-center gap-1.5 text-sm text-slate-800">
                      {a.login && <LogIn className="h-3.5 w-3.5 text-slate-400" />}
                      {a.descricao}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {dataHora(a.em)}
                      {a.detalhe && <> · {a.detalhe}</>}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FichaUsuarioDialog;
