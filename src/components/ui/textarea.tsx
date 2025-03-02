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
  const [htmlContent, setHtmlContent] = React.useState("");
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [selectedColor, setSelectedColor] = React.useState("#ea2be2");
  const colorPickerRef = React.useRef<HTMLDivElement>(null);
  
  // Forward the reference to our contentEditable div for external access
  const setRefs = React.useCallback((element: HTMLDivElement | null) => {
    editorRef.current = element;
    
    // Update forwarded ref if needed (we'll need to handle that differently)
    // This is a bit complex since we're using a div instead of textarea now
  }, []);

  // Convert markdown to HTML when value changes
  React.useEffect(() => {
    // Simple markdown-like to HTML conversion
    let html = value || "";
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Underline
    html = html.replace(/__(.*?)__/g, '<u>$1</u>');
    
    // Strikethrough
    html = html.replace(/~~(.*?)~~/g, '<s>$1</s>');
    
    // Ordered lists
    html = html.replace(/(\d+\.\s.*?)(?=\n\d+\.|$)/gs, '<ol><li>$1</li></ol>');
    
    // Unordered lists
    html = html.replace(/•\s(.*?)(?=\n•|$)/gs, '<ul><li>$1</li></ul>');
    
    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Images
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%;" />');
    
    // Colored text
    html = html.replace(/<span style="color:(.*?)">(.*?)<\/span>/g, '<span style="color:$1">$2</span>');
    
    setHtmlContent(html);
  }, [value]);

  const handleFormatting = (format: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    let formattedText = "";
    
    switch(format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      case 'strikethrough':
        formattedText = `~~${selectedText}~~`;
        break;
      case 'ordered-list':
        if (selectedText) {
          const lines = selectedText.split('\n');
          formattedText = lines.map((line, i) => `${i + 1}. ${line}`).join('\n');
        } else {
          formattedText = "1. ";
        }
        break;
      case 'bullet-list':
        if (selectedText) {
          const lines = selectedText.split('\n');
          formattedText = lines.map(line => `• ${line}`).join('\n');
        } else {
          formattedText = "• ";
        }
        break;
      case 'link':
        const url = prompt("Digite a URL do link:", "https://");
        if (url) {
          formattedText = `[${selectedText || "Link"}](${url})`;
        } else {
          return;
        }
        break;
      case 'image':
        const imageUrl = prompt("Digite a URL da imagem:", "https://");
        if (imageUrl) {
          formattedText = `![${selectedText || "Imagem"}](${imageUrl})`;
        } else {
          return;
        }
        break;
      case 'color':
        // Instead of prompting, we'll use our color picker
        setShowColorPicker(!showColorPicker);
        return;
    }
    
    if (!formattedText) return;
    
    // Get the current textarea value
    const textarea = document.createElement('textarea');
    textarea.innerHTML = value;
    const currentValue = textarea.value;
    
    // Find where in the string our selection is
    const fullText = editorRef.current?.innerText || "";
    const startPos = fullText.indexOf(selectedText);
    const endPos = startPos + selectedText.length;
    
    if (startPos === -1) return;
    
    // Replace the selected text with formatted text in the original value string
    const newValue = 
      currentValue.substring(0, startPos) + 
      formattedText + 
      currentValue.substring(endPos);
    
    onChange(newValue);
  };

  const applyColor = (color: string) => {
    setSelectedColor(color);
    setShowColorPicker(false);
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (!selectedText) return;
    
    // Get the current textarea value
    const textarea = document.createElement('textarea');
    textarea.innerHTML = value;
    const currentValue = textarea.value;
    
    // Find where in the string our selection is
    const fullText = editorRef.current?.innerText || "";
    const startPos = fullText.indexOf(selectedText);
    const endPos = startPos + selectedText.length;
    
    if (startPos === -1) return;
    
    // Create the colored text span
    const coloredText = `<span style="color:${color}">${selectedText}</span>`;
    
    // Replace the selected text with the colored text
    const newValue = 
      currentValue.substring(0, startPos) + 
      coloredText + 
      currentValue.substring(endPos);
    
    onChange(newValue);
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

  // Handle paste to strip HTML and keep only text
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Handle input to track changes and update the value
  const handleInput = () => {
    if (editorRef.current) {
      const newText = editorRef.current.innerText;
      onChange(newText);
    }
  };

  // Convert a textarea value to a contentEditable div
  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-1 p-2 bg-white border border-b-0 rounded-t-md">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleFormatting('bold')}
          className="h-8 w-8 p-0"
          title="Negrito"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleFormatting('italic')}
          className="h-8 w-8 p-0"
          title="Itálico"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleFormatting('underline')}
          className="h-8 w-8 p-0"
          title="Sublinhado"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleFormatting('strikethrough')}
          className="h-8 w-8 p-0"
          title="Tachado"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleFormatting('ordered-list')}
          className="h-8 w-8 p-0"
          title="Lista Ordenada"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleFormatting('bullet-list')}
          className="h-8 w-8 p-0"
          title="Lista com Marcadores"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleFormatting('link')}
          className="h-8 w-8 p-0"
          title="Inserir Link"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleFormatting('image')}
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
            onClick={() => handleFormatting('color')}
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
          "min-h-[200px] w-full rounded-b-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        contentEditable
        ref={editorRef}
        onInput={handleInput}
        onPaste={handlePaste}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        placeholder={placeholder}
        style={{ overflowY: 'auto' }}
      />

      {/* Hidden textarea for form compatibility */}
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ display: 'none' }}
        {...{} /* Forward any other props */}
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
