
import { Region } from "@/components/blog/types";

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
  "norte",
  "nordeste", 
  "centro-oeste", 
  "sudeste", 
  "sul", 
  "federal", 
  "nacional"
];

// Estados disponíveis
export const ESTADOS = [
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
