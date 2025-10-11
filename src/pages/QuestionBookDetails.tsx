import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Book, ChevronLeft, Pencil, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { QuestionCard } from '@/components/new/QuestionCard';
import type { Question } from '@/components/new/types';
import { PublicLayout } from "@/components/layout/PublicLayout";

interface QuestionBook {
  id: string;
  nome: string;
  created_at: string;
  user_id: string;
  is_public: boolean;
  total_questions: number;
  answered_questions: number;
  correct_answers: number;
  wrong_answers: number;
  questions: Question[];
}

export default function QuestionBookDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<QuestionBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [disabledOptions, setDisabledOptions] = useState<{ [key: string]: string[] }>({});

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      if (!id) return;

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar logado para ver este caderno');
        return;
      }

      // Primeiro, busca os detalhes do caderno
      const { data: bookData, error: bookError } = await supabase
        .from('cadernos_questoes')
        .select('*')
        .eq('id', id)
        .single();

      if (bookError) throw bookError;

      if (bookData.user_id !== user.id && !bookData.is_public) {
        toast.error('Você não tem permissão para ver este caderno');
        navigate('/cadernos');
        return;
      }

      // Depois, busca as questões do caderno usando join
      const { data: questionsData, error: questionsError } = await supabase
        .from('questoes')
        .select(`
          id,
          content,
          options,
          year,
          institution,
          organization,
          role,
          level,
          discipline,
          topicos,
          expandablecontent,
          teacherexplanation,
          aiexplanation
        `)
        .in('id', (await supabase
          .from('questoes_caderno')
          .select('questao_id')
          .eq('caderno_id', id))
          .data?.map(q => q.questao_id) || []);

      if (questionsError) throw questionsError;

      const questions = (questionsData || []).map(q => ({
        id: q.id,
        number: 0,
        content: q.content,
        command: "", // Não temos campo separado para comando
        options: q.options,
        year: q.year,
        institution: q.institution,
        organization: q.organization,
        role: q.role,
        educationLevel: q.level,
        discipline: q.discipline,
        topics: q.topicos,
        expandableContent: q.expandablecontent,
        teacherExplanation: q.teacherexplanation,
        aiExplanation: q.aiexplanation,
        comments: []
      } as Question));

      setBook({
        ...bookData,
        questions
      });
      setNewName(bookData.nome);
    } catch (error) {
      console.error('Erro ao buscar detalhes do caderno:', error);
      toast.error('Erro ao carregar o caderno de questões');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    try {
      if (!id || !newName.trim()) return;

      const { error } = await supabase
        .from('cadernos_questoes')
        .update({ nome: newName.trim() })
        .eq('id', id);

      if (error) throw error;

      setBook(prev => prev ? { ...prev, nome: newName.trim() } : null);
      setEditingName(false);
      toast.success('Nome do caderno atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar nome:', error);
      toast.error('Erro ao atualizar nome do caderno');
    }
  };

  const handleToggleDisabled = (questionId: string, optionId: string) => {
    setDisabledOptions(prev => {
      const questionDisabled = prev[questionId] || [];
      const isDisabled = questionDisabled.includes(optionId);

      return {
        ...prev,
        [questionId]: isDisabled
          ? questionDisabled.filter(id => id !== optionId)
          : [...questionDisabled, optionId]
      };
    });
  };

  const handleAddQuestion = async (questionId: string) => {
    try {
      if (!id) return;

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar logado para adicionar questões');
        return;
      }

      // Verifica se a questão já existe no caderno
      const { data: existingQuestion, error: checkError } = await supabase
        .from('questoes_caderno')
        .select('*')
        .eq('caderno_id', id)
        .eq('questao_id', questionId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      if (existingQuestion) {
        toast.error('Esta questão já está no caderno');
        return;
      }

      // Adiciona a questão ao caderno
      const { error: insertError } = await supabase
        .from('questoes_caderno')
        .insert([
          {
            caderno_id: id,
            questao_id: questionId,
            user_id: user.id
          }
        ]);

      if (insertError) throw insertError;

      // Atualiza o contador de questões do caderno
      const { error: updateError } = await supabase
        .from('cadernos_questoes')
        .update({ 
          total_questions: book ? book.total_questions + 1 : 1 
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Recarrega os detalhes do caderno
      await fetchBookDetails();
      toast.success('Questão adicionada ao caderno!');
    } catch (error) {
      console.error('Erro ao adicionar questão:', error);
      toast.error('Erro ao adicionar questão ao caderno');
    }
  };

  const handleRemoveQuestion = async (questionId: string) => {
    try {
      if (!id) return;

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar logado para remover questões');
        return;
      }

      // Remove a questão do caderno
      const { error: deleteError } = await supabase
        .from('questoes_caderno')
        .delete()
        .eq('caderno_id', id)
        .eq('questao_id', questionId);

      if (deleteError) throw deleteError;

      // Atualiza o contador de questões do caderno
      const { error: updateError } = await supabase
        .from('cadernos_questoes')
        .update({ 
          total_questions: book ? Math.max(0, book.total_questions - 1) : 0 
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Recarrega os detalhes do caderno
      await fetchBookDetails();
      toast.success('Questão removida do caderno!');
    } catch (error) {
      console.error('Erro ao remover questão:', error);
      toast.error('Erro ao remover questão do caderno');
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <div className="container mx-auto px-4 py-8">
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5f2ebe]"></div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </PublicLayout>
    );
  }

  if (!book) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <div className="container mx-auto px-4 py-8">
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <Book className="mx-auto h-12 w-12 text-gray-400" />
                <h1 className="text-2xl font-bold text-gray-900 mt-4">Caderno não encontrado</h1>
                <p className="text-gray-600 mt-2">O caderno que você está tentando acessar não existe ou foi removido.</p>
                <Button 
                  onClick={() => navigate('/cadernos')} 
                  className="mt-6"
                >
                  Voltar para meus cadernos
                </Button>
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
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="outline" 
                onClick={() => navigate('/cadernos')}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Button>
              
              <div className="flex-1">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="text-2xl font-bold"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateName();
                        if (e.key === 'Escape') {
                          setEditingName(false);
                          setNewName(book.nome);
                        }
                      }}
                    />
                    <Button size="icon" onClick={handleUpdateName}>
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => {
                        setEditingName(false);
                        setNewName(book.nome);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900">{book.nome}</h1>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => setEditingName(true)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{book.total_questions} questões</span>
                <span>•</span>
                <span>{book.answered_questions || 0} respondidas</span>
                <span>•</span>
                <span>{book.correct_answers || 0} acertos</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Estatísticas do Caderno</h2>
                  <p className="text-sm text-gray-600">Acompanhe seu progresso de estudos</p>
                </div>
                
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      if (!id) return;
                      
                      toast.info('Atualizando estatísticas do caderno...');
                      
                      const { error } = await supabase.rpc('recalculate_caderno_statistics', {
                        caderno_id: id
                      });
                      
                      if (error) throw error;
                      
                      await fetchBookDetails();
                      toast.success('Estatísticas atualizadas com sucesso!');
                    } catch (error) {
                      console.error('Erro ao atualizar estatísticas:', error);
                      toast.error('Erro ao atualizar as estatísticas');
                    }
                  }}
                >
                  Atualizar Estatísticas
                </Button>
              </div>

              <div className="space-y-6">
                {book.questions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhuma questão adicionada ainda.</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Adicione questões ao seu caderno para começar a estudar.
                    </p>
                  </div>
                ) : (
                  book.questions.map((question) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      disabledOptions={disabledOptions[question.id] || []}
                      onToggleDisabled={(optionId) => handleToggleDisabled(question.id, optionId)}
                      onRemove={handleRemoveQuestion}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </PublicLayout>
  );
}