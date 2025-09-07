interface FormatOptions {
    addHashtags?: boolean;
    shortenLinks?: boolean;
    addEmojis?: boolean;
    maxLength?: number;
}
export declare class ContentFormatter {
    private platformLimits;
    private popularHashtags;
    format(content: string, platform: string, options?: FormatOptions): Promise<string>;
    private formatForTwitter;
    private formatForLinkedIn;
    private formatForFacebook;
    private formatForInstagram;
    private detectIndustry;
    private getRelevantHashtags;
    private addRelevantEmojis;
    private addProfessionalEmojis;
    private shortenLinks;
    private truncateWithEllipsis;
}
export {};
//# sourceMappingURL=content-formatter.d.ts.map