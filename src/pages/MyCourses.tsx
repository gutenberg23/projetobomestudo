
import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Clock, Calendar, ChevronRight } from "lucide-react";

const MyCourses = () => {
  const [activeTab, setActiveTab] = useState("cursos");
  const [searchQuery, setSearchQuery] = useState("");
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [myDisciplinas, setMyDisciplinas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bancas, setBancas] = useState<any[]>([]);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      fetchCourses();
      fetchBancas();
    }
  }, [user]);
  
  const fetchBancas = async () => {
    try {
      const { data, error } = await supabase
        .from('bancas')
        .select('*');
      
      if (error) throw error;
      setBancas(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar bancas:', error);
    }
  };
  
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
  
  const fetchCourses = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Buscar cursos matriculados
      const { data: matriculasData, error: matriculasError } = await supabase
        .from('user_course_enrollments')
        .select('course_id, created_at')
        .eq('user_id', user.id);
      
      if (matriculasError) throw matriculasError;
      
      if (!matriculasData || matriculasData.length === 0) {
        setMyCourses([]);
        setMyDisciplinas([]);
        setLoading(false);
        return;
      }
      
      const courseIds = matriculasData.map(m => m.course_id);
      
      // Buscar dados dos cursos
      const { data: cursosData, error: cursosError } = await supabase
        .from('cursos')
        .select('*, professores:professor_id(nome)')
        .in('id', courseIds);
      
      if (cursosError) throw cursosError;
      
      // Processar cursos para obter progresso e tópicos
      const cursosProcessados = await processarCursos(cursosData || []);
      
      // Adicionar data de matrícula
      const cursosComMatricula = cursosProcessados.map(curso => {
        const matricula = matriculasData.find(m => m.course_id === curso.id);
        return {
          ...curso,
          data_matricula: matricula?.created_at
        };
      });
      
      setMyCourses(cursosComMatricula);
      
      // Buscar disciplinas relacionadas aos cursos
      const disciplinasIds = new Set<string>();
      cursosData?.forEach(curso => {
        if (curso.disciplinas_ids && Array.isArray(curso.disciplinas_ids)) {
          curso.disciplinas_ids.forEach((id: string) => disciplinasIds.add(id));
        }
      });
      
      if (disciplinasIds.size > 0) {
        const { data: disciplinasData, error: disciplinasError } = await supabase
          .from('disciplinas')
          .select('*')
          .in('id', Array.from(disciplinasIds));
        
        if (disciplinasError) throw disciplinasError;
        
        // Processar disciplinas para adicionar contagem de tópicos
        const disciplinasProcessadas = await processarDisciplinas(disciplinasData || []);
        setMyDisciplinas(disciplinasProcessadas);
      }
      
    } catch (error: any) {
      console.error('Erro ao carregar cursos:', error);
      toast({
        title: "Erro ao carregar cursos",
        description: error.message || "Ocorreu um erro ao buscar seus cursos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoToCourse = (course: any) => {
    navigate(`/course/${course.id}`);
  };
  
  const getBancaNome = (bancaId: string) => {
    const banca = bancas.find(b => b.id === bancaId);
    return banca ? banca.nome : '';
  };
  
  const filteredCourses = myCourses.filter(curso => 
    searchQuery === "" || 
    curso.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    curso.descricao?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredDisciplinas = myDisciplinas.filter(disciplina => 
    searchQuery === "" || 
    disciplina.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    disciplina.descricao?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f6f8fa]">
      <Header />
      <main className="pt-[88px] px-4 py-8 container mx-auto">
        <h1 className="text-3xl font-bold text-[#272f3c] mb-8">Meus Cursos</h1>
        
        <div className="mb-6">
          <div className="flex items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar nos meus cursos"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="cursos" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="cursos">Meus Cursos</TabsTrigger>
            <TabsTrigger value="disciplinas">Minhas Disciplinas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cursos">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array(4).fill(0).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-0">
                      <Skeleton className="h-32 w-full" />
                      <div className="p-5 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-10 w-full" />
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
                {filteredCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCourses.map((curso) => (
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
                            
                            <div className="mb-4">
                              <div className="flex justify-between text-xs text-[#67748a] mb-1">
                                <span>Progresso</span>
                                <span>0%</span>
                              </div>
                              <Progress value={0} className="h-2" />
                            </div>
                            
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
                                onClick={() => handleGoToCourse(curso)}
                              >
                                Continuar
                              </Button>
                            </div>
                            
                            {curso.data_matricula && (
                              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-[#67748a] flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>Matriculado em {new Date(curso.data_matricula).toLocaleDateString('pt-BR')}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <h3 className="text-xl font-semibold text-[#272f3c] mb-2">
                      {searchQuery ? "Nenhum curso encontrado" : "Você ainda não está matriculado em nenhum curso"}
                    </h3>
                    <p className="text-[#67748a] mb-6">
                      {searchQuery 
                        ? "Tente ajustar sua busca"
                        : "Explore nossos cursos disponíveis e comece sua jornada de aprendizado"
                      }
                    </p>
                    {!searchQuery && (
                      <Button onClick={() => navigate('/explore')}>
                        Explorar cursos
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="disciplinas">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(6).fill(0).map((_, i) => (
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
                          
                          <div className="mb-4">
                            <div className="flex justify-between text-xs text-[#67748a] mb-1">
                              <span>Progresso</span>
                              <span>0%</span>
                            </div>
                            <Progress value={0} className="h-2" />
                          </div>
                          
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
                ) : (
                  <div className="text-center py-10">
                    <h3 className="text-xl font-semibold text-[#272f3c] mb-2">
                      {searchQuery ? "Nenhuma disciplina encontrada" : "Você ainda não tem disciplinas"}
                    </h3>
                    <p className="text-[#67748a] mb-6">
                      {searchQuery 
                        ? "Tente ajustar sua busca"
                        : "As disciplinas dos seus cursos aparecerão aqui"
                      }
                    </p>
                    {!searchQuery && (
                      <Button onClick={() => navigate('/explore')}>
                        Explorar cursos
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default MyCourses;
