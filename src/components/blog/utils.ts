import { BlogPost } from "./types";

/** Tempo de leitura em minutos. O banco guarda minutos; se faltar, estima pelo texto. */
export function getReadingMinutes(post: Pick<BlogPost, "readingTime" | "content">): number {
  const saved = typeof post.readingTime === "number" ? post.readingTime : parseInt(String(post.readingTime ?? ""), 10);
  if (Number.isFinite(saved) && saved > 0) return saved;
  const words = (post.content || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Tags ordenadas pela quantidade de posts que as usam (mais usadas primeiro). */
export function getTagsByPopularity(posts: BlogPost[]): { tag: string; count: number }[] {
  const counts = new Map<string, { tag: string; count: number }>();
  for (const post of posts) {
    for (const raw of post.tags || []) {
      const tag = raw.trim();
      if (!tag) continue;
      const key = tag.toLowerCase();
      const entry = counts.get(key);
      if (entry) entry.count += 1;
      else counts.set(key, { tag, count: 1 });
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "pt-BR"));
}
