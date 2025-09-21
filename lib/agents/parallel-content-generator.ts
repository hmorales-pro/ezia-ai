import { MiloCopywritingAIAgent } from "./milo-copywriting-ai";
import { SiteSection } from "@/types/agents";
import { AIResponseValidator } from "./validators/ai-response-validator";

/**
 * Parallel content generator for improved performance
 */
export class ParallelContentGenerator {
  private milo: MiloCopywritingAIAgent;

  constructor() {
    this.milo = new MiloCopywritingAIAgent();
  }

  async generateAllContent(
    sections: SiteSection[],
    contentStrategy: any
  ): Promise<Record<string, any>> {
    console.log(`📝 Generating content for ${sections.length} sections in parallel...`);
    
    const results: Record<string, any> = {};
    const failedSections: { section: SiteSection, error: Error }[] = [];
    const batchSize = 3; // Process 3 sections at a time
    
    // Process sections in batches
    for (let i = 0; i < sections.length; i += batchSize) {
      const batch = sections.slice(i, i + batchSize);
      const batchNumber = Math.floor(i/batchSize) + 1;
      const totalBatches = Math.ceil(sections.length/batchSize);
      
      console.log(`🔄 Processing batch ${batchNumber}/${totalBatches}...`);
      
      // Create promises for this batch
      const batchPromises = batch.map(async (section) => {
        try {
          const content = await this.generateSectionContent(section, contentStrategy);
          
          // Validate the generated content
          const validation = AIResponseValidator.validateContentSection(content, section.type);
          
          if (!validation.isValid) {
            console.warn(`⚠️ Content validation failed for ${section.id}: ${validation.errors.join(', ')}`);
            
            // Attempt to regenerate with validation feedback
            const enhancedStrategy = {
              ...contentStrategy,
              validationFeedback: validation.suggestions,
              requireStrictValidation: true
            };
            
            const regeneratedContent = await this.generateSectionContent(section, enhancedStrategy);
            return { sectionId: section.id, content: regeneratedContent, regenerated: true };
          }
          
          return { sectionId: section.id, content, regenerated: false };
        } catch (error) {
          console.error(`❌ Error generating content for ${section.id}:`, error);
          return { sectionId: section.id, error: error as Error };
        }
      });
      
      // Wait for batch to complete
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Process results
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          const { sectionId, content, error, regenerated } = result.value as any;
          
          if (error) {
            const section = sections.find(s => s.id === sectionId)!;
            failedSections.push({ section, error });
          } else {
            results[sectionId] = content;
            if (regenerated) {
              console.log(`✅ Successfully regenerated content for ${sectionId}`);
            }
          }
        } else {
          console.error(`❌ Unexpected rejection in batch processing:`, result.reason);
        }
      }
      
      console.log(`✓ Completed batch ${batchNumber}/${totalBatches}`);
    }
    
    // Handle failed sections with collective regeneration
    if (failedSections.length > 0) {
      console.log(`🔄 Attempting to regenerate ${failedSections.length} failed sections...`);
      
      for (const { section, error } of failedSections) {
        try {
          // Add error context to help AI understand what went wrong
          const enhancedStrategy = {
            ...contentStrategy,
            previousError: error.message,
            isRegeneration: true,
            criticalSection: ['hero', 'services', 'contact'].includes(section.type)
          };
          
          const content = await this.milo.generateSectionContent(section, enhancedStrategy, 1);
          results[section.id] = content;
          console.log(`✅ Successfully regenerated ${section.id} on retry`);
        } catch (retryError) {
          console.error(`❌ Failed to regenerate ${section.id} even after retry:`, retryError);
          
          // For critical sections, throw an error
          if (['hero', 'services', 'contact'].includes(section.type)) {
            throw new Error(
              `Failed to generate content for critical section "${section.title}" (${section.type}). ` +
              `AI service may be experiencing issues. Please try again.`
            );
          }
        }
      }
    }
    
    // Validate we have at least the critical sections
    const criticalSectionTypes = ['hero', 'services', 'contact'];
    const missingCritical = sections
      .filter(s => criticalSectionTypes.includes(s.type))
      .filter(s => !results[s.id]);
    
    if (missingCritical.length > 0) {
      throw new Error(
        `Missing content for critical sections: ${missingCritical.map(s => s.title).join(', ')}. ` +
        `Please ensure AI service is properly configured.`
      );
    }

    return results;
  }

  private async generateSectionContent(
    section: SiteSection,
    contentStrategy: any
  ): Promise<any> {
    try {
      // Use Milo to generate content for specific section
      const content = await this.milo.generateSectionContent(section, contentStrategy);
      
      // Quick validation to ensure we got something
      if (!content || (typeof content === 'object' && Object.keys(content).length === 0)) {
        throw new Error('Generated content is empty or invalid');
      }
      
      return content;
    } catch (error) {
      console.error(`Error in generateSectionContent for ${section.id}:`, error);
      throw error;
    }
  }

}