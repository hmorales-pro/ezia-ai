"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { EziaChatModal } from './ezia-chat-modal';
import { ChatMode } from './ezia-unified-chat';

interface ChatConfig {
  businessId: string;
  businessName: string;
  mode?: ChatMode;
  initialContext?: string;
  onActionComplete?: (result: any) => void;
  title?: string;
  description?: string;
}

interface ChatContextType {
  openChat: (config: ChatConfig) => void;
  closeChat: () => void;
  isOpen: boolean;
  config: ChatConfig | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ChatConfig | null>(null);

  const openChat = (newConfig: ChatConfig) => {
    setConfig(newConfig);
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    // Garder la config pour éviter le flash lors de la fermeture
    setTimeout(() => setConfig(null), 300);
  };

  return (
    <ChatContext.Provider value={{ openChat, closeChat, isOpen, config }}>
      {children}
      {config && (
        <EziaChatModal
          isOpen={isOpen}
          onClose={closeChat}
          {...config}
        />
      )}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}