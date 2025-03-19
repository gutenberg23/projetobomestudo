
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
  region?: RegionOrEmpty;
  state?: string;
  tags?: string[];
  metaDescription?: string;
  metaKeywords?: string[];
  featuredImage?: string;
  readingTime?: string; // Mantido como string para corresponder à estrutura de dados
  relatedPosts?: string[];
  featured?: boolean;
  updatedAt?: string;
}

export type BlogComment = {
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
};

export type Region = "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul" | "Federal" | "Nacional";

export type RegionOrEmpty = Region | "";

export interface RegionFilter {
  id: string;
  name: string;
  value: Region;
}

export interface StateFilter {
  id: string;
  name: string;
  value: string;
  region: Region;
}

export interface CategoryFilter {
  id: string;
  name: string;
  value: string;
}
