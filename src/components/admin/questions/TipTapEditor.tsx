import React, { forwardRef, ForwardRefRenderFunction } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { Toggle } from '@/components/ui/toggle';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  List,
  ListOrdered,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface TipTapEditorProps {
  content: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const TipTapEditorComponent: ForwardRefRenderFunction<HTMLDivElement, TipTapEditorProps> = (
  { content, onChange, placeholder = 'Digite o conteúdo aqui...' },
  ref
) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'min-h-[150px] border border-input bg-background rounded-md p-3 focus-within:ring-1 focus-within:ring-ring focus-within:border-input outline-none',
      },
    },
  });

  const [linkUrl, setLinkUrl] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');

  const addLink = () => {
    if (!linkUrl) return;
    
    // Verifique se a URL começa com http:// ou https://
    const url = linkUrl.startsWith('http://') || linkUrl.startsWith('https://') 
      ? linkUrl 
      : `https://${linkUrl}`;
    
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    setLinkUrl('');
  };

  const addImage = () => {
    if (!imageUrl) return;
    editor?.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl('');
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full space-y-2" ref={ref}>
      <div className="flex flex-wrap gap-1 p-1 border border-input rounded-md bg-background mb-1">
        <Toggle
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          size="sm"
          aria-label="Negrito"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        
        <Toggle
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          size="sm"
          aria-label="Itálico"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        
        <Toggle
          pressed={editor.isActive('underline')}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          size="sm"
          aria-label="Sublinhado"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Toggle>

        <Toggle
          pressed={editor.isActive({ textAlign: 'left' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
          size="sm"
          aria-label="Alinhar à esquerda"
        >
          <AlignLeft className="h-4 w-4" />
        </Toggle>
        
        <Toggle
          pressed={editor.isActive({ textAlign: 'center' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
          size="sm"
          aria-label="Centralizar"
        >
          <AlignCenter className="h-4 w-4" />
        </Toggle>
        
        <Toggle
          pressed={editor.isActive({ textAlign: 'right' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
          size="sm"
          aria-label="Alinhar à direita"
        >
          <AlignRight className="h-4 w-4" />
        </Toggle>

        <Toggle
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          size="sm"
          aria-label="Lista com marcadores"
        >
          <List className="h-4 w-4" />
        </Toggle>
        
        <Toggle
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          size="sm"
          aria-label="Lista numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-2">
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-4">
              <h4 className="font-medium">Inserir Link</h4>
              <div className="space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <div className="flex gap-2">
                  <Input 
                    id="link-url" 
                    placeholder="https://exemplo.com" 
                    value={linkUrl} 
                    onChange={(e) => setLinkUrl(e.target.value)} 
                  />
                  <Button onClick={addLink}>Inserir</Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-2">
              <ImageIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-4">
              <h4 className="font-medium">Inserir Imagem</h4>
              <div className="space-y-2">
                <Label htmlFor="image-url">URL da Imagem</Label>
                <div className="flex gap-2">
                  <Input 
                    id="image-url" 
                    placeholder="https://exemplo.com/imagem.jpg" 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)} 
                  />
                  <Button onClick={addImage}>Inserir</Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <EditorContent 
        editor={editor} 
        className="min-h-[150px] focus:outline-none"
        placeholder={placeholder}
      />
    </div>
  );
};

const TipTapEditor = forwardRef(TipTapEditorComponent);

export default TipTapEditor; 