
import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Clock, BookOpen, ChevronRight, Users } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const Explore = () => {
  const [activeTab, setActiveTab] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    nivel: [] as string[],
    disciplina: [] as string[],
    banca: [] as string[]
  });
  const [cursos, setCursos] = useState<any[]>([]);
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [bancas, setBancas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [niveis] = useState(["Médio", "Superior", "Fundamental"]);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const searchParam = query.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    
    loadData();
  }, [location]);
  
  const loadData = async () => {
    setLoading(true);
    try {
      // Buscar cursos
      const { data: cursosData, error: cursosError } = await supabase
        .from('cursos')
        .select('*, professores:professor_id(nome)');
      
      if (cursosError) throw cursosError;
      
      const cursoProcessados = await processarCursos(cursosData || []);
      setCursos(cursoProcessados);
      
      // Buscar disciplinas
      const { data: disciplinasData, error: disciplinasError } = await supabase
        .from('disciplinas')
        .select('*');
      
      if (disciplinasError) throw disciplinasError;
      setDisciplinas(disciplinasData || []);
      
      // Buscar bancas
      const { data: bancasData, error: bancasError } = await supabase
        .from('bancas')
        .select('*');
      
      if (bancasError) throw bancasError;
      setBancas(bancasData || []);
      
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message || "Ocorreu um erro ao buscar os cursos e filtros.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Função para processar cursos e contar tópicos
  const processarCursos = async (cursosData: any[]) => {
    // Mapear todas as disciplinas IDs e aulas IDs para busca
    const todasDisciplinasIds = new Set<string>();
    const todasAulasIds = new Set<string>();
    
    cursosData.forEach(curso => {
      if (curso.disciplinas_ids && Array.isArray(curso.disciplinas_ids)) {
        curso.disciplinas_ids.forEach((id: string) => todasDisciplinasIds.add(id));
      }
      if (curso.aulas_ids && Array.isArray(curso.aulas_ids)) {
        curso.aulas_ids.forEach((id: string) => todasAulasIds.add(id));
      }
    });
    
    // Buscar todas as disciplinas relacionadas para obter suas aulas
    let disciplinasAulas: Record<string, string[]> = {};
    if (todasDisciplinasIds.size > 0) {
      const { data: disciplinasData } = await supabase
        .from('disciplinas')
        .select('id, aulas_ids')
        .in('id', Array.from(todasDisciplinasIds));
      
      if (disciplinasData) {
        disciplinasData.forEach(disc => {
          disciplinasAulas[disc.id] = disc.aulas_ids || [];
          if (disc.aulas_ids && Array.isArray(disc.aulas_ids)) {
            disc.aulas_ids.forEach(aulaId => todasAulasIds.add(aulaId));
          }
        });
      }
    }
    
    // Buscar todas as aulas para obter seus tópicos
    let aulasTopicos: Record<string, number> = {};
    if (todasAulasIds.size > 0) {
      const { data: aulasData } = await supabase
        .from('aulas')
        .select('id, topicos_ids')
        .in('id', Array.from(todasAulasIds));
      
      if (aulasData) {
        aulasData.forEach(aula => {
          aulasTopicos[aula.id] = Array.isArray(aula.topicos_ids) ? aula.topicos_ids.length : 0;
        });
      }
    }
    
    // Processar cada curso para adicionar contagem de tópicos
    return cursosData.map(curso => {
      let totalTopicos = 0;
      
      // Contar tópicos das aulas diretamente ligadas ao curso
      if (curso.aulas_ids && Array.isArray(curso.aulas_ids)) {
        curso.aulas_ids.forEach((aulaId: string) => {
          totalTopicos += aulasTopicos[aulaId] || 0;
        });
      }
      
      // Contar tópicos das aulas ligadas às disciplinas do curso
      if (curso.disciplinas_ids && Array.isArray(curso.disciplinas_ids)) {
        curso.disciplinas_ids.forEach((discId: string) => {
          const aulasIds = disciplinasAulas[discId] || [];
          aulasIds.forEach(aulaId => {
            totalTopicos += aulasTopicos[aulaId] || 0;
          });
        });
      }
      
      return {
        ...curso,
        total_topicos: totalTopicos
      };
    });
  };
  
  // Funções para processamento de disciplinas e contagem de tópicos
  const processarDisciplinas = async (disciplinasData: any[]) => {
    // Extrair todos os IDs de aulas
    const todasAulasIds = new Set<string>();
    disciplinasData.forEach(disc => {
      if (disc.aulas_ids && Array.isArray(disc.aulas_ids)) {
        disc.aulas_ids.forEach((id: string) => todasAulasIds.add(id));
      }
    });
    
    // Buscar todas as aulas para obter seus tópicos
    let aulasTopicos: Record<string, number> = {};
    if (todasAulasIds.size > 0) {
      const { data: aulasData } = await supabase
        .from('aulas')
        .select('id, topicos_ids')
        .in('id', Array.from(todasAulasIds));
      
      if (aulasData) {
        aulasData.forEach(aula => {
          aulasTopicos[aula.id] = Array.isArray(aula.topicos_ids) ? aula.topicos_ids.length : 0;
        });
      }
    }
    
    // Adicionar contagem de tópicos a cada disciplina
    return disciplinasData.map(disc => {
      let totalTopicos = 0;
      
      if (disc.aulas_ids && Array.isArray(disc.aulas_ids)) {
        disc.aulas_ids.forEach((aulaId: string) => {
          totalTopicos += aulasTopicos[aulaId] || 0;
        });
      }
      
      return {
        ...disc,
        total_topicos: totalTopicos
      };
    });
  };

  useEffect(() => {
    const processAndUpdateDisciplinas = async () => {
      if (disciplinas.length > 0) {
        const processedDisciplinas = await processarDisciplinas(disciplinas);
        setDisciplinas(processedDisciplinas);
      }
    };
    
    processAndUpdateDisciplinas();
  }, [disciplinas.length]);
  
  const toggleFilter = (type: 'nivel' | 'disciplina' | 'banca', value: string) => {
    setFilters(prev => {
      const currentFilters = [...prev[type]];
      const index = currentFilters.indexOf(value);
      
      if (index === -1) {
        currentFilters.push(value);
      } else {
        currentFilters.splice(index, 1);
      }
      
      return {
        ...prev,
        [type]: currentFilters
      };
    });
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  const handleViewCourse = (course: any) => {
    navigate(`/course/${course.id}`);
  };
  
  const filteredCursos = cursos.filter(curso => {
    // Filtrar por pesquisa
    const matchesSearch = 
      searchQuery === "" || 
      curso.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      curso.descricao?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      curso.categoria?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtrar por nível
    const matchesNivel = 
      filters.nivel.length === 0 || 
      filters.nivel.includes(curso.nivel || "");
    
    // Filtrar por disciplina
    const matchesDisciplina = 
      filters.disciplina.length === 0 || 
      (curso.disciplinas_ids && curso.disciplinas_ids.some((id: string) => 
        filters.disciplina.includes(id)
      ));
    
    // Filtrar por banca
    const matchesBanca = 
      filters.banca.length === 0 || 
      filters.banca.includes(curso.banca_id || "");
    
    return matchesSearch && matchesNivel && matchesDisciplina && matchesBanca;
  });
  
  const filteredDisciplinas = disciplinas.filter(disciplina => {
    const matchesSearch = 
      searchQuery === "" || 
      disciplina.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disciplina.descricao?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });
  
  const getBancaNome = (bancaId: string) => {
    const banca = bancas.find(b => b.id === bancaId);
    return banca ? banca.nome : '';
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa]">
      <Header />
      <main className="pt-[88px] px-4 py-8 container mx-auto">
        <h1 className="text-3xl font-bold text-[#272f3c] mb-8">Explorar Cursos e Disciplinas</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-[300px,1fr] gap-6">
          {/* Filtros */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Filter className="mr-2 h-5 w-5" /> Filtros
                  </h3>
                  {(filters.nivel.length > 0 || filters.disciplina.length > 0 || filters.banca.length > 0) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilters({ nivel: [], disciplina: [], banca: [] })}
                    >
                      Limpar
                    </Button>
                  )}
                </div>
                
                <div className="mb-5">
                  <h4 className="text-sm font-semibold mb-2">Nível</h4>
                  <div className="flex flex-wrap gap-2">
                    {niveis.map(nivel => (
                      <Badge 
                        key={nivel}
                        variant={filters.nivel.includes(nivel) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-muted-foreground/20"
                        onClick={() => toggleFilter('nivel', nivel)}
                      >
                        {nivel}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mb-5">
                  <h4 className="text-sm font-semibold mb-2">Disciplinas</h4>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {loading ? (
                      Array(5).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-6 w-20" />
                      ))
                    ) : (
                      disciplinas.map(disciplina => (
                        <Badge 
                          key={disciplina.id}
                          variant={filters.disciplina.includes(disciplina.id) ? "default" : "outline"}
                          className="cursor-pointer hover:bg-muted-foreground/20"
                          onClick={() => toggleFilter('disciplina', disciplina.id)}
                        >
                          {disciplina.titulo}
                          {disciplina.banca_id && ` - ${getBancaNome(disciplina.banca_id)}`}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold mb-2">Bancas</h4>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {loading ? (
                      Array(5).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-6 w-20" />
                      ))
                    ) : (
                      bancas.map(banca => (
                        <Badge 
                          key={banca.id}
                          variant={filters.banca.includes(banca.id) ? "default" : "outline"}
                          className="cursor-pointer hover:bg-muted-foreground/20"
                          onClick={() => toggleFilter('banca', banca.id)}
                        >
                          {banca.nome}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Conteúdo Principal */}
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar cursos e disciplinas"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Tabs defaultValue="todos" value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="mb-6">
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="cursos">Cursos</TabsTrigger>
                <TabsTrigger value="disciplinas">Disciplinas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="todos" className="space-y-6">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array(4).fill(0).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-0">
                          <Skeleton className="h-32 w-full" />
                          <div className="p-5 space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <div className="flex gap-2 mt-2">
                              <Skeleton className="h-8 w-20" />
                              <Skeleton className="h-8 w-20" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <>
                    {filteredCursos.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold mb-4 text-[#272f3c]">Cursos</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredCursos.slice(0, 4).map((curso) => (
                            <Card key={curso.id} className="overflow-hidden hover:shadow-md transition-shadow">
                              <CardContent className="p-0">
                                <div 
                                  className="h-32 bg-cover bg-center" 
                                  style={{ 
                                    backgroundImage: `url(${curso.foto_capa || 'https://placehold.co/600x400/5f2ebe/FFF?text=BomEstudo'})` 
                                  }}
                                />
                                <div className="p-5">
                                  <h3 className="font-bold text-lg text-[#272f3c] mb-2">{curso.nome}</h3>
                                  <p className="text-[#67748a] text-sm mb-4 line-clamp-2">{curso.descricao}</p>
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-4 text-sm text-[#67748a]">
                                      <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1" />
                                        <span>{curso.duracao || "N/A"}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <BookOpen className="h-4 w-4 mr-1" />
                                        <span>{curso.total_topicos || 0} tópicos</span>
                                      </div>
                                    </div>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="text-[#5f2ebe]"
                                      onClick={() => handleViewCourse(curso)}
                                    >
                                      Ver curso
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        {filteredCursos.length > 4 && (
                          <div className="mt-4 text-center">
                            <Button 
                              variant="outline" 
                              onClick={() => setActiveTab("cursos")}
                              className="text-[#5f2ebe]"
                            >
                              Ver todos os cursos
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {filteredDisciplinas.length > 0 && (
                      <div className="mt-8">
                        <h2 className="text-xl font-bold mb-4 text-[#272f3c]">Disciplinas</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredDisciplinas.slice(0, 6).map((disciplina) => (
                            <Card key={disciplina.id} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-5">
                                <h3 className="font-bold text-lg text-[#272f3c] mb-2">
                                  {disciplina.titulo}
                                  {disciplina.banca_id && ` - ${getBancaNome(disciplina.banca_id)}`}
                                </h3>
                                <p className="text-[#67748a] text-sm mb-4 line-clamp-2">{disciplina.descricao}</p>
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center space-x-4 text-sm text-[#67748a]">
                                    <div className="flex items-center">
                                      <BookOpen className="h-4 w-4 mr-1" />
                                      <span>{disciplina.total_topicos || 0} tópicos</span>
                                    </div>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-[#5f2ebe]"
                                    onClick={() => navigate(`/explore?disciplina=${disciplina.id}`)}
                                  >
                                    Ver aulas
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        {filteredDisciplinas.length > 6 && (
                          <div className="mt-4 text-center">
                            <Button 
                              variant="outline" 
                              onClick={() => setActiveTab("disciplinas")}
                              className="text-[#5f2ebe]"
                            >
                              Ver todas as disciplinas
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {filteredCursos.length === 0 && filteredDisciplinas.length === 0 && (
                      <div className="text-center py-10">
                        <h3 className="text-xl font-semibold text-[#272f3c] mb-2">Nenhum resultado encontrado</h3>
                        <p className="text-[#67748a]">Tente ajustar seus filtros ou termos de busca.</p>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="cursos" className="space-y-6">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array(6).fill(0).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-0">
                          <Skeleton className="h-32 w-full" />
                          <div className="p-5 space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <div className="flex gap-2 mt-2">
                              <Skeleton className="h-8 w-20" />
                              <Skeleton className="h-8 w-20" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <>
                    {filteredCursos.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredCursos.map((curso) => (
                          <Card key={curso.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-0">
                              <div 
                                className="h-32 bg-cover bg-center" 
                                style={{ 
                                  backgroundImage: `url(${curso.foto_capa || 'https://placehold.co/600x400/5f2ebe/FFF?text=BomEstudo'})` 
                                }}
                              />
                              <div className="p-5">
                                <h3 className="font-bold text-lg text-[#272f3c] mb-2">{curso.nome}</h3>
                                <p className="text-[#67748a] text-sm mb-4 line-clamp-2">{curso.descricao}</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {curso.nivel && (
                                    <Badge variant="outline">{curso.nivel}</Badge>
                                  )}
                                  {curso.categoria && (
                                    <Badge variant="outline">{curso.categoria}</Badge>
                                  )}
                                </div>
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center space-x-4 text-sm text-[#67748a]">
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-1" />
                                      <span>{curso.duracao || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <BookOpen className="h-4 w-4 mr-1" />
                                      <span>{curso.total_topicos || 0} tópicos</span>
                                    </div>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-[#5f2ebe]"
                                    onClick={() => handleViewCourse(curso)}
                                  >
                                    Ver curso
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <h3 className="text-xl font-semibold text-[#272f3c] mb-2">Nenhum curso encontrado</h3>
                        <p className="text-[#67748a]">Tente ajustar seus filtros ou termos de busca.</p>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="disciplinas" className="space-y-6">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array(9).fill(0).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-5 space-y-2">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <div className="flex gap-2 mt-2">
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-20" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <>
                    {filteredDisciplinas.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredDisciplinas.map((disciplina) => (
                          <Card key={disciplina.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                              <h3 className="font-bold text-lg text-[#272f3c] mb-2">
                                {disciplina.titulo}
                                {disciplina.banca_id && ` - ${getBancaNome(disciplina.banca_id)}`}
                              </h3>
                              <p className="text-[#67748a] text-sm mb-4 line-clamp-2">{disciplina.descricao}</p>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-4 text-sm text-[#67748a]">
                                  <div className="flex items-center">
                                    <BookOpen className="h-4 w-4 mr-1" />
                                    <span>{disciplina.total_topicos || 0} tópicos</span>
                                  </div>
                                  {disciplina.professores && (
                                    <div className="flex items-center">
                                      <Users className="h-4 w-4 mr-1" />
                                      <span>{disciplina.professores}</span>
                                    </div>
                                  )}
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-[#5f2ebe]"
                                  onClick={() => navigate(`/explore?disciplina=${disciplina.id}`)}
                                >
                                  Ver aulas
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <h3 className="text-xl font-semibold text-[#272f3c] mb-2">Nenhuma disciplina encontrada</h3>
                        <p className="text-[#67748a]">Tente ajustar seus filtros ou termos de busca.</p>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Explore;
