import { AIBaseAgent } from "./ai-base-agent";

/**
 * Blog Strategy Agent - Generates content strategy for businesses
 * Uses Mistral AI for intelligent topic generation and SEO planning
 */
export class BlogStrategyAgent extends AIBaseAgent {
  constructor() {
    super({
      name: "BlogStrategy",
      role: "AI Content Strategy Specialist",
      capabilities: [
        "Industry trend analysis",
        "SEO keyword research",
        "Topic ideation and validation",
        "Content calendar creation",
        "Competitor content analysis",
        "Engagement prediction"
      ],
      temperature: 0.7,
      maxTokens: 4000
    });
  }

  protected getDefaultSystemPrompt(): string {
    return `You are an expert content strategist specializing in SEO and business blogging.

Your expertise includes:
- Industry trend analysis
- Keyword research and SEO optimization
- Content gap analysis
- Editorial calendar planning
- Topic prioritization based on business value
- Audience engagement prediction

When creating content strategies:
1. Analyze the business and industry deeply
2. Identify high-value topics that drive business results
3. Research relevant keywords with search volume
4. Create a balanced content mix (educational, commercial, thought leadership)
5. Prioritize topics by business impact and SEO potential
6. Plan publishing frequency for optimal engagement

Always provide actionable, data-driven recommendations.`;
  }

  /**
   * Generate comprehensive blog strategy for a business
   */
  async generateBlogStrategy(input: {
    businessName: string;
    industry: string;
    description: string;
    targetAudience?: string;
    competitors?: string[];
    businessGoals?: string[];
  }): Promise<BlogStrategy> {
    try {
      this.log(`Generating blog strategy for ${input.businessName}...`);

      const prompt = `Create a comprehensive blog content strategy for ${input.businessName}.

## Business Context
- Name: ${input.businessName}
- Industry: ${input.industry}
- Description: ${input.description}
- Target Audience: ${input.targetAudience || "Professional and general public"}
${input.competitors ? `- Competitors: ${input.competitors.join(", ")}` : ""}
${input.businessGoals ? `- Business Goals: ${input.businessGoals.join(", ")}` : ""}

## Task
Generate a complete blog content strategy in JSON format:

{
  "contentPillars": [
    {
      "name": "Pillar Name",
      "description": "What this pillar covers",
      "businessValue": "How it helps the business",
      "topics": 5 // number of topics in this pillar
    }
  ],
  "topics": [
    {
      "title": "Article Title",
      "pillar": "Which content pillar",
      "description": "Brief description",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "searchIntent": "informational | commercial | navigational",
      "difficulty": "easy | medium | hard",
      "businessImpact": "high | medium | low",
      "priority": 1-10,
      "estimatedEngagement": "high | medium | low",
      "tone": "professional | casual | enthusiastic | academic"
    }
  ],
  "calendar": {
    "publishingFrequency": "2-3 times per week",
    "monthlySchedule": [
      {
        "week": 1,
        "topics": ["Topic 1", "Topic 2"],
        "focus": "Week theme/focus"
      }
    ]
  },
  "seoStrategy": {
    "primaryKeywords": ["keyword1", "keyword2"],
    "longTailKeywords": ["long tail 1", "long tail 2"],
    "contentTypes": ["how-to guides", "case studies", "thought leadership"],
    "internalLinkingStrategy": "Brief description"
  }
}

Requirements:
1. Generate 25-30 high-value topics
2. Include diverse content types (how-to, lists, case studies, thought leadership)
3. Focus on topics that drive business results
4. Include realistic SEO keywords with commercial intent
5. Prioritize topics by business impact and SEO potential
6. Create a balanced 4-week publishing calendar
7. Ensure topics are specific and actionable

Make it highly relevant to ${input.industry} industry and ${input.businessName}'s specific context.`;

      const response = await this.generateWithAI({
        prompt,
        context: input,
        formatJson: true
      });

      const strategy = this.parseAIJson<BlogStrategy>(response, {
        contentPillars: [],
        topics: [],
        calendar: { publishingFrequency: "", monthlySchedule: [] },
        seoStrategy: { primaryKeywords: [], longTailKeywords: [], contentTypes: [], internalLinkingStrategy: "" }
      });

      this.log(`Strategy generated: ${strategy.topics.length} topics across ${strategy.contentPillars.length} pillars`);

      return strategy;
    } catch (error) {
      this.log(`Strategy generation failed: ${error}`);
      throw error;
    }
  }

