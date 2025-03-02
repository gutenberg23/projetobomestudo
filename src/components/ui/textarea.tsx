
import * as React from "react";
import { 
  Bold, 
  Italic, 
  Underline, 
  ListOrdered, 
  List, 
  Link, 
  Image, 
  Type, 
  Strikethrough 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const TextEditor = React.forwardRef<
  HTMLTextAreaElement,
  {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
  }
>(({ value, onChange, placeholder, className }, ref) => {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [selectedColor, setSelectedColor] = React.useState("#ea2be2");
  const colorPickerRef = React.useRef<HTMLDivElement>(null);
  const [showPlaceholder, setShowPlaceholder] = React.useState(!value);
  
  // Quando o valor muda externamente, atualizamos o HTML
  React.useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML && !editorRef.current.matches(":focus")) {
      editorRef.current.innerHTML = value;
      setShowPlaceholder(!value);
    }
  }, [value]);

  // Manipular a formatação do texto
  const handleFormatting = (format: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevenir comportamento padrão
    
    if (!editorRef.current) return;
    
    // Salva a seleção atual
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    
    if (!selection || !range || range.collapsed) return;
    
    // Aplica o comando de formatação diretamente no documento
    switch(format) {
      case 'bold':
        document.execCommand('bold', false);
        break;
      case 'italic':
        document.execCommand('italic', false);
        break;
      case 'underline':
        document.execCommand('underline', false);
        break;
      case 'strikethrough':
        document.execCommand('strikeThrough', false);
        break;
      case 'ordered-list':
        document.execCommand('insertOrderedList', false);
        break;
      case 'bullet-list':
        document.execCommand('insertUnorderedList', false);
        break;
      case 'link':
        const url = prompt("Digite a URL do link:", "https://");
        if (url) {
          document.execCommand('createLink', false, url);
        }
        break;
      case 'image':
        const imageUrl = prompt("Digite a URL da imagem:", "https://");
        if (imageUrl) {
          document.execCommand('insertImage', false, imageUrl);
        }
        break;
      case 'color':
        setShowColorPicker(!showColorPicker);
        break;
    }
    
    // Atualiza o valor depois da formatação
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const applyColor = (color: string) => {
    setSelectedColor(color);
    setShowColorPicker(false);
    
    if (!editorRef.current) return;
    
    document.execCommand('foreColor', false, color);
    
    // Atualiza o valor depois da formatação
    onChange(editorRef.current.innerHTML);
  };

  // Handle clicks outside of color picker to close it
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle input to track changes and update the value
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      setShowPlaceholder(!editorRef.current.textContent);
    }
  };

  // Quando colar texto, limpar a formatação
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    
    // Inserir como texto plano
    document.execCommand('insertText', false, text);
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-1 p-2 bg-white border border-b-0 rounded-t-md">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={(e) => handleFormatting('bold', e)}
          className="h-8 w-8 p-0"
          title="Negrito"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={(e) => handleFormatting('italic', e)}
          className="h-8 w-8 p-0"
          title="Itálico"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={(e) => handleFormatting('underline', e)}
          className="h-8 w-8 p-0"
          title="Sublinhado"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={(e) => handleFormatting('strikethrough', e)}
          className="h-8 w-8 p-0"
          title="Tachado"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={(e) => handleFormatting('ordered-list', e)}
          className="h-8 w-8 p-0"
          title="Lista Ordenada"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={(e) => handleFormatting('bullet-list', e)}
          className="h-8 w-8 p-0"
          title="Lista com Marcadores"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={(e) => handleFormatting('link', e)}
          className="h-8 w-8 p-0"
          title="Inserir Link"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={(e) => handleFormatting('image', e)}
          className="h-8 w-8 p-0"
          title="Inserir Imagem"
        >
          <Image className="h-4 w-4" />
        </Button>
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onMouseDown={(e) => handleFormatting('color', e)}
            className="h-8 w-8 p-0"
            title="Cor do Texto"
            style={{ 
              borderBottom: `3px solid ${selectedColor}`,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0
            }}
          >
            <Type className="h-4 w-4" />
          </Button>
          {showColorPicker && (
            <div 
              ref={colorPickerRef}
              className="absolute top-full left-0 z-50 p-2 bg-white border rounded shadow-lg mt-1 w-56"
            >
              <div className="flex flex-wrap gap-1">
                {['#ea2be2', '#272f3c', '#67748a', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff', '#000000'].map(color => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: color }}
                    onClick={() => applyColor(color)}
                    title={color}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-8 h-8"
                />
                <input
                  type="text"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="ml-2 p-1 border rounded flex-1 text-xs"
                />
                <Button 
                  size="sm" 
                  className="ml-2"
                  onClick={() => applyColor(selectedColor)}
                >
                  Aplicar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div 
        className={cn(
          "min-h-[200px] w-full rounded-b-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm relative",
          className
        )}
        contentEditable
        ref={editorRef}
        onInput={handleInput}
        onPaste={handlePaste}
        style={{ overflowY: 'auto' }}
      />
      
      {/* Placeholder element */}
      {showPlaceholder && placeholder && (
        <div 
          className="absolute pointer-events-none text-muted-foreground px-3 py-2 text-base md:text-sm" 
          style={{
            top: 'calc(2.25rem + 2px)', // Height of the toolbar + border
            left: 0
          }}
        >
          {placeholder}
        </div>
      )}

      {/* Hidden textarea for form compatibility */}
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ display: 'none' }}
      />
    </div>
  );
});

TextEditor.displayName = "TextEditor";

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, value, onChange, placeholder, ...props }, ref) => {
    // Se o componente tiver um onChange, renderizamos o editor de texto
    if (onChange && value !== undefined) {
      return (
        <TextEditor
          ref={ref}
          value={value as string}
          onChange={(newValue) => {
            if (onChange) {
              const event = {
                target: { value: newValue }
              } as React.ChangeEvent<HTMLTextAreaElement>;
              onChange(event);
            }
          }}
          placeholder={placeholder}
          className={className}
        />
      )
    }
    
    // Caso contrário, renderizamos apenas o textarea normal
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Textarea.displayName = "Textarea";

export { Textarea };
