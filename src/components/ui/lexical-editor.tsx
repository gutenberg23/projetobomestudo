
import React, { useEffect, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/RichTextPlugin";
import { ContentEditable } from "@lexical/react/ContentEditable";
import { HistoryPlugin } from "@lexical/react/HistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/AutoFocusPlugin";
import { LinkPlugin } from "@lexical/react/LinkPlugin";
import { ListPlugin } from "@lexical/react/ListPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $createParagraphNode, $createTextNode, EditorState } from "lexical";
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
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { $isListNode, ListItemNode, ListNode } from "@lexical/list";
import { $patchStyleText } from "@lexical/selection";
import { $getNearestNodeOfType } from "@lexical/utils";

// Tema para o editor
const theme = {
  ltr: "ltr",
  rtl: "rtl",
  paragraph: "mb-1",
  quote: "border-l-4 border-gray-300 pl-4 mb-1",
  heading: {
    h1: "text-2xl font-bold",
    h2: "text-xl font-bold",
    h3: "text-lg font-bold",
  },
  list: {
    ol: "list-decimal pl-5 mb-1",
    ul: "list-disc pl-5 mb-1",
    nested: {
      listitem: "pl-1",
    },
    listitem: "mb-0.5",
  },
  image: "w-full max-w-full",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "bg-gray-100 p-1 rounded font-mono",
  }
};

// Plugin para atualizar o onChange passado
function OnChangePlugin({ onChange }: { onChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        // Converte o estado do editor para HTML
        const htmlElement = document.createElement('div');
        const root = $getRoot();
        const children = root.getChildren();
        
        if (children.length === 0) {
          onChange('');
        } else {
          // Converte para HTML
          const fragment = document.createDocumentFragment();
          children.forEach(node => {
            const el = node.createDOM(document);
            fragment.appendChild(el);
          });
          
          htmlElement.appendChild(fragment);
          onChange(htmlElement.innerHTML);
        }
      });
    });
  }, [editor, onChange]);
  
  return null;
}

// Plugin para definir o valor inicial
function InitialValuePlugin({ initialValue }: { initialValue: string }) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    if (initialValue) {
      editor.update(() => {
        const root = $getRoot();
        
        // Limpa o conteúdo atual
        root.clear();
        
        // Cria um contêiner temporário para processar o HTML
        const container = document.createElement('div');
        container.innerHTML = initialValue;
        
        // Converte elementos HTML para nós Lexical
        const paragraphs = container.children.length ? container.children : [container];
        
        for (let i = 0; i < paragraphs.length; i++) {
          const paragraphNode = $createParagraphNode();
          const textContent = paragraphs[i].textContent || '';
          
          if (textContent) {
            const textNode = $createTextNode(textContent);
            
            // Aplicar formatação se necessário
            if (paragraphs[i].style.fontWeight === 'bold' || paragraphs[i].tagName === 'STRONG') {
              textNode.setFormat('bold');
            }
            if (paragraphs[i].style.fontStyle === 'italic' || paragraphs[i].tagName === 'EM') {
              textNode.setFormat('italic');
            }
            if (paragraphs[i].style.textDecoration === 'underline' || paragraphs[i].tagName === 'U') {
              textNode.setFormat('underline');
            }
            if (paragraphs[i].style.textDecoration === 'line-through' || paragraphs[i].tagName === 'S') {
              textNode.setFormat('strikethrough');
            }
            
            paragraphNode.append(textNode);
          }
          
          root.append(paragraphNode);
        }
      });
    }
  }, [editor, initialValue]);
  
  return null;
}

