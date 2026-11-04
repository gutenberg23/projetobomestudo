import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ListaEsqueleto } from "@/components/admin/ui/listagem";
import { NotaProfessor, Professor } from "./types";

const dataHora = (iso: string | null) => (iso ? new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "");

/** Notas internas da equipe sobre o professor. */
const NotasProfessorDialog: React.FC<{ professor: Professor | null; onFechar: () => void }> = ({ professor, onFechar }) => {
  const { user } = useAuth();
  const [notas, setNotas] = useState<NotaProfessor[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [apagando, setApagando] = useState<string | null>(null);

  useEffect(() => {
    if (!professor) return;
    setTexto("");
    setApagando(null);
    setCarregando(true);
    supabase
      .from("notas_professores")
      .select("id, conteudo, data_criacao")
      .eq("professor_id", professor.id)
      .order("data_criacao", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("Erro ao buscar notas:", error);
          toast.error("Não foi possível carregar as notas");
        }
        setNotas(data || []);
        setCarregando(false);
      });
  }, [professor]);

  const adicionar = async () => {
    if (!professor || !texto.trim()) return;
    setEnviando(true);
    const { data, error } = await supabase
      .from("notas_professores")
      .insert({ professor_id: professor.id, conteudo: texto.trim(), usuario_id: user?.id || null })
      .select("id, conteudo, data_criacao")
      .single();
    setEnviando(false);
    if (error) {
      console.error("Erro ao adicionar nota:", error);
      toast.error("Não foi possível salvar a nota");
      return;
    }
    setNotas((l) => [data, ...l]);
    setTexto("");
  };

  const apagar = async (id: string) => {
    const { error } = await supabase.from("notas_professores").delete().eq("id", id);
    setApagando(null);
    if (error) {
      console.error("Erro ao excluir nota:", error);
      toast.error("Não foi possível excluir a nota");
      return;
    }
    setNotas((l) => l.filter((n) => n.id !== id));
  };

  return (
    <Dialog open={!!professor} onOpenChange={(o) => !o && onFechar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Notas sobre {professor?.nome}</DialogTitle>
          <DialogDescription>Combinados, pagamentos, pendências. Só a equipe vê.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escreva uma nota..." className="min-h-[80px]" aria-label="Nova nota" />
          <div className="flex justify-end">
            <Button size="sm" onClick={adicionar} disabled={!texto.trim() || enviando} className="bg-[#5f2ebe] text-white hover:bg-[#4f25a0]">
              {enviando ? "Salvando..." : "Adicionar nota"}
            </Button>
          </div>
        </div>
        {carregando ? (
          <ListaEsqueleto linhas={2} icone={false} />
        ) : notas.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">Nenhuma nota ainda.</p>
        ) : (
          <ul className="space-y-2">
            {notas.map((n) => (
              <li key={n.id} className="rounded-lg border border-slate-200 px-3 py-2.5">
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
      </DialogContent>
    </Dialog>
  );
};

export default NotasProfessorDialog;
