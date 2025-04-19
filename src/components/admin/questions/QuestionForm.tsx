import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { QuestionOption } from "./types";
import { useQuestionManagementStore } from "@/stores/questionManagementStore";
import { toast } from "sonner";
import { generateAIResponse } from "@/services/aiService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import QuestionTextFields from "./form/QuestionTextFields";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface QuestionFormProps {
  year: string;
  setYear: (value: string) => void;
  institution: string;
  setInstitution: (value: string) => void;
  organization: string;
  setOrganization: (value: string) => void;
  role: string[];
  setRole: (value: string[]) => void;
  discipline: string;
  setDiscipline: (value: string) => void;
  level: string;
  setLevel: (value: string) => void;
  difficulty: string;
  setDifficulty: (value: string) => void;
  questionType: string;
  setQuestionType: (value: string) => void;
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
  assuntos: string[];
  setAssuntos: (value: string[]) => void;
  topicos: string[];
  setTopicos: (value: string[]) => void;
  onSubmit: () => void;
  submitButtonText: string;
  isEditing?: boolean;
}

interface SearchFieldProps {
  label: string;
  value: string;
  setValue: (value: string) => void;
  options: string[];
  addOption: (value: string) => void;
  removeOption?: (value: string) => void;
  editOption?: (oldValue: string, newValue: string) => void;
  isRequired?: boolean;
}

