"use client";

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';
import EziaUnifiedChat, { ChatMode } from './ezia-unified-chat';
import { Button } from "@/components/ui/button";
import { MessageSquare, Minimize2, X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface EziaChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  businessName: string;
  mode?: ChatMode;
  initialContext?: string;
  onActionComplete?: (result: any) => void;
  title?: string;
  description?: string;
}

export function EziaChatModal({
  isOpen,
  onClose,
  businessId,
  businessName,
  mode = 'general',
  initialContext,
  onActionComplete,
  title,
  description
}: EziaChatModalProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Reset minimized state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsMinimized(false);
    }
  }, [isOpen]);

  const handleActionComplete = (result: any) => {
    if (result.cancelled) {
      onClose();
    } else {
      onActionComplete?.(result);
    }
  };

  // Version minimisée (chat bubble)
  if (isMinimized && isOpen) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          size="lg"
          className="rounded-full shadow-lg relative h-14 w-14 p-0"
          onClick={() => setIsMinimized(false)}
        >
          <MessageSquare className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && !isMinimized && (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DialogOverlay className="bg-background/80 backdrop-blur-sm" />
          <DialogContent 
            className={cn(
              "max-w-none w-[95vw] h-[90vh]",
              "lg:w-[85vw] lg:h-[85vh]",
              "xl:w-[75vw] xl:h-[80vh]",
              "p-0 gap-0 border-0 shadow-2xl",
              "bg-transparent overflow-hidden"
            )}
            showCloseButton={false}
          >
            <VisuallyHidden>
              <DialogTitle>Chat avec Ezia - Assistant IA</DialogTitle>
            </VisuallyHidden>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ 
                type: "spring",
                duration: 0.5,
                bounce: 0.3
              }}
              className="relative h-full bg-background rounded-lg overflow-hidden"
            >
              {/* Chat principal - on laisse le composant chat gérer ses propres contrôles */}
              <EziaUnifiedChat
                businessId={businessId}
                businessName={businessName}
                mode={mode}
                initialContext={initialContext}
                onActionComplete={handleActionComplete}
                className="h-full border-0 shadow-none"
                onMinimize={() => setIsMinimized(true)}
                onClose={onClose}
              />
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

// Hook pour gérer l'état du chat modal
export function useEziaChatModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatConfig, setChatConfig] = useState<Omit<EziaChatModalProps, 'isOpen' | 'onClose'>>({
    businessId: '',
    businessName: ''
  });

  const openChat = (config: Omit<EziaChatModalProps, 'isOpen' | 'onClose'>) => {
    setChatConfig(config);
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const ChatComponent = () => (
    <EziaChatModal
      {...chatConfig}
      isOpen={isOpen}
      onClose={closeChat}
    />
  );

  return {
    isOpen,
    openChat,
    closeChat,
    chatConfig,
    ChatComponent
  };
}