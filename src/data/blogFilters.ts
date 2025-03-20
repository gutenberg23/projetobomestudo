
import { RegionFilter, StateFilter, CategoryFilter, Region } from "@/components/blog/types";

export const REGIONS: RegionFilter[] = [
  { id: "federal", name: "Federal", value: "federal" as Region },
  { id: "nacional", name: "Nacional", value: "nacional" },
  { id: "norte", name: "Norte", value: "norte" },
  { id: "nordeste", name: "Nordeste", value: "nordeste" },
  { id: "centro-oeste", name: "Centro-Oeste", value: "centro-oeste" },
  { id: "sudeste", name: "Sudeste", value: "sudeste" },
  { id: "sul", name: "Sul", value: "sul" },
];

export const STATES: StateFilter[] = [
  { id: "ac", name: "AC", value: "Acre", region: "norte" },
  { id: "al", name: "AL", value: "Alagoas", region: "nordeste" },
  { id: "am", name: "AM", value: "Amazonas", region: "norte" },
  { id: "ap", name: "AP", value: "Amapá", region: "norte" },
  { id: "ba", name: "BA", value: "Bahia", region: "nordeste" },
  { id: "ce", name: "CE", value: "Ceará", region: "nordeste" },
  { id: "df", name: "DF", value: "Distrito Federal", region: "centro-oeste" },
  { id: "es", name: "ES", value: "Espírito Santo", region: "sudeste" },
  { id: "go", name: "GO", value: "Goiás", region: "centro-oeste" },
  { id: "ma", name: "MA", value: "Maranhão", region: "nordeste" },
  { id: "mg", name: "MG", value: "Minas Gerais", region: "sudeste" },
  { id: "ms", name: "MS", value: "Mato Grosso do Sul", region: "centro-oeste" },
  { id: "mt", name: "MT", value: "Mato Grosso", region: "centro-oeste" },
  { id: "pa", name: "PA", value: "Pará", region: "norte" },
  { id: "pb", name: "PB", value: "Paraíba", region: "nordeste" },
  { id: "pe", name: "PE", value: "Pernambuco", region: "nordeste" },
  { id: "pi", name: "PI", value: "Piauí", region: "nordeste" },
  { id: "pr", name: "PR", value: "Paraná", region: "sul" },
  { id: "rj", name: "RJ", value: "Rio de Janeiro", region: "sudeste" },
  { id: "rn", name: "RN", value: "Rio Grande do Norte", region: "nordeste" },
  { id: "ro", name: "RO", value: "Rondônia", region: "norte" },
  { id: "rr", name: "RR", value: "Roraima", region: "norte" },
  { id: "rs", name: "RS", value: "Rio Grande do Sul", region: "sul" },
  { id: "sc", name: "SC", value: "Santa Catarina", region: "sul" },
  { id: "se", name: "SE", value: "Sergipe", region: "nordeste" },
  { id: "sp", name: "SP", value: "São Paulo", region: "sudeste" },
  { id: "to", name: "TO", value: "Tocantins", region: "norte" },
];

export const CATEGORIES: CategoryFilter[] = [
  { id: "concursos", name: "Concursos", value: "Concursos" },
  { id: "portugues", name: "Português", value: "Português" },
  { id: "matematica", name: "Matemática", value: "Matemática" },
  { id: "direito", name: "Direito", value: "Direito" },
  { id: "edital", name: "Editais", value: "Editais" },
  { id: "dicas", name: "Dicas de Estudo", value: "Dicas de Estudo" },
  { id: "noticias", name: "Notícias", value: "Notícias" },
  { id: "informatica", name: "Informática", value: "Informática" },
  { id: "atualidades", name: "Atualidades", value: "Atualidades" },
  { id: "legislacao", name: "Legislação", value: "Legislação" }
];
