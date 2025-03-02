
import * as React from "react"
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

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
  const handleFormatting = (format: string) => {
    if (!ref || typeof ref === 'function' || !ref.current) return;
    
    const textarea = ref.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let formattedText = "";
    let newCursorPos = end;
    
    switch(format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        newCursorPos = start + formattedText.length;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        newCursorPos = start + formattedText.length;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        newCursorPos = start + formattedText.length;
        break;
      case 'strikethrough':
        formattedText = `~~${selectedText}~~`;
        newCursorPos = start + formattedText.length;
        break;
      case 'ordered-list':
        if (selectedText) {
          const lines = selectedText.split('\n');
          formattedText = lines.map((line, i) => `${i + 1}. ${line}`).join('\n');
        } else {
          formattedText = "1. ";
        }
        newCursorPos = start + formattedText.length;
        break;
      case 'bullet-list':
        if (selectedText) {
          const lines = selectedText.split('\n');
          formattedText = lines.map(line => `• ${line}`).join('\n');
        } else {
          formattedText = "• ";
        }
        newCursorPos = start + formattedText.length;
        break;
      case 'link':
        const url = prompt("Digite a URL do link:", "https://");
        if (url) {
          formattedText = `[${selectedText || "Link"}](${url})`;
          newCursorPos = start + formattedText.length;
        } else {
          return;
        }
        break;
      case 'image':
        const imageUrl = prompt("Digite a URL da imagem:", "https://");
        if (imageUrl) {
          formattedText = `![${selectedText || "Imagem"}](${imageUrl})`;
          newCursorPos = start + formattedText.length;
        } else {
          return;
        }
        break;
      case 'color':
        const color = prompt("Digite a cor (ex: #FF0000, red, etc.):", "#ea2be2");
        if (color) {
          formattedText = `<span style="color:${color}">${selectedText}</span>`;
          newCursorPos = start + formattedText.length;
        } else {
          return;
        }
        break;
    }
    
    const newValue = 
      value.substring(0, start) + 
      formattedText + 
      value.substring(end);
    
    onChange(newValue);
    
    // Restaurar o foco e posicionar o cursor após a operação
    setTimeout(() => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.focus();
        ref.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  return (
    <div className="flex flex-col space-y-0">
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleFormatting('color')}
          className="h-8 w-8 p-0"
          title="Cor do Texto"
        >
          <Type className="h-4 w-4" />
        </Button>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "min-h-[80px] w-full rounded-b-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
      />
    </div>
  )
})

TextEditor.displayName = "TextEditor"

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

Textarea.displayName = "Textarea"

export { Textarea }
