
import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CourseItemType, DisciplinaItemType } from "@/components/admin/questions/types";

interface ItemProps {
  id: string;
  title: string;
  description: string;
  topics: number;
  lessons: number;
  onRemove: (id: string) => void;
}

const FavoriteItem: React.FC<ItemProps> = ({
  id,
  title,
  description,
  topics,
  lessons,
  onRemove
}) => {
  return <div className="flex justify-between items-center p-4 border-b border-gray-100">
      <div className="flex-1">
        <Link to={`/course/${id}`} className="hover:text-[#5f2ebe] transition-colors">
          <h3 className="text-[#272f3c] mb-0 leading-none font-light text-lg">{title}</h3>
        </Link>
      </div>
      <div className="flex items-center">
        <div className="text-right mr-4">
          <p className="text-sm font-bold text-[#262f3c]">Tópicos: <span className="text-gray-600 font-normal">{topics}</span></p>
          <p className="text-sm font-bold text-[#262f3c]">Aulas: <span className="text-gray-600 font-normal">{lessons}</span></p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onRemove(id)} aria-label="Remover dos favoritos">
          <Star className="h-5 w-5 fill-[#ea2be2] text-[#ea2be2]" />
        </Button>
      </div>
    </div>;
};

const MyCourses = () => {
  const [favoriteCourses, setFavoriteCourses] = useState<CourseItemType[]>([]);
  const [favoriteSubjects, setFavoriteSubjects] = useState<DisciplinaItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Buscar favoritos do usuário
  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      
      try {
        // Verificar se o usuário está logado
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error("Você precisa estar logado para ver seus favoritos");
          navigate('/login');
          return;
        }

        // Buscar perfil do usuário com os favoritos
        const { data: profile } = await supabase
          .from('profiles')
          .select('cursos_favoritos, disciplinas_favoritos')
          .eq('id', user.id)
          .single();

        if (!profile) {
          setLoading(false);
          return;
        }

        const cursosFavoritos = profile.cursos_favoritos || [];
        const disciplinasFavoritos = profile.disciplinas_favoritos || [];

        // Se tiver cursos favoritos, buscar detalhes
        if (cursosFavoritos.length > 0) {
          const { data: cursosData } = await supabase
            .from('cursos')
            .select('*')
            .in('id', cursosFavoritos);

          if (cursosData) {
            const formattedCourses: CourseItemType[] = cursosData.map(course => ({
              id: course.id,
              titulo: course.titulo,
              descricao: course.descricao || 'Sem descrição',
              isFavorite: true,
              topics: (course.topicos_ids?.length || 0),
              lessons: (course.aulas_ids?.length || 0),
              informacoes_curso: course.informacoes_curso
            }));
            setFavoriteCourses(formattedCourses);
          }
        }

        // Se tiver disciplinas favoritas, buscar detalhes
        if (disciplinasFavoritos.length > 0) {
          const { data: disciplinasData } = await supabase
            .from('disciplinas')
            .select('*')
            .in('id', disciplinasFavoritos);

          if (disciplinasData) {
            const formattedDisciplinas: DisciplinaItemType[] = disciplinasData.map(disciplina => ({
              id: disciplina.id,
              titulo: disciplina.titulo,
              descricao: disciplina.descricao || 'Sem descrição',
              isFavorite: true,
              topics: 0, // Valor padrão
              lessons: (disciplina.aulas_ids?.length || 0)
            }));
            setFavoriteSubjects(formattedDisciplinas);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar favoritos:", error);
        toast.error("Erro ao carregar favoritos. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [navigate]);

  const handleRemoveCourse = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Você precisa estar logado para remover favoritos");
        navigate('/login');
        return;
      }

      // Buscar favoritos atuais
      const { data: profile } = await supabase
        .from('profiles')
        .select('cursos_favoritos')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      // Remover o curso dos favoritos
      const cursosFavoritos = profile.cursos_favoritos || [];
      const updatedFavorites = cursosFavoritos.filter(favId => favId !== id);

      // Atualizar no banco de dados
      await supabase
        .from('profiles')
        .update({ cursos_favoritos: updatedFavorites })
        .eq('id', user.id);

      // Atualizar estado local
      setFavoriteCourses(favoriteCourses.filter(course => course.id !== id));
      toast.success("Curso removido dos favoritos");

    } catch (error) {
      console.error("Erro ao remover favorito:", error);
      toast.error("Erro ao remover favorito. Por favor, tente novamente.");
    }
  };

  const handleRemoveSubject = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Você precisa estar logado para remover favoritos");
        navigate('/login');
        return;
      }

      // Buscar favoritos atuais
      const { data: profile } = await supabase
        .from('profiles')
        .select('disciplinas_favoritos')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      // Remover a disciplina dos favoritos
      const disciplinasFavoritos = profile.disciplinas_favoritos || [];
      const updatedFavorites = disciplinasFavoritos.filter(favId => favId !== id);

      // Atualizar no banco de dados
      await supabase
        .from('profiles')
        .update({ disciplinas_favoritos: updatedFavorites })
        .eq('id', user.id);

      // Atualizar estado local
      setFavoriteSubjects(favoriteSubjects.filter(subject => subject.id !== id));
      toast.success("Disciplina removida dos favoritos");

    } catch (error) {
      console.error("Erro ao remover favorito:", error);
      toast.error("Erro ao remover favorito. Por favor, tente novamente.");
    }
  };

  return <div className="flex flex-col min-h-screen bg-[#f6f8fa]">
      <Header />
      <main className="flex-grow pt-[120px] px-4 md:px-8 w-full">
        <h1 className="text-3xl mb-2 text-[#272f3c] font-extrabold md:text-3xl">Minhas Matrículas</h1>
        <p className="text-[#67748a] mb-6">Aqui você encontra as suas disciplinas e seus concursos favoritos.</p>

        {loading ? (
          <div className="flex items-center justify-center my-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#5f2ebe] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="ml-3 text-gray-500">Carregando favoritos...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl mb-4 text-[#272f3c] font-bold">Concursos</h2>
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {favoriteCourses.length > 0 ? favoriteCourses.map(course => (
                    <FavoriteItem 
                      key={course.id} 
                      id={course.id} 
                      title={course.titulo} 
                      description={course.descricao || ""} 
                      topics={course.topics} 
                      lessons={course.lessons} 
                      onRemove={handleRemoveCourse} 
                    />
                  )) : (
                    <div className="p-8 text-center text-gray-500">
                      Você ainda não adicionou nenhum curso aos favoritos.
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl mb-4 text-[#272f3c] font-bold">Disciplinas</h2>
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {favoriteSubjects.length > 0 ? favoriteSubjects.map(subject => (
                    <FavoriteItem 
                      key={subject.id} 
                      id={subject.id} 
                      title={subject.titulo} 
                      description={subject.descricao || ""} 
                      topics={subject.topics} 
                      lessons={subject.lessons} 
                      onRemove={handleRemoveSubject} 
                    />
                  )) : (
                    <div className="p-8 text-center text-gray-500">
                      Você ainda não adicionou nenhuma disciplina aos favoritos.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
      <Footer />
    </div>;
};

export default MyCourses;
