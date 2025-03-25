export type Region = "nacional" | "norte" | "nordeste" | "centro-oeste" | "sudeste" | "sul" | "federal";
export type RegionOrEmpty = Region | "none";

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
  isLiked?: boolean;
}

export interface BlogComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  likesCount: number;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  replies?: BlogComment[];
  isLiked?: boolean;
}

export interface CategoryFilter {
  id: string;
  name: string;
  value: string;
}

export interface RegionFilter {
  id: string;
  name: string;
  value: Region;
}

export interface StateFilter {
  id: string;
  name: string;
  value: string;
  region: string;
}
