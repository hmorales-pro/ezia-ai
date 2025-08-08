"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { stripDataSlot } from "@/lib/strip-data-slot"

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  const cleanedProps = stripDataSlot(props);
  return <CollapsiblePrimitive.Root {...cleanedProps} />;
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  const cleanedProps = stripDataSlot(props);
  return <CollapsiblePrimitive.CollapsibleTrigger {...cleanedProps} />;
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  const cleanedProps = stripDataSlot(props);
  return <CollapsiblePrimitive.CollapsibleContent {...cleanedProps} />;
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
