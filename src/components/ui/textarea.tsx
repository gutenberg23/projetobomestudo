
import * as React from "react";
import { cn } from "@/lib/utils";
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import { 
  Bold, Italic, Underline, Strikethrough, 
  List, ListOrdered, Link2, Image as ImageIcon, 
  Palette, AlignLeft, AlignCenter, AlignRight 
} from "lucide-react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  richText?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, richText = false, ...props }, ref) => {
    const [value, setValue] = React.useState(props.value as string || "");
    
    React.useEffect(() => {
      setValue(props.value as string || "");
    }, [props.value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
      props.onChange?.(e);
    };

    // Configuração do editor Tiptap
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          bulletList: {
            keepMarks: true,
            keepAttributes: false,
          },
          orderedList: {
            keepMarks: true,
            keepAttributes: false,
          },
        }),
        TextStyle,
        Color,
        Image.configure({
          inline: true,
          allowBase64: true,
        }),
      ],
      content: value,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        setValue(html);
        
        // Criar um evento sintético para simular a mudança do textarea
        const syntheticEvent = {
          target: { 
            value: html 
          }
        } as React.ChangeEvent<HTMLTextAreaElement>;
        
        props.onChange?.(syntheticEvent);
      },
    });

    // Função para adicionar uma imagem ao editor
    const addImage = () => {
      const url = prompt('Insira o URL da imagem:');
      if (url && editor) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    };

    // Cores para o seletor de cores
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

    if (!richText) {
      return (
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          ref={ref}
          value={value}
          onChange={handleChange}
          {...props}
        />
      );
    }

    return (
      <div className="flex flex-col gap-2 w-full font-inter">
        {editor && (
          <div className="flex flex-wrap gap-1 p-1 bg-[#f6f8fa] rounded-t-md border border-input">
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
        )}
        
        {/* Editor Tiptap */}
        <div className={cn(
          "rounded-b-md border-x border-b border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm overflow-auto",
          "min-h-[80px] w-full",
          className
        )}>
          {editor && <EditorContent editor={editor} />}
        </div>
        
        {/* Textarea oculto para manter compatibilidade com o formulário */}
        <textarea
          className="hidden"
          ref={ref}
          value={value}
          onChange={handleChange}
          {...props}
        />
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
