import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-full text-sm font-sans font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-red-500 text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 [&_svg]:!text-white",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        lightGray: "bg-gray-200/60 hover:bg-gray-200",
        link: "text-primary underline-offset-4 hover:underline",
        ghostDarker:
          "text-[#1E1E1E] shadow-xs focus-visible:ring-[#6D3FC8]/40 bg-[#666666]/10 hover:bg-[#666666]/20",
        black: "bg-[#1E1E1E] text-white hover:brightness-110",
        sky: "bg-sky-500 text-white hover:brightness-110",
        ezia: "bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] hover:from-[#5A35A5] hover:to-[#4A2B87] text-white border-0 shadow-lg hover:shadow-xl transition-all",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-full text-[13px] gap-1.5 px-3",
        lg: "h-10 rounded-full px-6 has-[>svg]:px-4",
        icon: "size-9",
        iconXs: "size-7",
        iconXss: "size-6",
        xs: "h-6 text-xs rounded-full pl-2 pr-2 gap-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
