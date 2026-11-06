import React, { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
import js from "highlight.js/lib/languages/javascript";
import {
  Bold as BoldIcon,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Table as TableIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  Unlink,
  Quote,
  RemoveFormatting,
  HelpCircle,
  Maximize2,
  Minimize2,
  Undo2,
  Redo2,
  Minus,
  Code2,
  Palette,
  Highlighter,
  Trash2,
  Upload,
  Rows3,
  Columns3,
  Merge,
  Split,
  PaintBucket,
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  PanelTop,
  Loader2,
  ReplaceAll,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { QuestionExtension } from "@/components/editor/QuestionExtension";
import { TableCellBackground } from "@/components/editor/TableCellBackground";
import { FontSize, limparHtmlColado } from "./extensions";
import { PainelSubstituirEmMassa } from "./SubstituirEmMassa";
import "./TiptapEditor.css";

const lowlight = createLowlight();
lowlight.register("js", js);

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  /**
   * "post" (padrão): barra completa do blog.
   * "questao": barra enxuta para enunciados e comentários de questões
   * (sem fonte/tamanho e sem inserir questão), área de texto menor.
   */
  variante?: "post" | "questao";
  /** Bucket do Storage para as imagens enviadas (padrão: blog-images). */
  bucket?: string;
  /** Rótulo acessível da área de texto. */
  rotulo?: string;
}

const FONTES = [
  { label: "Fonte padrão", value: "" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
];

const TAMANHOS = ["", "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"];

const CORES_TEXTO = [
  "#1f2533", "#475569", "#94a3b8", "#5f2ebe", "#ea2be2", "#2563eb",
  "#0891b2", "#16a34a", "#ca8a04", "#ea580c", "#dc2626", "#be185d",
];
const CORES_MARCA_TEXTO = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fbcfe8", "#fed7aa", "#e9d5ff"];
const CORES_CELULA = [
  { nome: "Roxo (cabeçalho)", valor: "rgb(95, 46, 190)" },
  { nome: "Cinza claro", valor: "rgb(226, 232, 240)" },
  { nome: "Amarelo", valor: "rgb(254, 252, 232)" },
  { nome: "Azul", valor: "rgb(219, 234, 254)" },
  { nome: "Verde", valor: "rgb(220, 252, 231)" },
  { nome: "Vermelho", valor: "rgb(254, 226, 226)" },
];

/* --------------------------------------------------------------------------
 * Peças da barra de ferramentas
 * ------------------------------------------------------------------------ */

interface BotaoProps {
  titulo: string;
  ativo?: boolean;
  desativado?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

const Botao = React.forwardRef<HTMLButtonElement, BotaoProps>(
  ({ titulo, ativo, desativado, onClick, children, className, ...rest }, ref) => (
    <button
      ref={ref}
      type="button"
      title={titulo}
      aria-label={titulo}
      aria-pressed={ativo}
      disabled={desativado}
      // Evita que o clique tire o foco (e a seleção) do editor
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-md px-1.5 text-slate-600 transition-colors",
        "hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40",
        ativo && "bg-[#5f2ebe]/10 text-[#5f2ebe] hover:bg-[#5f2ebe]/15 hover:text-[#5f2ebe]",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
);
Botao.displayName = "Botao";

const Separador = () => <span className="mx-0.5 h-5 w-px shrink-0 bg-slate-200" aria-hidden />;

const Grupo: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("flex items-center gap-0.5", className)}>{children}</div>
);

const SeletorNativo: React.FC<{
  titulo: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}> = ({ titulo, value, onChange, children, className }) => (
  <select
    title={titulo}
    aria-label={titulo}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={cn(
      "h-8 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 hover:border-slate-300",
      "focus:outline-none focus:ring-2 focus:ring-[#5f2ebe]/30",
      className
    )}
  >
    {children}
  </select>
);

const PaletaCores: React.FC<{
  titulo: string;
  icone: React.ReactNode;
  cores: string[];
  corAtual?: string;
  onEscolher: (cor: string) => void;
  onLimpar: () => void;
}> = ({ titulo, icone, cores, corAtual, onEscolher, onLimpar }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Botao titulo={titulo}>
        <span className="flex flex-col items-center">
          {icone}
          <span className="mt-0.5 h-0.5 w-4 rounded" style={{ backgroundColor: corAtual || "transparent" }} />
        </span>
      </Botao>
    </PopoverTrigger>
    <PopoverContent className="w-56 p-3" onOpenAutoFocus={(e) => e.preventDefault()}>
      <p className="mb-2 text-xs font-medium text-slate-500">{titulo}</p>
      <div className="grid grid-cols-6 gap-1.5">
        {cores.map((cor) => (
          <button
            key={cor}
            type="button"
            title={cor}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onEscolher(cor)}
            className={cn(
              "h-7 w-7 rounded-md border border-black/10 transition-transform hover:scale-110",
              corAtual === cor && "ring-2 ring-[#5f2ebe] ring-offset-1"
            )}
            style={{ backgroundColor: cor }}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-xs text-slate-500">
          Outra
          <input
            type="color"
            className="h-7 w-9 cursor-pointer rounded border border-slate-200"
            onChange={(e) => onEscolher(e.target.value)}
          />
        </label>
        <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={onLimpar}>
          Remover cor
        </Button>
      </div>
    </PopoverContent>
  </Popover>
);

/** Escolha do tamanho da tabela numa grade, como nos editores de texto. */
const InserirTabela: React.FC<{ onInserir: (linhas: number, colunas: number) => void }> = ({ onInserir }) => {
  const [aberto, setAberto] = useState(false);
  const [hover, setHover] = useState({ l: 3, c: 3 });
  const MAX = 8;
  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <Botao titulo="Inserir tabela">
          <TableIcon className="h-4 w-4" />
        </Botao>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" onOpenAutoFocus={(e) => e.preventDefault()}>
        <p className="mb-2 text-xs font-medium text-slate-500">
          Tabela {hover.l} × {hover.c} <span className="font-normal">(1ª linha é cabeçalho)</span>
        </p>
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${MAX}, 1.25rem)` }}>
          {Array.from({ length: MAX * MAX }, (_, i) => {
            const l = Math.floor(i / MAX) + 1;
            const c = (i % MAX) + 1;
            const marcado = l <= hover.l && c <= hover.c;
            return (
              <button
                key={i}
                type="button"
                aria-label={`${l} linhas por ${c} colunas`}
                onMouseEnter={() => setHover({ l, c })}
                onFocus={() => setHover({ l, c })}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onInserir(l, c);
                  setAberto(false);
                }}
                className={cn(
                  "h-5 w-5 rounded-sm border",
                  marcado ? "border-[#5f2ebe] bg-[#5f2ebe]/20" : "border-slate-200 bg-white"
                )}
              />
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const EditarLink: React.FC<{ editor: Editor }> = ({ editor }) => {
  const [aberto, setAberto] = useState(false);
  const [url, setUrl] = useState("");
  const [novaAba, setNovaAba] = useState(true);
  const ativo = editor.isActive("link");

  const abrir = (estado: boolean) => {
    if (estado) {
      const attrs = editor.getAttributes("link");
      setUrl(attrs.href || "");
      setNovaAba(attrs.target ? attrs.target === "_blank" : true);
    }
    setAberto(estado);
  };

  const aplicar = () => {
    let href = url.trim();
    if (!href) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setAberto(false);
      return;
    }
    if (!/^(https?:|mailto:|tel:|\/|#)/i.test(href)) href = `https://${href}`;
    const attrs = { href, target: novaAba ? "_blank" : null, rel: novaAba ? "noopener noreferrer" : null };
    if (editor.state.selection.empty && !ativo) {
      // Sem texto selecionado: insere o próprio endereço como texto do link
      editor.chain().focus().insertContent({ type: "text", text: href, marks: [{ type: "link", attrs }] }).run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink(attrs as { href: string }).run();
    }
    setAberto(false);
  };

  return (
    <>
      <Popover open={aberto} onOpenChange={abrir}>
        <PopoverTrigger asChild>
          <Botao titulo={ativo ? "Editar link" : "Inserir link"} ativo={ativo}>
            <LinkIcon className="h-4 w-4" />
          </Botao>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3">
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              aplicar();
            }}
          >
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500" htmlFor="tiptap-link-url">
                Endereço do link
              </label>
              <Input
                id="tiptap-link-url"
                autoFocus
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://site-do-orgao.gov.br/edital.pdf"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={novaAba} onChange={(e) => setNovaAba(e.target.checked)} />
              Abrir em nova aba
            </label>
            <div className="flex justify-end gap-2">
              {ativo && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    editor.chain().focus().extendMarkRange("link").unsetLink().run();
                    setAberto(false);
                  }}
                >
                  Remover link
                </Button>
              )}
              <Button type="submit" size="sm" className="bg-[#5f2ebe] hover:bg-[#5f2ebe]/90">
                Aplicar
              </Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>
      {ativo && (
        <Botao titulo="Remover link" onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}>
          <Unlink className="h-4 w-4" />
        </Botao>
      )}
    </>
  );
};

