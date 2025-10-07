/**
 * AI Response Validator
 * Validates AI-generated responses to ensure they contain required fields
 * and meet quality standards without using hardcoded fallbacks
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions: string[];
}

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  errorMessage?: string;
}

export class AIResponseValidator {
  /**
   * Validate a response against a set of rules
   */
  static validate(
    response: any,
    rules: ValidationRule[]
  ): ValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    for (const rule of rules) {
      const value = this.getFieldValue(response, rule.field);

      // Required field check
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`Missing required field: ${rule.field}`);
        suggestions.push(`Please generate content for the "${rule.field}" field`);
        continue;
      }

      // Skip further checks if field is not required and not present
      if (!value && !rule.required) continue;

      // Type check
      if (rule.type && typeof value !== rule.type) {
        errors.push(`Field "${rule.field}" should be of type ${rule.type}, got ${typeof value}`);
        suggestions.push(`Convert "${rule.field}" to ${rule.type} type`);
      }

      // Length checks for strings and arrays
      if (typeof value === 'string' || Array.isArray(value)) {
        const length = value.length;
        
        if (rule.minLength && length < rule.minLength) {
          errors.push(`Field "${rule.field}" is too short (minimum ${rule.minLength} characters/items)`);
          suggestions.push(`Expand "${rule.field}" to at least ${rule.minLength} characters/items`);
        }
        
        if (rule.maxLength && length > rule.maxLength) {
          errors.push(`Field "${rule.field}" is too long (maximum ${rule.maxLength} characters/items)`);
          suggestions.push(`Shorten "${rule.field}" to maximum ${rule.maxLength} characters/items`);
        }
      }

      // Pattern check for strings
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        errors.push(rule.errorMessage || `Field "${rule.field}" doesn't match required pattern`);
        suggestions.push(`Adjust "${rule.field}" to match the required format`);
      }

      // Custom validation
      if (rule.custom && !rule.custom(value)) {
        errors.push(rule.errorMessage || `Field "${rule.field}" failed custom validation`);
        suggestions.push(`Review and correct the content of "${rule.field}"`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions
    };
  }

  /**
   * Get nested field value using dot notation
   */
  private static getFieldValue(obj: any, field: string): any {
    const parts = field.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  /**
   * Validate site structure
   */
  static validateSiteStructure(structure: any): ValidationResult {
    const rules: ValidationRule[] = [
      { field: 'businessName', required: true, type: 'string', minLength: 2 },
      { field: 'industry', required: true, type: 'string', minLength: 3 },
      { field: 'sections', required: true, type: 'object', custom: Array.isArray },
      { field: 'navigation', required: true, type: 'object', custom: Array.isArray },
      { field: 'metadata', required: true, type: 'object' },
      { field: 'metadata.title', required: true, type: 'string', minLength: 10 },
      { field: 'metadata.description', required: true, type: 'string', minLength: 50 },
      { field: 'metadata.keywords', required: true, type: 'object', custom: Array.isArray }
    ];

    const result = this.validate(structure, rules);

    // Additional section validation
    if (Array.isArray(structure?.sections)) {
      structure.sections.forEach((section: any, index: number) => {
        const sectionRules: ValidationRule[] = [
          { field: 'id', required: true, type: 'string' },
          { field: 'type', required: true, type: 'string' },
          { field: 'title', required: true, type: 'string', minLength: 3 }
        ];

        const sectionResult = this.validate(section, sectionRules);
        if (!sectionResult.isValid) {
          result.errors.push(`Section ${index}: ${sectionResult.errors.join(', ')}`);
          result.suggestions.push(`Fix section ${index} issues`);
        }
      });
    }

    return result;
  }

  /**
   * Validate design system
   */
  static validateDesignSystem(designSystem: any): ValidationResult {
    const rules: ValidationRule[] = [
      { field: 'colors', required: true, type: 'object' },
      { field: 'colors.primary', required: true, type: 'string', pattern: /^#[0-9A-Fa-f]{6}$/ },
      { field: 'colors.secondary', required: true, type: 'string', pattern: /^#[0-9A-Fa-f]{6}$/ },
      { field: 'typography', required: true, type: 'object' },
      { field: 'typography.headingFont', required: true, type: 'string', minLength: 3 },
      { field: 'typography.bodyFont', required: true, type: 'string', minLength: 3 },
      { field: 'spacing', required: true, type: 'object' },
      { field: 'layout', required: true, type: 'object' }
    ];

    return this.validate(designSystem, rules);
  }

  /**
   * Validate content section
   */
  static validateContentSection(content: any, sectionType: string): ValidationResult {
    // Define rules based on section type (RELAXED for better UX)
    const rulesByType: Record<string, ValidationRule[]> = {
      hero: [
        { field: 'headline', required: true, type: 'string', minLength: 5, maxLength: 150 },
        { field: 'subheadline', required: false, type: 'string', maxLength: 300 },
        { field: 'cta', required: false, type: 'string', maxLength: 50 }
      ],
      services: [
        { field: 'items', required: true, type: 'object', custom: Array.isArray },
        { field: 'items', custom: (items) => Array.isArray(items) && items.length > 0 }
      ],
      about: [
        { field: 'headline', required: true, type: 'string', minLength: 5 },
        { field: 'story', required: false, type: 'string', minLength: 50 }
      ],
      contact: [
        { field: 'headline', required: false, type: 'string' },
        { field: 'info', required: false, type: 'object' },
        { field: 'info.email', required: false, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
      ],
      menu: [
        { field: 'items', required: true, type: 'object', custom: Array.isArray },
        { field: 'categories', required: false, type: 'object', custom: Array.isArray }
      ],
      testimonials: [
        { field: 'items', required: true, type: 'object', custom: Array.isArray },
        { field: 'headline', required: false, type: 'string' }
      ],
      // Generic relaxed validation for custom sections
      'current-theme': [
        { field: 'items', required: false, type: 'object' },
        { field: 'headline', required: false, type: 'string' }
      ]
    };

    const defaultRules: ValidationRule[] = [
      { field: 'headline', required: false, type: 'string' },
      { field: 'content', required: false, type: 'string' }
    ];

    const rules = rulesByType[sectionType] || defaultRules;
    return this.validate(content, rules);
  }

  /**
   * Create a validation prompt for AI to fix issues
   */
  static createValidationPrompt(
    originalPrompt: string,
    validationResult: ValidationResult,
    context: any
  ): string {
    if (validationResult.isValid) {
      return originalPrompt;
    }

    return `${originalPrompt}

VALIDATION ERRORS DETECTED:
${validationResult.errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}

REQUIRED CORRECTIONS:
${validationResult.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Please regenerate the response ensuring ALL validation errors are fixed.
The response must include all required fields with appropriate content.
Context provided: ${JSON.stringify(context, null, 2)}`;
  }

  /**
   * Validate HTML output
   */
  static validateHTML(html: string): ValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Check for basic HTML structure
    if (!html.includes('<!DOCTYPE html>')) {
      errors.push('Missing DOCTYPE declaration');
      suggestions.push('Add <!DOCTYPE html> at the beginning');
    }

    if (!html.includes('<html') || !html.includes('</html>')) {
      errors.push('Missing html tags');
      suggestions.push('Ensure proper <html> opening and closing tags');
    }

    if (!html.includes('<head>') || !html.includes('</head>')) {
      errors.push('Missing head section');
      suggestions.push('Add proper <head> section with meta tags');
    }

    if (!html.includes('<body>') || !html.includes('</body>')) {
      errors.push('Missing body section');
      suggestions.push('Add proper <body> section');
    }

    if (!html.includes('<title>')) {
      errors.push('Missing page title');
      suggestions.push('Add <title> tag in the head section');
    }

    // Check for responsive meta tag
    if (!html.includes('viewport')) {
      errors.push('Missing viewport meta tag');
      suggestions.push('Add <meta name="viewport" content="width=device-width, initial-scale=1.0">');
    }

    // Check for empty content
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/);
    if (bodyMatch && bodyMatch[1].trim().length < 100) {
      errors.push('Body content appears to be empty or too short');
      suggestions.push('Generate proper content within the body section');
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions
    };
  }
}