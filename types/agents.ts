export interface IndustryInsights {
  keyFeatures: string[];
  userJourney: string[];
  competitiveAdvantages: string[];
  requiredSections: string[];
  businessGoals?: string[];
  targetPersonas?: any[];
}

export interface SiteSection {
  id: string;
  type: string;
  title: string;
  priority: number;
  content: any;
  layout?: string;
}

export interface SiteStructure {
  businessName: string;
  industry: string;
  sections: SiteSection[];
  navigation: any[];
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface Typography {
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
    "5xl": string;
  };
  fontWeight: {
    light: number;
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface DesignSystem {
  colorPalette: ColorPalette;
  typography: Typography;
  spacing: Record<string, string>;
  components: any;
  animations: any;
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
    wide: string;
  };
}

export interface GeneratedHTML {
  html: string;
  sections: string[];
  metadata: any;
}

export interface SiteContent {
  [sectionId: string]: any;
}

export interface GeneratedSite {
  html: string;
  css: string;
  structure: SiteStructure;
  designSystem: DesignSystem;
  content: SiteContent;
  metadata: {
    generatedAt: string;
    agents: {
      architect: string;
      designer: string;
      builder: string;
      copywriter: string;
    };
    insights: IndustryInsights;
  };
}