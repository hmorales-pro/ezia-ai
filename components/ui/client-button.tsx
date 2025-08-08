"use client";

import * as React from "react";
import { Button as BaseButton } from "./button";

// Client-side wrapper for Button to avoid SSR issues with event handlers
export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof BaseButton>
>((props, ref) => {
  return <BaseButton ref={ref} {...props} />;
});

Button.displayName = "Button";