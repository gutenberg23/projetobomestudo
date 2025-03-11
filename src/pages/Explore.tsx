
import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CourseItemType, DisciplinaItemType } from "@/components/admin/questions/types";

interface ItemProps {
  id: string;
  title: string;
  description: string;
  isFavorite: boolean;
  topics: number;
  lessons: number;
  onToggleFavorite: (id: string) => void;
}

const ResultItem: React.FC<ItemProps> = ({
  id,
  title,
  description,
  isFavorite,
  topics,
  lessons,
  onToggleFavorite
}) => {
  return <div className="flex justify-between items-center p-4 border-b border-gray-100">
      <div className="flex-1">
        <Link to={`/course/${id}`} className="hover:text-[#5f2ebe] transition-colors">
          <h3 className="text-[#272f3c] mb-0 leading-none font-extralight text-lg">{title}</h3>
        </Link>
      </div>
      <div className="flex items-center">
        <div className="text-right mr-4">
          <p className="text-sm font-bold text-[#262f3c]">Tópicos: <span className="text-gray-600 font-normal">{topics}</span></p>
          <p className="text-sm font-bold text-[#262f3c]">Aulas: <span className="text-gray-600 font-normal">{lessons}</span></p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onToggleFavorite(id)} aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
          <Star className={`h-5 w-5 ${isFavorite ? "fill-[#ea2be2] text-[#ea2be2]" : "text-gray-400"}`} />
        </Button>
      </div>
    </div>;
};

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSubjects, setShowSubjects] = useState(false);
  const [courses, setCourses] = useState<CourseItemType[]>([]);
  const [subjects, setSubjects] = useState<DisciplinaItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Extrair parâmetro de pesquisa da URL quando a página carrega
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [location.search]);

  // Buscar cursos e disciplinas do banco de dados
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Buscar cursos
        const { data: coursesData, error: coursesError } = await supabase
          .from('cursos')
          .select('*');

        if (coursesError) throw coursesError;

        // Buscar favoritos do usuário logado
        const { data: { user } } = await supabase.auth.getUser();
        
        let userFavorites: string[] = [];
        let userDisciplinasFavorites: string[] = [];
        
        if (user) {
          const { data: favoritesData } = await supabase
            .from('profiles')
            .select('cursos_favoritos, disciplinas_favoritos')
            .eq('id', user.id)
            .single();
          
          userFavorites = favoritesData?.cursos_favoritos || [];
          userDisciplinasFavorites = favoritesData?.disciplinas_favoritos || [];
        }

        // Transformar dados de cursos
        const formattedCourses: CourseItemType[] = coursesData.map(course => ({
          id: course.id,
          titulo: course.titulo,
          descricao: course.descricao || 'Sem descrição',
          isFavorite: user ? userFavorites.includes(course.id) : false,
          topics: (course.topicos_ids?.length || 0),
          lessons: (course.aulas_ids?.length || 0),
          informacoes_curso: course.informacoes_curso
        }));

        setCourses(formattedCourses);

        // Buscar disciplinas
        const { data: disciplinasData, error: disciplinasError } = await supabase
          .from('disciplinas')
          .select('*');

        if (disciplinasError) throw disciplinasError;

        // Transformar dados de disciplinas
        const formattedDisciplinas: DisciplinaItemType[] = disciplinasData.map(disciplina => ({
          id: disciplina.id,
          titulo: disciplina.titulo,
          descricao: disciplina.descricao || 'Sem descrição',
          isFavorite: user ? userDisciplinasFavorites.includes(disciplina.id) : false,
          topics: 0, // Como não temos essa informação no banco, colocamos um valor padrão
          lessons: (disciplina.aulas_ids?.length || 0)
        }));

        setSubjects(formattedDisciplinas);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast.error("Erro ao carregar dados. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleFavorite = async (id: string) => {
    // Verificar se o usuário está logado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Você precisa estar logado para adicionar favoritos.");
      navigate('/login');
      return;
    }

    try {
      if (showSubjects) {
        // Atualizar estado local
        setSubjects(subjects.map(subject => 
          subject.id === id ? { ...subject, isFavorite: !subject.isFavorite } : subject
        ));

        // Buscar favoritos atuais
        const { data: profile } = await supabase
          .from('profiles')
          .select('disciplinas_favoritos')
          .eq('id', user.id)
          .single();

        let disciplinasFavoritos = profile?.disciplinas_favoritos || [];
        
        // Adicionar ou remover dos favoritos
        if (disciplinasFavoritos.includes(id)) {
          disciplinasFavoritos = disciplinasFavoritos.filter(favId => favId !== id);
          toast.success("Disciplina removida dos favoritos");
        } else {
          disciplinasFavoritos.push(id);
          toast.success("Disciplina adicionada aos favoritos");
        }

        // Atualizar no banco de dados
        await supabase
          .from('profiles')
          .update({ disciplinas_favoritos: disciplinasFavoritos })
          .eq('id', user.id);

      } else {
        // Atualizar estado local de cursos
        setCourses(courses.map(course => 
          course.id === id ? { ...course, isFavorite: !course.isFavorite } : course
        ));

        // Buscar favoritos atuais
        const { data: profile } = await supabase
          .from('profiles')
          .select('cursos_favoritos')
          .eq('id', user.id)
          .single();

        let cursosFavoritos = profile?.cursos_favoritos || [];
        
        // Adicionar ou remover dos favoritos
        if (cursosFavoritos.includes(id)) {
          cursosFavoritos = cursosFavoritos.filter(favId => favId !== id);
          toast.success("Curso removido dos favoritos");
        } else {
          cursosFavoritos.push(id);
          toast.success("Curso adicionado aos favoritos");
        }

        // Atualizar no banco de dados
        await supabase
          .from('profiles')
          .update({ cursos_favoritos: cursosFavoritos })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error("Erro ao atualizar favoritos:", error);
      toast.error("Erro ao atualizar favoritos. Por favor, tente novamente.");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const filteredData = showSubjects 
    ? subjects.filter(subject => subject.titulo.toLowerCase().includes(searchTerm.toLowerCase())) 
    : courses.filter(course => course.titulo.toLowerCase().includes(searchTerm.toLowerCase()));

  return <div className="flex flex-col min-h-screen bg-[#f6f8fa]">
      <Header />
      <main className="flex-grow pt-[120px] px-4 md:px-8 w-full">
        <h1 className="text-3xl mb-2 md:text-3xl font-extrabold text-[#272f3c]">Explorar</h1>
        <p className="text-[#67748a] mb-6">Pesquise por concursos ou disciplinas do seu interesse</p>
        
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex items-center flex-1 relative">
            <form onSubmit={handleSearch} className="w-full flex">
              <Input type="text" placeholder="Pesquisar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pr-10 w-full" />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 flex items-center justify-center text-gray-400 hover:text-gray-600">
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-sm ${!showSubjects ? "font-medium" : ""}`}>Concursos</span>
            <Switch checked={showSubjects} onCheckedChange={setShowSubjects} aria-label="Alternar entre cursos e disciplinas" />
            <span className={`text-sm ${showSubjects ? "font-medium" : ""}`}>
              Disciplinas
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#5f2ebe] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-3 text-gray-500">Carregando dados...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredData.length > 0 ? (
                filteredData.map(item => (
                  <ResultItem 
                    key={item.id} 
                    id={item.id} 
                    title={item.titulo} 
                    description={item.descricao || ""} 
                    isFavorite={item.isFavorite} 
                    topics={item.topics} 
                    lessons={item.lessons} 
                    onToggleFavorite={handleToggleFavorite} 
                  />
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Nenhum resultado encontrado para "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>;
};

export default Explore;
