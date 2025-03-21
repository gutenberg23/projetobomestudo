
export type Region = "nacional" | "norte" | "nordeste" | "centro-oeste" | "sudeste" | "sul" | "federal";

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  authorAvatar?: string;
  commentCount: number;
  likesCount: number;
  createdAt: string;
  slug: string;
  category: string;
  region?: Region;
  state?: string;
  tags?: string[];
  metaDescription?: string;
  metaKeywords?: string[];
  featuredImage?: string;
  readingTime?: string | number;
  relatedPosts?: string[];
  featured?: boolean;
}
