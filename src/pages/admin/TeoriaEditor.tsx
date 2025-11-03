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
import { X, Save, ArrowLeft, Eye, EyeOff, Search, Settings, Plus, Trash2 } from "lucide-react";
import { TiptapEditor } from "./posts/components/editor/TiptapEditor";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { teoriasService } from "@/services/teoriasService";
import type { TeoriaInsert } from "@/services/teoriasService";
import { BlogContent } from "@/components/blog/BlogContent";
import { DisciplinaFiltersModal } from "./components/edital/DisciplinaFiltersModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Componente de campo de pesquisa com seleção múltipla e possibilidade de adição/remoção
interface MultiSearchFieldProps {
  label: string;
  values: string[];
  setValues: (values: string[]) => void;
  options: string[]; // Simplificado para usar apenas strings
  isRequired?: boolean;
  onAddNew?: () => void;
  onDelete?: (value: string) => void;
}

const MultiSearchField: React.FC<MultiSearchFieldProps> = ({
  label,
  values,
  setValues,
  options,
  isRequired = false,
  onAddNew,
  onDelete
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
      <Label htmlFor={`search-${label}`} className="flex items-center justify-between">
        <span>
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </span>
        {onAddNew && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onAddNew}
            className="h-8 px-2"
          >
            <Plus className="h-4 w-4 mr-1" />
            Novo
          </Button>
        )}
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
          <Badge key={index} variant="secondary" className="flex items-center gap-2">
            {value}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => handleRemoveValue(value)}
                className="hover:bg-gray-200 rounded-full p-0.5"
                title="Remover da seleção"
              >
                <X className="h-3 w-3" />
              </button>
              {onDelete && (
                <button 
                  onClick={() => onDelete(value)}
                  className="hover:bg-red-200 rounded-full p-0.5 text-red-600"
                  title="Excluir permanentemente"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
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
  onAddNew?: () => void;
  onDelete?: (value: string) => void;
}

const SearchField: React.FC<SearchFieldProps> = ({
  label,
  value,
  setValue,
  options,
  isRequired = false,
  disabled = false,
  onAddNew,
  onDelete
}) => {
  const [searchQuery, setSearchQuery] = useState(value || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectOption = (option: string) => {
    setValue(option);
    setSearchQuery(option);
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

  // Atualizar searchQuery quando o value muda
  useEffect(() => {
    setSearchQuery(value || "");
  }, [value]);

  return (
    <div className="space-y-2">
      <Label htmlFor={`search-${label}`} className="flex items-center justify-between">
        <span>
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </span>
        <div className="flex items-center gap-1">
          {onAddNew && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onAddNew}
              className="h-8 px-2"
              disabled={disabled}
            >
              <Plus className="h-4 w-4 mr-1" />
              Novo
            </Button>
          )}
          {onDelete && value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDelete(value)}
              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={disabled}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
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
            onBlur={() => {
              // Se o valor não estiver na lista de opções, manter o valor atual
              setTimeout(() => setShowDropdown(false), 150);
            }}
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
  const [loading, setLoading] = useState(true);
  const [titulo, setTitulo] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [assunto, setAssunto] = useState("");
  const [selectedTopicos, setSelectedTopicos] = useState<string[]>([]);
  const [conteudo, setConteudo] = useState("");
  const [noEdital, setNoEdital] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [professorId, setProfessorId] = useState("");
  const [allDisciplinas, setAllDisciplinas] = useState<string[]>([]);
  const [allAssuntos, setAllAssuntos] = useState<string[]>([]);
  const [allTopicos, setAllTopicos] = useState<string[]>([]);
  const [filteredAssuntos, setFilteredAssuntos] = useState<string[]>([]);
  const [filteredTopicos, setFilteredTopicos] = useState<string[]>([]);
  const [professores, setProfessores] = useState<Array<{id: string, nome: string}>>([]);
  const [isPreview, setIsPreview] = useState(false);
  
  // States for question filters
  const [questoesFiltros, setQuestoesFiltros] = useState<{
    disciplinas?: string[];
    assuntos?: string[];
    bancas?: string[];
    topicos?: string[];
  }>({});
  const [questoesLink, setQuestoesLink] = useState("");
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  
  // States for video links
  const [videoLinks, setVideoLinks] = useState<string[]>([]);
  const [newVideoLink, setNewVideoLink] = useState("");
  
  // States for mind maps (PDFs)
  const [mindMapFiles, setMindMapFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  
  // States for add/delete dialogs
  const [isAddDisciplinaOpen, setIsAddDisciplinaOpen] = useState(false);
  const [isAddAssuntoOpen, setIsAddAssuntoOpen] = useState(false);
  const [isAddTopicoOpen, setIsAddTopicoOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  // Carregar dados iniciais
  useEffect(() => {
    fetchAllData();
    fetchProfessores();
  }, []);

  // Load existing teoria data
  useEffect(() => {
    const loadTeoria = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const teoria = await teoriasService.getTeoriaById(id);
        
        if (teoria) {
          setTitulo(teoria.titulo || "");
          setDisciplina(teoria.disciplina_id || "");
          setAssunto(teoria.assunto_id || "");
          setSelectedTopicos(teoria.topicos_ids || []);
          setConteudo(teoria.conteudo || "");
          setNoEdital(teoria.no_edital || "");
          setStatus(teoria.status || "draft");
          setProfessorId(teoria.professor_id || "");
          
          // Load question filters if they exist
          if (teoria.questoes_filtros) {
            setQuestoesFiltros(teoria.questoes_filtros);
          }
          
          if (teoria.questoes_link) {
            setQuestoesLink(teoria.questoes_link);
          }
          
          // Load video links if they exist
          if (teoria.videoaulas) {
            setVideoLinks(teoria.videoaulas);
          }
          
          // Load mind map files if they exist
          if (teoria.mapas_mentais) {
            setMindMapFiles(teoria.mapas_mentais);
          }
          
          // Update filters based on loaded values
          if (teoria.disciplina_id) {
            await filterAssuntosByDisciplina(teoria.disciplina_id);
          }
          if (teoria.assunto_id && teoria.disciplina_id) {
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

    loadTeoria();
  }, [id]);

  // Filtrar assuntos quando disciplina muda
  useEffect(() => {
    if (disciplina) {
      // Filtrar assuntos que pertencem a essa disciplina
      filterAssuntosByDisciplina(disciplina);
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
      // Buscar professores da tabela professores com seus user_ids
      const { data, error } = await supabase
        .from('professores')
        .select('id, nome_completo');
      
      if (error) throw error;
      
      // Buscar os user_ids correspondentes dos professores
      const professoresFormatados = await Promise.all(
        data?.map(async (professor) => {
          return {
            id: professor.id,
            nome: professor.nome_completo
          };
        }) || []
      );
      
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

  // Update the handleSave function to save question filters
  const handleSave = async () => {
    if (!titulo || !disciplina || !assunto) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setLoading(true);
      
      // For topics, we store as array of strings (topic names)
      const teoriaData: TeoriaInsert = {
        titulo,
        disciplina_id: disciplina, // Now store the discipline name directly
        assunto_id: assunto,       // Now store the subject name directly
        topicos_ids: selectedTopicos,
        conteudo: conteudo || "",  // Ensure it's not undefined
        no_edital: noEdital || "", // Ensure it's not undefined
        status,
        professor_id: professorId || undefined, // Use the professor ID directly
        questoes_filtros: questoesFiltros,
        questoes_link: questoesLink,
        videoaulas: videoLinks,
        mapas_mentais: mindMapFiles
      };

      if (id) {
        // Update existing theory
        await teoriasService.updateTeoria(id, teoriaData);
        toast.success("Teoria atualizada com sucesso!");
      } else {
        // Create new theory
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

  // Function to add a new video link
  const handleAddVideoLink = () => {
    if (newVideoLink.trim() && !videoLinks.includes(newVideoLink.trim())) {
      setVideoLinks([...videoLinks, newVideoLink.trim()]);
      setNewVideoLink("");
    }
  };

  // Function to remove a video link
  const handleRemoveVideoLink = (link: string) => {
    setVideoLinks(videoLinks.filter(l => l !== link));
  };

  // Function to upload mind map PDF
  const handleUploadMindMap = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type !== 'application/pdf') {
          toast.error(`O arquivo ${file.name} não é um PDF válido.`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `mindmaps/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Erro ao fazer upload:', uploadError);
          toast.error(`Erro ao fazer upload do arquivo ${file.name}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('blog-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      if (uploadedUrls.length > 0) {
        setMindMapFiles([...mindMapFiles, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} arquivo(s) PDF carregado(s) com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao fazer upload dos PDFs:', error);
      toast.error('Erro ao fazer upload dos arquivos PDF');
    } finally {
      setUploading(false);
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  // Function to remove a mind map file
  const handleRemoveMindMap = (url: string) => {
    setMindMapFiles(mindMapFiles.filter(u => u !== url));
  };

  // Gerar slug a partir do título
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9]+/g, '-') // Substituir caracteres não alfanuméricos por hífen
      .replace(/^-+|-+$/g, ''); // Remover hífens do início e fim
  };

  const currentSlug = generateSlug(titulo);
  
  // Handlers for adding new items
  const handleAddDisciplina = () => {
    if (newItemName.trim() && !allDisciplinas.includes(newItemName.trim())) {
      setAllDisciplinas([...allDisciplinas, newItemName.trim()]);
      setDisciplina(newItemName.trim());
      toast.success("Disciplina adicionada com sucesso!");
    }
    setNewItemName("");
    setIsAddDisciplinaOpen(false);
  };
  
  const handleAddAssunto = () => {
    if (newItemName.trim() && !allAssuntos.includes(newItemName.trim())) {
      setAllAssuntos([...allAssuntos, newItemName.trim()]);
      setFilteredAssuntos([...filteredAssuntos, newItemName.trim()]);
      setAssunto(newItemName.trim());
      toast.success("Assunto adicionado com sucesso!");
    }
    setNewItemName("");
    setIsAddAssuntoOpen(false);
  };
  
  const handleAddTopico = () => {
    if (newItemName.trim() && !allTopicos.includes(newItemName.trim())) {
      setAllTopicos([...allTopicos, newItemName.trim()]);
      setFilteredTopicos([...filteredTopicos, newItemName.trim()]);
      toast.success("Tópico adicionado com sucesso!");
    }
    setNewItemName("");
    setIsAddTopicoOpen(false);
  };
  
  // Handlers for deleting items
  const handleDeleteDisciplina = (disciplinaToDelete: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a disciplina "${disciplinaToDelete}"?`)) {
      setAllDisciplinas(allDisciplinas.filter(d => d !== disciplinaToDelete));
      if (disciplina === disciplinaToDelete) {
        setDisciplina("");
      }
      toast.success("Disciplina excluída com sucesso!");
    }
  };
  
  const handleDeleteAssunto = (assuntoToDelete: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o assunto "${assuntoToDelete}"?`)) {
      setAllAssuntos(allAssuntos.filter(a => a !== assuntoToDelete));
      setFilteredAssuntos(filteredAssuntos.filter(a => a !== assuntoToDelete));
      if (assunto === assuntoToDelete) {
        setAssunto("");
      }
      toast.success("Assunto excluído com sucesso!");
    }
  };
  
  const handleDeleteTopico = (topico: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o tópico "${topico}"?`)) {
      setAllTopicos(allTopicos.filter(t => t !== topico));
      setFilteredTopicos(filteredTopicos.filter(t => t !== topico));
      setSelectedTopicos(selectedTopicos.filter(t => t !== topico));
      toast.success("Tópico excluído com sucesso!");
    }
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

      {/* Mostrar URL da teoria quando estiver sendo editada */}
      {id && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-800">URL da Teoria</h3>
                <p className="text-sm text-blue-600 mt-1">
                  {window.location.origin}/teoria/{id}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/teoria/${id}`);
                  toast.success("URL copiada para a área de transferência");
                }}
              >
                Copiar URL
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
              {titulo && (
                <p className="text-sm text-gray-500">
                  Slug: {currentSlug}
                </p>
              )}
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
                onAddNew={() => setIsAddDisciplinaOpen(true)}
                onDelete={handleDeleteDisciplina}
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
                onAddNew={() => setIsAddAssuntoOpen(true)}
                onDelete={handleDeleteAssunto}
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
              onAddNew={() => setIsAddTopicoOpen(true)}
              onDelete={handleDeleteTopico}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="conteudo">Conteúdo *</Label>
            {isPreview ? (
              <div className="border rounded-lg p-4 min-h-[300px]">
                <BlogContent 
                  content={conteudo} 
                  className="prose max-w-none"
                  showQuestionTags={true}
                />
              </div>
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
          
          {/* Card for question filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Adicionar filtro de questões</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsFiltersModalOpen(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {questoesFiltros && (
                Object.keys(questoesFiltros).length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Filtros configurados para exibição de questões na aba "Questões":
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {questoesFiltros.disciplinas && questoesFiltros.disciplinas.length > 0 && (
                        <Badge variant="secondary">
                          Disciplinas: {questoesFiltros.disciplinas.length}
                        </Badge>
                      )}
                      {questoesFiltros.assuntos && questoesFiltros.assuntos.length > 0 && (
                        <Badge variant="secondary">
                          Assuntos: {questoesFiltros.assuntos.length}
                        </Badge>
                      )}
                      {questoesFiltros.bancas && questoesFiltros.bancas.length > 0 && (
                        <Badge variant="secondary">
                          Bancas: {questoesFiltros.bancas.length}
                        </Badge>
                      )}
                      {questoesFiltros.topicos && questoesFiltros.topicos.length > 0 && (
                        <Badge variant="secondary">
                          Tópicos: {questoesFiltros.topicos.length}
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Nenhum filtro configurado. Clique em "Configurar" para adicionar filtros de questões.
                  </p>
                )
              )}
            </CardContent>
          </Card>
          
          {/* Card for video links - Ensure it always renders */}
          <Card>
            <CardHeader>
              <CardTitle>Videoaulas do YouTube</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newVideoLink || ""}
                  onChange={(e) => setNewVideoLink(e.target.value)}
                  placeholder="Cole o link do vídeo do YouTube"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddVideoLink();
                    }
                  }}
                />
                <Button onClick={handleAddVideoLink} disabled={!newVideoLink || newVideoLink.trim().length === 0}>
                  Adicionar
                </Button>
              </div>
              
              {videoLinks && videoLinks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Vídeos adicionados:</p>
                  <div className="space-y-2">
                    {videoLinks.map((link, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm truncate flex-1 mr-2">{link}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveVideoLink(link)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Card for mind maps (PDFs) - Ensure it always renders */}
          <Card>
            <CardHeader>
              <CardTitle>Mapas Mentais (PDFs)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 items-center">
                <Input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleUploadMindMap}
                  disabled={uploading}
                  className="flex-1"
                />
                {uploading && (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                  </div>
                )}
              </div>
              
              {mindMapFiles && mindMapFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Arquivos PDF adicionados:</p>
                  <div className="space-y-2">
                    {mindMapFiles.map((url, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm truncate flex-1 mr-2">mapa_mental_{index + 1}.pdf</span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(url, '_blank')}
                            className="h-8 w-8 p-0"
                            title="Visualizar PDF"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMindMap(url)}
                            className="h-8 w-8 p-0"
                            title="Remover PDF"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
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
      
      {/* Question Filters Modal */}
      <DisciplinaFiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        onApplyFilters={(filters, link) => {
          setQuestoesFiltros({
            disciplinas: filters.disciplinas,
            assuntos: filters.assuntos,
            bancas: filters.bancas,
            topicos: filters.topicos
          });
          setQuestoesLink(link);
          setIsFiltersModalOpen(false);
        }}
        initialDisciplinas={questoesFiltros.disciplinas || []}
        initialAssuntos={questoesFiltros.assuntos || []}
        initialBancas={questoesFiltros.bancas || []}
        initialTopicos={questoesFiltros.topicos || []}
      />
      
      {/* Add Disciplina Dialog */}
      <Dialog open={isAddDisciplinaOpen} onOpenChange={setIsAddDisciplinaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Disciplina</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-disciplina">Nome da Disciplina</Label>
              <Input
                id="new-disciplina"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Digite o nome da disciplina"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddDisciplina();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setNewItemName("");
              setIsAddDisciplinaOpen(false);
            }}>
              Cancelar
            </Button>
            <Button onClick={handleAddDisciplina} disabled={!newItemName.trim()}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Assunto Dialog */}
      <Dialog open={isAddAssuntoOpen} onOpenChange={setIsAddAssuntoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Assunto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-assunto">Nome do Assunto</Label>
              <Input
                id="new-assunto"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Digite o nome do assunto"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddAssunto();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setNewItemName("");
              setIsAddAssuntoOpen(false);
            }}>
              Cancelar
            </Button>
            <Button onClick={handleAddAssunto} disabled={!newItemName.trim()}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Tópico Dialog */}
      <Dialog open={isAddTopicoOpen} onOpenChange={setIsAddTopicoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Tópico</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-topico">Nome do Tópico</Label>
              <Input
                id="new-topico"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Digite o nome do tópico"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTopico();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setNewItemName("");
              setIsAddTopicoOpen(false);
            }}>
              Cancelar
            </Button>
            <Button onClick={handleAddTopico} disabled={!newItemName.trim()}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeoriaEditor;