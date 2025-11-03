import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronRight, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
}

interface Professor {
  id: string;
  nome_completo: string;
}

interface DisciplinaSummary {
  nome: string;
  quantidadeTeorias: number;
  professores: string[];
}

interface TeoriaDetalhada extends Teoria {
  professor_nome?: string;
}

// Função para gerar slug a partir do título

const Teorias = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [teorias, setTeorias] = useState<Teoria[]>([]);
  const [disciplinas, setDisciplinas] = useState<DisciplinaSummary[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [teoriasPorDisciplina, setTeoriasPorDisciplina] = useState<Record<string, TeoriaDetalhada[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDisciplina, setSelectedDisciplina] = useState<string | null>(null);

  // Carregar dados do banco de dados
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Carregar teorias publicadas
        const { data: teoriasData, error: teoriasError } = await supabase
          .from('teorias')
          .select('*')
          .eq('status', 'published')
          .order('disciplina_id', { ascending: true })
          .order('titulo', { ascending: true });
        
        if (teoriasError) throw teoriasError;
        
        // Carregar professores
        const { data: professoresData, error: professoresError } = await supabase
          .from('professores')
          .select('id, nome_completo');
        
        if (professoresError) throw professoresError;
        
        setTeorias(teoriasData || []);
        setProfessores(professoresData || []);
        
        // Processar dados para exibição
        processarDados(teoriasData || [], professoresData || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar teorias");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const processarDados = (teoriasData: Teoria[], professoresData: Professor[]) => {
    // Criar mapa de professores para fácil acesso
    const professorMap = professoresData.reduce((acc, prof) => {
      acc[prof.id] = prof.nome_completo;
      return acc;
    }, {} as Record<string, string>);
    
    // Agrupar teorias por disciplina
    const disciplinasMap: Record<string, TeoriaDetalhada[]> = {};
    teoriasData.forEach(teoria => {
      const teoriaDetalhada: TeoriaDetalhada = {
        ...teoria,
        professor_nome: teoria.professor_id ? professorMap[teoria.professor_id] : "Não informado"
      };
      
      if (!disciplinasMap[teoria.disciplina_id]) {
        disciplinasMap[teoria.disciplina_id] = [];
      }
      disciplinasMap[teoria.disciplina_id].push(teoriaDetalhada);
    });
    
    setTeoriasPorDisciplina(disciplinasMap);
    
    // Criar sumário das disciplinas
    const disciplinasSummary: DisciplinaSummary[] = Object.entries(disciplinasMap).map(([nome, teorias]) => {
      const professoresSet = new Set<string>();
      teorias.forEach(teoria => {
        if (teoria.professor_nome) {
          professoresSet.add(teoria.professor_nome);
        }
      });
      
      return {
        nome,
        quantidadeTeorias: teorias.length,
        professores: Array.from(professoresSet)
      };
    });
    
    // Ordenar disciplinas alfabeticamente
    disciplinasSummary.sort((a, b) => a.nome.localeCompare(b.nome));
    setDisciplinas(disciplinasSummary);
  };

  const handleDisciplinaClick = (disciplina: string) => {
    setSelectedDisciplina(disciplina);
  };

  const handleVoltar = () => {
    setSelectedDisciplina(null);
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <div className="container mx-auto px-4 py-8">
              {/* Page Header */}
              <div className="mb-8">
                <Skeleton className="h-10 w-48 mb-2" />
                <Skeleton className="h-4 w-80" />
              </div>

              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Skeleton className="h-10 w-full pl-10" />
                </div>
              </div>

              {/* Posts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-24 mb-4" />
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-5/6 mb-4" />
                      <div className="flex gap-1 mb-4">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </PublicLayout>
    );
  }

  // Exibição da lista de disciplinas
  if (!selectedDisciplina) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <div className="container mx-auto px-4 py-8">
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Teorias</h1>
                <p className="text-gray-600">
                  Aulas detalhadas com teorias e conceitos importantes para seus estudos.
                </p>
              </div>

              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar disciplinas..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Lista de Disciplinas */}
              {disciplinas.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-left font-medium text-gray-900">Disciplina</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-900">Quantidade de Teorias</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-900">Professores</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-900">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {disciplinas
                        .filter(disc => 
                          disc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          disc.professores.some(prof => prof.toLowerCase().includes(searchTerm.toLowerCase()))
                        )
                        .map((disciplina, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">{disciplina.nome}</td>
                            <td className="py-3 px-4 text-gray-700">{disciplina.quantidadeTeorias}</td>
                            <td className="py-3 px-4 text-gray-700">
                              {disciplina.professores.length > 0 
                                ? disciplina.professores.join(", ") 
                                : "Não informado"}
                            </td>
                            <td className="py-3 px-4">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDisciplinaClick(disciplina.nome)}
                                className="flex items-center gap-1"
                              >
                                Ver teorias
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma teoria encontrada</h3>
                  <p className="text-gray-500 mb-4">
                    Não encontramos nenhuma teoria cadastrada no sistema.
                  </p>
                </div>
              )}
            </div>
          </main>
          <Footer />
        </div>
      </PublicLayout>
    );
  }

  // Exibição das teorias de uma disciplina específica
  return (
    <PublicLayout>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="mb-8">
              <Button 
                variant="outline" 
                onClick={handleVoltar} 
                className="mb-4 flex items-center gap-2"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                Voltar para disciplinas
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedDisciplina}</h1>
              <p className="text-gray-600">
                Lista de teorias da disciplina {selectedDisciplina}
              </p>
            </div>

            {/* Lista de Teorias da Disciplina */}
            {teoriasPorDisciplina[selectedDisciplina]?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left font-medium text-gray-900">Teoria (Título)</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-900">Assunto</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-900">Professor</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-900">Quantidade de Tópicos</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-900">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {teoriasPorDisciplina[selectedDisciplina].map((teoria, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{teoria.titulo}</td>
                        <td className="py-3 px-4 text-gray-700">{teoria.assunto_id}</td>
                        <td className="py-3 px-4 text-gray-700">
                          {teoria.professor_nome || "Não informado"}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {teoria.topicos_ids ? teoria.topicos_ids.length : 0}
                        </td>
                        <td className="py-3 px-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/teoria/${teoria.id}`)}
                            className="flex items-center gap-1"
                          >
                            Ver teoria
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma teoria encontrada</h3>
                <p className="text-gray-500 mb-4">
                  Não encontramos nenhuma teoria para a disciplina {selectedDisciplina}.
                </p>
                <Button onClick={handleVoltar} variant="outline">
                  Voltar para disciplinas
                </Button>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </PublicLayout>
  );
};

export default Teorias;