export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  body: string; // HTML string from rich text editor
  category?: string;
  tags?: string[];
  status: "draft" | "published";
  publishDate?: string; // ISO string
  featuredImage?: string; // path under /public/media-images/
}