  /**
   * Generate quick topic ideas (faster, for immediate use)
   */
  async generateQuickTopics(input: {
    businessName: string;
    industry: string;
    count?: number;
  }): Promise<BlogTopic[]> {
    try {
      this.log(`Generating ${input.count || 10} quick topic ideas...`);

      const prompt = `Generate ${input.count || 10} blog article ideas for ${input.businessName} in the ${input.industry} industry.

Return a JSON array of topics:
[
  {
    "title": "Engaging article title",
    "description": "One sentence description",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "tone": "professional | casual | enthusiastic",
    "businessImpact": "high | medium | low"
  }
]

Make titles engaging and SEO-friendly. Focus on topics that provide value to customers and drive business results.`;

      const response = await this.generateWithAI({
        prompt,
        context: input,
        formatJson: true
      });

      const topics = this.parseAIJson<BlogTopic[]>(response, []);

      this.log(`Generated ${topics.length} quick topics`);

      return topics;
    } catch (error) {
      this.log(`Quick topic generation failed: ${error}`);
      throw error;
    }
  }

  /**
   * Analyze existing content and suggest improvements
   */
  async analyzeContentGaps(input: {
    businessName: string;
    industry: string;
    existingTopics: string[];
    competitors?: string[];
  }): Promise<ContentGapAnalysis> {
    try {
      this.log("Analyzing content gaps...");

      const prompt = `Analyze content gaps for ${input.businessName} in the ${input.industry} industry.

## Current Content
Topics already covered:
${input.existingTopics.map((t, i) => `${i + 1}. ${t}`).join("\n")}

${input.competitors ? `## Competitors\n${input.competitors.join(", ")}` : ""}

## Analysis Task
Identify content gaps and opportunities in JSON format:

{
  "missingTopics": [
    {
      "title": "Topic title",
      "reasoning": "Why this is important",
      "priority": "high | medium | low",
      "keywords": ["keyword1", "keyword2"]
    }
  ],
  "improvementOpportunities": [
    {
      "existingTopic": "Which existing topic",
      "suggestion": "How to improve it",
      "additionalKeywords": ["keyword1", "keyword2"]
    }
  ],
  "competitiveAdvantages": [
    "Unique angle or topic to differentiate from competitors"
  ],
  "trendingOpportunities": [
    {
      "trend": "Trending topic or keyword",
      "howToCapitalize": "Strategy to leverage this trend",
      "urgency": "high | medium | low"
    }
  ]
}

Focus on actionable insights that drive business value.`;

      const response = await this.generateWithAI({
        prompt,
        context: input,
        formatJson: true
      });

      const analysis = this.parseAIJson<ContentGapAnalysis>(response, {
        missingTopics: [],
        improvementOpportunities: [],
        competitiveAdvantages: [],
        trendingOpportunities: []
      });

      this.log(`Content gap analysis complete: ${analysis.missingTopics.length} gaps identified`);

      return analysis;
    } catch (error) {
      this.log(`Content gap analysis failed: ${error}`);
      throw error;
    }
  }
}

// Types
export interface BlogStrategy {
  contentPillars: ContentPillar[];
  topics: BlogTopic[];
  calendar: ContentCalendar;
  seoStrategy: SEOStrategy;
}

export interface ContentPillar {
  name: string;
  description: string;
  businessValue: string;
  topics: number;
}

export interface BlogTopic {
  title: string;
  pillar?: string;
  description: string;
  keywords: string[];
  searchIntent?: string;
  difficulty?: string;
  businessImpact: string;
  priority?: number;
  estimatedEngagement?: string;
  tone: string;
}

export interface ContentCalendar {
  publishingFrequency: string;
  monthlySchedule: WeeklySchedule[];
}

export interface WeeklySchedule {
  week: number;
  topics: string[];
  focus: string;
}

export interface SEOStrategy {
  primaryKeywords: string[];
  longTailKeywords: string[];
  contentTypes: string[];
  internalLinkingStrategy: string;
}

export interface ContentGapAnalysis {
  missingTopics: MissingTopic[];
  improvementOpportunities: ImprovementOpportunity[];
  competitiveAdvantages: string[];
  trendingOpportunities: TrendingOpportunity[];
}

export interface MissingTopic {
  title: string;
  reasoning: string;
  priority: string;
  keywords: string[];
}

export interface ImprovementOpportunity {
  existingTopic: string;
  suggestion: string;
  additionalKeywords: string[];
}

export interface TrendingOpportunity {
  trend: string;
  howToCapitalize: string;
  urgency: string;
}
