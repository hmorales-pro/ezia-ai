"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"
import { stripDataSlot } from "@/lib/strip-data-slot"

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  const cleanedProps = stripDataSlot(props);
  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...cleanedProps}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  const cleanedProps = stripDataSlot(props);
  return (
    <AvatarPrimitive.Image
      className={cn("aspect-square size-full", className)}
      {...cleanedProps}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  const cleanedProps = stripDataSlot(props);
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...cleanedProps}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
