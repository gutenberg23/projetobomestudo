import { MultiSelect } from "@/components/admin/questions/form/MultiSelect";

export interface FilterGroupProps {
  title?: string;
  options: string[];
  selectedValues: string[];
  placeholder?: string;
  onChange: (category: "topics" | "disciplines" | "institutions" | "organizations" | "roles" | "years" | "educationLevels" | "difficulty" | "subtopics", value: string) => void;
  category: "topics" | "disciplines" | "institutions" | "organizations" | "roles" | "years" | "educationLevels" | "difficulty" | "subtopics";
}

export function FilterGroup({
  title = '',
  options = [],
  selectedValues = [],
  placeholder = 'Selecione...',
  onChange,
  category,
}: FilterGroupProps) {
  
  // Garantir que options e selectedValues sejam sempre arrays válidos
  const safeOptions = Array.isArray(options) ? options : [];
  const safeSelectedValues = Array.isArray(selectedValues) ? selectedValues : [];
  
  // Função para converter a seleção múltipla para o formato esperado pelo componente original
  const handleChange = (selected: string[]) => {
    // Garantir que selected é um array
    const safeSelected = Array.isArray(selected) ? selected : [];
    
    // Calcular diferenças para determinar qual valor foi adicionado ou removido
    const added = safeSelected.filter(item => !safeSelectedValues.includes(item));
    const removed = safeSelectedValues.filter(item => !safeSelected.includes(item));
    
    if (added.length > 0) {
      // Um valor foi adicionado
      onChange(category, added[0]);
    } else if (removed.length > 0) {
      // Um valor foi removido
      onChange(category, removed[0]);
    }
  };
  
  return (
    <div className="space-y-2">
      {title && <h3 className="text-sm font-medium">{title}</h3>}
      <MultiSelect
        options={safeOptions}
        selected={safeSelectedValues}
        onChange={handleChange}
        placeholder={placeholder}
        clearable={true}
      />
    </div>
  );
} 