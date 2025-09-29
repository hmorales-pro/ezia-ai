import { 
  validateTheme, 
  validateBlock, 
  validatePage, 
  validateSiteStructure, 
  validateStreamingEvent,
  getValidationErrors 
} from './validation';

export interface SiteTheme {
  name: string;
  tokens: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      surface: string;
      text: string;
      textSecondary: string;
      border: string;
      error: string;
      success: string;
      warning: string;
      info: string;
    };
    typography: {
      fontFamily: {
        heading: string;
        body: string;
        mono: string;
      };
      fontSize: {
        xs: string;
        sm: string;
        base: string;
        lg: string;
        xl: string;
        "2xl": string;
        "3xl": string;
        "4xl": string;
      };
      fontWeight: {
        light: number;
        normal: number;
        medium: number;
        semibold: number;
        bold: number;
      };
      lineHeight: {
        tight: number;
        normal: number;
        relaxed: number;
      };
    };
    spacing: {
      px: string;
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      "2xl": string;
      "3xl": string;
      "4xl": string;
    };
    borderRadius: {
      none: string;
      sm: string;
      md: string;
      lg: string;
      full: string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
}

export interface SitePage {
  id: string;
  title: string;
  slug: string;
  meta: {
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
  blocks: Block[];
}

export interface Block {
  id: string;
  type: string;
  component: string;
  props: Record<string, any>;
  spec?: BlockSpec;
  styles?: Record<string, any>;
}

export interface BlockSpec {
  inputs: Record<string, string>;
  css: string;
  template: string;
  category?: string;
  description?: string;
}

export interface SiteAsset {
  id: string;
  type: "image" | "icon" | "video";
  url: string;
  alt?: string;
  metadata?: Record<string, any>;
}

export interface SiteStructure {
  id: string;
  title: string;
  description?: string;
  domain?: string;
  locale?: string;
  pages: SitePage[];
  assets: SiteAsset[];
  theme: SiteTheme;
  navigation: {
    header: {
      logo?: string;
      links: Array<{ label: string; href: string }>;
    };
    footer: {
      logo?: string;
      links: Array<{ label: string; href: string }>;
      social?: Array<{ platform: string; url: string }>;
      copyright?: string;
    };
  };
  customBlocks?: Record<string, BlockSpec>;
}

export interface StreamingEvent {
  type: "theme" | "page" | "block" | "asset" | "navigation" | "complete" | "error" | "phase_start" | "phase_complete";
  payload: any;
  timestamp?: string;
  id?: string;
}

export interface ThemeEvent {
  type: "theme";
  payload: SiteTheme;
}

export interface PageEvent {
  type: "page";
  payload: {
    page: SitePage;
    index: number;
    total: number;
  };
}

export interface BlockEvent {
  type: "block";
  payload: {
    pageId: string;
    block: Block;
    index: number;
    total: number;
  };
}

export interface AssetEvent {
  type: "asset";
  payload: SiteAsset;
}

export interface NavigationEvent {
  type: "navigation";
  payload: SiteStructure["navigation"];
}

export interface CompleteEvent {
  type: "complete";
  payload: {
    siteId: string;
    exportUrls?: {
      html?: string;
      zip?: string;
    };
  };
}

export interface ErrorEvent {
  type: "error";
  payload: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface PhaseStartEvent {
  type: "phase_start";
  payload: {
    phase: string;
    agent: string;
    description: string;
  };
}

export interface PhaseCompleteEvent {
  type: "phase_complete";
  payload: {
    phase: string;
    agent: string;
    result: any;
  };
}

// Export all validators for easy importing
export {
  validateTheme,
  validateBlock,
  validatePage,
  validateSiteStructure,
  validateStreamingEvent,
  getValidationErrors
};