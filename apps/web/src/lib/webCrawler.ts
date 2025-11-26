import axios from 'axios';
import * as cheerio from 'cheerio';
import { convert } from 'html-to-text';

interface CrawlOptions {
  maxDepth?: number;
  maxPages?: number;
  sameDomain?: boolean;
  includeImages?: boolean;
  timeout?: number;
}

interface CrawlResult {
  url: string;
  content: string;
  title?: string;
  links: string[];
}

const DEFAULT_OPTIONS: CrawlOptions = {
  maxDepth: 2,
  maxPages: 10,
  sameDomain: true,
  includeImages: false,
  timeout: 10000,
};

export class WebCrawler {
  private visited: Set<string> = new Set();
  private results: CrawlResult[] = [];
  private options: Required<CrawlOptions>;
  private baseUrl!: URL;

  constructor(options: CrawlOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options } as Required<CrawlOptions>;
  }

  async crawl(startUrl: string): Promise<string> {
    this.visited.clear();
    this.results = [];

    try {
      this.baseUrl = new URL(startUrl);
      await this.crawlPage(startUrl, 0);
      
      // Combine all extracted content
      return this.results
        .map((result, idx) => {
          let content = `\n\n=== Page ${idx + 1}: ${result.title || result.url} ===\n`;
          if (result.title) content += `URL: ${result.url}\n`;
          content += `\n${result.content}\n`;
          return content;
        })
        .join('\n');
    } catch (error) {
      console.error('Error during crawling:', error);
      throw error;
    }
  }

  private async crawlPage(url: string, depth: number): Promise<void> {
    // Check limits
    if (depth > this.options.maxDepth) return;
    if (this.visited.size >= this.options.maxPages) return;
    if (this.visited.has(url)) return;

    // Check same domain restriction
    try {
      const urlObj = new URL(url);
      if (this.options.sameDomain && urlObj.hostname !== this.baseUrl.hostname) {
        return;
      }
    } catch (e) {
      console.warn(`Invalid URL: ${url}`);
      return;
    }

    this.visited.add(url);
    console.log(`🔍 Crawling (depth ${depth}): ${url}`);

    try {
      const response = await axios.get(url, {
        timeout: this.options.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ZypherBot/1.0; +https://zypher.ai)',
        },
        maxRedirects: 5,
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Remove unwanted elements
      $('script, style, nav, footer, header, iframe, noscript').remove();

      // Extract title
      const title = $('title').text().trim() || $('h1').first().text().trim();

      // Extract main content
      let mainContent = '';
      
      // Try to find main content area
      const contentSelectors = [
        'main',
        'article',
        '[role="main"]',
        '.content',
        '.main-content',
        '#content',
        '#main',
      ];

      let $content = null;
      for (const selector of contentSelectors) {
        $content = $(selector).first();
        if ($content.length > 0) break;
      }

      // If no main content found, use body
      if (!$content || $content.length === 0) {
        $content = $('body');
      }

      // Convert HTML to text
      const htmlContent = $content.html() || '';
      mainContent = convert(htmlContent, {
        wordwrap: 130,
        selectors: [
          { selector: 'a', options: { ignoreHref: true } },
          { selector: 'img', format: 'skip' },
        ],
      });

      // Extract links for deeper crawling
      const links: string[] = [];
      $('a[href]').each((_, element) => {
        const href = $(element).attr('href');
        if (href) {
          try {
            const absoluteUrl = new URL(href, url).href;
            // Filter out non-http protocols and anchors
            if (absoluteUrl.startsWith('http') && !absoluteUrl.includes('#')) {
              links.push(absoluteUrl);
            }
          } catch (e) {
            // Invalid URL, skip
          }
        }
      });

      // Store result
      this.results.push({
        url,
        content: mainContent.trim(),
        title,
        links: [...new Set(links)], // Remove duplicates
      });

      // Crawl nested pages
      if (depth < this.options.maxDepth && this.visited.size < this.options.maxPages) {
        for (const link of links.slice(0, 5)) { // Limit links per page
          if (this.visited.size >= this.options.maxPages) break;
          await this.crawlPage(link, depth + 1);
        }
      }
    } catch (error: any) {
      console.error(`Error crawling ${url}:`, error.message);
      // Continue with other pages
    }
  }
}

// Convenience function for single URL
export async function extractTextFromUrl(
  url: string,
  options?: CrawlOptions
): Promise<string> {
  const crawler = new WebCrawler(options);
  return await crawler.crawl(url);
}

// Quick scrape for single page (no nested crawling)
export async function quickScrapeUrl(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ZypherBot/1.0)',
      },
    });

    const $ = cheerio.load(response.data);
    
    // Remove unwanted elements
    $('script, style, nav, footer, header, iframe, noscript').remove();
    
    // Try to find main content
    let $content = $('main, article, [role="main"]').first();
    if ($content.length === 0) $content = $('body');
    
    const title = $('title').text().trim();
    const htmlContent = $content.html() || '';
    const textContent = convert(htmlContent, {
      wordwrap: 130,
      selectors: [
        { selector: 'a', options: { ignoreHref: true } },
        { selector: 'img', format: 'skip' },
      ],
    });

    return `# ${title}\nURL: ${url}\n\n${textContent.trim()}`;
  } catch (error) {
    console.error('Error scraping URL:', error);
    throw error;
  }
}

