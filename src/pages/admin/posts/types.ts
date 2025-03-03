
import { BlogPost, Region, RegionOrEmpty, StateFilter } from "@/components/blog/types";

// Enum para controlar o modo da interface
export enum ModoInterface {
  LISTAR,
  CRIAR,
  EDITAR
}

// Categorias disponíveis
export const CATEGORIAS = [
  "Português",
  "Matemática",
  "Direito",
  "Informática",
  "Raciocínio Lógico",
  "Atualidades",
  "Legislação",
  "Concursos",
  "Dicas de Estudo",
  "Notícias"
];

// Regiões disponíveis
export const REGIOES: Region[] = [
  "Norte",
  "Nordeste", 
  "Centro-Oeste", 
  "Sudeste", 
  "Sul", 
  "Federal", 
  "Nacional"
];

// Estados disponíveis
export const ESTADOS: StateFilter[] = [
  { id: "ac", name: "Acre", value: "AC", region: "Norte" },
  { id: "al", name: "Alagoas", value: "AL", region: "Nordeste" },
  { id: "ap", name: "Amapá", value: "AP", region: "Norte" },
  { id: "am", name: "Amazonas", value: "AM", region: "Norte" },
  { id: "ba", name: "Bahia", value: "BA", region: "Nordeste" },
  { id: "ce", name: "Ceará", value: "CE", region: "Nordeste" },
  { id: "df", name: "Distrito Federal", value: "DF", region: "Centro-Oeste" },
  { id: "es", name: "Espírito Santo", value: "ES", region: "Sudeste" },
  { id: "go", name: "Goiás", value: "GO", region: "Centro-Oeste" },
  { id: "ma", name: "Maranhão", value: "MA", region: "Nordeste" },
  { id: "mt", name: "Mato Grosso", value: "MT", region: "Centro-Oeste" },
  { id: "ms", name: "Mato Grosso do Sul", value: "MS", region: "Centro-Oeste" },
  { id: "mg", name: "Minas Gerais", value: "MG", region: "Sudeste" },
  { id: "pa", name: "Pará", value: "PA", region: "Norte" },
  { id: "pb", name: "Paraíba", value: "PB", region: "Nordeste" },
  { id: "pr", name: "Paraná", value: "PR", region: "Sul" },
  { id: "pe", name: "Pernambuco", value: "PE", region: "Nordeste" },
  { id: "pi", name: "Piauí", value: "PI", region: "Nordeste" },
  { id: "rj", name: "Rio de Janeiro", value: "RJ", region: "Sudeste" },
  { id: "rn", name: "Rio Grande do Norte", value: "RN", region: "Nordeste" },
  { id: "rs", name: "Rio Grande do Sul", value: "RS", region: "Sul" },
  { id: "ro", name: "Rondônia", value: "RO", region: "Norte" },
  { id: "rr", name: "Roraima", value: "RR", region: "Norte" },
  { id: "sc", name: "Santa Catarina", value: "SC", region: "Sul" },
  { id: "sp", name: "São Paulo", value: "SP", region: "Sudeste" },
  { id: "se", name: "Sergipe", value: "SE", region: "Nordeste" },
  { id: "to", name: "Tocantins", value: "TO", region: "Norte" }
];

// Mock de posts para a listagem
export const MOCK_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "Dicas para provas de Português em concursos públicos",
    summary: "Confira nossas dicas essenciais para se destacar nas provas de língua portuguesa em concursos públicos.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    author: "Maria Silva",
    commentCount: 15,
    likesCount: 32,
    createdAt: "2023-10-15T14:30:00Z",
    slug: "dicas-para-provas-de-portugues",
    category: "Português"
  },
  {
    id: "2",
    title: "Como estudar para concursos jurídicos",
    summary: "Aprenda métodos eficientes para estudar direito e conquistar sua aprovação em concursos jurídicos.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    author: "Carlos Mendes",
    commentCount: 8,
    likesCount: 24,
    createdAt: "2023-10-10T09:45:00Z",
    slug: "como-estudar-para-concursos-juridicos",
    category: "Direito"
  },
  {
    id: "3",
    title: "Matemática para concursos: fórmulas essenciais",
    summary: "Domine as principais fórmulas matemáticas cobradas em provas de concursos públicos.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    author: "Fernando Costa",
    commentCount: 5,
    likesCount: 18,
    createdAt: "2023-09-28T11:20:00Z",
    slug: "matematica-para-concursos-formulas-essenciais",
    category: "Matemática"
  },
];
