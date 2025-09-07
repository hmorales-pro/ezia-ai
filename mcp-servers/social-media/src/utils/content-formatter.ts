interface FormatOptions {
  addHashtags?: boolean;
  shortenLinks?: boolean;
  addEmojis?: boolean;
  maxLength?: number;
}

export class ContentFormatter {
  private platformLimits = {
    twitter: 280,
    linkedin: 3000,
    facebook: 63206,
    instagram: 2200,
  };

  private popularHashtags: Record<string, string[]> = {
    restaurant: ['#Restaurant', '#Gastronomie', '#Food', '#Foodie', '#RestaurantParis'],
    tech: ['#Tech', '#Innovation', '#Digital', '#Startup', '#AI'],
    business: ['#Business', '#Entrepreneur', '#Marketing', '#Growth', '#Success'],
    health: ['#Health', '#Wellness', '#Fitness', '#HealthyLifestyle', '#Nutrition'],
  };

  async format(
    content: string,
    platform: string,
    options: FormatOptions = {}
  ): Promise<string> {
    let formatted = content;

    // Platform-specific formatting
    switch (platform) {
      case 'twitter':
        formatted = await this.formatForTwitter(content, options);
        break;
      case 'linkedin':
        formatted = await this.formatForLinkedIn(content, options);
        break;
      case 'facebook':
        formatted = await this.formatForFacebook(content, options);
        break;
      case 'instagram':
        formatted = await this.formatForInstagram(content, options);
        break;
    }

    return formatted;
  }

  private async formatForTwitter(
    content: string,
    options: FormatOptions
  ): Promise<string> {
    let formatted = content;

    // Add emojis if requested
    if (options.addEmojis) {
      formatted = this.addRelevantEmojis(formatted);
    }

    // Shorten links
    if (options.shortenLinks) {
      formatted = await this.shortenLinks(formatted);
    }

    // Add hashtags at the end
    if (options.addHashtags) {
      const industry = this.detectIndustry(content);
      const hashtags = this.getRelevantHashtags(industry).slice(0, 3);
      const hashtagsString = '\n\n' + hashtags.join(' ');
      
      // Check if adding hashtags would exceed limit
      if (formatted.length + hashtagsString.length <= this.platformLimits.twitter) {
        formatted += hashtagsString;
      }
    }

    // Truncate if necessary
    if (formatted.length > this.platformLimits.twitter) {
      formatted = this.truncateWithEllipsis(formatted, this.platformLimits.twitter);
    }

    return formatted;
  }

  private async formatForLinkedIn(
    content: string,
    options: FormatOptions
  ): Promise<string> {
    let formatted = content;

    // LinkedIn prefers professional tone, minimal emojis
    if (options.addEmojis) {
      formatted = this.addProfessionalEmojis(formatted);
    }

    // Add relevant hashtags
    if (options.addHashtags) {
      const industry = this.detectIndustry(content);
      const hashtags = this.getRelevantHashtags(industry).slice(0, 5);
      formatted += '\n\n' + hashtags.join(' ');
    }

    // Add call to action
    if (content.length < 2000) {
      formatted += '\n\n💼 Qu\'en pensez-vous ? Partagez votre expérience en commentaire !';
    }

    return formatted;
  }

  private async formatForFacebook(
    content: string,
    options: FormatOptions
  ): Promise<string> {
    let formatted = content;

    // Facebook allows longer content, so we can be more descriptive
    if (options.addEmojis) {
      formatted = this.addRelevantEmojis(formatted);
    }

    // Add hashtags (fewer than other platforms)
    if (options.addHashtags) {
      const industry = this.detectIndustry(content);
      const hashtags = this.getRelevantHashtags(industry).slice(0, 2);
      formatted += '\n\n' + hashtags.join(' ');
    }

    return formatted;
  }

