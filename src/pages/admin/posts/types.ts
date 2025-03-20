import { BlogPost, Region } from "@/components/blog/types";
import { StateFilter } from "@/components/blog/types";

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

// Regiões disponíveis - corrigidas para usar os valores definidos no tipo Region
export const REGIOES: Region[] = [
  "norte",
  "nordeste", 
  "centro-oeste", 
  "sudeste", 
  "sul", 
  "nacional", 
  "internacional",
  "federal"
];

// Estados disponíveis
export const ESTADOS: StateFilter[] = [
  { id: "ac", name: "Acre", value: "AC", region: "norte" },
  { id: "al", name: "Alagoas", value: "AL", region: "nordeste" },
  { id: "ap", name: "Amapá", value: "AP", region: "norte" },
  { id: "am", name: "Amazonas", value: "AM", region: "norte" },
  { id: "ba", name: "Bahia", value: "BA", region: "nordeste" },
  { id: "ce", name: "Ceará", value: "CE", region: "nordeste" },
  { id: "df", name: "Distrito Federal", value: "DF", region: "centro-oeste" },
  { id: "es", name: "Espírito Santo", value: "ES", region: "sudeste" },
  { id: "go", name: "Goiás", value: "GO", region: "centro-oeste" },
  { id: "ma", name: "Maranhão", value: "MA", region: "nordeste" },
  { id: "mt", name: "Mato Grosso", value: "MT", region: "centro-oeste" },
  { id: "ms", name: "Mato Grosso do Sul", value: "MS", region: "centro-oeste" },
  { id: "mg", name: "Minas Gerais", value: "MG", region: "sudeste" },
  { id: "pa", name: "Pará", value: "PA", region: "norte" },
  { id: "pb", name: "Paraíba", value: "PB", region: "nordeste" },
  { id: "pr", name: "Paraná", value: "PR", region: "sul" },
  { id: "pe", name: "Pernambuco", value: "PE", region: "nordeste" },
  { id: "pi", name: "Piauí", value: "PI", region: "nordeste" },
  { id: "rj", name: "Rio de Janeiro", value: "RJ", region: "sudeste" },
  { id: "rn", name: "Rio Grande do Norte", value: "RN", region: "nordeste" },
  { id: "rs", name: "Rio Grande do Sul", value: "RS", region: "sul" },
  { id: "ro", name: "Rondônia", value: "RO", region: "norte" },
  { id: "rr", name: "Roraima", value: "RR", region: "norte" },
  { id: "sc", name: "Santa Catarina", value: "SC", region: "sul" },
  { id: "sp", name: "São Paulo", value: "SP", region: "sudeste" },
  { id: "se", name: "Sergipe", value: "SE", region: "nordeste" },
  { id: "to", name: "Tocantins", value: "TO", region: "norte" }
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
    category: "Português",
    relatedPosts: []
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
    category: "Direito",
    relatedPosts: []
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
    category: "Matemática",
    relatedPosts: []
  },
];
