import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Copy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SubmissaoForm } from "@/components/contribuicoes/SubmissaoForm";
import { SubmissaoDetalhes } from "@/components/contribuicoes/SubmissaoDetalhes";
import {
  ContribuicoesConfig,
  Submissao,
  SubmissaoInput,
  atualizarSubmissao,
  criarSubmissao,
  excluirSubmissao,
  listarMinhasSubmissoes,
  mensagemErro,
  obterConfig,
  rotaPublicada,
} from "@/services/contribuicoes";

type ModoForm = { modo: "novo"; base?: Partial<Submissao> } | { modo: "editar"; submissao: Submissao } | null;

const Contribuir = () => {
  const { user } = useAuth();
  const [submissoes, setSubmissoes] = useState<Submissao[]>([]);
  const [config, setConfig] = useState<ContribuicoesConfig | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState<ModoForm>(null);
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback(async () => {
    if (!user) return;
    setCarregando(true);
    try {
      const [lista, cfg] = await Promise.all([listarMinhasSubmissoes(user.id), obterConfig()]);
      setSubmissoes(lista);
      setConfig(cfg);
    } catch (e) {
      toast.error("Erro ao carregar suas contribuições: " + mensagemErro(e));
    } finally {
      setCarregando(false);
    }
  }, [user]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const salvar = async (input: SubmissaoInput) => {
    setEnviando(true);
    try {
      if (form?.modo === "editar") {
        await atualizarSubmissao(form.submissao.id, input);
        toast.success("Envio atualizado.");
      } else {
        await criarSubmissao(input);
        toast.success("Conteúdo enviado! A equipe vai analisar em breve.");
      }
      setForm(null);
      carregar();
    } catch (e) {
      toast.error(mensagemErro(e));
    } finally {
      setEnviando(false);
    }
  };

  const excluir = async (s: Submissao) => {
    if (!window.confirm(`Excluir o envio "${s.titulo}"?`)) return;
    try {
      await excluirSubmissao(s.id);
      toast.success("Envio excluído.");
      carregar();
    } catch (e) {
      toast.error(mensagemErro(e));
    }
  };

  const pendentes = submissoes.filter((s) => s.status === "pendente").length;
  const habilitado = config?.habilitado ?? false;

  return (
    <div className="min-h-screen flex flex-col bg-[rgb(242,244,246)]">
      <Header />
      <main className="flex-grow px-4 py-6 md:px-8 max-w-5xl w-full mx-auto pt-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#272f3c]">Contribuir com conteúdo</h1>
            <p className="text-sm text-gray-600">
              Envie tópicos, aulas, disciplinas ou cursos. Tudo passa pela análise da administração antes de ser publicado.
            </p>
          </div>
          <Button
            onClick={() => setForm({ modo: "novo" })}
            disabled={!habilitado}
            className="bg-[#5f2ebe] hover:bg-[#4f25a0] text-white"
          >
            <Plus className="h-4 w-4 mr-1" /> Nova contribuição
          </Button>
        </div>

        {config && !habilitado && (
          <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            O envio de novos conteúdos está temporariamente desabilitado.
          </div>
        )}
        {config && habilitado && (
          <p className="text-xs text-gray-500">
            Você tem {pendentes} de {config.limite_pendentes} envios aguardando análise.
          </p>
        )}

        {carregando ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : submissoes.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-gray-600">
              Você ainda não enviou nenhum conteúdo. Comece por um tópico: é a forma mais simples de contribuir.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {submissoes.map((s) => {
              const rota = s.conteudo_publicado_id ? rotaPublicada(s.tipo, s.conteudo_publicado_id) : null;
              return (
                <Card key={s.id}>
                  <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
                    <CardTitle className="text-lg break-words">{s.titulo}</CardTitle>
                    <div className="flex gap-1 shrink-0">
                      {s.status === "pendente" && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => setForm({ modo: "editar", submissao: s })}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => excluir(s)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                      {s.status === "rejeitado" && habilitado && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setForm({
                              modo: "novo",
                              base: { ...s, itens_submissao_ids: [], id: undefined },
                            })
                          }
                        >
                          <Copy className="h-4 w-4 mr-1" /> Corrigir e reenviar
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SubmissaoDetalhes submissao={s} />
                    {rota && (
                      <Link to={rota} className="inline-block mt-3 text-sm text-[#5f2ebe] underline">
                        Ver conteúdo publicado
                      </Link>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Footer />

      <Dialog open={form !== null} onOpenChange={(open) => !open && setForm(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form?.modo === "editar" ? "Editar envio" : "Nova contribuição"}</DialogTitle>
            <DialogDescription>
              Use apenas materiais que você tem direito de compartilhar. Links precisam começar com https://.
            </DialogDescription>
          </DialogHeader>
          {form && (
            <SubmissaoForm
              key={form.modo === "editar" ? form.submissao.id : "novo"}
              inicial={form.modo === "editar" ? form.submissao : form.base}
              tipoEditavel={form.modo === "novo"}
              minhasSubmissoes={submissoes}
              enviando={enviando}
              textoBotao={form.modo === "editar" ? "Salvar alterações" : "Enviar para análise"}
              onSubmit={salvar}
              onCancel={() => setForm(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contribuir;
