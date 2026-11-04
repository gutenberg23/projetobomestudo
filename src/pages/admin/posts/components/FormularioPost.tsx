import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ModoInterface } from "../types";
import { FormularioBasico } from "./formulario/FormularioBasico";
import { FormularioConteudo } from "./formulario/FormularioConteudo";
import { FormularioRegiao } from "./formulario/FormularioRegiao";
import { FormularioMetadados } from "./formulario/FormularioMetadados";
import { FormularioMidia } from "./formulario/FormularioMidia";
import { FormularioPDF } from "./formulario/FormularioPDF";
import { FormularioStatus } from "./formulario/FormularioStatus";
import { CardLateral } from "./formulario/CardLateral";
import { Region } from "@/components/blog/types";
import { resetBlogPostLikes } from "@/services/blogService";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, ClipboardPaste, ExternalLink, HeartOff, Loader2, Save, Send, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormularioPostProps {
  modo: ModoInterface;
  onVoltar: () => void;
  /** Salva e devolve true se deu certo */
  onSalvar: (opcoes?: { isDraft?: boolean; continuarEditando?: boolean }) => Promise<boolean>;
  salvando?: boolean;
  titulo: string;
  onChangeTitulo: (value: string) => void;
  resumo: string;
  onChangeResumo: (value: string) => void;
  conteudo: string;
  onChangeConteudo: (value: string) => void;
  categoria: string;
  onChangeCategoria: (value: string) => void;
  destacado: boolean;
  onChangeDestacado: (value: boolean) => void;
  isDraft: boolean;
  onChangeIsDraft: (value: boolean) => void;
  tags: string;
  onChangeTags: (value: string) => void;
  metaDescricao: string;
  onChangeMetaDescricao: (value: string) => void;
  metaKeywords: string;
  onChangeMetaKeywords: (value: string) => void;
  imagemDestaque: string;
  onChangeImagemDestaque: (value: string) => void;
  regiao: Region | "none";
  onChangeRegiao: (value: Region | "none") => void;
  estado: string;
  onChangeEstado: (value: string) => void;
  postsRelacionados: string;
  onChangePostsRelacionados: (value: string) => void;
  postId?: string;
  postSlug?: string;
  postAutor?: string;
  postCriadoEm?: string;
  /** Status salvo no banco (o seletor pode ter sido mudado sem salvar) */
  publicadoNoBanco?: boolean;
}

