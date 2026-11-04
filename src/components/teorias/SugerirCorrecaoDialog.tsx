import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquareWarning, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { mensagemErro } from "@/services/contribuicoes";
import { LIMITE_CORRECAO, LIMITE_TRECHO, enviarCorrecao } from "@/services/correcoesTeoria";

interface Props {
  aberto: boolean;
  teoriaId: string;
  trechoSelecionado: string;
  onClose: () => void;
}

/**
 * Formulário em que o leitor sugere a correção de um trecho da teoria.
 * A sugestão vai para a moderação; nada muda no texto até um admin aprovar.
 */
export const SugerirCorrecaoDialog = ({ aberto, teoriaId, trechoSelecionado, onClose }: Props) => {
  const { user } = useAuth();
  const [original, setOriginal] = useState("");
  const [corrigido, setCorrigido] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (aberto) {
      setOriginal(trechoSelecionado);
      setCorrigido(trechoSelecionado);
      setJustificativa("");
    }
  }, [aberto, trechoSelecionado]);

  // Esc fecha
  useEffect(() => {
    if (!aberto) return;
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [aberto, onClose]);

  if (!aberto) return null;

  const enviar = async () => {
    if (original.trim().length < 3) {
      toast.error("Selecione ou cole o trecho que precisa de correção (mínimo 3 caracteres).");
      return;
    }
    if (!corrigido.trim()) {
      toast.error("Escreva como o trecho deveria ficar.");
      return;
    }
    if (corrigido.trim() === original.trim()) {
      toast.error("O texto corrigido está igual ao original.");
      return;
    }
    setEnviando(true);
    try {
      await enviarCorrecao({
        teoria_id: teoriaId,
        trecho_original: original,
        trecho_corrigido: corrigido,
        justificativa,
      });
      toast.success("Correção enviada! Ela vai ao ar depois da aprovação da equipe.");
      onClose();
    } catch (e) {
      toast.error(mensagemErro(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sugerir-correcao-titulo"
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
          <span className="mt-0.5 rounded-lg bg-orange-50 p-2 text-orange-600">
            <MessageSquareWarning className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 id="sugerir-correcao-titulo" className="text-base font-semibold text-slate-900">
              Sugerir correção
            </h3>
            <p className="text-xs text-slate-500">A equipe revisa antes de qualquer mudança no texto.</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!user ? (
          <div className="space-y-4 px-5 py-4">
            <p className="text-sm text-slate-700">Entre na sua conta para sugerir correções nesta teoria.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
              <Button asChild>
                <Link to="/login">Entrar</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 px-5 py-4">
            {!trechoSelecionado && (
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                Dica: selecione o trecho no texto da aula e toque em “Corrigir” para ele vir preenchido.
              </p>
            )}
            <div className="space-y-1">
              <Label htmlFor="correcao-original">Trecho atual</Label>
              <Textarea
                id="correcao-original"
                value={original}
                onChange={(e) => setOriginal(e.target.value)}
                rows={3}
                maxLength={LIMITE_TRECHO}
                placeholder="Cole aqui o trecho exatamente como está na aula"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="correcao-nova">Como deveria ficar</Label>
              <Textarea
                id="correcao-nova"
                value={corrigido}
                onChange={(e) => setCorrigido(e.target.value)}
                rows={4}
                maxLength={LIMITE_CORRECAO}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="correcao-justificativa">Por quê? (opcional)</Label>
              <Textarea
                id="correcao-justificativa"
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                rows={2}
                maxLength={2000}
                placeholder="Ex.: a lei foi alterada em 2024; artigo citado está errado..."
              />
            </div>
            <p className="text-xs text-slate-500">
              Se a correção for aprovada, seu nome aparece nos créditos desta teoria e no{" "}
              <Link to="/ranking-contribuicoes" className="underline">ranking de contribuições</Link>. Você acompanha suas
              sugestões em <Link to="/contribuir" className="underline">Contribuir</Link>.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={enviar} disabled={enviando} className="bg-[#5f2ebe] text-white hover:bg-[#4f25a0]">
                {enviando ? "Enviando..." : "Enviar para análise"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