  private async formatForInstagram(
    content: string,
    options: FormatOptions
  ): Promise<string> {
    let formatted = content;

    // Instagram loves emojis and hashtags
    if (options.addEmojis !== false) { // Default to true for Instagram
      formatted = this.addRelevantEmojis(formatted, true);
    }

    // Add many hashtags for Instagram
    if (options.addHashtags !== false) { // Default to true for Instagram
      const industry = this.detectIndustry(content);
      const hashtags = this.getRelevantHashtags(industry);
      
      // Instagram allows up to 30 hashtags, but 10-15 is optimal
      const selectedHashtags = hashtags.slice(0, 12);
      formatted += '\n\n' + selectedHashtags.join(' ');
      
      // Add some generic popular hashtags
      formatted += '\n#InstaGood #PhotoOfTheDay #Love #Beautiful';
    }

    // Truncate if necessary
    if (formatted.length > this.platformLimits.instagram) {
      formatted = this.truncateWithEllipsis(formatted, this.platformLimits.instagram);
    }

    return formatted;
  }

  private detectIndustry(content: string): string {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('restaurant') || lowerContent.includes('food') || 
        lowerContent.includes('cuisine') || lowerContent.includes('gastronomie')) {
      return 'restaurant';
    }
    
    if (lowerContent.includes('tech') || lowerContent.includes('digital') || 
        lowerContent.includes('innovation') || lowerContent.includes('software')) {
      return 'tech';
    }
    
    if (lowerContent.includes('health') || lowerContent.includes('santé') || 
        lowerContent.includes('wellness') || lowerContent.includes('fitness')) {
      return 'health';
    }
    
    return 'business'; // Default
  }

  private getRelevantHashtags(industry: string): string[] {
    return this.popularHashtags[industry] || this.popularHashtags.business;
  }

  private addRelevantEmojis(content: string, extensive = false): string {
    const emojiMap: Record<string, string> = {
      'restaurant': '🍽️',
      'food': '🍴',
      'delicious': '😋',
      'nouveau': '🆕',
      'new': '✨',
      'important': '⚡',
      'attention': '👀',
      'merci': '🙏',
      'thanks': '🙏',
      'bravo': '👏',
      'congratulations': '🎉',
      'question': '❓',
      'idée': '💡',
      'idea': '💡',
      'love': '❤️',
      'coeur': '❤️',
      'happy': '😊',
      'heureux': '😊',
      'success': '🎯',
      'succès': '🎯',
      'objectif': '🎯',
      'goal': '🎯',
    };

    let formatted = content;
    
    // Add emojis after certain keywords
    for (const [keyword, emoji] of Object.entries(emojiMap)) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      formatted = formatted.replace(regex, `$&${emoji}`);
    }

    // Add emojis at the beginning if extensive
    if (extensive && !formatted.match(/^[^\w\s]/)) {
      formatted = '✨ ' + formatted;
    }

    return formatted;
  }

  private addProfessionalEmojis(content: string): string {
    // More subtle emoji usage for LinkedIn
    const emojiMap: Record<string, string> = {
      'objectif': '🎯',
      'goal': '🎯',
      'croissance': '📈',
      'growth': '📈',
      'équipe': '👥',
      'team': '👥',
      'innovation': '💡',
      'succès': '✅',
      'success': '✅',
    };

    let formatted = content;
    
    for (const [keyword, emoji] of Object.entries(emojiMap)) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      formatted = formatted.replace(regex, `$&${emoji}`);
    }

    return formatted;
  }

  private async shortenLinks(content: string): Promise<string> {
    // TODO: Implement actual link shortening service integration
    // For now, just return the content as is
    return content;
  }

  private truncateWithEllipsis(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    
    // Leave room for ellipsis
    const truncateAt = maxLength - 3;
    
    // Try to truncate at a word boundary
    const lastSpace = text.lastIndexOf(' ', truncateAt);
    if (lastSpace > truncateAt * 0.8) {
      return text.substring(0, lastSpace) + '...';
    }
    
    return text.substring(0, truncateAt) + '...';
  }
}