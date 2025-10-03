/**
 * RSS Feed Generator for Blog Posts
 * Generates RSS 2.0 compliant XML feeds
 */

export interface RSSFeedOptions {
  title: string;
  description: string;
  link: string;
  language?: string;
  copyright?: string;
  managingEditor?: string;
  webMaster?: string;
  category?: string;
  image?: {
    url: string;
    title: string;
    link: string;
  };
}

export interface RSSItem {
  title: string;
  description: string;
  link: string;
  guid: string;
  pubDate: Date;
  author?: string;
  category?: string[];
  content?: string;
}

export class RSSGenerator {
  /**
   * Generate RSS 2.0 feed XML
   */
  static generateFeed(options: RSSFeedOptions, items: RSSItem[]): string {
    const {
      title,
      description,
      link,
      language = "fr-FR",
      copyright,
      managingEditor,
      webMaster,
      category,
      image
    } = options;

    const rssItems = items
      .map(item => this.generateRSSItem(item))
      .join("\n");

    const imageXML = image
      ? `
    <image>
      <url>${this.escapeXML(image.url)}</url>
      <title>${this.escapeXML(image.title)}</title>
      <link>${this.escapeXML(image.link)}</link>
    </image>`
      : "";

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${this.escapeXML(title)}</title>
    <description>${this.escapeXML(description)}</description>
    <link>${this.escapeXML(link)}</link>
    <language>${language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${this.escapeXML(link)}/rss.xml" rel="self" type="application/rss+xml" />
    ${category ? `<category>${this.escapeXML(category)}</category>` : ""}
    ${copyright ? `<copyright>${this.escapeXML(copyright)}</copyright>` : ""}
    ${managingEditor ? `<managingEditor>${this.escapeXML(managingEditor)}</managingEditor>` : ""}
    ${webMaster ? `<webMaster>${this.escapeXML(webMaster)}</webMaster>` : ""}${imageXML}
${rssItems}
  </channel>
</rss>`;
  }

  /**
   * Generate a single RSS item
   */
  private static generateRSSItem(item: RSSItem): string {
    const {
      title,
      description,
      link,
      guid,
      pubDate,
      author,
      category,
      content
    } = item;

    const categories = category
      ? category.map(cat => `    <category>${this.escapeXML(cat)}</category>`).join("\n")
      : "";

    const contentEncoded = content
      ? `    <content:encoded><![CDATA[${content}]]></content:encoded>`
      : "";

    return `    <item>
      <title>${this.escapeXML(title)}</title>
      <description>${this.escapeXML(description)}</description>
      <link>${this.escapeXML(link)}</link>
      <guid isPermaLink="true">${this.escapeXML(guid)}</guid>
      <pubDate>${pubDate.toUTCString()}</pubDate>
${author ? `      <dc:creator>${this.escapeXML(author)}</dc:creator>` : ""}
${categories}
${contentEncoded}
    </item>`;
  }

  /**
   * Escape XML special characters
   */
  private static escapeXML(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  /**
   * Generate sitemap XML for blog posts
   */
  static generateSitemap(posts: {
    slug: string;
    lastmod: Date;
    priority?: number;
  }[], baseUrl: string): string {
    const urls = posts
      .map(post => {
        const priority = post.priority || 0.7;
        return `  <url>
    <loc>${this.escapeXML(`${baseUrl}/blog/${post.slug}`)}</loc>
    <lastmod>${post.lastmod.toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
      })
      .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  }

  /**
   * Generate JSON Feed (modern alternative to RSS)
   */
  static generateJSONFeed(
    options: RSSFeedOptions,
    items: RSSItem[]
  ): string {
    const jsonFeed = {
      version: "https://jsonfeed.org/version/1.1",
      title: options.title,
      home_page_url: options.link,
      feed_url: `${options.link}/feed.json`,
      description: options.description,
      language: options.language || "fr-FR",
      ...(options.image && { icon: options.image.url }),
      ...(options.image && { favicon: options.image.url }),
      items: items.map(item => ({
        id: item.guid,
        url: item.link,
        title: item.title,
        content_html: item.content || item.description,
        summary: item.description,
        date_published: item.pubDate.toISOString(),
        ...(item.author && { author: { name: item.author } }),
        ...(item.category && { tags: item.category })
      }))
    };

    return JSON.stringify(jsonFeed, null, 2);
  }
}
