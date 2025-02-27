import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuestionCard } from "@/components/new/QuestionCard";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { CheckboxGroup } from "@/components/questions/CheckboxGroup";

// Dados fictícios para demonstração
const MOCK_QUESTIONS = [{
  id: "q1",
  content: "Conforme a Constituição Federal de 1988, é CORRETO afirmar que:",
  year: "2023",
  institution: "CESPE",
  organization: "TCU",
  role: "Auditor Federal",
  options: [{
    id: "o1",
    text: "O sistema tributário nacional é regido pelos princípios da legalidade, anterioridade e transparência fiscal."
  }, {
    id: "o2",
    text: "A saúde é direito de todos e dever do Estado, garantido mediante políticas sociais e econômicas."
  }, {
    id: "o3",
    text: "Os cargos, empregos e funções públicas são acessíveis aos brasileiros que preencham os requisitos estabelecidos em lei."
  }, {
    id: "o4",
    text: "O ensino fundamental é obrigatório e gratuito, assegurada sua oferta para todos que não tiverem acesso na idade própria."
  }, {
    id: "o5",
    text: "A previdência social será organizada sob a forma de regime geral, de caráter contributivo e de filiação obrigatória."
  }],
  comments: [{
    id: "c1",
    author: "João Silva",
    avatar: "https://github.com/shadcn.png",
    content: "Esta questão aborda princípios constitucionais fundamentais.",
    timestamp: "Há 2 dias",
    likes: 5
  }]
}, {
  id: "q2",
  content: "Em relação ao Direito Administrativo, assinale a alternativa correta:",
  year: "2022",
  institution: "FGV",
  organization: "Prefeitura de São Paulo",
  role: "Procurador Municipal",
  options: [{
    id: "o6",
    text: "O princípio da legalidade significa que o administrador público está sujeito aos mandamentos da lei em toda sua atividade funcional."
  }, {
    id: "o7",
    text: "A administração pública pode revogar seus próprios atos quando eivados de vícios que os tornem ilegais."
  }, {
    id: "o8",
    text: "O princípio da impessoalidade estabelece que a finalidade pública deve nortear toda a atividade administrativa."
  }, {
    id: "o9",
    text: "A presunção de legitimidade dos atos administrativos é absoluta, não admitindo prova em contrário."
  }, {
    id: "o10",
    text: "O poder de polícia é indelegável, não podendo ser exercido por entidades da administração indireta."
  }],
  comments: [{
    id: "c2",
    author: "Maria Oliveira",
    avatar: "https://github.com/shadcn.png",
    content: "O gabarito desta questão é a letra A, pois trata do princípio da legalidade corretamente.",
    timestamp: "Há 3 dias",
    likes: 8
  }]
}];

// Opções para os filtros
const FILTER_OPTIONS = {
  disciplines: ["Direito Constitucional", "Direito Administrativo", "Português", "Matemática", "Informática"],
  topics: ["Princípios Constitucionais", "Direitos Fundamentais", "Atos Administrativos", "Concordância Verbal", "Lógica de Programação"],
  institutions: ["CESPE", "FGV", "VUNESP", "FEPESE", "FCC"],
  organizations: ["TCU", "STF", "TRF", "Prefeitura de São Paulo", "INSS"],
  roles: ["Auditor Federal", "Analista Judiciário", "Técnico Administrativo", "Procurador Municipal", "Especialista em Políticas Públicas"],
  years: ["2023", "2022", "2021", "2020", "2019"],
  educationLevels: ["Médio", "Superior", "Pós-graduação"]
};
const Questions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    disciplines: [] as string[],
    topics: [] as string[],
    institutions: [] as string[],
    organizations: [] as string[],
    roles: [] as string[],
    years: [] as string[],
    educationLevels: [] as string[]
  });
  const [questionsPerPage, setQuestionsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const totalQuestions = MOCK_QUESTIONS.length;
  const handleToggleDisabled = (optionId: string, event: React.MouseEvent) => {
    event.preventDefault();
    setDisabledOptions(prev => prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]);
  };
  const handleFilterChange = (category: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => {
      const currentValues = prev[category];
      return {
        ...prev,
        [category]: currentValues.includes(value) ? currentValues.filter(item => item !== value) : [...currentValues, value]
      };
    });
  };
  const handleApplyFilters = () => {
    // Em uma implementação real, aqui seria feita uma chamada à API
    // para buscar as questões com os filtros aplicados
    setCurrentPage(1);
  };
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Cálculo para paginação
  const totalPages = Math.ceil(totalQuestions / parseInt(questionsPerPage));
  return <div className="flex flex-col min-h-screen bg-[#f6f8fa]">
      <Header />
      <main className="flex-grow pt-[120px] px-4 md:px-8 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6">Questões</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="relative">
              <Input type="text" placeholder="Pesquisar palavras-chave..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pr-10" />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm whitespace-nowrap">Questões por página:</span>
              <Select value={questionsPerPage} onValueChange={value => setQuestionsPerPage(value)}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            <CheckboxGroup title="Disciplina" options={FILTER_OPTIONS.disciplines} selectedValues={selectedFilters.disciplines} onChange={value => handleFilterChange("disciplines", value)} />
            
            <CheckboxGroup title="Tópico" options={FILTER_OPTIONS.topics} selectedValues={selectedFilters.topics} onChange={value => handleFilterChange("topics", value)} />
            
            <CheckboxGroup title="Banca" options={FILTER_OPTIONS.institutions} selectedValues={selectedFilters.institutions} onChange={value => handleFilterChange("institutions", value)} />
            
            <CheckboxGroup title="Instituição" options={FILTER_OPTIONS.organizations} selectedValues={selectedFilters.organizations} onChange={value => handleFilterChange("organizations", value)} />
            
            <CheckboxGroup title="Cargo" options={FILTER_OPTIONS.roles} selectedValues={selectedFilters.roles} onChange={value => handleFilterChange("roles", value)} />
            
            <CheckboxGroup title="Ano" options={FILTER_OPTIONS.years} selectedValues={selectedFilters.years} onChange={value => handleFilterChange("years", value)} />
            
            <CheckboxGroup title="Escolaridade" options={FILTER_OPTIONS.educationLevels} selectedValues={selectedFilters.educationLevels} onChange={value => handleFilterChange("educationLevels", value)} />
          </div>

          <Button onClick={handleApplyFilters} className="w-full">
            Filtrar Questões
          </Button>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando <strong>{MOCK_QUESTIONS.length}</strong> questões
            {Object.values(selectedFilters).some(arr => arr.length > 0) && " com filtros aplicados"}
          </p>
        </div>

        <div className="space-y-6 mb-8">
          {MOCK_QUESTIONS.map(question => <QuestionCard key={question.id} question={question} disabledOptions={disabledOptions} onToggleDisabled={handleToggleDisabled} />)}
        </div>

        {totalPages > 1 && <div className="flex items-center justify-center gap-2 mt-8">
            <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>
            
            <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>}
      </main>
      <Footer />
    </div>;
};
export default Questions;