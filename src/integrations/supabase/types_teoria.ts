export type Teoria = {
  id?: string;
  titulo: string;
  disciplina_id: string; // Agora armazena o nome da disciplina como string
  assunto_id: string;    // Agora armazena o nome do assunto como string
  topicos_ids: string[];
  conteudo: string;
  no_edital: string;
  status: "draft" | "published";
  professor_id?: string; // Adicionado campo para o professor
  created_at?: string;
  updated_at?: string;
};

export type TeoriaInsert = Omit<Teoria, 'id' | 'created_at' | 'updated_at'>;
export type TeoriaUpdate = Partial<Omit<Teoria, 'id' | 'created_at' | 'updated_at'>> & {
  updated_at?: string;
};