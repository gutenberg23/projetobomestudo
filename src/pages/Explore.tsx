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
import { generateFriendlyUrl } from "@/utils/slug-utils";
import { ActivityLogger } from '@/services/activity-logger';
import AdBanner from '@/components/ads/AdBanner';
import { PublicLayout } from "@/components/layout/PublicLayout";

interface ItemProps {
  id: string;
  title: string;
  description: string;
  isFavorite: boolean;
  topics: number;
  lessons: number;
  onToggleFavorite: (friendlyUrl: string) => void;
  friendlyUrl: string;
  banca?: string;
  cargo?: string;
}

const ResultItem: React.FC<ItemProps> = ({
  title,
  isFavorite,
  onToggleFavorite,
  friendlyUrl,
  banca,
  cargo
}) => {
  const displayTitle = cargo ? `${title} - ${cargo}` : (banca ? `${title} - ${banca}` : title);
  
  return <div className="flex justify-between items-center p-4 border-b border-gray-100">
      <div className="flex-1 pr-10">
        <Link to={`/course/${friendlyUrl}`} className="hover:text-[#5f2ebe] transition-colors">
          <h3 className="text-[#272f3c] mb-0 leading-none text-sm font-light">{displayTitle}</h3>
        </Link>
      </div>
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => onToggleFavorite(friendlyUrl)} aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
          <Star className={`h-5 w-5 ${isFavorite ? "fill-[#5f2ebe] text-[#5f2ebe]" : "text-[#5f2ebe]"}`} />
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

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const {
          data: coursesData,
          error: coursesError
        } = await supabase.from('cursos').select('*');
        if (coursesError) throw coursesError;

        const {
          data: {
            user
          }
        } = await supabase.auth.getUser();
        let userFavorites: string[] = [];
        let userDisciplinasFavorites: string[] = [];
        if (user) {
          const {
            data: favoritesData
          } = await supabase.from('profiles').select('cursos_favoritos, disciplinas_favoritos').eq('id', user.id).single();
          userFavorites = favoritesData?.cursos_favoritos || [];
          userDisciplinasFavorites = favoritesData?.disciplinas_favoritos || [];
        }

        const formattedCourses: CourseItemType[] = coursesData.map(course => {
          const friendlyUrl = generateFriendlyUrl(course.titulo, course.id);
          const isFavorite = user ? userFavorites.includes(course.id) : false;
          return {
            id: course.id,
            titulo: course.titulo,
            descricao: course.descricao || 'Sem descrição',
            isFavorite,
            topics: course.topicos_ids?.length || 0,
            lessons: course.aulas_ids?.length || 0,
            informacoes_curso: course.informacoes_curso,
            friendlyUrl,
            cargo: course.descricao
          };
        });
        setCourses(formattedCourses);

        const {
          data: disciplinasData,
          error: disciplinasError
        } = await supabase.from('disciplinas').select('*');
        if (disciplinasError) throw disciplinasError;

        const formattedDisciplinas: DisciplinaItemType[] = await Promise.all(
          disciplinasData.map(async (disciplina) => {
            const friendlyUrl = generateFriendlyUrl(disciplina.titulo, disciplina.id);
            const isFavorite = user ? userDisciplinasFavorites.includes(disciplina.id) : false;
            let topicsCount = 0;
            if (disciplina.aulas_ids && disciplina.aulas_ids.length > 0) {
              const { data: aulasData } = await supabase
                .from('aulas')
                .select('topicos_ids')
                .in('id', disciplina.aulas_ids);
              if (aulasData) {
                topicsCount = aulasData.reduce((count, aula) => 
                  count + (aula.topicos_ids?.length || 0), 0);
              }
            }
            return {
              id: disciplina.id,
              titulo: disciplina.titulo,
              descricao: disciplina.descricao || 'Sem descrição',
              isFavorite,
              topics: topicsCount,
              lessons: disciplina.aulas_ids?.length || 0,
              friendlyUrl,
              banca: disciplina.banca
            };
          })
        );
        
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

  const handleToggleFavorite = async (friendlyUrl: string) => {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Você precisa estar logado para adicionar favoritos.");
      navigate('/login');
      return;
    }
    try {
      if (showSubjects) {
        const subject = subjects.find(s => s.friendlyUrl === friendlyUrl);
        if (!subject) {
          console.error("Disciplina não encontrada:", friendlyUrl);
          return;
        }
        const disciplinaId = subject.id;
        console.log("ID da disciplina:", disciplinaId);
        setSubjects(subjects.map(s => s.id === subject.id ? {
          ...s,
          isFavorite: !s.isFavorite
        } : s));
        const {
          data: profile
        } = await supabase.from('profiles').select('disciplinas_favoritos').eq('id', user.id).single();
        if (!profile) {
          console.error("Perfil não encontrado");
          return;
        }
        let disciplinasFavoritos = profile.disciplinas_favoritos || [];
        console.log("Favoritos atuais:", disciplinasFavoritos);
        const isAlreadyFavorite = disciplinasFavoritos.includes(disciplinaId);
        if (isAlreadyFavorite) {
          disciplinasFavoritos = disciplinasFavoritos.filter((id: string) => id !== disciplinaId);
          toast.success("Disciplina removida dos favoritos");
        } else {
          disciplinasFavoritos.push(disciplinaId);
          
          // Registrar atividade de favoritar disciplina
          await ActivityLogger.logSubjectFavorite(disciplinaId, subject.titulo);
          
          toast.success("Disciplina adicionada aos favoritos");
        }
        const {
          error
        } = await supabase.from('profiles').update({
          disciplinas_favoritos: disciplinasFavoritos
        }).eq('id', user.id);
        if (error) throw error;
      } else {
        const course = courses.find(c => c.friendlyUrl === friendlyUrl);
        if (!course) {
          console.error("Curso não encontrado:", friendlyUrl);
          return;
        }
        const courseId = course.id;
        console.log("ID do curso:", courseId);
        setCourses(courses.map(c => c.id === course.id ? {
          ...c,
          isFavorite: !c.isFavorite
        } : c));
        const {
          data: profile
        } = await supabase.from('profiles').select('cursos_favoritos').eq('id', user.id).single();
        if (!profile) {
          console.error("Perfil não encontrado");
          return;
        }
        let cursosFavoritos = profile.cursos_favoritos || [];
        console.log("Favoritos atuais:", cursosFavoritos);
        const isAlreadyFavorite = cursosFavoritos.includes(courseId);
        if (isAlreadyFavorite) {
          cursosFavoritos = cursosFavoritos.filter((id: string) => id !== courseId);
          toast.success("Curso removido dos favoritos");
        } else {
          cursosFavoritos.push(courseId);
          
          // Registrar atividade de favoritar curso
          await ActivityLogger.logCourseFavorite(courseId, course.titulo);
          
          toast.success("Curso adicionado aos favoritos");
        }
        const {
          error
        } = await supabase.from('profiles').update({
          cursos_favoritos: cursosFavoritos
        }).eq('id', user.id);
        if (error) throw error;
      }
    } catch (error) {
      console.error("Erro ao atualizar favoritos:", error);
      toast.error("Erro ao atualizar favoritos. Por favor, tente novamente.");
    }
  };
  const filteredData = showSubjects ? subjects.filter(subject => subject.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || (subject.banca && subject.banca.toLowerCase().includes(searchTerm.toLowerCase()))) : courses.filter(course => course.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || (course.descricao && course.descricao.toLowerCase().includes(searchTerm.toLowerCase())));

  return (
    <PublicLayout>
      <div className="min-h-screen flex flex-col bg-[rgb(242,244,246)]">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl text-[#272f3c] font-extrabold md:text-3xl mb-2">Explorar Cursos e Disciplinas</h1>
              <p className="text-gray-600">Encontre o conteúdo que deseja estudar</p>
            </div>

            <div className="mb-6">
              <AdBanner position="explore_top" className="rounded-lg" />
            </div>

            <div className="bg-white rounded-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Buscar cursos ou disciplinas..."
                    className="pl-10 py-6 text-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Cursos</span>
                  <Switch
                    checked={showSubjects}
                    onCheckedChange={setShowSubjects}
                  />
                  <span className="text-sm text-gray-600">Disciplinas</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden">
              {loading ? <div className="p-8 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#5f2ebe] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <p className="mt-3 text-gray-500">Carregando dados...</p>
                </div> : <div className="divide-y divide-gray-100">
                  {filteredData.length > 0 ? filteredData.map(item => <ResultItem 
                    key={item.id} 
                    id={item.id}
                    title={item.titulo} 
                    description={item.descricao || ""}
                    isFavorite={item.isFavorite}
                    topics={item.topics}
                    lessons={item.lessons}
                    onToggleFavorite={handleToggleFavorite} 
                    friendlyUrl={item.friendlyUrl || generateFriendlyUrl(item.titulo, item.id)} 
                    banca={showSubjects ? (item as DisciplinaItemType).banca : undefined}
                    cargo={!showSubjects ? item.descricao : undefined}
                  />) : <div className="p-8 text-center text-gray-500">
                      Nenhum resultado encontrado para "{searchTerm}"
                    </div>}
                </div>}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </PublicLayout>
  );
};

export default Explore;