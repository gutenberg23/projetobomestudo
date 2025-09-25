import React, { useRef } from 'react';
import { useQuestionManagementStore } from '@/stores/questionManagementStore';
import SelectField from "./SelectField";
import AssuntosField from "./AssuntosField";
import TopicosFieldWrapper from "./TopicosFieldWrapper";
import { useSelectFieldState } from "./useSelectFieldState";
import { CheckboxGroup } from "@/components/questions/CheckboxGroup";
import AddValueDialog from "./AddValueDialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { isEqual } from 'lodash';

interface QuestionMetadataFieldsProps {
  institution: string;
  setInstitution: (value: string) => void;
  organization: string;
  setOrganization: (value: string) => void;
  year: string;
  setYear: (value: string) => void;
  role: string;
  setRole: (value: string) => void;
  discipline: string;
  setDiscipline: (value: string) => void;
  level: string;
  setLevel: (value: string) => void;
  difficulty: string;
  setDifficulty: (value: string) => void;
  questionType: string;
  setQuestionType: (value: string) => void;
  assuntos: string[];
  setAssuntos: (value: string[]) => void;
  topicos: string[];
  setTopicos: (value: string[]) => void;
  showValidation?: boolean;
}

export const QuestionMetadataFields: React.FC<QuestionMetadataFieldsProps> = ({
  institution,
  setInstitution,
  organization,
  setOrganization,
  year,
  setYear,
  role,
  setRole,
  discipline,
  setDiscipline,
  level,
  setLevel,
  difficulty,
  setDifficulty,
  questionType,
  setQuestionType,
  assuntos,
  setAssuntos,
  topicos,
  setTopicos,
  showValidation = false,
}) => {
  const dropdownData = useQuestionManagementStore((state) => state.dropdownData);
  
  // Criar estados locais de backup para quando as props não funcionarem
  const [localAssuntos, setLocalAssuntos] = React.useState<string[]>(Array.isArray(assuntos) ? assuntos : []);
  const [localTopicos, setLocalTopicos] = React.useState<string[]>(Array.isArray(topicos) ? topicos : []);
  
  // Referências para evitar atualizações desnecessárias
  const lastAssuntosRef = useRef<string[]>(Array.isArray(assuntos) ? [...assuntos] : []);
  const lastTopicosRef = useRef<string[]>(topicos || []);
  
  // Sincronizar estados locais com props quando elas mudarem
  React.useEffect(() => {
    if (Array.isArray(assuntos) && !isEqual(assuntos, lastAssuntosRef.current)) {
      lastAssuntosRef.current = [...assuntos];
      setLocalAssuntos(assuntos);
    }
  }, [assuntos]);
  
  React.useEffect(() => {
    if (Array.isArray(topicos) && !isEqual(topicos, lastTopicosRef.current)) {
      lastTopicosRef.current = [...topicos];
      setLocalTopicos(topicos);
    }
  }, [topicos]);
  
  // Funções seguras para atualizar os estados
  const safeSetAssuntos = React.useCallback((newAssuntos: string[]) => {
    // Verificar se realmente houve mudança para evitar atualizações desnecessárias
    if (!isEqual(newAssuntos, lastAssuntosRef.current)) {
      lastAssuntosRef.current = [...newAssuntos];
      setLocalAssuntos(newAssuntos);
      
      if (typeof setAssuntos === 'function') {
        try {
          setAssuntos(newAssuntos);
        } catch (error) {
          console.error('Erro ao chamar setAssuntos:', error);
        }
      } else {
        console.warn('setAssuntos não é uma função', typeof setAssuntos);
      }
    }
  }, [setAssuntos]);
  
  const safeSetTopicos = (newTopicos: string[]) => {
    // Só atualiza se houver uma mudança real
    if (!isEqual(newTopicos, lastTopicosRef.current)) {
      console.log("Atualizando tópicos para:", newTopicos);
      lastTopicosRef.current = [...newTopicos];
      if (typeof setTopicos === 'function') {
        setTopicos(newTopicos);
      }
    }
  };

  // Estados para os campos de seleção
  const institutionState = useSelectFieldState(
    institution,
    setInstitution,
    dropdownData.institutions,
    (values) => useQuestionManagementStore.setState(state => ({ dropdownData: { ...state.dropdownData, institutions: values } })),
    "Banca"
  );

  const organizationState = useSelectFieldState(
    organization,
    setOrganization,
    dropdownData.organizations,
    (values) => useQuestionManagementStore.setState(state => ({ dropdownData: { ...state.dropdownData, organizations: values } })),
    "Órgão"
  );

  const yearState = useSelectFieldState(
    year,
    setYear,
    dropdownData.years,
    (values) => useQuestionManagementStore.setState(state => ({ dropdownData: { ...state.dropdownData, years: values } })),
    "Ano"
  );

  const disciplineState = useSelectFieldState(
    discipline,
    setDiscipline,
    dropdownData.disciplines,
    (values) => useQuestionManagementStore.setState(state => ({ dropdownData: { ...state.dropdownData, disciplines: values } })),
    "Disciplina"
  );

  const levelState = useSelectFieldState(
    level,
    setLevel,
    dropdownData.levels,
    (values) => useQuestionManagementStore.setState(state => ({ dropdownData: { ...state.dropdownData, levels: values } })),
    "Nível"
  );

  const difficultyState = useSelectFieldState(
    difficulty,
    setDifficulty,
    dropdownData.difficulties,
    (values) => useQuestionManagementStore.setState(state => ({ dropdownData: { ...state.dropdownData, difficulties: values } })),
    "Dificuldade"
  );

  const questionTypeState = useSelectFieldState(
    questionType,
    setQuestionType,
    dropdownData.questionTypes,
    (values) => useQuestionManagementStore.setState(state => ({ dropdownData: { ...state.dropdownData, questionTypes: values } })),
    "Tipo de Questão"
  );

  const rolesState = useSelectFieldState(
    role,
    setRole,
    dropdownData.roles,
    (values) => useQuestionManagementStore.setState(state => ({ dropdownData: { ...state.dropdownData, roles: values } })),
    "Cargo"
  );

  // Função para gerenciar seleção múltipla de cargos
  const handleRoleChange = (value: string) => {
    const newRoles = role.split(';').filter(r => r !== '');
    const index = newRoles.indexOf(value);
    if (index === -1) {
      newRoles.push(value);
    } else {
      newRoles.splice(index, 1);
    }
    setRole(newRoles.join(';'));
  };

  // Função para passar ao setValue do TopicosFieldWrapper
  const handleSetValue = (name: string, value: any) => {
    if (name === 'topicos') {
      safeSetTopicos(value);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {/* Primeira coluna */}
      <div className="space-y-4">
        <SelectField
          label="Banca"
          value={institutionState.value}
          options={institutionState.options}
          onChange={institutionState.handleChange}
          onAddOption={institutionState.handleAddOption}
          placeholder="Selecione a banca"
          error={showValidation && !institution ? "Selecione uma banca" : undefined}
        />
        
        <SelectField
          label="Órgão"
          value={organizationState.value}
          options={organizationState.options}
          onChange={organizationState.handleChange}
          onAddOption={organizationState.handleAddOption}
          placeholder="Selecione o órgão"
          error={showValidation && !organization ? "Selecione um órgão" : undefined}
        />
        
        <SelectField
          label="Ano"
          value={yearState.value}
          options={yearState.options}
          onChange={yearState.handleChange}
          onAddOption={yearState.handleAddOption}
          placeholder="Selecione o ano"
          error={showValidation && !year ? "Selecione um ano" : undefined}
        />
        
        {/* Seleção múltipla de cargos */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <Label htmlFor="role">Cargo</Label>
            <AddValueDialog
              title="Adicionar Cargo"
              onAdd={rolesState.handleAddOption}
              buttonLabel="+"
              label="Nome do Cargo"
              placeholder="Digite o nome do cargo"
            />
          </div>
          
          <Select onValueChange={rolesState.handleChange} value={rolesState.value}>
            <SelectTrigger className={cn(showValidation && !role && "border-red-500")}>
              <SelectValue placeholder="Selecione o cargo" />
            </SelectTrigger>
            <SelectContent>
              {rolesState.options.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {showValidation && !role && <p className="text-red-500 text-sm">Selecione um cargo</p>}
          
          {/* Exibir cargos selecionados como badges */}
          {role && (
            <div className="flex flex-wrap gap-1 mt-2">
              {role.split(';').filter(r => r !== '').map((r) => (
                <Badge key={r} variant="outline" className="flex items-center gap-1">
                  {r}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRoleChange(r)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Segunda coluna */}
      <div className="space-y-4">
        <SelectField
          label="Disciplina"
          value={disciplineState.value}
          options={disciplineState.options}
          onChange={disciplineState.handleChange}
          onAddOption={disciplineState.handleAddOption}
          placeholder="Selecione a disciplina"
          error={showValidation && !discipline ? "Selecione uma disciplina" : undefined}
        />
        
        <SelectField
          label="Dificuldade"
          value={difficultyState.value}
          options={difficultyState.options}
          onChange={difficultyState.handleChange}
          onAddOption={difficultyState.handleAddOption}
          placeholder="Selecione a dificuldade"
        />
        
        <SelectField
          label="Nível"
          value={levelState.value}
          options={levelState.options}
          onChange={levelState.handleChange}
          onAddOption={levelState.handleAddOption}
          placeholder="Selecione o nível"
        />
        
        <SelectField
          label="Tipo de Questão"
          value={questionTypeState.value}
          options={questionTypeState.options}
          onChange={questionTypeState.handleChange}
          onAddOption={questionTypeState.handleAddOption}
          placeholder="Selecione o tipo"
        />
      </div>
      
      {/* Seleção de assuntos - full width */}
      <div className="col-span-1 md:col-span-2">
        <AssuntosField
          disciplina={discipline}
          assuntos={Array.isArray(assuntos) ? assuntos : localAssuntos}
          onChange={safeSetAssuntos}
        />
      </div>
      
      {/* Seleção de tópicos - full width */}
      <div className="col-span-1 md:col-span-2">
        <Label>Tópicos</Label>
        <TopicosFieldWrapper
          control={null}
          disciplina={discipline}
          assuntos={Array.isArray(assuntos) ? assuntos : localAssuntos}
          topicos={Array.isArray(topicos) ? topicos : localTopicos}
          setValue={handleSetValue}
        />
      </div>
    </div>
  );
};

export default QuestionMetadataFields;
