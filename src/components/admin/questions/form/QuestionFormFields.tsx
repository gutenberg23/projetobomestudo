import React from 'react';
import { QuestionOption } from '../types';

interface QuestionFormFieldsProps {
  institution: string;
  setInstitution: (value: string) => void;
  institutions: string[];
  organization: string;
  setOrganization: (value: string) => void;
  organizations: string[];
  year: string;
  setYear: (value: string) => void;
  years: string[];
  role: string;
  setRole: (value: string) => void;
  roles: string[];
  discipline: string;
  setDiscipline: (value: string) => void;
  disciplines: string[];
  level: string;
  setLevel: (value: string) => void;
  levels: string[];
  difficulty: string;
  setDifficulty: (value: string) => void;
  difficulties: string[];
  questionType: string;
  setQuestionType: (value: string) => void;
  questionTypes: string[];
  questionText: string;
  setQuestionText: (value: string) => void;
  teacherExplanation: string;
  setTeacherExplanation: (value: string) => void;
  expandableContent: string;
  setExpandableContent: (value: string) => void;
  aiExplanation: string;
  setAIExplanation: (value: string) => void;
  options: QuestionOption[];
  setOptions: (options: QuestionOption[]) => void;
  topicos: string[];
  setTopicos: (value: string[]) => void;
}

export const QuestionFormFields: React.FC<QuestionFormFieldsProps> = ({
  institution,
  setInstitution,
  institutions,
  organization,
  setOrganization,
  organizations,
  year,
  setYear,
  years,
  role,
  setRole,
  roles,
  discipline,
  setDiscipline,
  disciplines,
  level,
  setLevel,
  levels,
  difficulty,
  setDifficulty,
  difficulties,
  questionType,
  setQuestionType,
  questionTypes,
  questionText,
  setQuestionText,
  teacherExplanation,
  setTeacherExplanation,
  expandableContent,
  setExpandableContent,
  aiExplanation,
  setAIExplanation,
  options,
  setOptions,
  topicos,
  setTopicos,
}) => {
  // Função para atualizar uma opção específica
  const handleOptionChange = (index: number, field: keyof QuestionOption, value: string | boolean) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Banca */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Banca</label>
          <select
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Selecione a banca</option>
            {institutions.map((inst) => (
              <option key={inst} value={inst}>{inst}</option>
            ))}
          </select>
        </div>

        {/* Órgão */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Órgão</label>
          <select
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Selecione o órgão</option>
            {organizations.map((org) => (
              <option key={org} value={org}>{org}</option>
            ))}
          </select>
        </div>

        {/* Ano */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Ano</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Selecione o ano</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Cargo */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Cargo</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Selecione o cargo</option>
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Disciplina */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Disciplina</label>
          <select
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Selecione a disciplina</option>
            {disciplines.map((disc) => (
              <option key={disc} value={disc}>{disc}</option>
            ))}
          </select>
        </div>

        {/* Nível */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Nível</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Selecione o nível</option>
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
        </div>

        {/* Dificuldade */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Dificuldade</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Selecione a dificuldade</option>
            {difficulties.map((diff) => (
              <option key={diff} value={diff}>{diff}</option>
            ))}
          </select>
        </div>

        {/* Tipo de Questão */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo de Questão</label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Selecione o tipo</option>
            {questionTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Texto da Questão */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Texto da Questão</label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          rows={6}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      {/* Alternativas */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Alternativas</label>
        {options.map((option, index) => (
          <div key={option.id} className="flex items-center space-x-4">
            <input
              type="radio"
              checked={option.isCorrect}
              onChange={() => {
                const newOptions = options.map((opt, i) => ({
                  ...opt,
                  isCorrect: i === index
                }));
                setOptions(newOptions);
              }}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">
              {String.fromCharCode(65 + index)}
            </span>
            <textarea
              value={option.text}
              onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
              rows={2}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        ))}
      </div>

      {/* Conteúdo Expansível */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Conteúdo Expansível</label>
        <textarea
          value={expandableContent}
          onChange={(e) => setExpandableContent(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      {/* Explicação do Professor */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Explicação do Professor</label>
        <textarea
          value={teacherExplanation}
          onChange={(e) => setTeacherExplanation(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      {/* Resposta da BIA */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Resposta da BIA</label>
        <textarea
          value={aiExplanation}
          onChange={(e) => setAIExplanation(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      {/* Assuntos */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Assuntos</label>
        <select
          multiple
          value={topicos}
          onChange={(e) => {
            const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
            setTopicos(selectedOptions);
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {topicos.map((topic) => (
            <option key={topic} value={topic}>{topic}</option>
          ))}
        </select>
      </div>
    </div>
  );
}; 