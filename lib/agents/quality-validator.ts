/**
 * Quality validator for generated websites
 */
export class QualityValidator {
  validateHTML(html: string): ValidationResult {
    const issues: ValidationIssue[] = [];
    
    // Check basic HTML structure
    if (!html.includes('<!DOCTYPE html>')) {
      issues.push({ type: 'error', message: 'Missing DOCTYPE declaration' });
    }
    
    if (!html.includes('<html') || !html.includes('</html>')) {
      issues.push({ type: 'error', message: 'Missing HTML tags' });
    }
    
    if (!html.includes('<head>') || !html.includes('</head>')) {
      issues.push({ type: 'error', message: 'Missing HEAD section' });
    }
    
    if (!html.includes('<body>') || !html.includes('</body>')) {
      issues.push({ type: 'error', message: 'Missing BODY section' });
    }
    
    // Check for essential meta tags
    if (!html.includes('<meta charset=')) {
      issues.push({ type: 'warning', message: 'Missing charset meta tag' });
    }
    
    if (!html.includes('<meta name="viewport"')) {
      issues.push({ type: 'warning', message: 'Missing viewport meta tag' });
    }
    
    if (!html.includes('<title>')) {
      issues.push({ type: 'error', message: 'Missing page title' });
    }
    
    // Check for accessibility
    const imgCount = (html.match(/<img/g) || []).length;
    const altCount = (html.match(/alt="/g) || []).length;
    if (imgCount > altCount) {
      issues.push({ type: 'warning', message: `${imgCount - altCount} images missing alt text` });
    }
    
    // Check for forms
    if (html.includes('<form')) {
      if (!html.includes('<label')) {
        issues.push({ type: 'warning', message: 'Forms should have labels' });
      }
    }
    
    // Check for semantic HTML
    const semanticTags = ['<header', '<nav', '<main', '<section', '<article', '<footer'];
    const semanticCount = semanticTags.filter(tag => html.includes(tag)).length;
    if (semanticCount < 3) {
      issues.push({ type: 'info', message: 'Consider using more semantic HTML5 elements' });
    }
    
    // Check for responsive design
    if (!html.includes('@media') && !html.includes('responsive')) {
      issues.push({ type: 'info', message: 'No responsive design detected' });
    }
    
    // Check content quality
    if (!html.includes('{') && !html.includes('}')) {
      // Good - no JSON strings in HTML
    } else {
      issues.push({ type: 'error', message: 'Raw JSON data found in HTML' });
    }
    
    // Calculate score
    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;
    const score = Math.max(0, 100 - (errorCount * 20) - (warningCount * 10));
    
    return {
      valid: errorCount === 0,
      score,
      issues,
      metrics: {
        htmlSize: html.length,
        lineCount: html.split('\n').length,
        hasNavigation: html.includes('<nav'),
        hasFooter: html.includes('<footer'),
        hasContactForm: html.includes('contact') && html.includes('<form'),
        isResponsive: html.includes('@media') || html.includes('responsive'),
        hasAnimations: html.includes('animation') || html.includes('transition'),
        semanticScore: semanticCount
      }
    };
  }

  validateDesignSystem(designSystem: any): ValidationResult {
    const issues: ValidationIssue[] = [];
    
    // Check colors
    if (!designSystem.colors) {
      issues.push({ type: 'error', message: 'Missing colors in design system' });
    } else {
      const requiredColors = ['primary', 'secondary', 'background', 'text'];
      requiredColors.forEach(color => {
        if (!designSystem.colors[color]) {
          issues.push({ type: 'warning', message: `Missing ${color} color` });
        }
      });
      
      // Validate color format
      Object.entries(designSystem.colors).forEach(([name, value]) => {
        if (typeof value === 'string' && !value.match(/^#[0-9A-Fa-f]{6}$/)) {
          issues.push({ type: 'warning', message: `Invalid color format for ${name}: ${value}` });
        }
      });
    }
    
    // Check typography
    if (!designSystem.typography) {
      issues.push({ type: 'error', message: 'Missing typography in design system' });
    }
    
    // Check spacing
    if (!designSystem.spacing) {
      issues.push({ type: 'warning', message: 'Missing spacing system' });
    }
    
    return {
      valid: issues.filter(i => i.type === 'error').length === 0,
      score: Math.max(0, 100 - (issues.length * 10)),
      issues,
      metrics: {
        hasColors: !!designSystem.colors,
        hasTypography: !!designSystem.typography,
        hasSpacing: !!designSystem.spacing,
        hasAnimations: !!designSystem.animations,
        colorCount: designSystem.colors ? Object.keys(designSystem.colors).length : 0
      }
    };
  }

  validateContent(content: Record<string, any>, sections: any[]): ValidationResult {
    const issues: ValidationIssue[] = [];
    
    // Check if all sections have content
    sections.forEach(section => {
      if (!content[section.id]) {
        issues.push({ type: 'error', message: `Missing content for section: ${section.id}` });
      } else {
        const sectionContent = content[section.id];
        
        // Check content quality
        if (typeof sectionContent === 'object') {
          if (!sectionContent.headline && !sectionContent.title) {
            issues.push({ type: 'warning', message: `Section ${section.id} missing headline` });
          }
          
          // Check for placeholder content
          const contentStr = JSON.stringify(sectionContent).toLowerCase();
          if (contentStr.includes('lorem ipsum') || contentStr.includes('placeholder')) {
            issues.push({ type: 'warning', message: `Section ${section.id} contains placeholder text` });
          }
        }
      }
    });
    
    // Check language consistency
    const contentStr = JSON.stringify(content);
    const hasFrench = /[àâäéèêëïîôùûüÿç]/i.test(contentStr);
    const hasEnglish = /\b(the|and|or|but|with|from)\b/i.test(contentStr);
    
    if (hasFrench && hasEnglish) {
      issues.push({ type: 'info', message: 'Mixed languages detected (French and English)' });
    }
    
    return {
      valid: issues.filter(i => i.type === 'error').length === 0,
      score: Math.max(0, 100 - (issues.length * 5)),
      issues,
      metrics: {
        sectionCount: sections.length,
        filledSections: sections.filter(s => content[s.id]).length,
        averageContentLength: Object.values(content)
          .map(c => JSON.stringify(c).length)
          .reduce((a, b) => a + b, 0) / sections.length,
        language: hasFrench ? 'fr' : 'en'
      }
    };
  }

  generateReport(results: {
    html: ValidationResult,
    design: ValidationResult,
    content: ValidationResult
  }): QualityReport {
    const overallScore = Math.round(
      (results.html.score + results.design.score + results.content.score) / 3
    );
    
    return {
      overallScore,
      grade: this.getGrade(overallScore),
      summary: {
        htmlValid: results.html.valid,
        designValid: results.design.valid,
        contentValid: results.content.valid,
        totalIssues: 
          results.html.issues.length + 
          results.design.issues.length + 
          results.content.issues.length,
        criticalIssues: [
          ...results.html.issues,
          ...results.design.issues,
          ...results.content.issues
        ].filter(i => i.type === 'error').length
      },
      details: {
        html: results.html,
        design: results.design,
        content: results.content
      },
      recommendations: this.generateRecommendations(results)
    };
  }

  private getGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private generateRecommendations(results: any): string[] {
    const recommendations: string[] = [];
    
    // HTML recommendations
    if (results.html.score < 80) {
      recommendations.push('Améliorer la structure HTML et corriger les erreurs de validation');
    }
    if (!results.html.metrics.isResponsive) {
      recommendations.push('Ajouter des media queries pour un design responsive');
    }
    if (!results.html.metrics.hasAnimations) {
      recommendations.push('Considérer l\'ajout d\'animations subtiles pour améliorer l\'UX');
    }
    
    // Design recommendations
    if (results.design.metrics.colorCount < 5) {
      recommendations.push('Enrichir la palette de couleurs pour plus de variété visuelle');
    }
    
    // Content recommendations
    if (results.content.metrics.filledSections < results.content.metrics.sectionCount) {
      recommendations.push('Compléter le contenu manquant dans toutes les sections');
    }
    
    return recommendations;
  }
}

// Types
interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
}

interface ValidationResult {
  valid: boolean;
  score: number;
  issues: ValidationIssue[];
  metrics: Record<string, any>;
}

interface QualityReport {
  overallScore: number;
  grade: string;
  summary: {
    htmlValid: boolean;
    designValid: boolean;
    contentValid: boolean;
    totalIssues: number;
    criticalIssues: number;
  };
  details: {
    html: ValidationResult;
    design: ValidationResult;
    content: ValidationResult;
  };
  recommendations: string[];
}