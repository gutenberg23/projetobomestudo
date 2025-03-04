
import * as React from "react"
import { cn } from "@/lib/utils"
import { RichTextEditor } from "./rich-text"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  richText?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, richText = false, ...props }, ref) => {
    if (richText) {
      return (
        <RichTextEditor
          content={props.value as string || ""}
          onChange={(value) => {
            // Create a synthetic event to mimic the textarea onChange
            const syntheticEvent = {
              target: {
                value
              }
            } as React.ChangeEvent<HTMLTextAreaElement>
            
            if (props.onChange) {
              props.onChange(syntheticEvent)
            }
          }}
          className={cn(
            "min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        />
      )
    }
    
    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
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