export const FormularioPost: React.FC<FormularioPostProps> = (props) => {
  const {
    modo,
    onVoltar,
    onSalvar,
    salvando = false,
    titulo,
    onChangeTitulo,
    resumo,
    onChangeResumo,
    conteudo,
    onChangeConteudo,
    categoria,
    onChangeCategoria,
    destacado,
    onChangeDestacado,
    isDraft,
    onChangeIsDraft,
    tags,
    onChangeTags,
    metaDescricao,
    onChangeMetaDescricao,
    metaKeywords,
    onChangeMetaKeywords,
    imagemDestaque,
    onChangeImagemDestaque,
    regiao,
    onChangeRegiao,
    estado,
    onChangeEstado,
    postsRelacionados,
    onChangePostsRelacionados,
    postId,
    postSlug,
    postAutor,
    postCriadoEm,
    publicadoNoBanco,
  } = props;

  // ----- Alterações não salvas -----
  const retrato = useMemo(
    () =>
      JSON.stringify([
        titulo, resumo, conteudo, categoria, destacado, isDraft, tags, metaDescricao,
        metaKeywords, imagemDestaque, regiao, estado, postsRelacionados,
      ]),
    [titulo, resumo, conteudo, categoria, destacado, isDraft, tags, metaDescricao, metaKeywords, imagemDestaque, regiao, estado, postsRelacionados]
  );
  const retratoSalvo = useRef(retrato);
  // Novo retrato de referência quando outro post é aberto
  useEffect(() => {
    retratoSalvo.current = retrato;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, modo]);
  const alterado = retrato !== retratoSalvo.current;

  useEffect(() => {
    if (!alterado) return;
    const aviso = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [alterado]);

  const salvar = useCallback(
    async (opcoes: { isDraft?: boolean } = {}) => {
      if (!titulo.trim() || !resumo.trim() || !categoria.trim()) {
        toast({ title: "Faltam campos", description: "Preencha título, resumo e categoria antes de salvar.", variant: "destructive" });
        return;
      }
      const ok = await onSalvar({ ...opcoes, continuarEditando: true });
      if (ok) retratoSalvo.current = retrato;
    },
    [onSalvar, retrato, titulo, resumo, categoria]
  );

  // Ctrl+S / Cmd+S salva sem sair do editor
  useEffect(() => {
    const atalho = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!salvando) salvar();
      }
    };
    window.addEventListener("keydown", atalho);
    return () => window.removeEventListener("keydown", atalho);
  }, [salvar, salvando]);

  const voltar = () => {
    if (alterado && !window.confirm("Há alterações não salvas. Sair mesmo assim?")) return;
    onVoltar();
  };

  const handleResetLikes = async () => {
    if (!postId || !window.confirm("Tem certeza que deseja zerar as curtidas deste post?")) return;
    const success = await resetBlogPostLikes(postId).catch(() => false);
    toast(
      success
        ? { title: "Curtidas zeradas" }
        : { title: "Erro", description: "Não foi possível zerar as curtidas.", variant: "destructive" }
    );
  };

  const handleImportJSON = async () => {
    try {
      const texto = await navigator.clipboard.readText();
      if (!texto) throw new Error("Área de transferência vazia");
      const json = JSON.parse(texto);
      if (!json.titulo || !json.resumo || !json.categoria || !json.conteudo) {
        toast({ title: "JSON incompleto", description: "São obrigatórios: titulo, resumo, categoria e conteudo.", variant: "destructive" });
        return;
      }
      onChangeTitulo(json.titulo);
      onChangeResumo(json.resumo);
      onChangeConteudo(json.conteudo);
      onChangeCategoria(json.categoria);
      if (json.tags) onChangeTags(Array.isArray(json.tags) ? json.tags.join(", ") : json.tags);
      if (json.metaDescricao) onChangeMetaDescricao(json.metaDescricao);
      if (json.palavrasChave) onChangeMetaKeywords(Array.isArray(json.palavrasChave) ? json.palavrasChave.join(", ") : json.palavrasChave);
      if (json.regiao) onChangeRegiao(json.regiao);
      if (json.estado) onChangeEstado(json.estado);
      toast({ title: "Campos preenchidos a partir do JSON" });
    } catch (error) {
      console.error("Erro ao importar JSON:", error);
      toast({ title: "Não deu para importar", description: "Copie um JSON válido e tente de novo.", variant: "destructive" });
    }
  };

  const criando = modo === ModoInterface.CRIAR;
  const rotuloSalvar = isDraft ? "Salvar rascunho" : criando || !publicadoNoBanco ? "Publicar" : "Atualizar";

  return (
    // A barra do editor gruda logo abaixo da barra de ações desta página
    <div className="-mx-4 -mt-6 md:-mx-8" style={{ "--post-editor-sticky-top": "57px" } as React.CSSProperties}>
      {/* Barra de ações fixa no topo */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-14 items-center gap-2 px-4 md:px-8">
          <Button type="button" variant="ghost" size="sm" onClick={voltar} className="-ml-2 gap-1 text-slate-600">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Posts</span>
          </Button>
          <span className="h-5 w-px bg-slate-200" aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-base font-semibold text-slate-900">{criando ? "Novo post" : "Editar post"}</h2>
              {!criando && (
                <span
                  className={cn(
                    "hidden rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline",
                    publicadoNoBanco ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  )}
                >
                  {publicadoNoBanco ? "Publicado" : "Rascunho"}
                </span>
              )}
            </div>
            <p className={cn("truncate text-xs", alterado ? "text-amber-600" : "text-slate-400")}>
              {alterado ? "Alterações não salvas" : criando ? "Ainda não salvo" : "Tudo salvo"}
              <span className="hidden text-slate-400 md:inline"> · Ctrl+S salva</span>
            </p>
          </div>
          {postSlug && publicadoNoBanco && (
            <Button type="button" variant="ghost" size="sm" asChild className="hidden text-slate-600 sm:inline-flex">
              <a href={`/blog/${postSlug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 h-4 w-4" />
                Ver no site
              </a>
            </Button>
          )}
          <Button
            type="button"
            onClick={() => salvar()}
            disabled={salvando}
            className={cn("gap-1.5 text-white", isDraft ? "bg-slate-800 hover:bg-slate-700" : "bg-[#ea2be2] hover:bg-[#d029d5]")}
          >
            {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : isDraft ? <Save className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            {salvando ? "Salvando..." : rotuloSalvar}
          </Button>
        </div>
      </div>

      <form
        className="grid grid-cols-[minmax(0,1fr)] gap-5 px-4 py-5 md:px-8 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]"
        onSubmit={(e) => {
          e.preventDefault();
          salvar();
        }}
      >
        <div className="min-w-0 space-y-4">
          <FormularioBasico titulo={titulo} onChangeTitulo={onChangeTitulo} resumo={resumo} onChangeResumo={onChangeResumo} />
          <FormularioConteudo conteudo={conteudo} onChangeConteudo={onChangeConteudo} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[72px] lg:max-h-[calc(100vh-130px)] lg:self-start lg:overflow-y-auto lg:pb-4 lg:pr-1 scrollbar-thin">
          <FormularioStatus isDraft={isDraft} onChangeIsDraft={onChangeIsDraft} destacado={destacado} onChangeDestacado={onChangeDestacado}>
            {!criando && (postAutor || postCriadoEm) && (
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-slate-100 pt-3 text-xs">
                {postAutor && (
                  <>
                    <dt className="text-slate-400">Autor</dt>
                    <dd className="truncate text-slate-600">{postAutor}</dd>
                  </>
                )}
                {postCriadoEm && (
                  <>
                    <dt className="text-slate-400">Criado em</dt>
                    <dd className="text-slate-600">{new Date(postCriadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</dd>
                  </>
                )}
                {postSlug && (
                  <>
                    <dt className="text-slate-400">Endereço</dt>
                    <dd className="truncate font-mono text-[11px] text-slate-600" title={`/blog/${postSlug}`}>/blog/{postSlug}</dd>
                  </>
                )}
              </dl>
            )}
          </FormularioStatus>

          <FormularioMidia
            imagemDestaque={imagemDestaque}
            onChangeImagemDestaque={onChangeImagemDestaque}
            titulo={titulo}
            estado={estado}
            conteudo={conteudo}
            onChangeConteudo={onChangeConteudo}
          />

          <FormularioRegiao
            categoria={categoria}
            onChangeCategoria={onChangeCategoria}
            regiao={regiao}
            onChangeRegiao={onChangeRegiao}
            estado={estado}
            onChangeEstado={onChangeEstado}
          />

          <FormularioMetadados
            tags={tags}
            onChangeTags={onChangeTags}
            metaDescricao={metaDescricao}
            onChangeMetaDescricao={onChangeMetaDescricao}
            metaKeywords={metaKeywords}
            onChangeMetaKeywords={onChangeMetaKeywords}
            postsRelacionados={postsRelacionados}
            onChangePostsRelacionados={onChangePostsRelacionados}
            titulo={titulo}
            resumo={resumo}
            slug={postSlug}
          />

          {criando && (
            <FormularioPDF
              onPreencherCampos={(dados) => {
                if (dados.title) onChangeTitulo(dados.title);
                if (dados.summary) onChangeResumo(dados.summary);
                if (dados.category) onChangeCategoria(dados.category);
                if (dados.content) onChangeConteudo(dados.content);
                if (dados.region) onChangeRegiao(dados.region);
                if (dados.state) onChangeEstado(dados.state || "none");
                if (dados.tags) onChangeTags(Array.isArray(dados.tags) ? dados.tags.join(", ") : (dados.tags as string));
                if (dados.metaDescription) onChangeMetaDescricao(dados.metaDescription);
                if (dados.metaKeywords)
                  onChangeMetaKeywords(Array.isArray(dados.metaKeywords) ? dados.metaKeywords.join(", ") : (dados.metaKeywords as string));
              }}
            />
          )}

          <CardLateral titulo="Ferramentas" icone={<Wrench className="h-4 w-4 text-slate-400" />}>
            <Button type="button" variant="outline" size="sm" className="w-full justify-start" onClick={handleImportJSON}>
              <ClipboardPaste className="mr-2 h-4 w-4" />
              Preencher com JSON copiado
            </Button>
            {!criando && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={handleResetLikes}
              >
                <HeartOff className="mr-2 h-4 w-4" />
                Zerar curtidas
              </Button>
            )}
          </CardLateral>
        </aside>
      </form>
    </div>
  );
};
