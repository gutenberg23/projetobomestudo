import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Header } from "../layout/Header";
import { Footer } from "../layout/Footer";
import { CourseHeader } from "./CourseHeader";
import { CourseNavigation, type CourseTab } from "./CourseNavigation";
import { DisciplinasTrilha } from "./disciplinas/DisciplinasTrilha";
import { EditorializedView } from "./EditorializedView";
import { supabase } from "@/integrations/supabase/client";
import { extractIdFromFriendlyUrl } from "@/utils/slug-utils";
import { useUserProgress } from "./hooks/useUserProgress";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { CicloTab } from "./ciclo/CicloTab";
import { LeiSecaTab } from "./leiseca/LeiSecaTab";
import { SimuladosTab } from "./simulados/SimuladosTab";
import CourseAdBanner from "./CourseAdBanner";
import { FlashcardsTab, type FocoFlashcards } from "./flashcards/FlashcardsTab";
import { useFlashcardsCurso } from "./flashcards/useFlashcardsCurso";
import { EstatisticasTab } from "./estatisticas/EstatisticasTab";
import { useConteudoAbasCurso } from "./hooks/useConteudoAbasCurso";

/** Abas que só existem para cursos (uma disciplina avulsa não tem edital, simulados, ciclo nem lei seca). */
const ABAS_SO_DE_CURSO: CourseTab[] = ['edital', 'simulados', 'ciclo', 'leiseca'];

