export type ItemType = "Funcionalidades Novas" | "Bugs" | "Administrativo" | "Outros";

export interface KanbanItem {
  id: string;
  title: string;
  type: ItemType;
  votes: number;
  comments: number;
  upvotes: number;
  column_id: string;
  created_at: string;
  updated_at?: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  order: number;
  created_at: string;
  updated_at?: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: number;
  url?: string;
  parent_id: string | null;
  created_at: string;
  updated_at?: string;
} 