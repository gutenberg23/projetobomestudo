
// Tipos fundamentais
export type Region = 
  | 'norte' 
  | 'nordeste' 
  | 'centro-oeste' 
  | 'sudeste' 
  | 'sul' 
  | 'nacional'
  | 'internacional'
  | 'federal'; // Adicionando 'federal' como um valor válido

export type RegionOrEmpty = Region | '';

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

export interface CategoryFilter {
  id: string;
  name: string;
  value: string;
}

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
  category?: string;
  region?: Region;
  state?: string;
  tags?: string[];
  metaDescription?: string;
  metaKeywords?: string[];
  featuredImage?: string;
  readingTime?: string;
  relatedPosts: string[];
  featured?: boolean;
}

export interface BlogComment {
  id: string;
  content: string;
  author: string;
  authorId: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt: string;
  postId: string;
  likesCount: number;
  replies?: BlogComment[];
  parentId?: string;
  userId: string;
  authorName: string;
  isLiked?: boolean;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count: number;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface BlogAuthor {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatar?: string;
  role?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  postCount: number;
}

export interface BlogPostFilters {
  category?: string;
  tag?: string;
  author?: string;
  region?: Region;
  state?: string;
  search?: string;
  featured?: boolean;
  date?: string;
  page?: number;
  perPage?: number;
  orderBy?: 'latest' | 'oldest' | 'popular';
}

export interface BlogPagination {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface BlogPostSearchParams {
  search?: string;
  category?: string;
  tag?: string;
  author?: string;
  page?: number;
}

export interface RelatedPostsOptions {
  postId: string;
  category?: string;
  tags?: string[];
  limit?: number;
  excludeIds?: string[];
}
