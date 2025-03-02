
import * as React from "react";
import { cn } from "@/lib/utils";
import { LexicalEditor } from "./lexical-editor";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, value, onChange, placeholder, id, name, ...props }, ref) => {
    // Se o componente tiver um onChange, renderizamos o editor Lexical
    if (onChange && value !== undefined) {
      return (
        <LexicalEditor
          id={id}
          name={name}
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
          minHeight={props.style?.height as string || "200px"}
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
        id={id}
        name={name}
        placeholder={placeholder}
        {...props}
      />
    )
  }
)

Textarea.displayName = "Textarea";

export { Textarea };
