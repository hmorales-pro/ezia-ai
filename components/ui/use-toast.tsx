"use client"

import * as React from "react"
import { toast as sonnerToast } from "sonner"

export interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const toast = React.useCallback(({ title, description, variant }: ToastProps) => {
    const message = title || description
    if (variant === "destructive") {
      sonnerToast.error(message, {
        description: title ? description : undefined,
      })
    } else {
      sonnerToast.success(message, {
        description: title ? description : undefined,
      })
    }
  }, [])

  return { toast }
}