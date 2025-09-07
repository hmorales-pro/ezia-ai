import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Composant de chargement réutilisable
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-8 h-8 animate-spin text-[#6D3FC8]" />
  </div>
);

// Monaco Editor - Très lourd, charger uniquement quand nécessaire
export const DynamicMonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

// Composants de business - Charger à la demande
export const DynamicContentCalendar = dynamic(
  () => import('@/components/business/unified-content-calendar').then(mod => ({ default: mod.UnifiedContentCalendar })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

export const DynamicSocialMediaSettings = dynamic(
  () => import('@/components/business/social-media-manager'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

export const DynamicAgentStatus = dynamic(
  () => import('@/components/business/agent-status').then(mod => ({ default: mod.AgentStatus })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

// Chat components
export const DynamicEziaChat = dynamic(
  () => import('@/components/ezia-chat-v2').then(mod => ({ default: mod.EziaChatV2 })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

// Editor components
export const DynamicEditor = dynamic(
  () => import('@/components/editor'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);