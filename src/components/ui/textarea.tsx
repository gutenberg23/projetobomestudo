import * as React from "react";
import { cn } from "@/lib/utils";
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, Link2, Image, Palette } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./dropdown-menu";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  richText?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, richText = false, ...props }, ref) => {
    const [value, setValue] = React.useState(props.value as string || "");
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
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

    const applyFormat = (format: string) => {
      if (!textareaRef.current) return;

      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);

      let formattedText = "";
      let cursorPosition = 0;

      switch (format) {
        case "bold":
          formattedText = `**${selectedText}**`;
          cursorPosition = 2;
          break;
        case "italic":
          formattedText = `*${selectedText}*`;
          cursorPosition = 1;
          break;
        case "underline":
          formattedText = `__${selectedText}__`;
          cursorPosition = 2;
          break;
        case "strikethrough":
          formattedText = `~~${selectedText}~~`;
          cursorPosition = 2;
          break;
        case "ul":
          formattedText = selectedText
            .split("\n")
            .map(line => `- ${line}`)
            .join("\n");
          cursorPosition = 2;
          break;
        case "ol":
          formattedText = selectedText
            .split("\n")
            .map((line, i) => `${i + 1}. ${line}`)
            .join("\n");
          cursorPosition = 3;
          break;
        case "link":
          formattedText = `[${selectedText}](url)`;
          cursorPosition = selectedText.length + 3;
          break;
        case "image":
          formattedText = `![${selectedText}](url)`;
          cursorPosition = selectedText.length + 4;
          break;
        case "color":
          const colors = ["red", "blue", "green", "yellow", "purple"];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          formattedText = `<span style="color:${randomColor}">${selectedText}</span>`;
          cursorPosition = formattedText.length - 7 - selectedText.length;
          break;
      }

      const newValue = 
        textarea.value.substring(0, start) + 
        formattedText + 
        textarea.value.substring(end);
      
      // Create a synthetic event
      const syntheticEvent = {
        target: { 
          ...textarea,
          value: newValue 
        }
      } as React.ChangeEvent<HTMLTextAreaElement>;
      
      // Update the value
      setValue(newValue);
      props.onChange?.(syntheticEvent);
      
      // Set focus back to textarea
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + formattedText.length - (selectedText ? 0 : cursorPosition),
          start + formattedText.length - (selectedText ? 0 : cursorPosition)
        );
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
            onClick={() => applyFormat("bold")}
            className="p-1 hover:bg-gray-200 rounded"
            title="Negrito"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            onClick={() => applyFormat("italic")}
            className="p-1 hover:bg-gray-200 rounded"
            title="Itálico"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            onClick={() => applyFormat("underline")}
            className="p-1 hover:bg-gray-200 rounded"
            title="Sublinhado"
          >
            <Underline size={16} />
          </button>
          <button
            type="button"
            onClick={() => applyFormat("strikethrough")}
            className="p-1 hover:bg-gray-200 rounded"
            title="Tachado"
          >
            <Strikethrough size={16} />
          </button>
          <button
            type="button"
            onClick={() => applyFormat("ul")}
            className="p-1 hover:bg-gray-200 rounded"
            title="Lista com marcadores"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            onClick={() => applyFormat("ol")}
            className="p-1 hover:bg-gray-200 rounded"
            title="Lista numerada"
          >
            <ListOrdered size={16} />
          </button>
          <button
            type="button"
            onClick={() => applyFormat("link")}
            className="p-1 hover:bg-gray-200 rounded"
            title="Link"
          >
            <Link2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => applyFormat("image")}
            className="p-1 hover:bg-gray-200 rounded"
            title="Imagem"
          >
            <Image size={16} />
          </button>
          <button
            type="button"
            onClick={() => applyFormat("color")}
            className="p-1 hover:bg-gray-200 rounded"
            title="Cor do texto"
          >
            <Palette size={16} />
          </button>
        </div>
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-b-md border-x border-b border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
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
