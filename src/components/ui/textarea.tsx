
import * as React from "react";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "./rich-text";

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

    const handleRichTextChange = (html: string) => {
      setValue(html);
      
      // Criar um evento sintético para simular a mudança do textarea
      const syntheticEvent = {
        target: { 
          value: html 
        }
      } as React.ChangeEvent<HTMLTextAreaElement>;
      
      props.onChange?.(syntheticEvent);
    };

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
      <div className="w-full">
        <RichTextEditor 
          value={value} 
          onChange={handleRichTextChange} 
          className={className}
        />
        
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