const InserirImagem: React.FC<{ editor: Editor; onUpload: (f: File) => Promise<string | null> }> = ({ editor, onUpload }) => {
  const [aberto, setAberto] = useState(false);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [enviando, setEnviando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const inserir = (src: string, texto: string) => {
    editor.chain().focus().setImage({ src, alt: texto || undefined }).run();
    setAberto(false);
    setUrl("");
    setAlt("");
  };

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <Botao titulo="Inserir imagem">
          <ImageIcon className="h-4 w-4" />
        </Botao>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-3 p-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setEnviando(true);
            const src = await onUpload(file);
            setEnviando(false);
            if (src) inserir(src, alt || file.name.replace(/\.[^.]+$/, ""));
          }}
        />
        <Button type="button" variant="outline" className="w-full" disabled={enviando} onClick={() => inputRef.current?.click()}>
          {enviando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {enviando ? "Enviando..." : "Enviar do computador"}
        </Button>
        <div className="relative text-center text-xs text-slate-400">
          <span className="bg-white px-2">ou cole o endereço</span>
        </div>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        <Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Descrição da imagem (acessibilidade e SEO)" />
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            className="bg-[#5f2ebe] hover:bg-[#5f2ebe]/90"
            disabled={!/^https?:\/\//i.test(url.trim())}
            onClick={() => inserir(url.trim(), alt.trim())}
          >
            Inserir
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

/** Barra que aparece quando o cursor está dentro de uma tabela. */
const BarraTabela: React.FC<{ editor: Editor }> = ({ editor }) => {
  const c = () => editor.chain().focus();
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-t border-slate-100 bg-[#faf8ff] px-2 py-1 text-xs">
      <span className="mr-1 flex items-center gap-1 font-medium text-[#5f2ebe]">
        <TableIcon className="h-3.5 w-3.5" /> Tabela
      </span>
      <Separador />
      <Botao titulo="Inserir linha acima" onClick={() => c().addRowBefore().run()}>
        <ArrowUpToLine className="h-4 w-4" />
      </Botao>
      <Botao titulo="Inserir linha abaixo" onClick={() => c().addRowAfter().run()}>
        <ArrowDownToLine className="h-4 w-4" />
      </Botao>
      <Botao titulo="Excluir linha" onClick={() => c().deleteRow().run()} className="hover:text-red-600">
        <Rows3 className="h-4 w-4" />
        <Minus className="-ml-1 h-3 w-3" />
      </Botao>
      <Separador />
      <Botao titulo="Inserir coluna à esquerda" onClick={() => c().addColumnBefore().run()}>
        <ArrowLeftToLine className="h-4 w-4" />
      </Botao>
      <Botao titulo="Inserir coluna à direita" onClick={() => c().addColumnAfter().run()}>
        <ArrowRightToLine className="h-4 w-4" />
      </Botao>
      <Botao titulo="Excluir coluna" onClick={() => c().deleteColumn().run()} className="hover:text-red-600">
        <Columns3 className="h-4 w-4" />
        <Minus className="-ml-1 h-3 w-3" />
      </Botao>
      <Separador />
      <Botao titulo="Mesclar células selecionadas" desativado={!editor.can().mergeCells()} onClick={() => c().mergeCells().run()}>
        <Merge className="h-4 w-4" />
      </Botao>
      <Botao titulo="Dividir célula" desativado={!editor.can().splitCell()} onClick={() => c().splitCell().run()}>
        <Split className="h-4 w-4" />
      </Botao>
      <Botao titulo="Primeira linha como cabeçalho (liga/desliga)" onClick={() => c().toggleHeaderRow().run()}>
        <PanelTop className="h-4 w-4" />
      </Botao>
      <Popover>
        <PopoverTrigger asChild>
          <Botao titulo="Cor de fundo da célula">
            <PaintBucket className="h-4 w-4" />
          </Botao>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" onOpenAutoFocus={(e) => e.preventDefault()}>
          <div className="space-y-0.5">
            {CORES_CELULA.map((cor) => (
              <button
                key={cor.valor}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => c().setTableCellBackground(cor.valor).run()}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-slate-100"
              >
                <span className="h-4 w-4 rounded border border-black/10" style={{ backgroundColor: cor.valor }} />
                {cor.nome}
              </button>
            ))}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => c().setTableCellBackground("").run()}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-slate-500 hover:bg-slate-100"
            >
              <span className="h-4 w-4 rounded border border-dashed border-slate-300" />
              Sem cor
            </button>
          </div>
        </PopoverContent>
      </Popover>
      <span className="flex-1" />
      <Botao titulo="Excluir tabela" onClick={() => c().deleteTable().run()} className="text-red-500 hover:bg-red-50 hover:text-red-600">
        <Trash2 className="h-4 w-4" />
        <span className="hidden sm:inline">Excluir tabela</span>
      </Botao>
    </div>
  );
};

