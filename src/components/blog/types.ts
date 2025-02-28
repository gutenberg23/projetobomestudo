
export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  commentCount: number;
  likesCount: number;
  createdAt: string;
  slug: string;
  category: string;
}
