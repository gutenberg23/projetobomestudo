
import * as React from "react"
import { Bold, Italic, Underline, ListOrdered, List, Link, Image, Type, Strikethrough } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const TextEditor = ({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void 
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const applyFormatting = (format: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let formattedText = "";
    let cursorAdjustment = 0;
    
    switch(format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        cursorAdjustment = 4;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        cursorAdjustment = 2;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        cursorAdjustment = 4;
        break;
      case 'strikethrough':
        formattedText = `~~${selectedText}~~`;
        cursorAdjustment = 4;
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
        const color = prompt("Digite a cor (ex: #FF0000, red, etc.):", "#ea2be2");
        if (color) {
          formattedText = `<span style="color:${color}">${selectedText}</span>`;
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
    
    // Ajusta a posição do cursor após a formatação
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        if (format !== 'link' && format !== 'image' && format !== 'color') {
          textarea.setSelectionRange(
            start + formattedText.length,
            start + formattedText.length
          );
        }
      }
    }, 0);
  };

  return (
    <div className="space-y-2">
      <div className="border rounded-md p-2 mb-2 bg-white">
        <div className="flex flex-wrap gap-2 mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyFormatting('bold')}
            type="button"
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyFormatting('italic')}
            type="button"
            className="h-8 w-8 p-0"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyFormatting('underline')}
            type="button"
            className="h-8 w-8 p-0"
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyFormatting('strikethrough')}
            type="button"
            className="h-8 w-8 p-0"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyFormatting('ordered-list')}
            type="button"
            className="h-8 w-8 p-0"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyFormatting('bullet-list')}
            type="button"
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyFormatting('link')}
            type="button"
            className="h-8 w-8 p-0"
          >
            <Link className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyFormatting('image')}
            type="button"
            className="h-8 w-8 p-0"
          >
            <Image className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyFormatting('color')}
            type="button"
            className="h-8 w-8 p-0"
          >
            <Type className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    // Se não houver onChange, passamos um valor padrão para evitar erros
    const hasOnChangeHandler = !!props.onChange;
    
    return (
      <div>
        {hasOnChangeHandler && props.value !== undefined && (
          <TextEditor 
            value={props.value as string} 
            onChange={(newValue) => {
              if (props.onChange) {
                const event = {
                  target: { value: newValue }
                } as React.ChangeEvent<HTMLTextAreaElement>;
                props.onChange(event);
              }
            }} 
          />
        )}
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
