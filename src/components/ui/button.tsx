
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-white",
  {
    variants: {
      variant: {
        default: "bg-primary text-white rounded-lg text-sm sm:text-base tracking-wider hover:bg-opacity-90 transition-all px-5 py-2 bg-gradient-to-r from-[#5f2ebe] to-[#7344d4] hover:shadow-lg hover:shadow-[#5f2ebe]/30 hover:-translate-y-1 border-b-2 border-[#491aa4] font-normal w-auto",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 px-5",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground text-foreground px-5",
        secondary:
          "bg-white text-[#5f2ebe] border-2 border-[#5f2ebe] hover:bg-[#5f2ebe]/10 hover:shadow-lg hover:shadow-[#5f2ebe]/20 hover:-translate-y-1 transition-all px-5",
        ghost: "hover:bg-accent hover:text-accent-foreground text-foreground px-5",
        link: "text-primary underline-offset-4 hover:underline px-5",
        hero: "text-white rounded-lg text-sm sm:text-base tracking-wider hover:bg-opacity-90 transition-all px-5 py-2 bg-gradient-to-r from-[#5f2ebe] to-[#7344d4] hover:shadow-lg hover:shadow-[#5f2ebe]/30 hover:-translate-y-1 border-b-2 border-[#491aa4] font-normal w-auto",
      },
      size: {
        default: "h-9 px-5 py-2",
        sm: "h-8 rounded-md px-5",
        lg: "h-10 rounded-md px-5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
