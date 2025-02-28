
import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { QuestionCard } from "@/components/new/QuestionCard";

const Questions = () => {
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [showQuestions, setShowQuestions] = useState(true);

  const handleToggleDisabled = (optionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setDisabledOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const question = {
    id: "q1",
    content: "Assinale a alternativa que apresenta o uso correto da crase segundo a norma culta da língua portuguesa.",
    year: "2022",
    institution: "FUNDATEC",
    organization: "Prefeitura de Porto Alegre",
    role: "Administrador",
    options: [
      { id: "opt1", text: "Refiro-me à questões de ordem pública." },
      { id: "opt2", text: "Chegou à noite e saiu de manhã." },
      { id: "opt3", text: "Estava disposto à colaborar com a investigação." },
      { id: "opt4", text: "Ela foi à farmácia comprar remédios." },
      { id: "opt5", text: "Voltamos à pé para casa depois da festa." },
    ],
    comments: [
      {
        id: "c1",
        author: "Maria Silva",
        avatar: "https://i.pravatar.cc/100?img=1",
        content: "Excelente questão para revisar o uso da crase!",
        timestamp: "há 2 dias",
        likes: 5
      },
      {
        id: "c2",
        author: "João Oliveira",
        avatar: "https://i.pravatar.cc/100?img=2",
        content: "Sempre confundo o uso da crase antes de verbos no infinitivo.",
        timestamp: "há 1 dia",
        likes: 3
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-[88px] px-4">
        <div className="w-full max-w-6xl mx-auto py-8">
          <h1 className="text-3xl font-bold text-[#272f3c] mb-6">Banco de Questões</h1>
          
          <div className="mb-8 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-[#272f3c] mb-4">Filtros</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[#67748a] mb-2">Matéria</label>
                <select className="w-full p-2 border border-gray-300 rounded-md">
                  <option>Todas as matérias</option>
                  <option>Português</option>
                  <option>Matemática</option>
                  <option>Direito Constitucional</option>
                </select>
              </div>
              <div>
                <label className="block text-[#67748a] mb-2">Banca</label>
                <select className="w-full p-2 border border-gray-300 rounded-md">
                  <option>Todas as bancas</option>
                  <option>CESPE</option>
                  <option>FGV</option>
                  <option>FUNDATEC</option>
                </select>
              </div>
              <div>
                <label className="block text-[#67748a] mb-2">Ano</label>
                <select className="w-full p-2 border border-gray-300 rounded-md">
                  <option>Todos os anos</option>
                  <option>2023</option>
                  <option>2022</option>
                  <option>2021</option>
                </select>
              </div>
            </div>
            <button className="mt-4 px-6 py-2 bg-[#ea2be2] text-white rounded-md hover:bg-opacity-90 transition-colors">
              Aplicar Filtros
            </button>
          </div>
          
          <div className="space-y-6">
            <QuestionCard 
              question={question} 
              disabledOptions={disabledOptions}
              onToggleDisabled={handleToggleDisabled}
            />
            
            <QuestionCard 
              question={{
                ...question,
                id: "q2",
                content: "Sobre os princípios da Administração Pública, é correto afirmar que:",
                institution: "CESPE",
                organization: "TRT 4ª Região",
                options: [
                  { id: "opt6", text: "O princípio da legalidade significa que o administrador público está sujeito às determinações da lei, não podendo se afastar de suas prescrições, sob pena de praticar ato inválido." },
                  { id: "opt7", text: "O princípio da moralidade não é aplicável aos concursos públicos, apenas aos processos licitatórios." },
                  { id: "opt8", text: "O princípio da publicidade pode ser restringido quando o sigilo for imprescindível à segurança da sociedade e do Estado." },
                  { id: "opt9", text: "O princípio da eficiência foi introduzido pela Emenda Constitucional nº 45/2004." },
                  { id: "opt10", text: "O princípio da impessoalidade impede que o administrador utilize seu cargo para promoção pessoal, mas não obsta a prática de nepotismo." },
                ]
              }} 
              disabledOptions={disabledOptions}
              onToggleDisabled={handleToggleDisabled}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Questions;