/* --------------------------------------------------------------------------
 * Editor
 * ------------------------------------------------------------------------ */

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
  content,
  onChange,
  placeholder,
  variante = "post",
  bucket = "blog-images",
  rotulo,
}) => {
  const questao = variante === "questao";
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modoHtml, setModoHtml] = useState(false);
  const [html, setHtml] = useState("");
  const [substituindo, setSubstituindo] = useState(false);
  // Último HTML que o próprio editor emitiu: evita recarregar o conteúdo
  // (e perder o cursor) quando a prop volta igual ao que acabou de sair daqui.
  const ultimoHtml = useRef<string>(content || "");
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Table.configure({ resizable: true, lastColumnResizable: false, allowTableNodeSelection: true }),
      TableRow,
      TableCell,
      TableHeader,
      Image.configure({ allowBase64: true }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder: placeholder || "Escreva o post aqui. Use Título 2 para dividir em seções." }),
      CodeBlockLowlight.configure({ lowlight }),
      QuestionExtension,
      TableCellBackground,
    ],
    content: content || "",
    editorProps: {
      attributes: { class: "post-prose", spellcheck: "true", ...(rotulo ? { "aria-label": rotulo } : {}) },
      transformPastedHTML: limparHtmlColado,
    },
    onUpdate: ({ editor }) => {
      const atual = editor.isEmpty ? "" : editor.getHTML();
      ultimoHtml.current = atual;
      onChangeRef.current(atual);
    },
  });

  // Conteúdo trocado de fora (abrir outro post, importar JSON, gerar via PDF)
  useEffect(() => {
    if (!editor) return;
    const novo = content || "";
    if (novo === ultimoHtml.current) return;
    ultimoHtml.current = novo;
    editor.commands.setContent(novo, false);
  }, [editor, content]);

  // ESC sai da tela cheia; a página não rola por trás do editor
  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsFullscreen(false);
    document.addEventListener("keydown", onKey);
    document.body.classList.add("overflow-hidden");
    editor?.commands.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("overflow-hidden");
    };
  }, [isFullscreen, editor]);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}.${fileExt}`;
      const { error } = await supabase.storage.from(bucket).upload(filePath, file);
      if (error) {
        console.error("Erro ao fazer upload:", error);
        alert(`Erro ao enviar a imagem. Verifique se o bucket "${bucket}" existe e tem permissão de upload.`);
        return null;
      }
      return supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      alert(error instanceof Error ? error.message : "Erro ao enviar a imagem");
      return null;
    }
  }, [bucket]);

  // Mesmo caminho da digitação no textarea do modo HTML
  const trocarHtml = (novo: string) => {
    setHtml(novo);
    ultimoHtml.current = novo;
    onChangeRef.current(novo);
  };

  const alternarHtml = () => {
    if (!editor) return;
    if (modoHtml) {
      editor.commands.setContent(html, true);
    } else {
      setHtml(formatarHtml(editor.getHTML()));
    }
    setModoHtml(!modoHtml);
  };

  if (!editor) return null;

  const blocoAtual = (() => {
    for (const nivel of [1, 2, 3, 4, 5, 6]) {
      if (editor.isActive("heading", { level: nivel })) return `h${nivel}`;
    }
    if (editor.isActive("codeBlock")) return "code";
    return "p";
  })();

  const mudarBloco = (valor: string) => {
    const c = editor.chain().focus();
    if (valor === "p") c.setParagraph().run();
    else if (valor === "code") c.toggleCodeBlock().run();
    else c.setHeading({ level: Number(valor.slice(1)) as 1 | 2 | 3 | 4 | 5 | 6 }).run();
  };

  const estilo = editor.getAttributes("textStyle");
  const fonteAtual = FONTES.find((f) => f.value && f.value === estilo.fontFamily)?.value ?? (estilo.fontFamily || "");
  const tamanhoAtual = (estilo.fontSize as string) || "";
  const dentroDeTabela = editor.isActive("table");
  const palavras = editor.state.doc.textContent.split(/\s+/).filter(Boolean).length;

  return (
    <div className={cn("post-editor", questao && "post-editor--questao", isFullscreen && "post-editor--fullscreen")}>
      <div className="post-editor__toolbar">
        <div className="flex flex-wrap items-center gap-1 px-2 py-1.5">
          <Grupo>
            <Botao titulo="Desfazer (Ctrl+Z)" desativado={modoHtml || !editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
              <Undo2 className="h-4 w-4" />
            </Botao>
            <Botao titulo="Refazer (Ctrl+Shift+Z)" desativado={modoHtml || !editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
              <Redo2 className="h-4 w-4" />
            </Botao>
          </Grupo>
          <Separador />
          <fieldset disabled={modoHtml} className="contents">
            {!questao && (
            <SeletorNativo titulo="Estilo do parágrafo" value={blocoAtual} onChange={mudarBloco} className="w-[9.5rem]">
              <option value="p">Texto normal</option>
              <option value="h2">Título 2 (seção)</option>
              <option value="h3">Título 3 (subseção)</option>
              <option value="h4">Título 4</option>
              <option value="h1">Título 1 (evite)</option>
              {(blocoAtual === "h5" || blocoAtual === "h6") && <option value={blocoAtual}>Título {blocoAtual.slice(1)}</option>}
              <option value="code">Código</option>
            </SeletorNativo>
            )}
            {!questao && (
            <>
            <SeletorNativo
              titulo="Fonte"
              value={fonteAtual}
              onChange={(v) => (v ? editor.chain().focus().setFontFamily(v).run() : editor.chain().focus().unsetFontFamily().run())}
              className="hidden w-[8.5rem] md:block"
            >
              {FONTES.map((f) => (
                <option key={f.label} value={f.value}>
                  {f.label}
                </option>
              ))}
              {fonteAtual && !FONTES.some((f) => f.value === fonteAtual) && <option value={fonteAtual}>{fonteAtual.split(",")[0]}</option>}
            </SeletorNativo>
            <SeletorNativo
              titulo="Tamanho do texto"
              value={tamanhoAtual}
              onChange={(v) => (v ? editor.chain().focus().setFontSize(v).run() : editor.chain().focus().unsetFontSize().run())}
              className="w-[6.75rem]"
            >
              {TAMANHOS.map((t) => (
                <option key={t || "padrao"} value={t}>
                  {t ? t.replace("px", "") : "Tamanho"}
                </option>
              ))}
              {tamanhoAtual && !TAMANHOS.includes(tamanhoAtual) && <option value={tamanhoAtual}>{tamanhoAtual}</option>}
            </SeletorNativo>
            </>
            )}
            <Separador />
            <Grupo>
              <Botao titulo="Negrito (Ctrl+B)" ativo={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
                <BoldIcon className="h-4 w-4" />
              </Botao>
              <Botao titulo="Itálico (Ctrl+I)" ativo={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
                <Italic className="h-4 w-4" />
              </Botao>
              <Botao titulo="Sublinhado (Ctrl+U)" ativo={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
                <UnderlineIcon className="h-4 w-4" />
              </Botao>
              <Botao titulo="Tachado" ativo={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
                <Strikethrough className="h-4 w-4" />
              </Botao>
              <PaletaCores
                titulo="Cor do texto"
                icone={<Palette className="h-4 w-4" />}
                cores={CORES_TEXTO}
                corAtual={estilo.color}
                onEscolher={(cor) => editor.chain().focus().setColor(cor).run()}
                onLimpar={() => editor.chain().focus().unsetColor().run()}
              />
              <PaletaCores
                titulo="Marca-texto"
                icone={<Highlighter className="h-4 w-4" />}
                cores={CORES_MARCA_TEXTO}
                corAtual={editor.getAttributes("highlight").color}
                onEscolher={(cor) => editor.chain().focus().setHighlight({ color: cor }).run()}
                onLimpar={() => editor.chain().focus().unsetHighlight().run()}
              />
            </Grupo>
            <Separador />
            <Grupo>
              <Botao titulo="Alinhar à esquerda" ativo={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
                <AlignLeft className="h-4 w-4" />
              </Botao>
              <Botao titulo="Centralizar" ativo={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
                <AlignCenter className="h-4 w-4" />
              </Botao>
              <Botao titulo="Alinhar à direita" ativo={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
                <AlignRight className="h-4 w-4" />
              </Botao>
              <Botao titulo="Justificar" ativo={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
                <AlignJustify className="h-4 w-4" />
              </Botao>
            </Grupo>
            <Separador />
            <Grupo>
              <Botao titulo="Lista com marcadores" ativo={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                <List className="h-4 w-4" />
              </Botao>
              <Botao titulo="Lista numerada" ativo={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                <ListOrdered className="h-4 w-4" />
              </Botao>
              <Botao titulo="Citação" ativo={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                <Quote className="h-4 w-4" />
              </Botao>
              <Botao titulo="Linha divisória" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                <Minus className="h-4 w-4" />
              </Botao>
            </Grupo>
            <Separador />
            <Grupo>
              <EditarLink editor={editor} />
              <InserirImagem editor={editor} onUpload={handleImageUpload} />
              <InserirTabela onInserir={(rows, cols) => editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()} />
              {!questao && (
              <Botao
                titulo="Inserir questão (pelo ID)"
                onClick={() => {
                  const questionId = window.prompt("ID da questão");
                  if (questionId?.trim()) editor.chain().focus().setQuestionNode({ questionId: questionId.trim() }).run();
                }}
              >
                <HelpCircle className="h-4 w-4" />
              </Botao>
              )}
            </Grupo>
            <Separador />
            <Botao titulo="Limpar formatação da seleção" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
              <RemoveFormatting className="h-4 w-4" />
            </Botao>
          </fieldset>
          <span className="flex-1" />
          <Grupo>
            <Botao
              titulo="Substituir em massa (vários textos de uma vez)"
              ativo={substituindo}
              onClick={() => setSubstituindo(!substituindo)}
            >
              <ReplaceAll className="h-4 w-4" />
              <span className="hidden text-xs font-medium lg:inline">Substituir</span>
            </Botao>
            <Botao titulo={modoHtml ? "Voltar ao editor visual" : "Editar o código HTML"} ativo={modoHtml} onClick={alternarHtml}>
              <Code2 className="h-4 w-4" />
              <span className="hidden text-xs font-medium lg:inline">HTML</span>
            </Botao>
            <Botao titulo={isFullscreen ? "Sair da tela cheia (Esc)" : "Tela cheia"} onClick={() => setIsFullscreen(!isFullscreen)}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Botao>
          </Grupo>
        </div>
        {dentroDeTabela && !modoHtml && <BarraTabela editor={editor} />}
        {substituindo && (
          <PainelSubstituirEmMassa
            alvo={modoHtml ? { tipo: "html", html, onTrocar: trocarHtml } : { tipo: "editor", editor }}
            onFechar={() => setSubstituindo(false)}
          />
        )}
      </div>

      <div className="post-editor__body">
        {modoHtml ? (
          <textarea
            className="post-editor__html"
            value={html}
            spellCheck={false}
            onChange={(e) => trocarHtml(e.target.value)}
            aria-label={questao ? "Código HTML" : "Código HTML do post"}
          />
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>

      <div className="post-editor__footer">
        <span>
          {palavras} {palavras === 1 ? "palavra" : "palavras"}
          {!questao && ` · ~${Math.max(1, Math.ceil(palavras / 200))} min de leitura`}
        </span>
        <span className="hidden sm:inline">
          {questao
            ? "Dica: cole o texto da prova direto, a formatação estranha é removida."
            : "Dica: cole textos de outros sites sem medo, as fontes e tamanhos fixos são removidos."}
        </span>
      </div>
    </div>
  );
};

/** Quebra o HTML em linhas por bloco para facilitar a edição manual. */
function formatarHtml(html: string): string {
  return html
    .replace(/></g, ">\n<")
    .replace(/\n<\/(strong|em|u|s|a|span|mark|code|b|i)>/g, "</$1>")
    .replace(/<(strong|em|u|s|a|span|mark|code|b|i)([^>]*)>\n/g, "<$1$2>")
    .replace(/>\n<(strong|em|u|s|a|span|mark|code|b|i)\b/g, "><$1")
    .trim();
}
