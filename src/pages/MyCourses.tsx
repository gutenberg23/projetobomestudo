import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CourseItemType, DisciplinaItemType } from "@/components/admin/questions/types";

interface ItemProps {
  id: string;
  title: string;
  onRemove: (id: string) => void;
  banca?: string;
  cargo?: string;
}

const FavoriteItem: React.FC<ItemProps> = ({
  id,
  title,
  onRemove,
  banca,
  cargo
}) => {
  const displayTitle = cargo ? `${title} - ${cargo}` : (banca ? `${title} - ${banca}` : title);
  
  return <div className="flex justify-between items-center p-4 border-b border-gray-100">
      <div className="flex-1">
        <Link to={`/course/${id}`} className="hover:text-[#5f2ebe] transition-colors">
          <h3 className="text-[#272f3c] mb-0 leading-none font-light text-sm">{displayTitle}</h3>
        </Link>
      </div>
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => onRemove(id)} aria-label="Remover dos favoritos">
          <Star className="h-5 w-5 fill-[#5f2ebe] text-[#5f2ebe]" />
        </Button>
      </div>
    </div>;
};

const MyCourses = () => {
  const [favoriteCourses, setFavoriteCourses] = useState<CourseItemType[]>([]);
  const [favoriteSubjects, setFavoriteSubjects] = useState<DisciplinaItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const countTopics = async (course: any): Promise<number> => {
    if (!course.topicos_ids || course.topicos_ids.length === 0) {
      return 0;
    }
    return course.topicos_ids.length;
  };

  const countDisciplineTopics = async (disciplina: any): Promise<number> => {
    let topicsCount = 0;
    
    if (disciplina.aulas_ids && disciplina.aulas_ids.length > 0) {
      const { data: aulasData } = await supabase
        .from('aulas')
        .select('topicos_ids')
        .in('id', disciplina.aulas_ids);
      
      if (aulasData) {
        for (const aula of aulasData) {
          if (aula.topicos_ids) {
            topicsCount += aula.topicos_ids.length;
          }
        }
      }
    }
    
    return topicsCount;
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const {
          data: {
            user
          }
        } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Você precisa estar logado para ver seus favoritos");
          navigate('/login');
          return;
        }

        const {
          data: profile
        } = await supabase.from('profiles').select('cursos_favoritos, disciplinas_favoritos').eq('id', user.id).single();
        console.log("Perfil do usuário:", profile);
        if (!profile) {
          setLoading(false);
          return;
        }
        const cursosFavoritos = profile.cursos_favoritos || [];
        const disciplinasFavoritos = profile.disciplinas_favoritos || [];
        console.log("Cursos favoritos brutos:", cursosFavoritos);
        console.log("Disciplinas favoritas brutas:", disciplinasFavoritos);

        if (cursosFavoritos.length > 0) {
          const {
            data: cursosData
          } = await supabase.from('cursos').select('*').in('id', cursosFavoritos);
          console.log("Dados de cursos obtidos:", cursosData);
          if (cursosData) {
            const formattedCourses: CourseItemType[] = await Promise.all(
              cursosData.map(async (course) => {
                const topicsCount = await countTopics(course);
                
                return {
                  id: course.id,
                  titulo: course.titulo,
                  descricao: course.descricao || 'Sem descrição',
                  isFavorite: true,
                  topics: topicsCount,
                  lessons: course.aulas_ids?.length || 0,
                  informacoes_curso: course.informacoes_curso,
                  cargo: course.descricao
                };
              })
            );
            
            setFavoriteCourses(formattedCourses);
            console.log("Cursos formatados:", formattedCourses);
          }
        } else {
          setFavoriteCourses([]);
          console.log("Nenhum curso favorito encontrado");
        }

        if (disciplinasFavoritos.length > 0) {
          const {
            data: disciplinasData
          } = await supabase.from('disciplinas').select('*').in('id', disciplinasFavoritos);
          console.log("Dados de disciplinas obtidos:", disciplinasData);
          
          if (disciplinasData) {
            const formattedDisciplinas: DisciplinaItemType[] = await Promise.all(
              disciplinasData.map(async (disciplina) => {
                const topicsCount = await countDisciplineTopics(disciplina);
                
                return {
                  id: disciplina.id,
                  titulo: disciplina.titulo,
                  descricao: disciplina.descricao || 'Sem descrição',
                  isFavorite: true,
                  topics: topicsCount,
                  lessons: disciplina.aulas_ids?.length || 0,
                  banca: disciplina.banca
                };
              })
            );
            
            setFavoriteSubjects(formattedDisciplinas);
            console.log("Disciplinas formatadas:", formattedDisciplinas);
          }
        } else {
          setFavoriteSubjects([]);
          console.log("Nenhuma disciplina favorita encontrada");
        }
      } catch (error) {
        console.error("Erro ao buscar favoritos:", error);
        toast.error("Erro ao carregar favoritos. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };
    console.log("Buscando favoritos...");
    fetchFavorites();
  }, [navigate, location]);

  const handleRemoveCourse = async (id: string) => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado para remover favoritos");
        navigate('/login');
        return;
      }

      const {
        data: profile
      } = await supabase.from('profiles').select('cursos_favoritos').eq('id', user.id).single();
      if (!profile) return;

      const cursosFavoritos = profile.cursos_favoritos || [];
      const updatedFavorites = cursosFavoritos.filter((favId: string) => favId !== id);

      await supabase.from('profiles').update({
        cursos_favoritos: updatedFavorites
      }).eq('id', user.id);

      setFavoriteCourses(favoriteCourses.filter(course => course.id !== id));
      toast.success("Curso removido dos favoritos");
    } catch (error) {
      console.error("Erro ao remover favorito:", error);
      toast.error("Erro ao remover favorito. Por favor, tente novamente.");
    }
  };

  const handleRemoveSubject = async (id: string) => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado para remover favoritos");
        navigate('/login');
        return;
      }

      const {
        data: profile
      } = await supabase.from('profiles').select('disciplinas_favoritos').eq('id', user.id).single();
      if (!profile) return;

      const disciplinasFavoritos = profile.disciplinas_favoritos || [];
      const updatedFavorites = disciplinasFavoritos.filter((favId: string) => favId !== id);

      await supabase.from('profiles').update({
        disciplinas_favoritos: updatedFavorites
      }).eq('id', user.id);

      setFavoriteSubjects(favoriteSubjects.filter(subject => subject.id !== id));
      toast.success("Disciplina removida dos favoritos");
    } catch (error) {
      console.error("Erro ao remover favorito:", error);
      toast.error("Erro ao remover favorito. Por favor, tente novamente.");
    }
  };

  return <div className="min-h-screen bg-[#f6f8fa] flex flex-col">
      <Header />
      <main className="flex-grow px-4 md:px-8 w-full pt-8">
        <h1 className="text-3xl mb-2 text-[#272f3c] font-extrabold md:text-3xl">Minhas Matrículas</h1>
        <p className="text-[#67748a] mb-6">Aqui você encontra as suas disciplinas e seus concursos favoritos.</p>

        {loading ? <div className="flex items-center justify-center my-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#5f2ebe] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="ml-3 text-gray-500">Carregando favoritos...</p>
          </div> : <div className="space-y-8">
            <section>
              <h2 className="text-2xl mb-4 text-[#272f3c] font-bold">Concursos</h2>
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {favoriteCourses.length > 0 ? favoriteCourses.map(course => <FavoriteItem 
                    key={course.id} 
                    id={course.id} 
                    title={course.titulo} 
                    onRemove={handleRemoveCourse}
                    cargo={course.descricao}
                  />) : <div className="p-8 text-center text-gray-500">
                      Você ainda não adicionou nenhum curso aos favoritos.
                    </div>}
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl mb-4 text-[#272f3c] font-bold">Disciplinas</h2>
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {favoriteSubjects.length > 0 ? favoriteSubjects.map(subject => <FavoriteItem 
                    key={subject.id} 
                    id={subject.id} 
                    title={subject.titulo} 
                    onRemove={handleRemoveSubject}
                    banca={subject.banca} 
                  />) : <div className="p-8 text-center text-gray-500">
                      Você ainda não adicionou nenhuma disciplina aos favoritos.
                    </div>}
                </div>
              </div>
            </section>
          </div>}
      </main>
      <Footer />
    </div>;
};

export default MyCourses;
