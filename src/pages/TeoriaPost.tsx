import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  AlertTriangle, 
  FileText, 
  FileQuestion, 
  Video, 
  Map, 
  User,
  Edit,
  X,
  Trash2,
  List,
  BookOpen,
  Calendar,
  Eye,
  Palette
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BlogContentWithQuestions } from "@/components/blog/BlogContentWithQuestions";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import QuestionResults from "@/components/questions/QuestionResults";
import { supabase as supabaseClient } from "@/integrations/supabase/client";

interface Teoria {
  id: string;
  titulo: string;
  disciplina_id: string;
  assunto_id: string;
  topicos_ids: string[];
  conteudo: string;
  no_edital: string;
  status: "draft" | "published";
  professor_id?: string;
  created_at: string;
  updated_at: string;
  questoes_filtros?: {
    disciplinas?: string[];
    assuntos?: string[];
    bancas?: string[];
    topicos?: string[];
  };
  questoes_link?: string;
  videoaulas?: string[];
  mapas_mentais?: string[];
}

interface Professor {
  id: string;
  nome_completo: string;
}

const TeoriaPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Teoria | null>(null);
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("aula");
  const { isAdmin } = usePermissions();
  
  // States for error reporting
  const [showErrorReport, setShowErrorReport] = useState(false);
  const [errorReport, setErrorReport] = useState("");
  
  // States for text highlighting
  const [showHighlightColors, setShowHighlightColors] = useState(false);
  const [highlights, setHighlights] = useState<Array<{
    id: string;
    text: string;
    html?: string; // Add HTML of selection
    color: string;
    position: { start: number; end: number };
    note?: string;
  }>>([]);
  const [showHighlightsSidebar, setShowHighlightsSidebar] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingHighlight, setPendingHighlight] = useState<{text: string, color: string} | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // States for question filters and pagination
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<{[key: string]: string[]}>({});
  
  // Function to load questions based on filters
  const loadFilteredQuestions = async (filters: any) => {
    setQuestionsLoading(true);
    try {
      let query = supabaseClient
        .from('questoes')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (filters.disciplinas && filters.disciplinas.length > 0) {
        query = query.in('discipline', filters.disciplinas);
      }
      
      if (filters.assuntos && filters.assuntos.length > 0) {
        query = query.overlaps('assuntos', filters.assuntos);
      }
      
      if (filters.bancas && filters.bancas.length > 0) {
        query = query.in('institution', filters.bancas);
      }
      
      if (filters.topicos && filters.topicos.length > 0) {
        query = query.overlaps('topicos', filters.topicos);
      }
      
      // Add pagination
      const from = (currentPage - 1) * 10;
      const to = from + 9;
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      setFilteredQuestions(data || []);
      setTotalPages(count ? Math.ceil(count / 10) : 1);
    } catch (error) {
      console.error("Erro ao carregar questões:", error);
      toast.error("Erro ao carregar questões");
    } finally {
      setQuestionsLoading(false);
    }
  };
  
  // Effect to reload questions when page changes
  useEffect(() => {
    if (post && post.questoes_filtros && activeTab === "questoes") {
      loadFilteredQuestions(post.questoes_filtros);
    }
  }, [currentPage, activeTab, post]);
  
  // Fetch teoria data
  useEffect(() => {
    const loadPost = async () => {
      if (!slug) {
        navigate('/teorias');
        return;
      }

      try {
        setLoading(true);
        
        // Fetch teoria by ID (slug is actually the ID in our case)
        const { data: teoriaData, error: teoriaError } = await supabase
          .from('teorias')
          .select('*')
          .eq('id', slug)
          .eq('status', 'published')
          .single();
        
        if (teoriaError) throw teoriaError;
        if (!teoriaData) {
          throw new Error('Teoria não encontrada');
        }
        
        setPost(teoriaData);
        
        // Fetch professor data if professor_id exists
        if (teoriaData.professor_id) {
          const { data: professorData, error: professorError } = await supabase
            .from('professores')
            .select('id, nome_completo')
            .eq('id', teoriaData.professor_id)
            .single();
          
          if (!professorError && professorData) {
            setProfessor(professorData);
          }
        }
        
        // Load questions if filters exist
        if (teoriaData.questoes_filtros) {
          loadFilteredQuestions(teoriaData.questoes_filtros);
        }
      } catch (error) {
        console.error("Erro ao carregar teoria:", error);
        toast.error("Erro ao carregar a teoria");
        navigate('/teorias');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug, navigate]);

  // Menu options
  const menuOptions = [
    { id: "aula", label: "Aula em texto", icon: FileText },
    { id: "questoes", label: "Questões", icon: FileQuestion },
    { id: "video", label: "Videoaula", icon: Video },
    { id: "mapa", label: "Mapa mental", icon: Map }
  ];

  // Icon actions
  const iconActions = [
    { id: "report", icon: AlertTriangle, label: "Reportar erro" },
    { id: "highlight", icon: Palette, label: "Marcar texto" }
  ];

  // Highlight colors
  const highlightColors = [
    { name: "Amarelo Pastel", value: "#FFF9C4" },
    { name: "Verde Pastel", value: "#C8E6C9" },
    { name: "Azul Pastel", value: "#BBDEFB" },
    { name: "Rosa Pastel", value: "#F8BBD0" },
    { name: "Laranja Pastel", value: "#FFE0B2" },
    { name: "Violeta Pastel", value: "#D1C4E9" }
  ];

  const handleIconAction = (actionId: string) => {
    console.log(`Action triggered: ${actionId}`);
    
    switch (actionId) {
      case "report":
        setShowErrorReport(true);
        break;
      case "highlight":
        // Toggle highlight color palette
        setShowHighlightColors(prev => !prev);
        break;
      default:
        break;
    }
  };

  // Function to scroll to highlighted text
  const scrollToHighlight = (highlightId: string) => {
    // In a real implementation, this would scroll to the highlighted text
    console.log(`Scrolling to highlight: ${highlightId}`);
    
    // Find the highlighted element in the content
    if (contentRef.current) {
      const highlightElements = contentRef.current.querySelectorAll('mark');
      highlightElements.forEach(element => {
        const elementHighlightId = element.getAttribute('data-highlight-id');
        if (elementHighlightId === highlightId) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add temporary highlight effect
          element.classList.add('ring-2', 'ring-blue-500');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-blue-500');
          }, 2000);
        }
      });
    }
    
    setShowHighlightsSidebar(false);
  };

  // Function to apply highlight to selected text
  const applyHighlight = (color: string) => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === "" || selection.rangeCount === 0) {
      setShowHighlightColors(false);
      return;
    }
    
    const range = selection.getRangeAt(0);
    
    // Obter o texto selecionado
    let selectedText = selection.toString();
    
    // Capturar HTML da seleção para melhor correspondência
    const clonedContent = range.cloneContents();
    const div = document.createElement('div');
    div.appendChild(clonedContent);
    const selectedHtml = div.innerHTML;
    
    // Normalizar o texto para garantir consistência
    selectedText = selectedText
      .normalize('NFC') // Normalização Unicode
      .replace(/\s+/g, ' ') // Substituir múltiplos espaços por um único espaço
      .trim(); // Remover espaços no início e fim
    
    // Verificar se o texto selecionado já tem highlight
    const hasExistingHighlight = highlights.some(highlight => 
      selectedText.includes(highlight.text) || highlight.text.includes(selectedText)
    );
    
    if (hasExistingHighlight) {
      // Mostrar diálogo de confirmação
      setPendingHighlight({ text: selectedText, color });
      setShowConfirmDialog(true);
    } else {
      // Adicionar highlight com texto E HTML
      const newHighlight = {
        id: `highlight-${Date.now()}`,
        text: selectedText,
        html: selectedHtml, // Incluir HTML para melhor correspondência
        color: color,
        position: { 
          start: selection.anchorOffset, 
          end: selection.focusOffset 
        },
        note: "" // Inicializando com nota vazia
      };
      
      setHighlights(prev => [...prev, newHighlight]);
    }
    
    setShowHighlightColors(false);
    
    // Clear selection
    selection.removeAllRanges();
  };

  // Function to confirm highlight replacement
  const confirmHighlight = () => {
    if (pendingHighlight) {
      // Remover highlights existentes que se sobrepõem
      const filteredHighlights = highlights.filter(highlight => 
        !pendingHighlight.text.includes(highlight.text) && !highlight.text.includes(pendingHighlight.text)
      );
      
      // Adicionar o novo highlight
      const newHighlight = {
        id: `highlight-${Date.now()}`,
        text: pendingHighlight.text,
        color: pendingHighlight.color,
        position: { start: 0, end: 0 }, // Posições genéricas
        note: ""
      };
      
      setHighlights([...filteredHighlights, newHighlight]);
      setPendingHighlight(null);
    }
    
    setShowConfirmDialog(false);
  };

  // Function to cancel highlight replacement
  const cancelHighlight = () => {
    setShowConfirmDialog(false);
    setPendingHighlight(null);
  };

  // Function to update highlight note
  const updateHighlightNote = (highlightId: string, note: string) => {
    setHighlights(prev => prev.map(highlight => 
      highlight.id === highlightId ? { ...highlight, note } : highlight
    ));
  };

  // Function to start editing a note
  const startEditingNote = (highlightId: string) => {
    setEditingNoteId(highlightId);
  };

  // Function to finish editing a note
  const finishEditingNote = () => {
    setEditingNoteId(null);
  };

  // Function to delete a highlight
  const deleteHighlight = (highlightId: string) => {
    setHighlights(prev => prev.filter(highlight => highlight.id !== highlightId));
  };
  
  // Function to handle disabled options for questions
  const handleToggleDisabled = (questionId: string, optionId: string, event: React.MouseEvent) => {
    event.preventDefault();
    setDisabledOptions(prev => {
      const questionDisabled = prev[questionId] || [];
      if (questionDisabled.includes(optionId)) {
        return {
          ...prev,
          [questionId]: questionDisabled.filter(id => id !== optionId)
        };
      } else {
        return {
          ...prev,
          [questionId]: [...questionDisabled, optionId]
        };
      }
    });
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <div className="container mx-auto px-4 py-8">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                  <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </PublicLayout>
    );
  }

  if (!post) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <div className="container mx-auto px-4 py-8">
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Teoria não encontrada</h1>
                <p className="text-gray-600 mb-6">A teoria que você está procurando não existe ou foi removida.</p>
                <Link to="/teorias" className="text-primary hover:underline">
                  Voltar para teorias
                </Link>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <style>
        {`
          .highlight-paragraphs p {
            border: 1px dotted transparent;
            transition: border-color 0.2s ease;
          }
          
          .highlight-paragraphs p:hover {
            border-color: #d1d5db;
          }
          
          /* Tooltip CSS */
          mark[data-note] {
            position: relative;
            cursor: pointer;
          }
          
          mark[data-note]:hover::after {
            content: attr(data-note);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background-color: #333;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 400;
            line-height: 1.3;
            white-space: pre-wrap;
            min-width: 200px;
            max-width: 300px;
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          }
          
          mark[data-note]:hover::before {
            content: '';
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 5px solid transparent;
            border-top-color: #333;
            margin-bottom: -5px;
            z-index: 1001;
          }
        `}
      </style>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            {/* Error Report Popup */}
            {showErrorReport && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                  <div className="flex justify-between items-center border-b p-4">
                    <h3 className="text-lg font-semibold">Reportar Erro</h3>
                    <button 
                      onClick={() => setShowErrorReport(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="mb-4">
                      <Label htmlFor="error-description" className="block text-sm font-medium text-gray-700 mb-2">
                        Descreva o erro encontrado
                      </Label>
                      <Textarea
                        id="error-description"
                        value={errorReport}
                        onChange={(e) => setErrorReport(e.target.value)}
                        placeholder="Descreva o erro encontrado na teoria..."
                        rows={4}
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowErrorReport(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => {
                          // TODO: Implement actual error reporting logic
                          console.log("Erro reportado:", errorReport);
                          setShowErrorReport(false);
                          setErrorReport("");
                          toast.success("Erro reportado com sucesso!");
                        }}
                      >
                        Enviar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Confirm Highlight Replacement Dialog */}
            {showConfirmDialog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                  <div className="flex justify-between items-center border-b p-4">
                    <h3 className="text-lg font-semibold">Substituir marcação existente?</h3>
                    <button 
                      onClick={cancelHighlight}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 mb-6">
                      Já existe uma marcação neste trecho. Deseja substituir a marcação existente pela nova?
                    </p>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={cancelHighlight}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={confirmHighlight}
                      >
                        Substituir
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Post Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <div className="relative">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      {post.titulo}
                    </h1>
                    {/* Botão de edição para administradores */}
                    {isAdmin() && post.id && (
                      <Link 
                        to={`/admin/teorias/${post.id}/edit`} 
                        className="absolute top-0 right-0 bg-[#ea2be2] text-white p-2 rounded-full hover:bg-[#d029d5] transition-colors"
                        title="Editar teoria"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium">{post.disciplina_id}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      {professor ? professor.nome_completo : "Professor não informado"}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {format(new Date(post.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      Assunto: {post.assunto_id}
                    </span>
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      Tópicos: {post.topicos_ids ? post.topicos_ids.length : 0}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Top Menu - Fixed when scrolling */}
              <div className="sticky top-0 z-10 bg-white border-b border-[rgba(239,239,239,1)] mb-6 -mx-6 px-6 py-0">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* Left Icons */}
                  <div className="flex items-center gap-2 relative">
                    {iconActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleIconAction(action.id)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                        title={action.label}
                      >
                        <action.icon className="h-5 w-5 text-gray-600" />
                        {action.id === "highlight" && highlights.length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {highlights.length}
                          </span>
                        )}
                      </button>
                    ))}
                    
                    {/* Highlight color palette */}
                    {showHighlightColors && (
                      <div className="absolute top-12 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50">
                        <div className="flex gap-2">
                          {highlightColors.map((color) => (
                            <button
                              key={color.name}
                              className="w-8 h-8 rounded cursor-pointer border border-gray-300 hover:scale-110 transition-transform"
                              style={{ backgroundColor: color.value }}
                              onClick={() => applyHighlight(color.value)}
                              title={color.name}
                            />
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
                          <button 
                            className="text-xs text-gray-500 hover:text-gray-700"
                            onClick={() => setShowHighlightColors(false)}
                          >
                            Cancelar
                          </button>
                          {highlights.length > 0 && (
                            <button 
                              className="text-xs text-blue-500 hover:text-blue-700 flex items-center"
                              onClick={() => {
                                setShowHighlightColors(false);
                                setShowHighlightsSidebar(true);
                              }}
                            >
                              <List className="h-4 w-4 mr-1" />
                              Lista
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Highlights sidebar */}
                    {showHighlightsSidebar && (
                      <div className="fixed inset-0 z-60">
                        <div 
                          className="absolute inset-0 bg-black bg-opacity-50"
                          onClick={() => setShowHighlightsSidebar(false)}
                        />
                        <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg p-4 overflow-y-auto">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Textos Marcados</h3>
                            <button 
                              onClick={() => setShowHighlightsSidebar(false)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="space-y-3">
                            {highlights.map((highlight) => (
                              <div 
                                key={highlight.id}
                                className="p-3 rounded border cursor-pointer hover:bg-gray-50 relative"
                                style={{ borderLeft: `4px solid ${highlight.color}` }}
                                onClick={(e) => {
                                  // Only scroll if not clicking on form elements
                                  if (!(e.target as HTMLElement).closest('textarea, button')) {
                                    scrollToHighlight(highlight.id);
                                  }
                                }}
                              >
                                <p className="text-sm text-gray-700 line-clamp-33">
                                  {highlight.text}
                                </p>
                                <div 
                                  className="w-4 h-4 rounded-full mt-2 inline-block"
                                  style={{ backgroundColor: highlight.color }}
                                />
                                
                                {editingNoteId === highlight.id ? (
                                  // Textarea para edição da nota
                                  <div className="mt-2">
                                    <textarea
                                      className="w-full text-xs border rounded p-2"
                                      placeholder="Adicione uma nota..."
                                      defaultValue={highlight.note || ""}
                                      onBlur={(e) => {
                                        updateHighlightNote(highlight.id, e.target.value);
                                        finishEditingNote();
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Escape') {
                                          finishEditingNote();
                                        }
                                      }}
                                      autoFocus
                                    />
                                    <div className="flex justify-end mt-1 space-x-2">
                                      <button
                                        className="text-xs text-gray-500 hover:text-gray-700"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          finishEditingNote();
                                        }}
                                      >
                                        Cancelar
                                      </button>
                                      <button
                                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const textarea = e.currentTarget.closest('div')?.querySelector('textarea');
                                          if (textarea) {
                                            updateHighlightNote(highlight.id, textarea.value);
                                            finishEditingNote();
                                          }
                                        }}
                                      >
                                        Salvar
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  // Exibição da nota ou botão para adicionar nota
                                  <div className="mt-2">
                                    {highlight.note ? (
                                      <p className="text-xs text-gray-500 italic">
                                        Nota: {highlight.note}
                                      </p>
                                    ) : (
                                      <p className="text-xs text-gray-400 italic">
                                        Sem nota
                                      </p>
                                    )}
                                  </div>
                                )}
                                
                                <div className="flex justify-end mt-2 space-x-2">
                                  <button
                                    className="text-gray-400 hover:text-blue-500"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startEditingNote(highlight.id);
                                    }}
                                    title={highlight.note ? "Editar nota" : "Adicionar nota"}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    className="text-gray-400 hover:text-red-500"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteHighlight(highlight.id);
                                    }}
                                    title="Excluir marcação"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            {highlights.length === 0 && (
                              <p className="text-gray-500 text-center py-4">
                                Nenhum texto marcado ainda
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Right Menu Tabs - Similar to course page design */}
                  <div className="flex items-center gap-2">
                    {menuOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setActiveTab(option.id)}
                          className={cn(
                            "course-nav-button flex items-center gap-2 px-4 py-4 text-[rgba(38,47,60,0.7)] hover:text-[#5f2ebe] border-b-2 border-transparent hover:border-[#5f2ebe] transition-colors rounded-none",
                            activeTab === option.id && "text-[#5f2ebe] border-[#5f2ebe]"
                          )}
                        >
                          <IconComponent className="h-5 w-5" />
                          <span className="hidden md:inline">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Content Area */}
              <div className="prose max-w-none relative" ref={contentRef}>
                {activeTab === "aula" && (
                  <div className="relative">
                    <BlogContentWithQuestions 
                      content={post.conteudo} 
                      className="text-gray-700"
                      highlights={highlights}
                    />
                  </div>
                )}
                
                {activeTab === "questoes" && (
                  <div className="relative bg-[rgb(249,250,251)] p-4 rounded-lg">
                    {post.questoes_filtros ? (
                      <div>
                        <QuestionResults
                          questions={filteredQuestions}
                          disabledOptions={disabledOptions}
                          onToggleDisabled={handleToggleDisabled}
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={setCurrentPage}
                          hasFilters={true}
                          loading={questionsLoading}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="bg-gray-100 rounded-full p-4 mb-4">
                          <FileQuestion className="h-8 w-8 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Nenhum filtro configurado
                        </h3>
                        <p className="text-gray-600 mb-4">
                          O administrador ainda não configurou filtros para exibir questões nesta teoria.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === "video" && (
                  <div className="relative bg-[rgb(249,250,251)] p-4 rounded-lg">
                    {post.videoaulas && post.videoaulas.length > 0 ? (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold mb-6">Videoaulas</h2>
                        {post.videoaulas.map((videoUrl, index) => {
                          // Extract YouTube video ID from URL
                          const videoId = videoUrl.includes('youtube.com') 
                            ? new URLSearchParams(videoUrl.split('?')[1]).get('v') 
                            : videoUrl.split('/').pop();
                          
                          return (
                            <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                              <div className="aspect-w-16 aspect-h-9">
                                <iframe
                                  src={`https://www.youtube.com/embed/${videoId}`}
                                  title={`Videoaula ${index + 1}`}
                                  className="w-full h-64 md:h-96"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                ></iframe>
                              </div>
                              <div className="p-4">
                                <h3 className="font-medium">Videoaula {index + 1}</h3>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="bg-gray-100 rounded-full p-4 mb-4">
                          <Video className="h-8 w-8 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Nenhum vídeo adicionado
                        </h3>
                        <p className="text-gray-600 mb-4">
                          O administrador ainda não adicionou vídeos para esta teoria.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === "mapa" && (
                  <div className="relative bg-[rgb(249,250,251)] p-4 rounded-lg">
                    {post.mapas_mentais && post.mapas_mentais.length > 0 ? (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold mb-6">Mapas Mentais</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {post.mapas_mentais.map((pdfUrl, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                              <div className="p-4 border-b">
                                <h3 className="font-medium">Mapa Mental {index + 1}</h3>
                              </div>
                              <div className="p-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Documento PDF</span>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => window.open(pdfUrl, '_blank')}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Visualizar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="bg-gray-100 rounded-full p-4 mb-4">
                          <Map className="h-8 w-8 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Nenhum mapa mental adicionado
                        </h3>
                        <p className="text-gray-600 mb-4">
                          O administrador ainda não adicionou mapas mentais para esta teoria.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab !== "aula" && activeTab !== "questoes" && activeTab !== "video" && activeTab !== "mapa" && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-gray-100 rounded-full p-4 mb-4">
                      {menuOptions.find(opt => opt.id === activeTab)?.icon && 
                        (() => {
                          const IconComponent = menuOptions.find(opt => opt.id === activeTab)?.icon || FileText;
                          return <IconComponent className="h-8 w-8 text-gray-600" />;
                        })()
                      }
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {menuOptions.find(opt => opt.id === activeTab)?.label}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Conteúdo de {menuOptions.find(opt => opt.id === activeTab)?.label.toLowerCase()} estará disponível em breve.
                    </p>
                    <Button variant="outline" onClick={() => setActiveTab("aula")}>
                      Voltar para a aula
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </PublicLayout>
  );
};

export default TeoriaPost;
