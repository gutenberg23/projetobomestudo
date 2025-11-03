import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Save, ArrowLeft, Eye, EyeOff, Search, Plus, Trash2 } from "lucide-react";
import { TiptapEditor } from "./posts/components/editor/TiptapEditor";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { teoriasService } from "@/services/teoriasService";
import type { Teoria, TeoriaInsert } from "@/services/teoriasService";

// Componente de campo de pesquisa com seleção múltipla e possibilidade de adição/remoção
interface MultiSearchFieldProps {
  label: string;
  values: string[];
  setValues: (values: string[]) => void;
  options: string[]; // Simplificado para usar apenas strings
  isRequired?: boolean;
}

const MultiSearchField: React.FC<MultiSearchFieldProps> = ({
  label,
  values,
  setValues,
  options,
  isRequired = false
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !values.includes(option) // Evitar duplicatas
  );

  const handleSelectOption = (option: string) => {
    if (!values.includes(option)) {
      setValues([...values, option]);
    }
    setSearchQuery("");
    setShowDropdown(false);
  };

  // Função para remover um valor selecionado
  const handleRemoveValue = (value: string) => {
    setValues(values.filter(v => v !== value));
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
        <div className="relative flex-1">
          <Input
            id={`search-${label}`}
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

        {showDropdown && filteredOptions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredOptions.map((option, index) => (
              <div
                key={index}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelectOption(option)}
              >
                <span>{option}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Badges para valores selecionados */}
      <div className="flex flex-wrap gap-2 mt-2">
        {values.map((value, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {value}
            <button 
              onClick={() => handleRemoveValue(value)}
              className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

// Componente de campo de pesquisa com possibilidade de adição
interface SearchFieldProps {
  label: string;
  value: string;
  setValue: (value: string) => void;
  options: string[]; // Simplificado para usar apenas strings
  isRequired?: boolean;
  disabled?: boolean;
}

const SearchField: React.FC<SearchFieldProps> = ({
  label,
  value,
  setValue,
  options,
  isRequired = false,
  disabled = false
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectOption = (option: string) => {
    setValue(option);
    setSearchQuery("");
    setShowDropdown(false);
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
            disabled={disabled}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        {showDropdown && !disabled && filteredOptions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredOptions.map((option, index) => (
              <div
                key={index}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelectOption(option)}
              >
                <span>{option}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TeoriaEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Estados para armazenar todas as opções disponíveis
  const [allDisciplinas, setAllDisciplinas] = useState<string[]>([]);
  const [allAssuntos, setAllAssuntos] = useState<string[]>([]);
  const [allTopicos, setAllTopicos] = useState<string[]>([]);
  const [professores, setProfessores] = useState<{id: string, nome: string}[]>([]);

  // Estados para armazenar as opções filtradas
  const [filteredAssuntos, setFilteredAssuntos] = useState<string[]>([]);
  const [filteredTopicos, setFilteredTopicos] = useState<string[]>([]);
  
  // Estados para os valores selecionados
  const [titulo, setTitulo] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [assunto, setAssunto] = useState("");
  const [selectedTopicos, setSelectedTopicos] = useState<string[]>([]);
  const [conteudo, setConteudo] = useState("");
  const [noEdital, setNoEdital] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [professorId, setProfessorId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    fetchAllData();
    fetchProfessores();
    if (id) {
      fetchTeoria(id);
    }
  }, [id]);

  // Filtrar assuntos quando disciplina muda
  useEffect(() => {
    if (disciplina) {
      // Filtrar assuntos que pertencem a essa disciplina
      filterAssuntosByDisciplina(disciplina);
      setAssunto("");
      setFilteredTopicos([]);
      setSelectedTopicos([]);
    } else {
      setFilteredAssuntos([]);
      setAssunto("");
      setFilteredTopicos([]);
      setSelectedTopicos([]);
    }
  }, [disciplina, allAssuntos]);

  // Filtrar tópicos quando assunto muda
  useEffect(() => {
    if (assunto && disciplina) {
      // Filtrar tópicos que pertencem a esse assunto
      filterTopicosByAssunto(assunto);
    } else {
      setFilteredTopicos([]);
      setSelectedTopicos([]);
    }
  }, [assunto, disciplina, allTopicos]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Buscar todas as teorias para extrair disciplinas, assuntos e tópicos
      const { data: teorias, error } = await supabase
        .from('teorias')
        .select('disciplina_id, assunto_id, topicos_ids');
      
      if (error) throw error;
      
      // Extrair disciplinas únicas
      const disciplinas = Array.from(
        new Set(teorias?.map(t => t.disciplina_id).filter(Boolean) || [])
      ) as string[];
      setAllDisciplinas(disciplinas);
      
      // Extrair assuntos únicos
      const assuntos = Array.from(
        new Set(teorias?.map(t => t.assunto_id).filter(Boolean) || [])
      ) as string[];
      setAllAssuntos(assuntos);
      
      // Extrair tópicos únicos
      const topicosSet = new Set<string>();
      teorias?.forEach(teoria => {
        if (teoria.topicos_ids && Array.isArray(teoria.topicos_ids)) {
          teoria.topicos_ids.forEach(topico => {
            if (topico) topicosSet.add(topico);
          });
        }
      });
      setAllTopicos(Array.from(topicosSet));
      
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfessores = async () => {
    try {
      // Buscar professores da tabela professores
      const { data, error } = await supabase
        .from('professores')
        .select('id, nome_completo');
      
      if (error) throw error;
      
      const professoresFormatados = data?.map(professor => ({
        id: professor.id,
        nome: professor.nome_completo
      })) || [];
      
      setProfessores(professoresFormatados);
    } catch (error) {
      console.error("Erro ao carregar professores:", error);
      toast.error("Erro ao carregar professores");
    }
  };

  const filterAssuntosByDisciplina = async (disciplinaSelecionada: string) => {
    try {
      // Buscar assuntos que pertencem a essa disciplina
      const { data: teorias, error } = await supabase
        .from('teorias')
        .select('assunto_id')
        .eq('disciplina_id', disciplinaSelecionada);
      
      if (error) throw error;
      
      const assuntos = Array.from(
        new Set(teorias?.map(t => t.assunto_id).filter(Boolean) || [])
      ) as string[];
      setFilteredAssuntos(assuntos);
    } catch (error) {
      console.error("Erro ao filtrar assuntos:", error);
      toast.error("Erro ao filtrar assuntos");
    }
  };

  const filterTopicosByAssunto = async (assuntoSelecionado: string) => {
    try {
      // Buscar tópicos que pertencem a esse assunto
      const { data: teorias, error } = await supabase
        .from('teorias')
        .select('topicos_ids')
        .eq('assunto_id', assuntoSelecionado);
      
      if (error) throw error;
      
      const topicosSet = new Set<string>();
      teorias?.forEach(teoria => {
        if (teoria.topicos_ids && Array.isArray(teoria.topicos_ids)) {
          teoria.topicos_ids.forEach(topico => {
            if (topico) topicosSet.add(topico);
          });
        }
      });
      
      setFilteredTopicos(Array.from(topicosSet));
    } catch (error) {
      console.error("Erro ao filtrar tópicos:", error);
      toast.error("Erro ao filtrar tópicos");
    }
  };

  const fetchTeoria = async (teoriaId: string) => {
    try {
      setLoading(true);
      
      const teoria = await teoriasService.getTeoriaById(teoriaId);
      
      if (teoria) {
        setTitulo(teoria.titulo);
        setDisciplina(teoria.disciplina_id || "");
        setAssunto(teoria.assunto_id || "");
        setSelectedTopicos(teoria.topicos_ids || []);
        setConteudo(teoria.conteudo);
        setNoEdital(teoria.no_edital || "");
        setStatus(teoria.status || "draft");
        setProfessorId(teoria.professor_id || "");
        
        // Atualizar filtros com base nos valores carregados
        if (teoria.disciplina_id) {
          await filterAssuntosByDisciplina(teoria.disciplina_id);
        }
        if (teoria.assunto_id) {
          await filterTopicosByAssunto(teoria.assunto_id);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar teoria:", error);
      toast.error("Erro ao carregar teoria");
    } finally {
      setLoading(false);
    }
  };

  // Atualizar a função handleSave para salvar os tópicos como array de strings
  const handleSave = async () => {
    if (!titulo || !disciplina || !assunto) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setLoading(true);
      
      // Para tópicos, vamos armazenar como array de strings (nomes dos tópicos)
      const teoriaData: TeoriaInsert = {
        titulo,
        disciplina_id: disciplina, // Agora armazenamos o nome da disciplina diretamente
        assunto_id: assunto,       // Agora armazenamos o nome do assunto diretamente
        topicos_ids: selectedTopicos,
        conteudo: conteudo || "",  // Garantir que não seja undefined
        no_edital: noEdital || "", // Garantir que não seja undefined
        status,
        professor_id: professorId || undefined
      };

      if (id) {
        // Atualizar teoria existente
        await teoriasService.updateTeoria(id, teoriaData);
        toast.success("Teoria atualizada com sucesso!");
      } else {
        // Criar nova teoria
        await teoriasService.createTeoria(teoriaData);
        toast.success("Teoria criada com sucesso!");
      }
      
      navigate("/admin/teorias");
    } catch (error) {
      console.error("Erro ao salvar teoria:", error);
      toast.error("Erro ao salvar teoria");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setStatus("published");
    // A lógica de salvar será tratada no handleSave
    await handleSave();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/admin/teorias")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">
            {id ? "Editar Teoria" : "Nova Teoria"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsPreview(!isPreview)}
          >
            {isPreview ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Editar
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Pré-visualizar
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSave}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Rascunho
          </Button>
          <Button 
            onClick={handlePublish}
            disabled={loading}
          >
            Publicar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Teoria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título da teoria"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="professor">Professor *</Label>
              <select
                id="professor"
                value={professorId}
                onChange={(e) => setProfessorId(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Selecione um professor</option>
                {professores.map(professor => (
                  <option key={professor.id} value={professor.id}>
                    {professor.nome}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <SearchField
                label="Disciplina"
                value={disciplina}
                setValue={setDisciplina}
                options={allDisciplinas}
                isRequired={true}
              />
            </div>
            
            <div className="space-y-2">
              <SearchField
                label="Assunto"
                value={assunto}
                setValue={setAssunto}
                options={filteredAssuntos}
                isRequired={true}
                disabled={!disciplina}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={status} 
                onValueChange={(value: "draft" | "published") => setStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <MultiSearchField
              label="Tópicos"
              values={selectedTopicos}
              setValues={setSelectedTopicos}
              options={filteredTopicos}
              isRequired={false}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="conteudo">Conteúdo *</Label>
            {isPreview ? (
              <div 
                className="border rounded-lg p-4 min-h-[300px] prose max-w-none"
                dangerouslySetInnerHTML={{ __html: conteudo }}
              />
            ) : (
              <TiptapEditor 
                content={conteudo} 
                onChange={setConteudo} 
              />
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="noEdital">No Edital</Label>
            <Input
              id="noEdital"
              value={noEdital}
              onChange={(e) => setNoEdital(e.target.value)}
              placeholder="Como esse conteúdo aparece nos editais de concurso"
            />
            <p className="text-sm text-gray-500">
              Este campo não aparecerá na postagem da teoria. Será apenas para futura utilização para criação de conteúdos por IA.
            </p>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/admin/teorias")}
            >
              Cancelar
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSave}
              disabled={loading}
            >
              Salvar Rascunho
            </Button>
            <Button 
              onClick={handlePublish}
              disabled={loading}
            >
              Publicar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeoriaEditor;