import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import QuestionFiltersPanel from "@/components/questions/QuestionFiltersPanel";
import QuestionResults from "@/components/questions/QuestionResults";

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
    text: "O sistema tributário nacional é regido pelos princípios da legalidade, anterioridade e transparência fiscal.",
    isCorrect: false
  }, {
    id: "o2",
    text: "A saúde é direito de todos e dever do Estado, garantido mediante políticas sociais e econômicas.",
    isCorrect: false
  }, {
    id: "o3",
    text: "Os cargos, empregos e funções públicas são acessíveis aos brasileiros que preencham os requisitos estabelecidos em lei.",
    isCorrect: false
  }, {
    id: "o4",
    text: "O ensino fundamental é obrigatório e gratuito, assegurada sua oferta para todos que não tiverem acesso na idade própria.",
    isCorrect: true
  }, {
    id: "o5",
    text: "A previdência social será organizada sob a forma de regime geral, de caráter contributivo e de filiação obrigatória.",
    isCorrect: false
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
    text: "O princípio da legalidade significa que o administrador público está sujeito aos mandamentos da lei em toda sua atividade funcional.",
    isCorrect: true
  }, {
    id: "o7",
    text: "A administração pública pode revogar seus próprios atos quando eivados de vícios que os tornem ilegais.",
    isCorrect: false
  }, {
    id: "o8",
    text: "O princípio da impessoalidade estabelece que a finalidade pública deve nortear toda a atividade administrativa.",
    isCorrect: false
  }, {
    id: "o9",
    text: "A presunção de legitimidade dos atos administrativos é absoluta, não admitindo prova em contrário.",
    isCorrect: false
  }, {
    id: "o10",
    text: "O poder de polícia é indelegável, não podendo ser exercido por entidades da administração indireta.",
    isCorrect: false
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
    setDisabledOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId) 
        : [...prev, optionId]
    );
  };
  
  const handleFilterChange = (category: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => {
      const currentValues = prev[category];
      return {
        ...prev,
        [category]: currentValues.includes(value) 
          ? currentValues.filter(item => item !== value) 
          : [...currentValues, value]
      };
    });
  };
  
  const handleApplyFilters = () => {
    setCurrentPage(1);
  };
  
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Cálculo para paginação
  const totalPages = Math.ceil(totalQuestions / parseInt(questionsPerPage));
  
  const hasFilters = Object.values(selectedFilters).some(arr => arr.length > 0);
  
  return (
    <div className="flex flex-col min-h-screen bg-[#f6f8fa]">
      <Header />
      <main className="flex-grow pt-[120px] px-4 md:px-8 mx-auto w-full">
        <h1 className="text-2xl mb-6 text-[#262f3c] font-extrabold md:text-3xl">Questões</h1>

        <QuestionFiltersPanel 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedFilters={selectedFilters}
          handleFilterChange={handleFilterChange}
          handleApplyFilters={handleApplyFilters}
          questionsPerPage={questionsPerPage}
          setQuestionsPerPage={setQuestionsPerPage}
          filterOptions={FILTER_OPTIONS}
        />

        <QuestionResults 
          questions={MOCK_QUESTIONS}
          disabledOptions={disabledOptions}
          onToggleDisabled={handleToggleDisabled}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          hasFilters={hasFilters}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Questions;
