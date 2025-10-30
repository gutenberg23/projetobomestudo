import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  AlertTriangle, 
  Highlighter, 
  FileText, 
  FileQuestion, 
  Video, 
  Map, 
  Layers,
  Clock,
  User,
  Calendar,
  Edit,
  X,
  Trash2,
  List
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BlogContent } from "@/components/blog/BlogContent";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Mock data for demonstration
const MOCK_TEORIA_POST = {
  id: "1",
  title: "Teoria de Direito Administrativo",
  slug: "teoria-direito-administrativo",
  author: "Prof. João Silva",
  createdAt: new Date().toISOString(),
  content: `
    <h2>O que é Direito Administrativo?</h2>
    <p>O Direito Administrativo é o ramo do Direito Público que regula a organização e o funcionamento da Administração Pública, bem como as relações entre esta e os administrados.</p>
    
    <h3>Princípios do Direito Administrativo</h3>
    <p>Os princípios do Direito Administrativo são normas fundamentais que orientam a atuação da Administração Pública. Dentre os principais, destacam-se:</p>
    <ul>
      <li><strong>Legalidade:</strong> A Administração deve agir estritamente dentro da lei.</li>
      <li><strong>Impessoalidade:</strong> O interesse público deve prevalecer sobre o privado.</li>
      <li><strong>Moralidade:</strong> A Administração deve seguir os padrões éticos da sociedade.</li>
      <li><strong>Publicidade:</strong> Os atos administrativos devem ser transparentes.</li>
      <li><strong>Eficiência:</strong> A Administração deve buscar o melhor desempenho possível.</li>
    </ul>
    
    <h3>Conceitos Fundamentais</h3>
    <p>Para entender melhor o Direito Administrativo, é importante compreender alguns conceitos fundamentais:</p>
    <blockquote>
      <p><strong>Administração Pública:</strong> Conjunto de órgãos e entidades que exercem funções administrativas do Estado.</p>
    </blockquote>
    <blockquote>
      <p><strong>Agentes Públicos:</strong> Pessoas que exercem funções públicas, como servidores, políticos e delegados de poder.</p>
    </blockquote>
    
    <h3>Organização Administrativa</h3>
    <p>A Administração Pública é organizada em três esferas:</p>
    <ol>
      <li><strong>Administração Direta:</strong> Órgãos integrantes da estrutura dos Poderes Executivo, Legislativo e Judiciário.</li>
      <li><strong>Administração Indireta:</strong> Entidades autônomas criadas pelo Estado para prestar serviços públicos.</li>
      <li><strong>Fundação Pública:</strong> Pessoa jurídica de direito público criada por lei para fins de relevante interesse público.</li>
    </ol>
    
    <p>Esses são apenas os conceitos iniciais. Em aulas futuras, abordaremos temas mais específicos como poderes administrativos, atos administrativos, licitações, contratos administrativos, entre outros.</p>
  `,
  readingTime: 300, // seconds
  viewCount: 1250,
  saved: false
};

const TeoriaPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
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
    color: string;
    position: { start: number; end: number };
    note?: string;
  }>>([]);
  const [showHighlightsSidebar, setShowHighlightsSidebar] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingHighlight, setPendingHighlight] = useState<{text: string, color: string} | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Simulate fetching post data
  useEffect(() => {
    const loadPost = async () => {
      if (!slug) {
        navigate('/teorias');
        return;
      }

      setLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        // For now, we'll use mock data
        // In a real implementation, this would fetch from an API
        setPost(MOCK_TEORIA_POST);
        setLoading(false);
      }, 500);
    };

    loadPost();
  }, [slug, navigate]);

  // Menu options
  const menuOptions = [
    { id: "aula", label: "Aula em texto", icon: FileText },
    { id: "questoes", label: "Questões", icon: FileQuestion },
    { id: "video", label: "Videoaula", icon: Video },
    { id: "mapa", label: "Mapa mental", icon: Map },
    { id: "estrutura", label: "Estrutura", icon: Layers }
  ];

  // Icon actions
  const iconActions = [
    { id: "report", icon: AlertTriangle, label: "Reportar erro" },
    { id: "highlight", icon: Highlighter, label: "Marcar texto" }
  ];

  // Highlight colors
  const highlightColors = [
    { name: "Amarelo", value: "#fff000" },
    { name: "Verde", value: "#00ff00" },
    { name: "Azul", value: "#0080ff" },
    { name: "Rosa", value: "#ff69b4" },
    { name: "Laranja", value: "#ffa500" }
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
    if (!selection || selection.toString().trim() === "") {
      setShowHighlightColors(false);
      return;
    }
    
    // Obter o texto selecionado
    let selectedText = selection.toString();
    
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
      // Adicionar highlight diretamente
      const newHighlight = {
        id: `highlight-${Date.now()}`,
        text: selectedText,
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
                      {post.title}
                    </h1>
                    {/* Botão de edição para administradores */}
                    {isAdmin() && post.id && (
                      <Link 
                        to={`/admin/teorias?edit=${post.id}`} 
                        className="absolute top-0 right-0 bg-[#ea2be2] text-white p-2 rounded-full hover:bg-[#d029d5] transition-colors"
                        title="Editar teoria"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {post.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(post.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {Math.ceil(post.readingTime / 60)} min de leitura
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Top Menu - Fixed when scrolling */}
              <div className="sticky top-[88px] z-10 bg-white border-b border-[rgba(239,239,239,1)] mb-6 -mx-6 px-6 py-0">
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
                      <div className="fixed inset-0 z-50">
                        <div 
                          className="absolute inset-0 bg-black bg-opacity-50"
                          onClick={() => setShowHighlightsSidebar(false)}
                        />
                        <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg p-4 overflow-y-auto mt-[88px]">
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
                                <p className="text-sm text-gray-700 line-clamp-3">
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
                    <BlogContent 
                      content={post.content} 
                      className="text-gray-700"
                      highlights={highlights}
                    />
                  </div>
                )}
                
                {activeTab !== "aula" && (
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
            
            {/* Related Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Próxima teoria</h3>
                  <p className="text-gray-600">Princípios Constitucionais</p>
                  <Button className="mt-4 w-full" variant="outline">
                    Continuar aprendendo
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Questões relacionadas</h3>
                  <p className="text-gray-600">15 questões sobre este tema</p>
                  <Button className="mt-4 w-full" variant="outline">
                    Praticar questões
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Resumo</h3>
                  <p className="text-gray-600">Veja um resumo desta teoria</p>
                  <Button className="mt-4 w-full" variant="outline">
                    Ver resumo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </PublicLayout>
  );
};

export default TeoriaPost;