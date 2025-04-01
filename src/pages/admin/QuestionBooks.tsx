import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Copy, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface User {
  email: string;
}

interface QuestionBookFromDB {
  id: string;
  nome: string;
  created_at: string;
  user_id: string;
  is_public: boolean;
  total_questions: number;
  answered_questions: number;
  correct_answers: number;
  wrong_answers: number;
  users: User;
}

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

export default function AdminQuestionBooks() {
  const [books, setBooks] = useState<QuestionBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
    // Log temporário para mostrar o ID do usuário
    supabase.auth.getUser().then(({ data }) => {
      console.log('ID do usuário atual:', data.user?.id);
    });
  }, []);

  const fetchBooks = async () => {
    try {
      // Buscar todos os cadernos usando uma função RPC administrativa
      const { data: cadernos, error: cadernosError } = await supabase
        .rpc('admin_list_cadernos');

      if (cadernosError) throw cadernosError;

      // Mapear os dados para o formato esperado
      const booksWithUserEmail: QuestionBook[] = (cadernos || []).map(book => ({
        id: book.id,
        nome: book.nome,
        created_at: book.created_at,
        user_id: book.user_id,
        is_public: book.is_public,
        total_questions: book.total_questions || 0,
        answered_questions: book.answered_questions || 0,
        correct_answers: book.correct_answers || 0,
        wrong_answers: book.wrong_answers || 0,
        user_email: book.user_email || 'Usuário não encontrado'
      }));

      setBooks(booksWithUserEmail);
    } catch (error) {
      console.error('Erro ao buscar cadernos:', error);
      toast.error('Erro ao carregar os cadernos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (book: QuestionBook) => {
    if (!confirm('Tem certeza que deseja excluir este caderno?')) return;

    try {
      const { error } = await supabase
        .rpc('admin_delete_caderno', {
          p_caderno_id: book.id
        });

      if (error) throw error;

      // Atualizar a lista de cadernos
      await fetchBooks();
      toast.success('Caderno excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir caderno:', error);
      toast.error('Erro ao excluir o caderno');
    }
  };

  const handleDuplicateBook = async (book: QuestionBook) => {
    try {
      // Obter o usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Usuário não autenticado');

      // Duplicar o caderno usando a função RPC
      const { error: duplicateError } = await supabase
        .rpc('admin_duplicate_caderno', {
          p_caderno_id: book.id,
          p_novo_nome: `${book.nome} (Cópia)`,
          p_novo_user_id: user.id,
          p_is_public: book.is_public
        });

      if (duplicateError) throw duplicateError;

      // Atualizar a lista de cadernos
      await fetchBooks();
      toast.success('Caderno duplicado com sucesso!');
    } catch (error) {
      console.error('Erro ao duplicar caderno:', error);
      toast.error('Erro ao duplicar o caderno');
    }
  };

  const filteredBooks = books.filter(book =>
    book.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBooks = filteredBooks.slice(startIndex, endIndex);

  const PaginationControls = ({ 
    currentPage, 
    totalPages, 
    onPageChange 
  }: { 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void;
  }) => (
    <div className="flex items-center justify-end gap-2 py-4 px-6 border-t">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm text-gray-600">
        Página {currentPage} de {totalPages || 1}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Book className="h-6 w-6 text-purple-500" />
          <h1 className="text-2xl font-semibold text-gray-900">Gerenciar Cadernos de Questões</h1>
        </div>
        <div className="w-1/3">
          <Input
            placeholder="Pesquisar por nome do caderno ou email do usuário..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Data da Criação</TableHead>
              <TableHead>Questões</TableHead>
              <TableHead>Respondidas</TableHead>
              <TableHead>Acertos</TableHead>
              <TableHead>Erros</TableHead>
              <TableHead>Aproveitamento</TableHead>
              <TableHead>Público</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-4">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : currentBooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-4">
                  Nenhum caderno encontrado
                </TableCell>
              </TableRow>
            ) : (
              currentBooks.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>
                    <button
                      onClick={() => navigate(`/cadernos/${book.id}`)}
                      className="font-medium text-purple-600 hover:text-purple-800 transition-colors"
                    >
                      {book.nome}
                    </button>
                  </TableCell>
                  <TableCell>{book.user_email}</TableCell>
                  <TableCell>
                    {new Date(book.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>{book.total_questions}</TableCell>
                  <TableCell>{book.answered_questions}</TableCell>
                  <TableCell>{book.correct_answers}</TableCell>
                  <TableCell>{book.wrong_answers}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      book.answered_questions === 0
                        ? 'bg-gray-100 text-gray-800'
                        : book.correct_answers / book.answered_questions >= 0.7
                        ? 'bg-green-100 text-green-800'
                        : book.correct_answers / book.answered_questions >= 0.5
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {book.answered_questions === 0 ? '0.0%' : ((book.correct_answers / book.answered_questions) * 100).toFixed(1) + '%'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      book.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {book.is_public ? 'Sim' : 'Não'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/admin/cadernos/${book.id}/editar`)}
                        className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicateBook(book)}
                        className="text-green-500 hover:text-green-600 hover:bg-green-50"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteBook(book)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {filteredBooks.length > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
} 