import React, { useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Bold from '@tiptap/extension-bold';
import { createLowlight } from 'lowlight';
import js from 'highlight.js/lib/languages/javascript';
import { Button } from '@/components/ui/button';
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
  Quote,
  RemoveFormatting,
  Copy,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Square,
  HelpCircle,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { QuestionExtension } from '@/components/editor/QuestionExtension';
import { TableCellBackground } from '@/components/editor/TableCellBackground';
import './TiptapEditor.css';

const lowlight = createLowlight();
lowlight.register('js', js);

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({ content, onChange }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-4',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-4',
          },
        },
      }),
      Bold,
      TextStyle,
      Color,
      FontFamily,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300',
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 p-2',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 p-2 bg-gray-100',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Strike,
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'bg-yellow-200',
        },
      }),
      Placeholder.configure({
        placeholder: 'Comece a escrever...',
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gray-100 p-4 rounded-md',
        },
      }),
      QuestionExtension,
      TableCellBackground,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Atualizar o conteúdo do editor quando a prop content mudar, mas apenas se for diferente
  useEffect(() => {
    if (editor && content !== undefined && content !== null) {
      // Verificar se o conteúdo atual do editor é diferente do conteúdo recebido
      const currentContent = editor.getHTML();
      // Remover espaços em branco e quebras de linha para comparação mais precisa
      const normalizedCurrent = currentContent.replace(/\s+/g, ' ').trim();
      const normalizedContent = (content || '').replace(/\s+/g, ' ').trim();
      
      // Só atualizar se o conteúdo for realmente diferente
      if (normalizedCurrent !== normalizedContent) {
        console.log('Atualizando conteúdo do editor:', content);
        editor.commands.setContent(content || '');
      }
    }
  }, [editor, content]);

  // Efeito para lidar com a tecla ESC para sair do modo tela cheia
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscKey);
      // Adicionar classe ao body para esconder scrollbars
      document.body.classList.add('overflow-hidden');
    } else {
      // Remover classe do body
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      // Remover classe do body
      document.body.classList.remove('overflow-hidden');
    };
  }, [isFullscreen]);

  // Efeito para garantir que o editor tenha a altura correta em modo tela cheia
  useEffect(() => {
    if (isFullscreen && editor) {
      // Forçar re-renderização do editor
      setTimeout(() => {
        editor.commands.focus();
      }, 100);
    }
  }, [isFullscreen, editor]);

  // Efeito para atualizar o conteúdo quando sair do modo tela cheia
  useEffect(() => {
    if (!isFullscreen && editor && content) {
      // Verificar se o conteúdo atual do editor é diferente do conteúdo recebido
      const currentContent = editor.getHTML();
      // Remover espaços em branco e quebras de linha para comparação mais precisa
      const normalizedCurrent = currentContent.replace(/\s+/g, ' ').trim();
      const normalizedContent = (content || '').replace(/\s+/g, ' ').trim();
      
      // Só atualizar se o conteúdo for realmente diferente
      if (normalizedCurrent !== normalizedContent) {
        // Atualizar o conteúdo quando sair do modo tela cheia
        editor.commands.setContent(content);
      }
    }
  }, [isFullscreen, editor, content]);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Configuração do Supabase não encontrada. Por favor, configure o arquivo .env com suas credenciais.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Erro ao fazer upload:', uploadError);
        alert('Erro ao fazer upload da imagem. Verifique se o bucket "blog-images" existe e se as permissões estão configuradas corretamente.');
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      alert(error instanceof Error ? error.message : 'Erro ao fazer upload da imagem');
      return null;
    }
  }, []);

  const addImage = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        const url = await handleImageUpload(file);
        if (url) {
          editor?.chain().focus().setImage({ src: url, alt: file.name }).run();
        }
      }
    };
    input.click();
  }, [editor, handleImageUpload]);

  const addLink = useCallback(() => {
    const url = window.prompt('URL do link');
    if (url) {
      if (editor?.isActive('link')) {
        editor.chain().focus().unsetLink().run();
      } else {
        editor?.chain().focus().setLink({ href: url }).run();
      }
    }
  }, [editor]);

  const addTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const addQuestion = useCallback(() => {
    const questionId = window.prompt('ID da Questão');
    if (questionId) {
      editor?.chain().focus().setQuestionNode({ questionId }).run();
    }
  }, [editor]);

  // Função para alternar o modo tela cheia
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`border rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 m-0 rounded-none border-0' : ''}`}>
      <div className="border-b p-2 flex flex-wrap gap-2 bg-gray-50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200' : ''}
        >
          <BoldIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'bg-gray-200' : ''}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'bg-gray-200' : ''}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200' : ''}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addTable}
        >
          <TableIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addImage}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addLink}
          className={editor.isActive('link') ? 'bg-gray-200' : ''}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addQuestion}
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-gray-200' : ''}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        >
          <RemoveFormatting className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const selection = editor.state.selection;
            const node = editor.state.doc.nodeAt(selection.from);
            if (node) {
              navigator.clipboard.writeText(JSON.stringify({
                type: node.type.name,
                marks: node.marks.map(mark => ({
                  type: mark.type.name,
                  attrs: mark.attrs,
                })),
                attrs: node.attrs,
              }));
            }
          }}
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={editor.isActive('heading', { level: 4 }) ? 'bg-gray-200' : ''}
        >
          <Heading4 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          className={editor.isActive('heading', { level: 5 }) ? 'bg-gray-200' : ''}
        >
          <Heading5 className="h-4 w-4" />
        </Button>
        <select
          className="border rounded px-2 py-1 text-sm"
          onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
        </select>
        <input
          type="color"
          className="w-8 h-8 rounded cursor-pointer"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        />
        <input
          type="color"
          className="w-8 h-8 rounded cursor-pointer"
          onChange={(e) => editor.chain().focus().setHighlight({ color: e.target.value }).run()}
        />
        
        {/* Table cell background color selector */}
        <div className="flex items-center gap-1">
          <Square className="h-4 w-4" />
          <select
            className="border rounded px-2 py-1 text-sm"
            onChange={(e) => {
              if (editor && e.target.value) {
                editor.chain().focus().setTableCellBackground(e.target.value).run();
              }
            }}
            defaultValue=""
          >
            <option value="">Cor de fundo da célula</option>
            <option value="">Padrão</option>
            <option value="rgb(95, 46, 190)">Roxo</option>
            <option value="rgb(226, 232, 240)">Cinza claro</option>
            <option value="rgb(254, 252, 232)">Amarelo</option>
            <option value="rgb(219, 234, 254)">Azul</option>
            <option value="rgb(220, 252, 231)">Verde</option>
            <option value="rgb(254, 226, 226)">Vermelho</option>
          </select>
        </div>
        
        {/* Botão de tela cheia */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Sair da tela cheia" : "Entrar na tela cheia"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
      <div className={`editor-content ${isFullscreen ? 'flex-1 overflow-y-auto p-4' : ''}`}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};