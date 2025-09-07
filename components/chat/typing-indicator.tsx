"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  isVisible: boolean;
  agentName?: string;
  className?: string;
}

export function TypingIndicator({ 
  isVisible, 
  agentName = "Ezia",
  className 
}: TypingIndicatorProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={cn("flex items-center gap-3", className)}
        >
          <Avatar className="h-8 w-8 border shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <Sparkles className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          
          <div className="bg-muted border rounded-2xl px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {agentName} est en train d'écrire
              </span>
              <div className="flex gap-1">
                <motion.div
                  animate={{ 
                    y: [0, -4, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 1.2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-1.5 h-1.5 bg-primary rounded-full"
                />
                <motion.div
                  animate={{ 
                    y: [0, -4, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 1.2, 
                    repeat: Infinity,
                    delay: 0.2,
                    ease: "easeInOut"
                  }}
                  className="w-1.5 h-1.5 bg-primary rounded-full"
                />
                <motion.div
                  animate={{ 
                    y: [0, -4, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 1.2, 
                    repeat: Infinity,
                    delay: 0.4,
                    ease: "easeInOut"
                  }}
                  className="w-1.5 h-1.5 bg-primary rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Variante simple pour les espaces restreints
export function SimpleTypingIndicator({ isVisible }: { isVisible: boolean }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="inline-flex items-center gap-1.5 px-2 py-1 bg-muted rounded-full"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-primary rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            className="w-1.5 h-1.5 bg-primary rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            className="w-1.5 h-1.5 bg-primary rounded-full"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}