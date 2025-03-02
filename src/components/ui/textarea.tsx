
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

    // Função para inicializar o editor com o conteúdo atual e colocar o cursor no final
    React.useEffect(() => {
      if (editorRef.current && richText) {
        // Inicializar o editor com o valor atual
        editorRef.current.innerHTML = value;
      }
    }, [richText, value]);

    // Função para manter o cursor na posição correta após alterações
    const setEndOfContentEditable = (contentEditableElement: HTMLElement) => {
      // Cria uma range e uma seleção
      const range = document.createRange();
      const selection = window.getSelection();
      
      // Define a range no final do elemento
      range.selectNodeContents(contentEditableElement);
      range.collapse(false); // false significa colapsar para o final
      
      // Remove qualquer seleção existente e adiciona a nova
      selection?.removeAllRanges();
      selection?.addRange(range);
    };

    const handleEditorChange = () => {
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
      // Garantir que o editor tem foco antes de executar o comando
      if (editorRef.current) {
        editorRef.current.focus();
        
        // Salvar a seleção atual
        const selection = window.getSelection();
        const savedRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        
        // Executar o comando
        document.execCommand(command, false, value);
        
        // Restaurar a seleção após o comando, se necessário
        if (savedRange && ["insertUnorderedList", "insertOrderedList"].includes(command)) {
          // Para listas, garantimos que o cursor permanece visível
          setTimeout(() => {
            if (editorRef.current) {
              editorRef.current.focus();
            }
          }, 10);
        }
        
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
    };

    const handleColorSelection = () => {
      // Array de cores predefinidas para escolha
      const colors = [
        "#FF0000", // Vermelho
        "#0000FF", // Azul
        "#008000", // Verde
        "#FFA500", // Laranja
        "#800080", // Roxo
        "#000000"  // Preto
      ];
      
      // Criar e mostrar um elemento de seleção de cores
      const colorPickerContainer = document.createElement("div");
      colorPickerContainer.style.position = "absolute";
      colorPickerContainer.style.display = "flex";
      colorPickerContainer.style.flexWrap = "wrap";
      colorPickerContainer.style.width = "150px";
      colorPickerContainer.style.padding = "5px";
      colorPickerContainer.style.background = "#fff";
      colorPickerContainer.style.border = "1px solid #ccc";
      colorPickerContainer.style.borderRadius = "4px";
      colorPickerContainer.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
      colorPickerContainer.style.zIndex = "1000";
      
      // Posicionar próximo ao botão de cores
      if (editorRef.current) {
        const editorRect = editorRef.current.getBoundingClientRect();
        colorPickerContainer.style.top = `${editorRect.top}px`;
        colorPickerContainer.style.left = `${editorRect.left + 50}px`;
      }
      
      // Adicionar botões de cores
      colors.forEach(color => {
        const colorButton = document.createElement("div");
        colorButton.style.width = "20px";
        colorButton.style.height = "20px";
        colorButton.style.margin = "5px";
        colorButton.style.backgroundColor = color;
        colorButton.style.cursor = "pointer";
        colorButton.style.border = "1px solid #ddd";
        
        colorButton.onclick = () => {
          // Salvar a seleção antes de executar o comando
          const selection = window.getSelection();
          const savedRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
          
          if (savedRange && editorRef.current) {
            // Restaurar a seleção
            selection?.removeAllRanges();
            selection?.addRange(savedRange);
            
            // Executar o comando na seleção restaurada
            execCommand("foreColor", color);
          } else {
            execCommand("foreColor", color);
          }
          
          // Remover o seletor de cores
          document.body.removeChild(colorPickerContainer);
        };
        
        colorPickerContainer.appendChild(colorButton);
      });
      
      // Fechar o seletor quando clicar fora dele
      document.addEventListener("click", function closeColorPicker(e) {
        if (!colorPickerContainer.contains(e.target as Node)) {
          if (document.body.contains(colorPickerContainer)) {
            document.body.removeChild(colorPickerContainer);
          }
          document.removeEventListener("click", closeColorPicker);
        }
      });
      
      document.body.appendChild(colorPickerContainer);
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
            onClick={handleColorSelection}
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
          onFocus={() => {
            // Se estiver vazio, colocar o cursor no início
            if (editorRef.current && (!editorRef.current.textContent || editorRef.current.textContent.trim() === '')) {
              setEndOfContentEditable(editorRef.current);
            }
          }}
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
