
import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { 
  Bold, Italic, Strikethrough, 
  List, ListOrdered, Image as ImageIcon, 
  Palette, AlignLeft, AlignCenter, AlignRight, 
  Link, Table, Heading1, Heading2, Heading3
} from "lucide-react";
import LinkDialog from "./LinkDialog";
import TableDialog from "./TableDialog";

interface RichTextToolbarProps {
  editor: Editor;
}

const colors = [
  '#ea2be2', // Tom principal (roxo/magenta)
  '#272f3c', // Cor para títulos
  '#67748a', // Cor para parágrafos
  '#FF0000', // Vermelho
  '#0000FF', // Azul
  '#008000', // Verde
  '#FFA500', // Laranja
  '#800080', // Roxo
  '#000000'  // Preto
];

const RichTextToolbar: React.FC<RichTextToolbarProps> = ({ editor }) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [linkInitialText, setLinkInitialText] = useState("");
  const [linkInitialUrl, setLinkInitialUrl] = useState("");

  // Função para adicionar uma imagem ao editor
  const addImage = () => {
    const url = prompt('Insira o URL da imagem:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  // Função para abrir o diálogo de link
  const openLinkDialog = () => {
    if (editor) {
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, ' ');
      setLinkInitialText(selectedText);
      
      // Se o link estiver ativo, pegue o URL
      if (editor.isActive('link')) {
        const attrs = editor.getAttributes('link');
        setLinkInitialUrl(attrs.href || "");
      } else {
        setLinkInitialUrl("");
      }

      setIsLinkDialogOpen(true);
    }
  };

  // Função para adicionar ou atualizar um link
  const addLink = (url: string, text: string) => {
    if (editor) {
      // Se tiver texto selecionado, apenas aplique o link
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;
      
      if (!hasSelection && text) {
        // Se não houver seleção, mas temos texto do diálogo, insira-o
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${url}">${text}</a>`)
          .run();
      } else {
        // Se houver seleção, aplique o link à seleção
        editor
          .chain()
          .focus()
          .setLink({ href: url })
          .run();
      }
    }
  };

  // Função para inserir uma tabela
  const insertTable = (rows: number, cols: number) => {
    if (editor) {
      editor
        .chain()
        .focus()
        .insertTable({ rows, cols, withHeaderRow: true })
        .run();
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-1 p-1 bg-[#f6f8fa] rounded-t-md border border-input">
        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(
            "p-1 hover:bg-gray-200 rounded", 
            { "bg-gray-200": editor.isActive('heading', { level: 1 }) }
          )}
          title="Título H1"
        >
          <Heading1 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            "p-1 hover:bg-gray-200 rounded", 
            { "bg-gray-200": editor.isActive('heading', { level: 2 }) }
          )}
          title="Título H2"
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(
            "p-1 hover:bg-gray-200 rounded", 
            { "bg-gray-200": editor.isActive('heading', { level: 3 }) }
          )}
          title="Título H3"
        >
          <Heading3 size={16} />
        </button>
        
        <div className="h-6 mx-1 border-r border-gray-300"></div>
        
        {/* Formatação de texto */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "p-1 hover:bg-gray-200 rounded", 
            { "bg-gray-200": editor.isActive('bold') }
          )}
          title="Negrito"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "p-1 hover:bg-gray-200 rounded", 
            { "bg-gray-200": editor.isActive('italic') }
          )}
          title="Itálico"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(
            "p-1 hover:bg-gray-200 rounded", 
            { "bg-gray-200": editor.isActive('strike') }
          )}
          title="Tachado"
        >
          <Strikethrough size={16} />
        </button>
        
        <div className="h-6 mx-1 border-r border-gray-300"></div>
        
        {/* Listas */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "p-1 hover:bg-gray-200 rounded", 
            { "bg-gray-200": editor.isActive('bulletList') }
          )}
          title="Lista com marcadores"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "p-1 hover:bg-gray-200 rounded", 
            { "bg-gray-200": editor.isActive('orderedList') }
          )}
          title="Lista numerada"
        >
          <ListOrdered size={16} />
        </button>
        
        <div className="h-6 mx-1 border-r border-gray-300"></div>
        
        {/* Mídia e Links */}
        <button
          type="button"
          onClick={addImage}
          className={cn(
            "p-1 hover:bg-gray-200 rounded"
          )}
          title="Imagem"
        >
          <ImageIcon size={16} />
        </button>
        
        <button
          type="button"
          onClick={openLinkDialog}
          className={cn(
            "p-1 hover:bg-gray-200 rounded",
            { "bg-gray-200": editor.isActive('link') }
          )}
          title="Link"
        >
          <Link size={16} />
        </button>
        
        <button
          type="button"
          onClick={() => setIsTableDialogOpen(true)}
          className={cn(
            "p-1 hover:bg-gray-200 rounded"
          )}
          title="Tabela"
        >
          <Table size={16} />
        </button>
        
        <div className="h-6 mx-1 border-r border-gray-300"></div>
        
        {/* Dropdown de cores */}
        <div className="relative inline-block">
          <button
            type="button"
            onClick={(e) => {
              const dropdown = e.currentTarget.nextElementSibling;
              if (dropdown) {
                dropdown.classList.toggle('hidden');
              }
            }}
            className="p-1 hover:bg-gray-200 rounded"
            title="Cor do texto"
          >
            <Palette size={16} />
          </button>
          <div className="hidden absolute z-10 mt-1 p-2 bg-white border border-gray-200 rounded-md shadow-lg flex flex-wrap gap-1 w-[120px]">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  editor.chain().focus().setColor(color).run();
                  const dropdown = document.querySelector('.relative.inline-block .hidden');
                  if (dropdown) {
                    dropdown.classList.add('hidden');
                  }
                }}
                className="w-5 h-5 border border-gray-300 rounded-sm"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
        
        <div className="h-6 mx-1 border-r border-gray-300"></div>
        
        {/* Alinhamento de texto */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={cn(
            "p-1 hover:bg-gray-200 rounded", 
            { "bg-gray-200": editor.isActive({ textAlign: 'left' }) }
          )}
          title="Alinhar à esquerda"
        >
          <AlignLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={cn(
            "p-1 hover:bg-gray-200 rounded", 
            { "bg-gray-200": editor.isActive({ textAlign: 'center' }) }
          )}
          title="Centralizar"
        >
          <AlignCenter size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={cn(
            "p-1 hover:bg-gray-200 rounded", 
            { "bg-gray-200": editor.isActive({ textAlign: 'right' }) }
          )}
          title="Alinhar à direita"
        >
          <AlignRight size={16} />
        </button>
      </div>

      {/* Diálogos para links e tabelas */}
      <LinkDialog 
        isOpen={isLinkDialogOpen}
        setIsOpen={setIsLinkDialogOpen}
        onConfirm={addLink}
        initialText={linkInitialText}
        initialUrl={linkInitialUrl}
      />
      
      <TableDialog
        isOpen={isTableDialogOpen}
        setIsOpen={setIsTableDialogOpen}
        onConfirm={insertTable}
      />
    </>
  );
};

export default RichTextToolbar;
