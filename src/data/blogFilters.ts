
import { RegionFilter, StateFilter, CategoryFilter } from "@/components/blog/types";

export const REGIONS: RegionFilter[] = [
  { id: "federal", name: "Federal", value: "nacional" },
  { id: "nacional", name: "Nacional", value: "nacional" },
  { id: "norte", name: "Norte", value: "norte" },
  { id: "nordeste", name: "Nordeste", value: "nordeste" },
  { id: "centro-oeste", name: "Centro-Oeste", value: "centro-oeste" },
  { id: "sudeste", name: "Sudeste", value: "sudeste" },
  { id: "sul", name: "Sul", value: "sul" },
];

export const STATES: StateFilter[] = [
  { id: "ac", name: "AC", value: "Acre", region: "Norte" },
  { id: "al", name: "AL", value: "Alagoas", region: "Nordeste" },
  { id: "am", name: "AM", value: "Amazonas", region: "Norte" },
  { id: "ap", name: "AP", value: "Amapá", region: "Norte" },
  { id: "ba", name: "BA", value: "Bahia", region: "Nordeste" },
  { id: "ce", name: "CE", value: "Ceará", region: "Nordeste" },
  { id: "df", name: "DF", value: "Distrito Federal", region: "Centro-Oeste" },
  { id: "es", name: "ES", value: "Espírito Santo", region: "Sudeste" },
  { id: "go", name: "GO", value: "Goiás", region: "Centro-Oeste" },
  { id: "ma", name: "MA", value: "Maranhão", region: "Nordeste" },
  { id: "mg", name: "MG", value: "Minas Gerais", region: "Sudeste" },
  { id: "ms", name: "MS", value: "Mato Grosso do Sul", region: "Centro-Oeste" },
  { id: "mt", name: "MT", value: "Mato Grosso", region: "Centro-Oeste" },
  { id: "pa", name: "PA", value: "Pará", region: "Norte" },
  { id: "pb", name: "PB", value: "Paraíba", region: "Nordeste" },
  { id: "pe", name: "PE", value: "Pernambuco", region: "Nordeste" },
  { id: "pi", name: "PI", value: "Piauí", region: "Nordeste" },
  { id: "pr", name: "PR", value: "Paraná", region: "Sul" },
  { id: "rj", name: "RJ", value: "Rio de Janeiro", region: "Sudeste" },
  { id: "rn", name: "RN", value: "Rio Grande do Norte", region: "Nordeste" },
  { id: "ro", name: "RO", value: "Rondônia", region: "Norte" },
  { id: "rr", name: "RR", value: "Roraima", region: "Norte" },
  { id: "rs", name: "RS", value: "Rio Grande do Sul", region: "Sul" },
  { id: "sc", name: "SC", value: "Santa Catarina", region: "Sul" },
  { id: "se", name: "SE", value: "Sergipe", region: "Nordeste" },
  { id: "sp", name: "SP", value: "São Paulo", region: "Sudeste" },
  { id: "to", name: "TO", value: "Tocantins", region: "Norte" },
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
