"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"
import { stripDataSlot } from "@/lib/strip-data-slot"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  const cleanedProps = stripDataSlot(props);
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#6D3FC8] data-[state=checked]:to-[#5A35A5] data-[state=unchecked]:bg-gray-200 focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-gray-700 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
        className
      )}
      {...cleanedProps}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "bg-white pointer-events-none block size-4 rounded-full ring-0 shadow-sm transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
