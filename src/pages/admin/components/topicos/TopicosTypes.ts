
export interface Topico {
  id: string;
  titulo: string;
  thumbnail: string;
  patrocinador: string;
  disciplina: string;
  videoUrl: string;
  pdfUrl: string;
  mapaUrl: string;
  resumoUrl: string;
  questoesIds: string[];
  selecionado?: boolean;
  abrirVideoEm?: "site" | "destino";
}
