import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDirectory = path.join(process.cwd(), "src/content/blog");

export interface BlogPost {
  title: string;
  slug: string;
  date: string;
  author: string;
  categories: string[];
  excerpt: string;
  content: string;
  draft?: boolean;
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const fileNames = fs.readdirSync(contentDirectory);
  const allPosts = fileNames
    .filter((fileName) => fileName.endsWith(".mdx"))
    .map((fileName) => {
      const fullPath = path.join(contentDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      return {
        ...data,
        content,
      } as BlogPost;
    })
    .filter((post) => !post.draft);

  return allPosts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(contentDirectory, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      ...data,
      slug,
      content,
    } as BlogPost;
  } catch (e) {
    return null;
  }
}