export const CourseLayout = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<CourseTab>('disciplinas');
  const [subjectsData, setSubjectsData] = useState<any[]>([]);
  const [focoFlashcards, setFocoFlashcards] = useState<FocoFlashcards | null>(null);
  // O link /course/... pode ser de um curso ou de uma disciplina avulsa (null enquanto carrega)
  const [tipo, setTipo] = useState<'curso' | 'disciplina' | null>(null);
  const ehDisciplina = tipo === 'disciplina';

  // Edital, Simulados e Lei Seca só aparecem quando o curso tem conteúdo para elas
  const conteudo = useConteudoAbasCurso(courseId, tipo === 'curso');
  const temEdital = tipo === 'curso' && conteudo.edital;
  const temSimulados = tipo === 'curso' && conteudo.simulados;
  const temLeiSeca = tipo === 'curso' && conteudo.leiseca;
  const carregandoAbas = tipo === null || (tipo === 'curso' && conteudo.carregando);


  // Flashcards do curso: a aba só aparece quando há cartões nos tópicos
  const flashcards = useFlashcardsCurso(courseId);

  useEffect(() => {
    if (activeTab === 'flashcards' && !flashcards.carregando && !flashcards.temFlashcards) {
      setActiveTab('disciplinas');
    }
  }, [activeTab, flashcards.carregando, flashcards.temFlashcards]);

  // Clique nas abas: abre a aba Flashcards na lista, sem o último tópico pedido
  const trocarAba = useCallback((tab: CourseTab) => {
    setFocoFlashcards(null);
    setActiveTab(tab);
  }, []);

  // Botão "Flashcards" abaixo do vídeo, na aba Disciplinas
  const abrirFlashcards = useCallback((topicoId: string, aulaId?: string) => {
    setFocoFlashcards({ topicoId, aulaId, chave: Date.now() });
    setActiveTab('flashcards');
    setTimeout(() => document.getElementById('abas-curso')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }, []);
  
  // Usar o hook de configurações do site
  const { config, isLoading: isLoadingConfig } = useSiteConfig();
  
  // Usar o hook de progresso com o ID do usuário atual
  useUserProgress(user?.id, courseId);

  // Disciplina avulsa: só as abas Disciplina, Estatísticas e Flashcards
  useEffect(() => {
    if (isLoadingConfig) return;
    if (ehDisciplina && ABAS_SO_DE_CURSO.includes(activeTab)) {
      setActiveTab(config.tabs.showDisciplinasTab ? 'disciplinas' : 'estatisticas');
    }
    if (tipo === 'curso' && activeTab === 'estatisticas') setActiveTab('disciplinas');
    // Aba sem conteúdo neste curso: volta para Disciplinas
    if (tipo === 'curso' && !conteudo.carregando) {
      if (
        (activeTab === 'edital' && !conteudo.edital) ||
        (activeTab === 'simulados' && !conteudo.simulados) ||
        (activeTab === 'leiseca' && !conteudo.leiseca)
      ) {
        setActiveTab('disciplinas');
      }
    }
  }, [ehDisciplina, tipo, activeTab, isLoadingConfig, config.tabs.showDisciplinasTab, conteudo]);

  // Efeito para ajustar a aba ativa quando as configurações são carregadas
  useEffect(() => {
    if (isLoadingConfig) return;
    
    const { showDisciplinasTab, showCicloTab } = config.tabs;
    // Edital e Simulados sem conteúdo no curso contam como escondidas
    const showEditalTab = config.tabs.showEditalTab && temEdital;
    const showSimuladosTab = config.tabs.showSimuladosTab && temSimulados;
    
    // Se a aba atual está invisível, mudar para a primeira aba visível
    if (
      (activeTab === 'disciplinas' && !showDisciplinasTab) ||
      (activeTab === 'edital' && !showEditalTab) ||
      (activeTab === 'simulados' && !showSimuladosTab) ||
      (activeTab === 'ciclo' && !showCicloTab)
    ) {
      if (showDisciplinasTab) {
        setActiveTab('disciplinas');
      } else if (showEditalTab) {
        setActiveTab('edital');
      } else if (showSimuladosTab) {
        setActiveTab('simulados');
      } else if (showCicloTab) {
        setActiveTab('ciclo');
      }
    }
  }, [config.tabs, activeTab, isLoadingConfig, temEdital, temSimulados]);

  // Carregar dados das disciplinas quando o componente montar
  useEffect(() => {
    const fetchSubjectsData = async () => {
      if (!courseId) return;
      setTipo(null);
      
      try {
        const realCourseId = extractIdFromFriendlyUrl(courseId);
        
        // Verificar primeiro se é um curso ou uma disciplina
        // Verificar se é um curso
        const { data: cursoData, error: cursoError } = await supabase
          .from('cursos')
          .select('disciplinas_ids')
          .eq('id', realCourseId)
          .single();
          
        if (cursoError || !cursoData) {
          
          // Se não for um curso, verificar se é uma disciplina
          const { data: disciplinaData, error: disciplinaError } = await supabase
            .from('disciplinas')
            .select('*')
            .eq('id', realCourseId)
            .single();
            
          if (disciplinaError || !disciplinaData) {
            console.error('Erro ao buscar curso/disciplina:', cursoError, disciplinaError);
            setTipo('curso');
            return;
          }
          setTipo('disciplina');
          
          // É uma disciplina avulsa - não precisamos fazer nada porque o SubjectsList já irá carregá-la
          setSubjectsData([disciplinaData]);
          return;
        }
        
        // É um curso, buscar suas disciplinas
        setTipo('curso');
        if (cursoData.disciplinas_ids && cursoData.disciplinas_ids.length > 0) {
          const { data: disciplinasData, error: disciplinasError } = await supabase
            .from('disciplinas')
            .select('*')
            .in('id', cursoData.disciplinas_ids);
            
          if (disciplinasError || !disciplinasData) {
            console.error('Erro ao buscar disciplinas:', disciplinasError);
            return;
          }
          
          setSubjectsData(disciplinasData);
        } else {
          setSubjectsData([]);
        }
      } catch (error) {
        console.error('Erro ao buscar dados das disciplinas:', error);
        setTipo('curso');
      }
    };
    
    fetchSubjectsData();
  }, [courseId]);

  // Função para receber o número de disciplinas e os dados das disciplinas do componente SubjectsList
  const handleSubjectsCountChange = useCallback((_count: number, data?: any[]) => {
    if (data) {
      setSubjectsData(data);
    }
  }, []);

  if (!courseId) {
    return <div>Curso não encontrado</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[rgb(242,244,246)]">
      <Header />
      <main className="flex-1 w-full">
        <CourseHeader courseId={courseId || ''} />
        <div id="abas-curso" className="scroll-mt-2">
          <CourseNavigation
            activeTab={activeTab}
            setActiveTab={trocarAba}
            mostrarFlashcards={flashcards.temFlashcards}
            totalFlashcards={flashcards.total}
            ehDisciplina={ehDisciplina}
            carregandoTipo={carregandoAbas}
            temEdital={temEdital}
            temSimulados={temSimulados}
            temLeiSeca={temLeiSeca}
          />
        </div>
        <CourseAdBanner />
        
        {activeTab === 'disciplinas' && config.tabs.showDisciplinasTab && (
          <div className="bg-[rgb(242,244,246)] w-full flex justify-center relative">
            <div className="max-w-[1400px] w-full flex gap-5 py-0 flex-col xl:flex-row px-[10px] md:px-[32px]">
              <div className="flex-1">
                <DisciplinasTrilha
                  courseId={courseId}
                  onSubjectsCountChange={handleSubjectsCountChange}
                  flashcardsPorTopico={flashcards.contagemPorTopico}
                  onFlashcards={abrirFlashcards}
                />
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'estatisticas' && ehDisciplina && (
          <div className="bg-[rgb(242,244,246)] w-full flex justify-center">
            <div className="max-w-[1400px] w-full py-5 px-[10px] md:px-[32px]">
              <EstatisticasTab courseId={courseId} />
            </div>
          </div>
        )}

        {activeTab === 'edital' && config.tabs.showEditalTab && temEdital && (
          <div className="bg-[rgb(242,244,246)] w-full flex justify-center">
            <div className="max-w-[1400px] w-full py-5 px-[10px] md:px-[32px]">
              <EditorializedView courseId={courseId || ''} activeTab={activeTab} />
            </div>
          </div>
        )}
        
        {activeTab === 'simulados' && config.tabs.showSimuladosTab && temSimulados && (
          <div className="bg-[rgb(242,244,246)] w-full flex justify-center">
            <div className="max-w-[1400px] w-full py-5 px-[10px] md:px-[32px]">
              <SimuladosTab courseId={courseId} />
            </div>
          </div>
        )}
        
        {activeTab === 'ciclo' && config.tabs.showCicloTab && !ehDisciplina && (
          <div className="bg-[rgb(242,244,246)] w-full flex justify-center">
            <div className="max-w-[1400px] w-full py-5 px-[10px] md:px-[32px]">
              <CicloTab courseId={courseId} subjects={subjectsData} />
            </div>
          </div>
        )}

        {activeTab === 'flashcards' && (
          <div className="bg-[rgb(242,244,246)] w-full flex justify-center">
            <div className="max-w-[1400px] w-full py-5 px-[10px] md:px-[32px]">
              <FlashcardsTab flash={flashcards} foco={focoFlashcards} />
            </div>
          </div>
        )}

        {activeTab === 'leiseca' && temLeiSeca && (
          <div className="bg-[rgb(242,244,246)] w-full flex justify-center">
            <div className="max-w-[1400px] w-full py-5 px-[10px] md:px-[32px]">
              <LeiSecaTab courseId={courseId} />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};