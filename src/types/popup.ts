export interface Popup {
  id?: string;
  created_at?: string;
  updated_at?: string;
  titulo: string;
  conteudo?: string; // Conteúdo HTML do popup (opcional)
  imagem_url?: string;
  link_destino?: string;
  data_inicio: string;
  data_fim: string;
  pagina: string; // Página onde o popup será exibido
  ativo?: boolean;
  ordem?: number;
}