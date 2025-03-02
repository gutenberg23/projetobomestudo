
import React from "react";
import { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { 
  Bold, Italic, Strikethrough, 
  List, ListOrdered, Image as ImageIcon, 
  Palette, AlignLeft, AlignCenter, AlignRight 
} from "lucide-react";

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
  // Função para adicionar uma imagem ao editor
  const addImage = () => {
    const url = prompt('Insira o URL da imagem:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
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
  );
};

export default RichTextToolbar;
