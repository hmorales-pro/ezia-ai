"use client";

import React from 'react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User, Sparkles, Brain, Target, TrendingUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    isStreaming?: boolean;
    metadata?: {
      agent?: string;
      actionType?: string;
      status?: 'success' | 'error' | 'pending';
    };
  };
  showAvatar?: boolean;
  className?: string;
}

// Configuration des agents
const agentConfig = {
  Ezia: {
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    title: 'Ezia - Manager IA'
  },
  Market: {
    icon: TrendingUp,
    color: 'from-blue-500 to-cyan-500',
    title: 'Agent Marché'
  },
  Strategy: {
    icon: Target,
    color: 'from-green-500 to-emerald-500',
    title: 'Agent Stratégie'
  },
  Content: {
    icon: Brain,
    color: 'from-orange-500 to-red-500',
    title: 'Agent Contenu'
  }
};

export function ChatMessage({ message, showAvatar = true, className }: ChatMessageProps) {
  const agent = message.metadata?.agent || 'Ezia';
  const config = agentConfig[agent as keyof typeof agentConfig] || agentConfig.Ezia;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-3",
        message.role === 'user' && "justify-end",
        className
      )}
    >
      {message.role === 'assistant' && showAvatar && (
        <Avatar className="h-8 w-8 border shadow-sm">
          <AvatarFallback className={cn("bg-gradient-to-br text-white", config.color)}>
            <config.icon className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
          message.role === 'user'
            ? "bg-primary text-primary-foreground"
            : "bg-muted border",
          message.role === 'system' && "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
        )}
      >
        {/* Header pour les messages assistant avec métadonnées */}
        {message.role === 'assistant' && message.metadata && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium">{config.title}</span>
            {message.metadata.status && (
              <Badge 
                variant={
                  message.metadata.status === 'success' ? 'default' :
                  message.metadata.status === 'error' ? 'destructive' : 
                  'secondary'
                }
                className="text-xs"
              >
                {message.metadata.status === 'success' ? '✓ Succès' :
                 message.metadata.status === 'error' ? '✗ Erreur' :
                 '⏳ En cours'}
              </Badge>
            )}
          </div>
        )}

        {/* Contenu du message */}
        {message.isStreaming ? (
          <StreamingMessage content={message.content} />
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                code: ({ inline, children }) => 
                  inline ? (
                    <code className="bg-muted px-1 py-0.5 rounded text-sm">{children}</code>
                  ) : (
                    <pre className="bg-muted p-2 rounded overflow-x-auto text-sm">
                      <code>{children}</code>
                    </pre>
                  ),
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" 
                     className="text-primary underline hover:no-underline">
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground mt-2">
          {message.timestamp.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      {message.role === 'user' && showAvatar && (
        <Avatar className="h-8 w-8 border shadow-sm">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
}

// Composant pour les messages en streaming
function StreamingMessage({ content }: { content: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex gap-1 mt-1">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-1.5 h-1.5 bg-current rounded-full"
        />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          className="w-1.5 h-1.5 bg-current rounded-full"
        />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
          className="w-1.5 h-1.5 bg-current rounded-full"
        />
      </div>
      {content && (
        <div className="flex-1 prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

// Composant pour les actions dans le chat
export function ChatAction({ 
  icon: Icon, 
  label, 
  onClick,
  variant = 'outline'
}: { 
  icon: any; 
  label: string; 
  onClick: () => void;
  variant?: 'outline' | 'default' | 'secondary';
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
        variant === 'outline' && "border hover:bg-muted",
        variant === 'default' && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === 'secondary' && "bg-muted hover:bg-muted/80"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </motion.button>
  );
}