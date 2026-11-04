import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Check, X, Pencil, Trash2 } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { SubmissaoDetalhes } from "@/components/contribuicoes/SubmissaoDetalhes";
import { SubmissaoForm } from "@/components/contribuicoes/SubmissaoForm";
import { ModeracaoCorrecoes } from "@/components/contribuicoes/ModeracaoCorrecoes";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ContribuicoesConfig,
  StatusSubmissao,
  Submissao,
  SubmissaoInput,
  TipoSubmissao,
  TIPO_LABEL,
  STATUS_LABEL,
  aprovarSubmissao,
  atualizarSubmissao,
  buscarNomesAutores,
  excluirSubmissao,
  listarSubmissoes,
  mensagemErro,
  obterConfig,
  rejeitarSubmissao,
  salvarConfig,
} from "@/services/contribuicoes";

const Moderacao = () => {
  const { isAdmin, loading: carregandoPermissoes } = usePermissions();
  const [status, setStatus] = useState<StatusSubmissao | "todos">("pendente");
  const [tipo, setTipo] = useState<TipoSubmissao | "todos">("todos");
  const [submissoes, setSubmissoes] = useState<Submissao[]>([]);
  const [autores, setAutores] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);
  const [incluirDependencias, setIncluirDependencias] = useState(true);

  const [rejeitando, setRejeitando] = useState<Submissao | null>(null);
  const [motivo, setMotivo] = useState("");
  const [editando, setEditando] = useState<Submissao | null>(null);
  const [editandoMinhas, setEditandoMinhas] = useState<Submissao[]>([]);

  const [config, setConfig] = useState<ContribuicoesConfig | null>(null);
  const [salvandoConfig, setSalvandoConfig] = useState(false);

  const admin = isAdmin();

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const lista = await listarSubmissoes({ status, tipo });
      setSubmissoes(lista);
      const ids = Array.from(new Set(lista.map((s) => s.autor_id)));
      setAutores(await buscarNomesAutores(ids));
    } catch (e) {
      toast.error("Erro ao carregar envios: " + mensagemErro(e));
    } finally {
      setCarregando(false);
    }
  }, [status, tipo]);

  useEffect(() => {
    if (admin) carregar();
  }, [admin, carregar]);

  useEffect(() => {
    if (admin) obterConfig().then(setConfig).catch((e) => toast.error(mensagemErro(e)));
  }, [admin]);

  if (carregandoPermissoes) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!admin) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-2">Moderação</h1>
        <p className="text-gray-600">Apenas administradores podem aprovar ou rejeitar conteúdos enviados por usuários.</p>
      </div>
    );
  }

  const aprovar = async (s: Submissao) => {
    setProcessando(s.id);
    try {
      await aprovarSubmissao(s.id, incluirDependencias);
      toast.success(`${TIPO_LABEL[s.tipo]} "${s.titulo}" publicado.`);
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
      await rejeitarSubmissao(rejeitando.id, motivo);
      toast.success("Envio rejeitado. O autor verá o motivo.");
      setRejeitando(null);
      setMotivo("");
      carregar();
    } catch (e) {
      toast.error(mensagemErro(e));
    } finally {
      setProcessando(null);
    }
  };

  const abrirEdicao = async (s: Submissao) => {
    try {
      // Envios do mesmo autor, para manter/ajustar os itens vinculados
      const todas = await listarSubmissoes({ status: "todos", tipo: "todos" });
      setEditandoMinhas(todas.filter((x) => x.autor_id === s.autor_id));
    } catch {
      setEditandoMinhas([]);
    }
    setEditando(s);
  };

  const salvarEdicao = async (input: SubmissaoInput) => {
    if (!editando) return;
    setProcessando(editando.id);
    try {
      await atualizarSubmissao(editando.id, input);
      toast.success("Envio atualizado. Agora você pode aprová-lo.");
      setEditando(null);
      carregar();
    } catch (e) {
      toast.error(mensagemErro(e));
    } finally {
      setProcessando(null);
    }
  };

  const excluir = async (s: Submissao) => {
    if (!window.confirm(`Excluir definitivamente o envio "${s.titulo}"? O conteúdo já publicado não é afetado.`)) return;
    try {
      await excluirSubmissao(s.id);
      carregar();
    } catch (e) {
      toast.error(mensagemErro(e));
    }
  };

  const gravarConfig = async () => {
    if (!config) return;
    setSalvandoConfig(true);
    try {
      await salvarConfig(config);
      toast.success("Configuração salva.");
    } catch (e) {
      toast.error(mensagemErro(e));
    } finally {
      setSalvandoConfig(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        titulo="Moderação"
        descricao="Conteúdos e correções de teorias enviados por usuários. Nada é publicado sem aprovação."
      />

      {config && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Configuração das contribuições</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row md:items-end gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={config.habilitado} onCheckedChange={(v) => setConfig({ ...config, habilitado: v })} />
              Permitir que usuários enviem conteúdos e correções
            </label>
            <div className="space-y-1">
              <Label htmlFor="lim-pend" className="text-xs">Máx. pendentes por usuário</Label>
              <Input
                id="lim-pend"
                type="number"
                min={1}
                max={500}
                className="w-32"
                value={config.limite_pendentes}
                onChange={(e) => setConfig({ ...config, limite_pendentes: Number(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lim-dia" className="text-xs">Máx. envios por dia</Label>
              <Input
                id="lim-dia"
                type="number"
                min={1}
                max={1000}
                className="w-32"
                value={config.limite_diario}
                onChange={(e) => setConfig({ ...config, limite_diario: Number(e.target.value) || 1 })}
              />
            </div>
            <Button onClick={gravarConfig} disabled={salvandoConfig} variant="outline">
              {salvandoConfig ? "Salvando..." : "Salvar"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="conteudos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="conteudos">Tópicos, aulas, disciplinas e cursos</TabsTrigger>
          <TabsTrigger value="correcoes">Correções de teorias</TabsTrigger>
        </TabsList>
        <TabsContent value="correcoes">
          <ModeracaoCorrecoes />
        </TabsContent>
        <TabsContent value="conteudos" className="space-y-6">
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <Select value={status} onValueChange={(v) => setStatus(v as StatusSubmissao | "todos")}>
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
        <Select value={tipo} onValueChange={(v) => setTipo(v as TipoSubmissao | "todos")}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            {(Object.keys(TIPO_LABEL) as TipoSubmissao[]).map((t) => (
              <SelectItem key={t} value={t}>
                {TIPO_LABEL[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm md:ml-auto">
          <Checkbox checked={incluirDependencias} onCheckedChange={(v) => setIncluirDependencias(v === true)} />
          Ao aprovar, publicar também os itens pendentes vinculados
        </label>
      </div>

      {carregando ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : submissoes.length === 0 ? (
        <p className="text-gray-600">Nenhum envio encontrado com estes filtros.</p>
      ) : (
        <div className="space-y-4">
          {submissoes.map((s) => (
            <Card key={s.id}>
              <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
                <CardTitle className="text-lg break-words">{s.titulo}</CardTitle>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {s.status === "pendente" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => abrirEdicao(s)} disabled={processando === s.id}>
                        <Pencil className="h-4 w-4 mr-1" /> Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-700 border-red-200"
                        onClick={() => {
                          setRejeitando(s);
                          setMotivo("");
                        }}
                        disabled={processando === s.id}
                      >
                        <X className="h-4 w-4 mr-1" /> Rejeitar
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => aprovar(s)}
                        disabled={processando === s.id}
                      >
                        <Check className="h-4 w-4 mr-1" /> {processando === s.id ? "Publicando..." : "Aprovar"}
                      </Button>
                    </>
                  )}
                  {s.status !== "pendente" && (
                    <Button size="sm" variant="ghost" onClick={() => excluir(s)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <SubmissaoDetalhes submissao={s} nomeAutor={autores[s.autor_id]} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
        </TabsContent>
      </Tabs>

      <Dialog open={rejeitando !== null} onOpenChange={(open) => !open && setRejeitando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar envio</DialogTitle>
            <DialogDescription>O autor verá este motivo e poderá corrigir e reenviar.</DialogDescription>
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

      <Dialog open={editando !== null} onOpenChange={(open) => !open && setEditando(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar envio antes de aprovar</DialogTitle>
          </DialogHeader>
          {editando && (
            <SubmissaoForm
              key={editando.id}
              inicial={editando}
              tipoEditavel={false}
              minhasSubmissoes={editandoMinhas}
              enviando={processando === editando.id}
              textoBotao="Salvar alterações"
              onSubmit={salvarEdicao}
              onCancel={() => setEditando(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Moderacao;