// Plugin para os botões de formatação
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#ea2be2");
  const colorPickerRef = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
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
  
  const applyFormat = (formatType: string, e: React.MouseEvent) => {
    e.preventDefault();
    
    editor.update(() => {
      switch(formatType) {
        case 'bold':
          // Aplica negrito ao texto selecionado
          $patchStyleText(
            { [formatType]: true }
          );
          break;
        case 'italic':
          // Aplica itálico ao texto selecionado
          $patchStyleText(
            { [formatType]: true }
          );
          break;
        case 'underline':
          // Aplica sublinhado ao texto selecionado
          $patchStyleText(
            { [formatType]: true }
          );
          break;
        case 'strikethrough':
          // Aplica tachado ao texto selecionado
          $patchStyleText(
            { [formatType]: true }
          );
          break;
        case 'ordered-list':
          // Converte em lista ordenada
          editor.dispatchCommand(formatType, undefined);
          break;
        case 'bullet-list':
          // Converte em lista de marcadores
          editor.dispatchCommand(formatType, undefined);
          break;
        case 'link':
          const url = prompt("Digite a URL do link:", "https://");
          if (url) {
            editor.dispatchCommand('link', url);
          }
          break;
        case 'image':
          const imageUrl = prompt("Digite a URL da imagem:", "https://");
          if (imageUrl) {
            editor.dispatchCommand('image', imageUrl);
          }
          break;
        case 'color':
          setShowColorPicker(!showColorPicker);
          return;
      }
    });
  };
  
  const applyColor = (color: string) => {
    setSelectedColor(color);
    setShowColorPicker(false);
    
    editor.update(() => {
      $patchStyleText({
        color: color
      });
    });
  };
  
  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-white border border-b-0 rounded-t-md">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onMouseDown={(e) => applyFormat('bold', e)}
        className="h-8 w-8 p-0"
        title="Negrito"
        aria-label="Negrito"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onMouseDown={(e) => applyFormat('italic', e)}
        className="h-8 w-8 p-0"
        title="Itálico"
        aria-label="Itálico"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onMouseDown={(e) => applyFormat('underline', e)}
        className="h-8 w-8 p-0"
        title="Sublinhado"
        aria-label="Sublinhado"
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onMouseDown={(e) => applyFormat('strikethrough', e)}
        className="h-8 w-8 p-0"
        title="Tachado"
        aria-label="Tachado"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onMouseDown={(e) => applyFormat('ordered-list', e)}
        className="h-8 w-8 p-0"
        title="Lista Ordenada"
        aria-label="Lista Ordenada"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onMouseDown={(e) => applyFormat('bullet-list', e)}
        className="h-8 w-8 p-0"
        title="Lista com Marcadores"
        aria-label="Lista com Marcadores"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onMouseDown={(e) => applyFormat('link', e)}
        className="h-8 w-8 p-0"
        title="Inserir Link"
        aria-label="Inserir Link"
      >
        <Link className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onMouseDown={(e) => applyFormat('image', e)}
        className="h-8 w-8 p-0"
        title="Inserir Imagem"
        aria-label="Inserir Imagem"
      >
        <Image className="h-4 w-4" />
      </Button>
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={(e) => applyFormat('color', e)}
          className="h-8 w-8 p-0"
          title="Cor do Texto"
          aria-label="Cor do Texto"
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
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyColor(color);
                  }}
                  title={color}
                  type="button"
                  aria-label={`Selecionar cor ${color}`}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-8 h-8"
                aria-label="Selecionar cor personalizada"
              />
              <input
                type="text"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="ml-2 p-1 border rounded flex-1 text-xs"
                aria-label="Código da cor"
              />
              <Button 
                type="button"
                size="sm" 
                className="ml-2"
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyColor(selectedColor);
                }}
                aria-label="Aplicar cor selecionada"
              >
                Aplicar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export interface LexicalEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  minHeight?: string; // altura mínima do editor
}

export function LexicalEditor({
  value,
  onChange,
  placeholder,
  className,
  id,
  name,
  minHeight = "200px",
}: LexicalEditorProps) {
  // Configuração inicial para o editor
  const initialConfig = {
    namespace: id || "editor",
    theme,
    onError: (error: Error) => {
      console.error(error);
    },
    nodes: [ListNode, ListItemNode]
  };
  
  return (
    <div className="flex flex-col relative">
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className={cn(
          "w-full rounded-b-md border border-input bg-background px-3 py-2 text-base ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )} style={{ minHeight }}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className="outline-none" 
                style={{ minHeight }} 
                id={id} 
                aria-label={placeholder}
              />
            }
            placeholder={
              <div className="absolute pointer-events-none text-muted-foreground px-3 py-2 text-base md:text-sm">
                {placeholder}
              </div>
            }
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <AutoFocusPlugin />
          <OnChangePlugin onChange={onChange} />
          <InitialValuePlugin initialValue={value} />
        </div>
        
        {/* Input escondido para compatibilidade com formulários */}
        <input type="hidden" name={name} value={value} id={id} />
      </LexicalComposer>
    </div>
  );
}