const SearchField: React.FC<SearchFieldProps> = ({
  label,
  value,
  setValue,
  options,
  addOption,
  removeOption,
  editOption,
  isRequired = false
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [newOption, setNewOption] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingValue, setEditingValue] = useState<{ old: string, new: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options
    .filter(option => typeof option === 'string')
    .filter(option => option.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSelectOption = (option: string) => {
    setValue(option);
    setSearchQuery("");
    setShowDropdown(false);
    
    // Forçar evento de alteração para garantir que o React detecte a mudança
    const event = new Event('input', { bubbles: true });
    const inputElement = document.getElementById(`search-${label}`);
    if (inputElement) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(inputElement, option);
        inputElement.dispatchEvent(event);
      }
    }
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      addOption(newOption.trim());
      setValue(newOption.trim());
      setNewOption("");
      setIsAdding(false);
      setShowDropdown(false);
    }
  };

  const handleRemoveOption = (option: string) => {
    if (removeOption) {
      removeOption(option);
      if (value === option) {
        setValue("");
      }
    }
  };

  const handleEditOption = () => {
    if (editingValue && editOption && editingValue.new.trim()) {
      editOption(editingValue.old, editingValue.new);
      if (value === editingValue.old) {
        setValue(editingValue.new);
      }
      setEditingValue(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor={`search-${label}`} className="flex items-center">
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative" ref={dropdownRef}>
        <div className="flex">
          <div className="relative flex-1">
            <Input
              id={`search-${label}`}
              value={searchQuery || (showDropdown ? searchQuery : value)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder={`Pesquisar ${label.toLowerCase()}...`}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Button
            variant="outline"
            type="button"
            className="ml-2"
            onClick={() => setIsAdding(true)}
          >
            +
          </Button>
        </div>

        {showDropdown && filteredOptions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredOptions.map((option, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelectOption(option)}
              >
                <span>{option}</span>
                <div className="flex space-x-1">
                  {editOption && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingValue({ old: option, new: option });
                      }}
                    >
                      Editar
                    </Button>
                  )}
                  {removeOption && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveOption(option);
                      }}
                    >
                      Remover
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {isAdding && (
          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg p-3">
            <div className="space-y-2">
              <Label htmlFor="new-option">Novo {label}</Label>
              <Input
                id="new-option"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder={`Digite o novo ${label.toLowerCase()}`}
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setNewOption("");
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleAddOption}>Adicionar</Button>
              </div>
            </div>
          </div>
        )}

        {editingValue && (
          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg p-3">
            <div className="space-y-2">
              <Label htmlFor="edit-option">Editar {label}</Label>
              <Input
                id="edit-option"
                value={editingValue.new}
                onChange={(e) => setEditingValue({ ...editingValue, new: e.target.value })}
                placeholder={`Editar ${label.toLowerCase()}`}
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingValue(null)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleEditOption}>Salvar</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface MultiSelectFieldProps {
  label: string;
  values: string[];
  setValues: (values: string[]) => void;
  options: string[];
  addOption: (value: string) => void;
  removeOption?: (value: string) => void;
  editOption?: (oldValue: string, newValue: string) => void;
  isRequired?: boolean;
}

const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  label,
  values,
  setValues,
  options,
  addOption,
  removeOption,
  editOption,
  isRequired = false
}) => {
  // Debug para verificar se os valores estão chegando corretamente
  useEffect(() => {
    console.log(`MultiSelectField ${label} - valores recebidos:`, values);
  }, [label, values]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [newOption, setNewOption] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingValue, setEditingValue] = useState<{ old: string, new: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Verificar se values é um array válido
  const safeValues = Array.isArray(values) ? values : [];

  const filteredOptions = options
    .filter(option => typeof option === 'string')
    .filter(option => {
      return option.toLowerCase().includes(searchQuery.toLowerCase());
    });

  const handleSelectOption = (option: string) => {
    // Evitar duplicatas
    if (!safeValues.includes(option)) {
      setValues([...safeValues, option]);
      setSearchQuery("");
      
      // Forçar evento de alteração para garantir que o React detecte a mudança
      const event = new Event('input', { bubbles: true });
      const inputElement = document.getElementById(`multiselect-${label}`);
      if (inputElement) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        )?.set;
        if (nativeInputValueSetter) {
          nativeInputValueSetter.call(inputElement, "");
          inputElement.dispatchEvent(event);
        }
      }
    }
  };

  const handleRemoveValue = (option: string) => {
    setValues(safeValues.filter(v => v !== option));
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      addOption(newOption.trim());
      setValues([...safeValues, newOption.trim()]);
      setNewOption("");
      setIsAdding(false);
    }
  };

  const handleRemoveOption = (option: string) => {
    if (removeOption) {
      removeOption(option);
      handleRemoveValue(option);
    }
  };

  const handleEditOption = () => {
    if (editingValue && editOption && editingValue.new.trim()) {
      editOption(editingValue.old, editingValue.new);
      if (safeValues.includes(editingValue.old)) {
        setValues(safeValues.map(v => v === editingValue.old ? editingValue.new : v));
      }
      setEditingValue(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor={`multiselect-${label}`} className="flex items-center">
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative" ref={dropdownRef}>
        <div className="flex">
          <div className="relative flex-1">
            <Input
              id={`multiselect-${label}`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder={`Pesquisar ${label.toLowerCase()}...`}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Button
            variant="outline"
            type="button"
            className="ml-2"
            onClick={() => setIsAdding(true)}
          >
            +
          </Button>
        </div>

        {safeValues.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {safeValues.map((value, index) => (
              <div key={index} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center">
                <span>{value}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 ml-1"
                  onClick={() => handleRemoveValue(value)}
                >
                  &times;
                </Button>
              </div>
            ))}
          </div>
        )}

        {showDropdown && filteredOptions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredOptions.map((option, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelectOption(option)}
              >
                <span>{option}</span>
                <div className="flex space-x-1">
                  {editOption && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingValue({ old: option, new: option });
                      }}
                    >
                      Editar
                    </Button>
                  )}
                  {removeOption && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveOption(option);
                      }}
                    >
                      Remover
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {isAdding && (
          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg p-3">
            <div className="space-y-2">
              <Label htmlFor="new-option">Novo {label.slice(0, -1)}</Label>
              <Input
                id="new-option"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder={`Digite o novo ${label.toLowerCase().slice(0, -1)}`}
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setNewOption("");
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleAddOption}>Adicionar</Button>
              </div>
            </div>
          </div>
        )}

        {editingValue && (
          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg p-3">
            <div className="space-y-2">
              <Label htmlFor="edit-option">Editar {label.slice(0, -1)}</Label>
              <Input
                id="edit-option"
                value={editingValue.new}
                onChange={(e) => setEditingValue({ ...editingValue, new: e.target.value })}
                placeholder={`Editar ${label.toLowerCase().slice(0, -1)}`}
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingValue(null)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleEditOption}>Salvar</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente principal do formulário de questões
export const QuestionForm: React.FC<QuestionFormProps> = ({
  year,
  setYear,
  institution,
  setInstitution,
  organization,
  setOrganization,
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
  assuntos,
  setAssuntos,
  topicos,
  setTopicos,
  onSubmit,
  submitButtonText,
  isEditing = false,
}) => {
  const [activeTab, setActiveTab] = useState("metadata");
  const [aiPrompt, setAIPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [accordionValue, setAccordionValue] = useState<string[]>(["item-1"]);

  const dropdownData = useQuestionManagementStore((state) => state.dropdownData);
  
  // Log para debug dos dados de dropdown
  useEffect(() => {
    console.log("Dados de dropdown no QuestionForm:", {
      years: dropdownData?.years?.length || 0,
      institutions: dropdownData?.institutions?.length || 0,
      organizations: dropdownData?.organizations?.length || 0,
      roles: dropdownData?.roles?.length || 0,
      disciplines: dropdownData?.disciplines?.length || 0,
      levels: dropdownData?.levels?.length || 0,
      difficulties: dropdownData?.difficulties?.length || 0,
      questionTypes: dropdownData?.questionTypes?.length || 0
    });
  }, [dropdownData]);
  
  // Extrair os dados do dropdown para uso nos campos com valores padrão seguros
  const institutions = dropdownData?.institutions || [];
  const organizations = dropdownData?.organizations || [];
  const years = dropdownData?.years || [];
  const disciplines = dropdownData?.disciplines || [];
  const levels = dropdownData?.levels || [];
  const difficulties = dropdownData?.difficulties || [];
  const questionTypes = dropdownData?.questionTypes || [];
  const roles = dropdownData?.roles || [];

  // Função para adicionar opções aos dados do dropdown
  const addToDropdownData = (category: string, value: string) => {
    useQuestionManagementStore.setState(state => {
      const updatedData = { ...state.dropdownData };
      // @ts-ignore
      if (!updatedData[category].includes(value)) {
        // @ts-ignore
        updatedData[category] = [...updatedData[category], value];
      }
      return { dropdownData: updatedData };
    });
  };

  // Função para remover opções dos dados do dropdown
  const removeFromDropdownData = (category: string, value: string) => {
    useQuestionManagementStore.setState(state => {
      const updatedData = { ...state.dropdownData };
      // @ts-ignore
      updatedData[category] = updatedData[category].filter((item: string) => item !== value);
      return { dropdownData: updatedData };
    });
  };

  // Função para editar opções nos dados do dropdown
  const editInDropdownData = (category: string, oldValue: string, newValue: string) => {
    useQuestionManagementStore.setState(state => {
      const updatedData = { ...state.dropdownData };
      // @ts-ignore
      updatedData[category] = updatedData[category].map((item: string) => 
        item === oldValue ? newValue : item
      );
      return { dropdownData: updatedData };
    });
  };

  // Função para gerar respostas de IA
  const handleGenerateAIResponse = async () => {
    try {
      setIsGenerating(true);

      const questionData = {
        text: questionText,
        options: options.map((opt, index) => ({
          letter: String.fromCharCode(65 + index),
          text: opt.text,
          isCorrect: opt.isCorrect
        })),
        discipline,
        level,
        difficulty,
        topicos,
        existingExplanation: aiExplanation,
        prompt: aiPrompt
      };

      const response = await generateAIResponse(questionData);
      setAIExplanation(response);
      toast.success("Resposta da IA gerada com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar resposta da IA:", error);
      toast.error("Erro ao gerar resposta da IA");
    } finally {
      setIsGenerating(false);
    }
  };

  // Atualizar opções quando o tipo de questão mudar
  useEffect(() => {
    if (questionType === "Certo ou Errado" || questionType === "Múltipla Escolha") {
      ensureCorrectNumberOfOptions();
    } else if (questionType && options.length === 0) {
      // Para outros tipos de questão, inicializar com pelo menos uma opção vazia
      setOptions([{
        id: `option-${Math.random().toString(36).substr(2, 9)}`,
        text: '',
        isCorrect: true
      }]);
    }
  }, [questionType]);

  // Função para garantir o número correto de opções baseado no tipo de questão
  const ensureCorrectNumberOfOptions = () => {
    const currentOptions = [...options];
    
    if (questionType === "Certo ou Errado") {
      // Para questões de Certo ou Errado, sempre ter exatamente 2 opções
      if (currentOptions.length !== 2 || currentOptions[0]?.text !== "Certo" || currentOptions[1]?.text !== "Errado") {
        setOptions([
          {
            id: `option-${Math.random().toString(36).substr(2, 9)}`,
            text: "Certo",
            isCorrect: false
          },
          {
            id: `option-${Math.random().toString(36).substr(2, 9)}`,
            text: "Errado",
            isCorrect: false
          }
        ]);
      }
    } else if (questionType === "Múltipla Escolha") {
      // Para questões de Múltipla Escolha, garantir 5 opções (A, B, C, D, E)
      const targetLength = 5;
      
      // Remover opções extras se necessário
      if (currentOptions.length > targetLength) {
        currentOptions.splice(targetLength);
      }
      
      // Adicionar opções faltantes se necessário
      while (currentOptions.length < targetLength) {
        currentOptions.push({
          id: `option-${Math.random().toString(36).substr(2, 9)}`,
          text: '',
          isCorrect: false
        });
      }
      
      setOptions(currentOptions);
    }
  };

  // Função para atualizar as opções da questão
  const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    const updatedOptions = [...options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: value
    };
    setOptions(updatedOptions);
  };

  // Função para validar e submeter o formulário
  const handleSubmit = () => {
    // Validar apenas campos obrigatórios
    if (!institution || !organization || !year || !discipline || !questionType || !questionText) {
      setShowValidation(true);
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    // Validar opções
    if (questionType === "Múltipla Escolha") {
      // Validar apenas as 4 primeiras alternativas
      const requiredOptions = options.slice(0, 4);
      if (!requiredOptions.every(opt => opt.text.trim())) {
        toast.error("As 4 primeiras alternativas são obrigatórias");
        return;
      }
    }

    onSubmit();
  };

  // Renderizar o componente de opções de questão
  const renderQuestionOptions = () => {
    const isTrueFalseQuestion = questionType === "Certo ou Errado";

    // Função para obter a letra da opção de acordo com o tipo de questão
    const getOptionLetter = (index: number) => {
      if (isTrueFalseQuestion) {
        return index === 0 ? "C" : "E";
      }
      return String.fromCharCode(65 + index);
    };

    return (
      <div className="space-y-4 mt-4">
        <Label>Alternativas</Label>
        <RadioGroup 
          value={options.find(opt => opt.isCorrect)?.id || ""}
          onValueChange={(value) => {
            const updatedOptions = options.map(opt => ({
              ...opt,
              isCorrect: opt.id === value
            }));
            setOptions(updatedOptions);
          }}
          className="space-y-2"
        >
          {options.map((option, index) => (
            <div 
              key={option.id} 
              className={`flex space-x-2 items-center p-2 rounded-md ${option.isCorrect ? 'bg-green-50 border border-green-200' : ''}`}
            >
              <RadioGroupItem
                id={`option-${index}`}
                value={option.id}
              />
              <div className="flex items-center flex-1 space-x-2">
                <span className="font-medium text-md w-6">
                  {getOptionLetter(index)}.
                </span>
                {isTrueFalseQuestion ? (
                  <div className="py-2 px-3 border rounded-md w-full bg-gray-50">
                    {option.text}
                  </div>
                ) : (
                  <Input
                    id={`option-text-${index}`}
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                    placeholder={`Digite o texto da alternativa ${getOptionLetter(index)}`}
                    className="w-full"
                  />
                )}
              </div>
              {option.isCorrect && (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  Correta
                </Badge>
              )}
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="metadata">
            <div className="flex flex-col items-center">
              <span>1. Metadados</span>
              <span className="text-xs text-gray-500">Informações básicas</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="content">
            <div className="flex flex-col items-center">
              <span>2. Conteúdo</span>
              <span className="text-xs text-gray-500">Textos da questão</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="options">
            <div className="flex flex-col items-center">
              <span>3. Alternativas e Explicações</span>
              <span className="text-xs text-gray-500">Respostas e explicações</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metadata" className="mt-4">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-1">Informações da Questão</h2>
            <p className="text-gray-500 text-sm">Preencha os dados básicos que identificam a questão</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <SearchField
                  label="Banca"
                  value={institution}
                  setValue={setInstitution}
                  options={institutions}
                  addOption={(value) => addToDropdownData('institutions', value)}
                  removeOption={(value) => removeFromDropdownData('institutions', value)}
                  editOption={(oldValue, newValue) => editInDropdownData('institutions', oldValue, newValue)}
                  isRequired
                />

                <SearchField
                  label="Órgão"
                  value={organization}
                  setValue={setOrganization}
                  options={organizations}
                  addOption={(value) => addToDropdownData('organizations', value)}
                  removeOption={(value) => removeFromDropdownData('organizations', value)}
                  editOption={(oldValue, newValue) => editInDropdownData('organizations', oldValue, newValue)}
                  isRequired
                />

                <SearchField
                  label="Ano"
                  value={year}
                  setValue={setYear}
                  options={years}
                  addOption={(value) => addToDropdownData('years', value)}
                  removeOption={(value) => removeFromDropdownData('years', value)}
                  editOption={(oldValue, newValue) => editInDropdownData('years', oldValue, newValue)}
                  isRequired
                />

                <MultiSelectField
                  label="Cargos"
                  values={role}
                  setValues={setRole}
                  options={roles}
                  addOption={(value) => addToDropdownData('roles', value)}
                  removeOption={(value) => removeFromDropdownData('roles', value)}
                  editOption={(oldValue, newValue) => editInDropdownData('roles', oldValue, newValue)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <SearchField
                  label="Disciplina"
                  value={discipline}
                  setValue={setDiscipline}
                  options={disciplines}
                  addOption={(value) => addToDropdownData('disciplines', value)}
                  removeOption={(value) => removeFromDropdownData('disciplines', value)}
                  editOption={(oldValue, newValue) => editInDropdownData('disciplines', oldValue, newValue)}
                  isRequired
                />

                <MultiSelectField
                  label="Assuntos"
                  values={assuntos}
                  setValues={setAssuntos}
                  options={dropdownData.assuntos || []}
                  addOption={(value) => addToDropdownData('assuntos', value)}
                  removeOption={(value) => removeFromDropdownData('assuntos', value)}
                  editOption={(oldValue, newValue) => editInDropdownData('assuntos', oldValue, newValue)}
                />

                <MultiSelectField
                  label="Tópicos"
                  values={topicos}
                  setValues={setTopicos}
                  options={dropdownData.topicos || []}
                  addOption={(value) => addToDropdownData('topicos', value)}
                  removeOption={(value) => removeFromDropdownData('topicos', value)}
                  editOption={(oldValue, newValue) => editInDropdownData('topicos', oldValue, newValue)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <SearchField
                  label="Nível"
                  value={level}
                  setValue={setLevel}
                  options={levels}
                  addOption={(value) => addToDropdownData('levels', value)}
                  removeOption={(value) => removeFromDropdownData('levels', value)}
                  editOption={(oldValue, newValue) => editInDropdownData('levels', oldValue, newValue)}
                  isRequired
                />

                <SearchField
                  label="Dificuldade"
                  value={difficulty}
                  setValue={setDifficulty}
                  options={difficulties}
                  addOption={(value) => addToDropdownData('difficulties', value)}
                  removeOption={(value) => removeFromDropdownData('difficulties', value)}
                  editOption={(oldValue, newValue) => editInDropdownData('difficulties', oldValue, newValue)}
                  isRequired
                />

                <SearchField
                  label="Tipo de Questão"
                  value={questionType}
                  setValue={setQuestionType}
                  options={questionTypes}
                  addOption={(value) => addToDropdownData('questionTypes', value)}
                  removeOption={(value) => removeFromDropdownData('questionTypes', value)}
                  editOption={(oldValue, newValue) => editInDropdownData('questionTypes', oldValue, newValue)}
                  isRequired
                />
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end mt-6">
            <Button onClick={() => setActiveTab("content")} className="px-6">
              Próximo: Conteúdo da Questão
            </Button>
      </div>
        </TabsContent>

        <TabsContent value="content" className="mt-4 space-y-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-1">Texto e Explicações da Questão</h2>
            <p className="text-gray-500 text-sm">Insira o texto da questão, conteúdo expansível e explicações</p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <QuestionTextFields 
                questionText={questionText} 
                setQuestionText={setQuestionText} 
                teacherExplanation={teacherExplanation} 
                setTeacherExplanation={setTeacherExplanation}
                expandableContent={expandableContent}
                setExpandableContent={setExpandableContent}
                aiExplanation={aiExplanation}
                setAIExplanation={setAIExplanation}
              />
              {showValidation && !questionText && (
                <p className="text-red-500 text-sm mt-1">O texto da questão é obrigatório</p>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-between mt-6">
            <Button onClick={() => setActiveTab("metadata")} variant="outline" className="px-6">
              Voltar: Metadados
            </Button>
            <Button onClick={() => setActiveTab("options")} className="px-6">
              Próximo: Alternativas
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="options" className="mt-4 space-y-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-1">Alternativas</h2>
            <p className="text-gray-500 text-sm">Configure as alternativas da questão</p>
          </div>
          <div className="mb-6">
            <Card>
              <CardContent className="pt-6">
                {renderQuestionOptions()}
              </CardContent>
            </Card>
      </div>

          <div className="space-y-4 mt-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-2">Geração de Resposta com IA</h3>
                <p className="text-gray-500 text-sm mb-4">Utilize a inteligência artificial para gerar uma explicação para a questão</p>
                <Label htmlFor="ai-prompt">Prompt para a IA</Label>
                <Textarea
                  id="ai-prompt"
                  value={aiPrompt}
                  onChange={(e) => setAIPrompt(e.target.value)}
                  placeholder="Digite um prompt para a IA responder a questão"
                  className="min-h-[100px]"
                />
                <Button
                  type="button"
                  onClick={handleGenerateAIResponse}
                  disabled={isGenerating}
                  className="mt-2"
                >
                  {isGenerating ? "Gerando..." : "Gerar Resposta da IA"}
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-between mt-6">
            <Button onClick={() => setActiveTab("content")} variant="outline" className="px-6">
              Voltar: Conteúdo
            </Button>
            <div className="flex space-x-2">
              <Button onClick={handleSubmit} className="px-6">
                {submitButtonText}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};