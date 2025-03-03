
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
  readingTime?: number;
  relatedPosts?: string[];
  featured?: boolean;
}

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
