import React, { useState, useEffect } from "react";
import { Star, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { extractIdFromFriendlyUrl } from "@/utils/slug-utils";
import { Spinner } from "@/components/ui/spinner";

interface CourseHeaderProps {
  courseId: string;
  progress?: number;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({ courseId, progress = 0 }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseInfo, setCourseInfo] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCurso, setIsCurso] = useState(true);
  const [realId, setRealId] = useState("");
  const [cargo, setCargo] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      
      setLoading(true);
      console.log("Buscando dados do curso/disciplina:", courseId);

      try {
        // Extrair o ID real da URL amigável
        const extractedId = extractIdFromFriendlyUrl(courseId);
        setRealId(extractedId);
        console.log("ID real extraído:", extractedId);
        
        // Verificar primeiro se é um curso ou uma disciplina
        // Tenta buscar como curso
        let { data: cursoData, error: cursoError } = await supabase
          .from('cursos')
          .select('*')
          .eq('id', extractedId)
          .maybeSingle();

        console.log("Dados do curso:", cursoData, "Erro:", cursoError);

        if (cursoError || !cursoData) {
          // Se não encontrar como curso, tenta como disciplina
          const { data: disciplinaData, error: disciplinaError } = await supabase
            .from('disciplinas')
            .select('*')
            .eq('id', extractedId)
            .maybeSingle();

          console.log("Dados da disciplina:", disciplinaData, "Erro:", disciplinaError);

          if (disciplinaError || !disciplinaData) {
            // Tenta buscar pelo ID original sem modificação
            const { data: cursoDataOriginal } = await supabase
              .from('cursos')
              .select('*')
              .eq('id', courseId)
              .maybeSingle();
              
            if (cursoDataOriginal) {
              setIsCurso(true);
              setCourseTitle(cursoDataOriginal.titulo);
              setCargo(cursoDataOriginal.descricao || "");
              setCourseInfo(cursoDataOriginal.informacoes_curso || "Este curso contém múltiplos módulos e aulas. Certificado disponível após conclusão de 80% do conteúdo.");
              setRealId(courseId);
            } else {
              // Se ainda não encontrar, redireciona para 404
              toast.error("Conteúdo não encontrado");
              navigate('/not-found');
              return;
            }
          } else {
            setIsCurso(false);
            setCourseTitle(disciplinaData.titulo);
            setCargo(disciplinaData.descricao || "");
            setCourseInfo("");
          }
        } else {
          setIsCurso(true);
          setCourseTitle(cursoData.titulo);
          setCargo(cursoData.descricao || "");
          setCourseInfo(cursoData.informacoes_curso || "Este curso contém múltiplos módulos e aulas. Certificado disponível após conclusão de 80% do conteúdo.");
        }

        // Verificar se é favorito
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('cursos_favoritos, disciplinas_favoritos')
            .eq('id', user.id)
            .single();

          if (profile) {
            const cursosFavoritos = profile.cursos_favoritos || [];
            const disciplinasFavoritos = profile.disciplinas_favoritos || [];
            
            // Verificar em ambos os arrays
            const isFavoriteCurso = cursosFavoritos.some(id => id === extractedId || id === courseId);
            const isFavoriteDisciplina = disciplinasFavoritos.some(id => id === extractedId || id === courseId);
            
            setIsFavorite(isFavoriteCurso || isFavoriteDisciplina);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados do curso:", error);
        toast.error("Erro ao carregar dados do curso");
        setCourseTitle("Conteúdo não encontrado");
        setRealId("");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, navigate]);

  const toggleFavorite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Faça login para adicionar aos favoritos");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Erro ao buscar perfil:", profileError);
        toast.error("Erro ao buscar perfil do usuário");
        return;
      }

      if (!profile) {
        toast.error("Perfil não encontrado");
        return;
      }

      // Inicializar os arrays se não existirem
      const field = isCurso ? 'cursos_favoritos' : 'disciplinas_favoritos';
      if (!profile[field]) {
        profile[field] = [];
      }
      
      const currentFavorites = profile[field] || [];
      const newFavorites = isFavorite
        ? currentFavorites.filter(id => id !== realId)
        : [...currentFavorites, realId];

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [field]: newFavorites })
        .eq('id', user.id);

      if (updateError) {
        console.error("Erro ao atualizar favoritos:", updateError);
        throw updateError;
      }

      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos");
    } catch (error) {
      console.error("Erro ao atualizar favoritos:", error);
      toast.error("Erro ao atualizar favoritos");
    }
  };

  return (
    <div className="w-full border-b border-[rgba(239,239,239,1)] bg-white">
      <div className="mx-auto flex min-w-60 w-full items-start justify-between flex-wrap py-[50px] px-[10px] md:px-[32px] bg-transparent">
        <div className="flex min-w-60 flex-col justify-center py-2.5 w-full md:w-auto md:flex-1">
          <div className="flex w-full max-w-[859px] gap-2.5 text-[35px] md:text-[35px] text-[24px] text-[rgba(38,47,60,1)] font-bold leading-[31px] items-center">
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" className="fill-[#5f2ebe]" />
                <span>Carregando...</span>
              </div>
            ) : (
              <h1 className="inline-block w-auto">{courseTitle}</h1>
            )}
            <button onClick={toggleFavorite} className="flex items-center justify-center shrink-0">
              <Star className={`w-[30px] h-[30px] cursor-pointer ${isFavorite ? "fill-[#5f2ebe] text-[#5f2ebe]" : "text-gray-400"}`} />
            </button>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            {isCurso && cargo && (
              <span className="bg-[#ede7f9] text-sm px-3 py-1 rounded-full inline-block text-[#5f2ebe]">
                {cargo}
              </span>
            )}
            {isCurso && courseInfo && (
              <TooltipProvider>
                <Tooltip open={showTooltip}>
                  <TooltipTrigger onClick={() => setShowTooltip(!showTooltip)} className="md:hover:cursor-help">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#ede7f9] cursor-pointer">
                      <Info className="w-3.5 h-3.5 text-[#5f2ebe]" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-white p-3 border border-[#5f2ebe]/20 shadow-lg rounded-md">
                    <p className="text-sm text-[#67748a]">{courseInfo}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        <div className="flex flex-col text-[17px] justify-center w-full md:w-[278px] py-[13px] mt-4 md:mt-0">
          {progress === 100 && (
            <button className="flex items-center gap-2.5 justify-center px-5 py-4 rounded-[10px] text-white font-thin bg-gradient-to-r from-[#5f2ebe] to-[#7344d4] hover:shadow-lg hover:shadow-[#5f2ebe]/30 hover:-translate-y-1 transition-all border-b-4 border-[#491aa4]">
              <img src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/87eae3edb19d6590e38c55cc28e85559b7a359d44c6a2ea44df65f4dd696565f" alt="Certificate Icon" className="w-6" />
              Imprimir Certificado
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
