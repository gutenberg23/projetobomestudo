import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Check, X, ExternalLink, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { STATUS_LABEL, buscarNomesAutores, mensagemErro } from "@/services/contribuicoes";
import {
  CorrecaoTeoria,
  StatusCorrecao,
  TeoriaResumo,
  aprovarCorrecao,
  buscarTeorias,
  excluirCorrecao,
  listarCorrecoes,
  rejeitarCorrecao,
} from "@/services/correcoesTeoria";
import { aplicarCorrecaoHtml } from "@/utils/aplicarCorrecaoHtml";

const formatarData = (iso: string) => new Date(iso).toLocaleString("pt-BR");

/** Aba da moderação com as correções de trechos de teorias enviadas por usuários. */
export const ModeracaoCorrecoes = () => {
  const [status, setStatus] = useState<StatusCorrecao | "todos">("pendente");
  const [correcoes, setCorrecoes] = useState<CorrecaoTeoria[]>([]);
  const [teorias, setTeorias] = useState<Record<string, TeoriaResumo>>({});
  const [autores, setAutores] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);
  const [rejeitando, setRejeitando] = useState<CorrecaoTeoria | null>(null);
  const [motivo, setMotivo] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const lista = await listarCorrecoes(status);
      setCorrecoes(lista);
      const idsTeorias = Array.from(new Set(lista.map((c) => c.teoria_id)));
      const idsAutores = Array.from(new Set(lista.map((c) => c.autor_id)));
      const [mapaTeorias, mapaAutores] = await Promise.all([
        // O conteúdo só é necessário para calcular as prévias das pendentes
        buscarTeorias(idsTeorias, lista.some((c) => c.status === "pendente")),
        buscarNomesAutores(idsAutores),
      ]);
      setTeorias(mapaTeorias);
      setAutores(mapaAutores);
    } catch (e) {
      toast.error("Erro ao carregar correções: " + mensagemErro(e));
    } finally {
      setCarregando(false);
    }
  }, [status]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Para cada pendente, verifica se o trecho é encontrado no texto atual da teoria
  const previas = useMemo(() => {
    const resultado: Record<string, ReturnType<typeof aplicarCorrecaoHtml> | null> = {};
    correcoes.forEach((c) => {
      const conteudo = teorias[c.teoria_id]?.conteudo;
      resultado[c.id] =
        c.status === "pendente" && typeof conteudo === "string"
          ? aplicarCorrecaoHtml(conteudo, c.trecho_original, c.trecho_corrigido)
          : null;
    });
    return resultado;
  }, [correcoes, teorias]);

  const aprovar = async (c: CorrecaoTeoria, aplicarNoTexto: boolean) => {
    const previa = previas[c.id];
    const conteudoAtual = teorias[c.teoria_id]?.conteudo ?? null;
    if (aplicarNoTexto && (!previa || !previa.ok)) return;
    if (
      !aplicarNoTexto &&
      !window.confirm(
        "Aprovar sem alterar o texto? Use esta opção quando você já aplicou a correção pelo editor da teoria."
      )
    )
      return;
    setProcessando(c.id);
    try {
      await aprovarCorrecao(c.id, aplicarNoTexto && previa?.ok ? previa.html : null, aplicarNoTexto ? conteudoAtual : null);
      toast.success(aplicarNoTexto ? "Correção aplicada e publicada na teoria." : "Correção marcada como aprovada.");
      carregar();
    } catch (e) {
      toast.error(mensagemErro(e));
    } finally {
      setProcessando(null);
    }
  };

  const confirmarRejeicao = async () => {
    if (!rejeitando) return;
    if (motivo.trim().length < 5) {
      toast.error("Explique o motivo para o autor (mínimo 5 caracteres).");
      return;
    }
    setProcessando(rejeitando.id);
    try {
      await rejeitarCorrecao(rejeitando.id, motivo);
      toast.success("Correção rejeitada. O autor verá o motivo.");
      setRejeitando(null);
      setMotivo("");
      carregar();
    } catch (e) {
      toast.error(mensagemErro(e));
    } finally {
      setProcessando(null);
    }
  };

  const excluir = async (c: CorrecaoTeoria) => {
    if (!window.confirm("Excluir este registro? O texto da teoria não é alterado.")) return;
    try {
      await excluirCorrecao(c.id);
      carregar();
    } catch (e) {
      toast.error(mensagemErro(e));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <Select value={status} onValueChange={(v) => setStatus(v as StatusCorrecao | "todos")}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pendente">{STATUS_LABEL.pendente}</SelectItem>
            <SelectItem value="aprovado">{STATUS_LABEL.aprovado}</SelectItem>
            <SelectItem value="rejeitado">{STATUS_LABEL.rejeitado}</SelectItem>
            <SelectItem value="todos">Todos</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-600">
          Ao aprovar, o trecho é trocado direto no texto da teoria. Nada muda antes disso.
        </p>
      </div>

      {carregando ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : correcoes.length === 0 ? (
        <p className="text-gray-600">Nenhuma correção encontrada com este filtro.</p>
      ) : (
        correcoes.map((c) => {
          const teoria = teorias[c.teoria_id];
          const previa = previas[c.id];
          return (
            <Card key={c.id}>
              <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
                <div className="space-y-1">
                  <CardTitle className="text-base break-words">
                    {teoria?.titulo || "Teoria removida"}
                  </CardTitle>
                  <p className="text-xs text-gray-500">
                    Enviada por {autores[c.autor_id] || "usuário"} em {formatarData(c.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0 justify-end">
                  <Badge variant="outline">{STATUS_LABEL[c.status]}</Badge>
                  {teoria && (
                    <Button size="sm" variant="ghost" asChild title="Ver teoria">
                      <a href={`/teoria/${c.teoria_id}`} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {c.status !== "pendente" && (
                    <Button size="sm" variant="ghost" onClick={() => excluir(c)} title="Excluir registro">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Trecho atual</p>
                    <p className="text-sm whitespace-pre-wrap rounded border border-red-100 bg-red-50 p-2 line-through decoration-red-300">
                      {c.trecho_original}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Sugestão</p>
                    <p className="text-sm whitespace-pre-wrap rounded border border-green-100 bg-green-50 p-2">
                      {c.trecho_corrigido}
                    </p>
                  </div>
                </div>
                {c.justificativa && (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Justificativa:</span> {c.justificativa}
                  </p>
                )}
                {c.status === "rejeitado" && c.motivo_rejeicao && (
                  <p className="text-sm text-red-700">Motivo da rejeição: {c.motivo_rejeicao}</p>
                )}
                {c.status === "aprovado" && (
                  <p className="text-xs text-gray-500">
                    {c.aplicada_no_texto ? "Aplicada automaticamente no texto." : "Aprovada sem alteração automática do texto."}
                  </p>
                )}

                {c.status === "pendente" && teoria && previa && "motivo" in previa && (
                  <div className="flex items-start gap-2 rounded border border-amber-200 bg-amber-50 p-2 text-sm text-amber-800">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>
                      {previa.motivo === "ambiguo"
                        ? `O trecho aparece ${previa.ocorrencias} vezes no texto, então não dá para aplicar sozinho.`
                        : "O trecho não foi encontrado no texto atual (pode já ter sido alterado)."}{" "}
                      Aplique pelo editor e depois clique em "Já apliquei no editor".
                    </span>
                  </div>
                )}

                {c.status === "pendente" && (
                  <div className="flex flex-wrap gap-2 justify-end">
                    {teoria && (
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/admin/teorias/${c.teoria_id}/edit`} target="_blank">
                          <Pencil className="h-4 w-4 mr-1" /> Abrir no editor
                        </Link>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-700 border-red-200"
                      onClick={() => {
                        setRejeitando(c);
                        setMotivo("");
                      }}
                      disabled={processando === c.id}
                    >
                      <X className="h-4 w-4 mr-1" /> Rejeitar
                    </Button>
                    {previa?.ok ? (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => aprovar(c, true)}
                        disabled={processando === c.id}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        {processando === c.id ? "Publicando..." : "Aprovar e aplicar"}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => aprovar(c, false)}
                        disabled={processando === c.id || !teoria}
                      >
                        <Check className="h-4 w-4 mr-1" /> Já apliquei no editor
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}

      <Dialog open={rejeitando !== null} onOpenChange={(open) => !open && setRejeitando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar correção</DialogTitle>
            <DialogDescription>O autor verá este motivo.</DialogDescription>
          </DialogHeader>
          <Textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={4} maxLength={2000} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejeitando(null)}>
              Cancelar
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmarRejeicao} disabled={!!processando}>
              Rejeitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
