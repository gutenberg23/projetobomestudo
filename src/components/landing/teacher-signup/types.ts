
export const disciplinas = [
  "Português",
  "Matemática",
  "Direito Constitucional",
  "Direito Administrativo",
  "Raciocínio Lógico",
  "Contabilidade",
  "Informática",
  "Administração"
];

export const topicosPorDisciplina: Record<string, string[]> = {
  "Português": ["Gramática", "Interpretação de Texto", "Redação", "Literatura"],
  "Matemática": ["Álgebra", "Geometria", "Estatística", "Probabilidade"],
  "Direito Constitucional": ["Princípios Fundamentais", "Direitos e Garantias", "Organização do Estado"],
  "Direito Administrativo": ["Atos Administrativos", "Licitação", "Contratos Administrativos"],
  "Raciocínio Lógico": ["Lógica de Argumentação", "Estruturas Lógicas", "Diagramas Lógicos"],
  "Contabilidade": ["Contabilidade Básica", "Demonstrações Financeiras", "Análise de Balanços"],
  "Informática": ["Sistemas Operacionais", "Excel", "Word", "Segurança da Informação"],
  "Administração": ["Gestão de Pessoas", "Processos Organizacionais", "Planejamento Estratégico"]
};

export interface TeacherFormData {
  nomeCompleto: string;
  email: string;
  linkYoutube: string;
  disciplina: string;
  instagram: string;
  twitter: string;
  facebook: string;
  fotoPerfil: File | null;
  aceitouTermos: boolean;
}
