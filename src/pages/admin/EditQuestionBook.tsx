import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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
  user_email: string;
}

export default function EditQuestionBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [book, setBook] = useState<QuestionBook | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/admin/cadernos');
      return;
    }
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      const { data, error } = await supabase
        .rpc('admin_get_caderno', {
          p_caderno_id: id
        })
        .single();

      if (error) throw error;
      if (!data) throw new Error('Caderno não encontrado');

      setBook(data as QuestionBook);
    } catch (error) {
      console.error('Erro ao buscar caderno:', error);
      toast.error('Erro ao carregar o caderno');
      navigate('/admin/cadernos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book || !id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .rpc('admin_update_caderno', {
          p_caderno_id: id,
          p_nome: book.nome,
          p_is_public: book.is_public
        });

      if (error) throw error;

      toast.success('Caderno atualizado com sucesso!');
      navigate('/admin/cadernos');
    } catch (error) {
      console.error('Erro ao atualizar caderno:', error);
      toast.error('Erro ao atualizar o caderno');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Book className="h-6 w-6 text-purple-500" />
          <h1 className="text-2xl font-semibold text-gray-900">Carregando...</h1>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Book className="h-6 w-6 text-purple-500" />
          <h1 className="text-2xl font-semibold text-gray-900">Caderno não encontrado</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Book className="h-6 w-6 text-purple-500" />
        <h1 className="text-2xl font-semibold text-gray-900">Editar Caderno</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
              Nome do Caderno
            </label>
            <Input
              id="nome"
              value={book.nome}
              onChange={(e) => setBook({ ...book, nome: e.target.value })}
              className="mt-1"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="is_public"
              checked={book.is_public}
              onCheckedChange={(checked) => setBook({ ...book, is_public: checked as boolean })}
            />
            <label htmlFor="is_public" className="text-sm font-medium text-gray-700">
              Caderno Público
            </label>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/cadernos')}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
} 