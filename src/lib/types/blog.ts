export interface FAQItem {
  question: string;
  answer: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  body: string; // HTML string from rich text editor
  category?: string;
  tags?: string[];
  status: "draft" | "published";
  publishDate?: string; // ISO string
  featuredImage?: string; // path under /public/media/
  
  // SEO Settings
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;

  // EEAT Signals
  authorName?: string;
  authorCredential?: string;
  authorBio?: string;
  lastReviewed?: string; // ISO string
  sources?: string[]; // array of URLs

  // AEO (Answer Engine)
  primaryQuestion?: string;
  answerSummary?: string;
  faqItems?: FAQItem[];

  // Analytics
  readingTime?: string;

  // Extended SEO
  secondaryKeywords?: string[];
  ogDescription?: string;
  noindex?: boolean;
}
