import React, { useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import Underline from '@tiptap/extension-underline';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Highlight from '@tiptap/extension-highlight';
import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Image as ImageIcon,
  Table as TableIcon,
  Type,
  Highlighter
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface FormularioConteudoProps {
  conteudo: string;
  onChangeConteudo: (value: string) => void;
}

export const FormularioConteudo: React.FC<FormularioConteudoProps> = ({
  conteudo,
  onChangeConteudo
}) => {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isToolbarFixed, setIsToolbarFixed] = React.useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (toolbarRef.current) {
        const toolbarPosition = toolbarRef.current.getBoundingClientRect().top;
        setIsToolbarFixed(toolbarPosition <= 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5]
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'table']
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg',
        },
      }),
      TextStyle.configure({
        HTMLAttributes: {
          class: 'font-size',
        },
      }),
      Color,
      ListItem,
      Underline,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
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
          class: 'border border-gray-300 p-2 bg-gray-100 font-bold',
        },
      }),
      Highlight.configure({
        multicolor: true
      })
    ],
    content: conteudo,
    onUpdate: ({ editor }) => {
      onChangeConteudo(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
      },
    }
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const input = event.currentTarget;
    
    if (!input.files || input.files.length === 0 || !editor) {
      return;
    }

    const file = input.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `posts/content/${fileName}`;

    try {
      const { error: uploadError, data } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      editor.chain().focus().setImage({ src: publicUrl }).run();
      
      input.value = '';
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
    }
  };

  const setFontSize = (size: string) => {
    if (!editor) return;
    
    editor
      .chain()
      .focus()
      .setMark('textStyle', { style: `font-size: ${size}` })
      .run();
  };

  const insertTable = () => {
    if (!editor) return;

    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold text-[#272f3c] mb-4">Conteúdo</h3>
      <div className="space-y-4">
        <div className="bg-white border rounded-md p-2 space-y-2">
          <div className="sticky top-0 z-50 bg-white border-b">
            <div className="flex flex-wrap gap-2 pb-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={editor.isActive('bold') ? 'bg-gray-200' : ''}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={editor.isActive('italic') ? 'bg-gray-200' : ''}
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={editor.isActive('underline') ? 'bg-gray-200' : ''}
                >
                  <UnderlineIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={editor.isActive('strike') ? 'bg-gray-200' : ''}
                >
                  <Strikethrough className="h-4 w-4" />
                </Button>
              </div>

              <div className="w-px h-6 bg-gray-200" />

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().setTextAlign('left').run()}
                  className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().setTextAlign('center').run()}
                  className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().setTextAlign('right').run()}
                  className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="w-px h-6 bg-gray-200" />

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </div>

              <div className="w-px h-6 bg-gray-200" />

              <div className="flex items-center gap-2">
                <Select
                  value={editor.isActive('heading') ? `h${editor.getAttributes('heading').level}` : 'p'}
                  onValueChange={(value) => {
                    if (value === 'p') {
                      editor.chain().focus().setParagraph().run();
                    } else {
                      const level = parseInt(value[1]) as 1 | 2 | 3 | 4 | 5;
                      editor.chain().focus().toggleHeading({ level }).run();
                    }
                  }}
                >
                  <SelectTrigger className="w-[130px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="p">Parágrafo</SelectItem>
                    <SelectItem value="h1">Título 1</SelectItem>
                    <SelectItem value="h2">Título 2</SelectItem>
                    <SelectItem value="h3">Título 3</SelectItem>
                    <SelectItem value="h4">Título 4</SelectItem>
                    <SelectItem value="h5">Título 5</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={editor.getAttributes('textStyle').style?.match(/font-size: (\d+px)/)?.[1] || '16px'}
                  onValueChange={setFontSize}
                >
                  <SelectTrigger className="w-[100px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12px">12px</SelectItem>
                    <SelectItem value="14px">14px</SelectItem>
                    <SelectItem value="16px">16px</SelectItem>
                    <SelectItem value="18px">18px</SelectItem>
                    <SelectItem value="20px">20px</SelectItem>
                    <SelectItem value="24px">24px</SelectItem>
                    <SelectItem value="30px">30px</SelectItem>
                    <SelectItem value="36px">36px</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-px h-6 bg-gray-200" />

              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  className="w-8 h-8 p-1"
                  value={editor.getAttributes('textStyle').color || '#000000'}
                  onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                />
                <Input
                  type="color"
                  className="w-8 h-8 p-1"
                  value={editor.getAttributes('highlight').color || '#ffffff'}
                  onChange={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()}
                />
              </div>

              <div className="w-px h-6 bg-gray-200" />

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={insertTable}
                  className={editor.isActive('table') ? 'bg-gray-200' : ''}
                >
                  <TableIcon className="h-4 w-4" />
                </Button>
                <form className="inline" onSubmit={(e) => e.preventDefault()}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => document.getElementById('imageUpload')?.click()}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    onClick={(e) => e.stopPropagation()}
                  />
                </form>
              </div>
            </div>
          </div>
          <style dangerouslySetInnerHTML={{ __html: `
            .ProseMirror {
              min-height: 300px;
              padding: 1rem;
            }
            
            .ProseMirror:focus {
              outline: none;
            }

            .ProseMirror h1 {
              font-size: 2.5em;
              font-weight: bold;
              margin-bottom: 0.5em;
            }

            .ProseMirror h2 {
              font-size: 2em;
              font-weight: bold;
              margin-bottom: 0.5em;
            }

            .ProseMirror h3 {
              font-size: 1.75em;
              font-weight: bold;
              margin-bottom: 0.5em;
            }

            .ProseMirror h4 {
              font-size: 1.5em;
              font-weight: bold;
              margin-bottom: 0.5em;
            }

            .ProseMirror h5 {
              font-size: 1.25em;
              font-weight: bold;
              margin-bottom: 0.5em;
            }

            .ProseMirror p {
              margin-bottom: 0.5em;
            }

            .ProseMirror ul {
              list-style-type: disc;
              padding-left: 1.5em;
              margin-bottom: 0.5em;
            }

            .ProseMirror ol {
              list-style-type: decimal;
              padding-left: 1.5em;
              margin-bottom: 0.5em;
            }

            .ProseMirror table {
              border-collapse: collapse;
              margin: 0;
              overflow: hidden;
              table-layout: fixed;
              width: 100%;
              margin-bottom: 0.5em;
            }

            .ProseMirror table td,
            .ProseMirror table th {
              border: 2px solid #ced4da;
              box-sizing: border-box;
              min-width: 1em;
              padding: 0.5em;
              position: relative;
              vertical-align: top;
            }

            .ProseMirror table th {
              background-color: #f8f9fa;
              font-weight: bold;
            }

            .ProseMirror img {
              max-width: 100%;
              height: auto;
              border-radius: 0.5rem;
              margin: 1em 0;
            }

            .ProseMirror [style*="font-size"] {
              line-height: 1.4;
            }
          `}} />
          <EditorContent editor={editor} className="min-h-[300px] prose max-w-none" />
        </div>
      </div>
    </div>
  );
};
