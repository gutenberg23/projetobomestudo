import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold">Sugerir correção</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!user ? (
          <div className="p-4 space-y-4">
            <p className="text-sm text-gray-700">Entre na sua conta para sugerir correções nesta teoria.</p>
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
          <div className="p-4 space-y-4">
            <p className="text-sm text-gray-600">
              Dica: selecione o trecho no texto da aula antes de clicar em "Sugerir correção" para ele vir preenchido.
            </p>
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
            <p className="text-xs text-gray-500">
              Se a correção for aprovada, seu nome aparece nos créditos desta teoria e no{" "}
              <Link to="/ranking-contribuicoes" className="underline">ranking de contribuições</Link>. Você acompanha suas
              sugestões em <Link to="/contribuir" className="underline">Contribuir</Link>.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={enviar} disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar para análise"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
