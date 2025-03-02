
import * as React from "react";
import { cn } from "@/lib/utils";
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, Link2, Image, Palette } from "lucide-react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  richText?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, richText = false, ...props }, ref) => {
    const [value, setValue] = React.useState(props.value as string || "");
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const editorRef = React.useRef<HTMLDivElement>(null);
    const mergedRef = React.useMemo(() => {
      return (node: HTMLTextAreaElement) => {
        textareaRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      };
    }, [ref]);

    React.useEffect(() => {
      setValue(props.value as string || "");
    }, [props.value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
      props.onChange?.(e);
    };

    const handleEditorChange = (e: React.FormEvent<HTMLDivElement>) => {
      if (!editorRef.current) return;
      
      const content = editorRef.current.innerHTML;
      
      // Criar um evento sintético para simular a mudança do textarea
      const syntheticEvent = {
        target: { 
          value: content 
        }
      } as React.ChangeEvent<HTMLTextAreaElement>;
      
      setValue(content);
      props.onChange?.(syntheticEvent);
    };

    const execCommand = (command: string, value: string = "") => {
      document.execCommand(command, false, value);
      
      if (editorRef.current) {
        // Atualizar o valor quando um comando é executado
        const content = editorRef.current.innerHTML;
        
        // Criar um evento sintético
        const syntheticEvent = {
          target: { 
            value: content 
          }
        } as React.ChangeEvent<HTMLTextAreaElement>;
        
        setValue(content);
        props.onChange?.(syntheticEvent);
      }
      
      // Focar de volta no editor
      setTimeout(() => {
        editorRef.current?.focus();
      }, 0);
    };

    if (!richText) {
      return (
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          ref={ref}
          {...props}
        />
      );
    }

    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-wrap gap-1 p-1 bg-[#f6f8fa] rounded-t-md border border-input">
          <button
            type="button"
            onClick={() => execCommand('bold')}
            className="p-1 hover:bg-gray-200 rounded"
            title="Negrito"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            onClick={() => execCommand('italic')}
            className="p-1 hover:bg-gray-200 rounded"
            title="Itálico"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            onClick={() => execCommand('underline')}
            className="p-1 hover:bg-gray-200 rounded"
            title="Sublinhado"
          >
            <Underline size={16} />
          </button>
          <button
            type="button"
            onClick={() => execCommand('strikeThrough')}
            className="p-1 hover:bg-gray-200 rounded"
            title="Tachado"
          >
            <Strikethrough size={16} />
          </button>
          <button
            type="button"
            onClick={() => execCommand('insertUnorderedList')}
            className="p-1 hover:bg-gray-200 rounded"
            title="Lista com marcadores"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            onClick={() => execCommand('insertOrderedList')}
            className="p-1 hover:bg-gray-200 rounded"
            title="Lista numerada"
          >
            <ListOrdered size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              const url = prompt('Insira o URL do link:');
              if (url) execCommand('createLink', url);
            }}
            className="p-1 hover:bg-gray-200 rounded"
            title="Link"
          >
            <Link2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              const url = prompt('Insira o URL da imagem:');
              if (url) execCommand('insertImage', url);
            }}
            className="p-1 hover:bg-gray-200 rounded"
            title="Imagem"
          >
            <Image size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              const colors = ["red", "blue", "green", "yellow", "purple"];
              const randomColor = colors[Math.floor(Math.random() * colors.length)];
              execCommand('foreColor', randomColor);
            }}
            className="p-1 hover:bg-gray-200 rounded"
            title="Cor do texto"
          >
            <Palette size={16} />
          </button>
        </div>
        
        {/* Editor de conteúdo rico */}
        <div
          ref={editorRef}
          contentEditable
          className={cn(
            "flex min-h-[80px] w-full rounded-b-md border-x border-b border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm overflow-auto",
            className
          )}
          onInput={handleEditorChange}
          onBlur={handleEditorChange}
          dangerouslySetInnerHTML={{ __html: value }}
        ></div>
        
        {/* Textarea oculto para manter compatibilidade com o formulário */}
        <textarea
          className="hidden"
          ref={mergedRef}
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
