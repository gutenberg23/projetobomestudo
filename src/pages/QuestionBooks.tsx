import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
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
}

export default function QuestionBooks() {
  const [books, setBooks] = useState<QuestionBook[]>([]);
  const [publicBooks, setPublicBooks] = useState<QuestionBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<QuestionBook | null>(null);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookType, setNewBookType] = useState<'public' | 'private'>('private');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [publicCurrentPage, setPublicCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
    fetchPublicBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar logado para ver seus cadernos');
        return;
      }

      const { data, error } = await supabase
        .from('cadernos_questoes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBooks(data || []);
    } catch (error) {
      console.error('Erro ao buscar cadernos:', error);
      toast.error('Erro ao carregar os cadernos');
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('cadernos_questoes')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPublicBooks(data || []);
    } catch (error) {
      console.error('Erro ao buscar cadernos públicos:', error);
      toast.error('Erro ao carregar os cadernos públicos');
    }
  };

  const filteredPublicBooks = publicBooks.filter(book => 
    book.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Cálculos para paginação dos meus cadernos
  const totalPages = Math.ceil(books.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBooks = books.slice(startIndex, endIndex);

  // Cálculos para paginação dos cadernos públicos
  const totalPublicPages = Math.ceil(filteredPublicBooks.length / itemsPerPage);
  const publicStartIndex = (publicCurrentPage - 1) * itemsPerPage;
  const publicEndIndex = publicStartIndex + itemsPerPage;
  const currentPublicBooks = filteredPublicBooks.slice(publicStartIndex, publicEndIndex);

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

  const handleCreateBook = async () => {
    try {
      if (!newBookTitle.trim()) {
        toast.error('O título é obrigatório');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar logado para criar um caderno');
        return;
      }

      const { data, error } = await supabase
        .from('cadernos_questoes')
        .insert([
          {
            nome: newBookTitle.trim(),
            user_id: user.id,
            is_public: newBookType === 'public'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setBooks(prev => [data, ...prev]);
      setOpen(false);
      setNewBookTitle('');
      setNewBookType('private');
      toast.success('Caderno criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar caderno:', error);
      toast.error('Erro ao criar o caderno');
    }
  };

  const handleEditBook = async () => {
    try {
      if (!editingBook || !newBookTitle.trim()) {
        toast.error('O título é obrigatório');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar logado para editar o caderno');
        return;
      }

      const { error } = await supabase
        .from('cadernos_questoes')
        .update({
          nome: newBookTitle.trim(),
          is_public: newBookType === 'public'
        })
        .eq('id', editingBook.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setBooks(prev => prev.map(book => 
        book.id === editingBook.id 
          ? { ...book, nome: newBookTitle.trim(), is_public: newBookType === 'public' }
          : book
      ));
      setOpen(false);
      setEditingBook(null);
      setNewBookTitle('');
      setNewBookType('private');
      toast.success('Caderno atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar caderno:', error);
      toast.error('Erro ao atualizar o caderno');
    }
  };

  const handleDeleteBook = async (book: QuestionBook) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar logado para excluir o caderno');
        return;
      }

      const { error } = await supabase
        .from('cadernos_questoes')
        .delete()
        .eq('id', book.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setBooks(prev => prev.filter(b => b.id !== book.id));
      toast.success('Caderno excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir caderno:', error);
      toast.error('Erro ao excluir o caderno');
    }
  };

  const startEditing = (book: QuestionBook) => {
    setEditingBook(book);
    setNewBookTitle(book.nome);
    setNewBookType(book.is_public ? 'public' : 'private');
    setOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 pt-[88px]">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Book className="h-6 w-6 text-purple-500" />
              <h1 className="text-2xl font-semibold text-gray-900">Meus cadernos de questões</h1>
            </div>

            <Dialog open={open} onOpenChange={(isOpen) => {
              if (!isOpen) {
                setEditingBook(null);
                setNewBookTitle('');
                setNewBookType('private');
              }
              setOpen(isOpen);
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Novo Caderno
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingBook ? 'Editar Caderno' : 'Criar Novo Caderno'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingBook 
                      ? 'Edite as informações do seu caderno.'
                      : 'Crie um novo caderno para organizar suas questões.'
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium text-gray-700">
                      Título
                    </label>
                    <Input
                      id="title"
                      placeholder="Digite o título do caderno"
                      value={newBookTitle}
                      onChange={(e) => setNewBookTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="type" className="text-sm font-medium text-gray-700">
                      Tipo
                    </label>
                    <Select
                      value={newBookType}
                      onValueChange={(value: 'public' | 'private') => setNewBookType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Privado</SelectItem>
                        <SelectItem value="public">Público</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={editingBook ? handleEditBook : handleCreateBook}>
                      {editingBook ? 'Salvar Alterações' : 'Criar Caderno'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-white rounded-lg shadow-sm border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Data da Criação</TableHead>
                  <TableHead>Questões</TableHead>
                  <TableHead>Respondidas</TableHead>
                  <TableHead>Acertos</TableHead>
                  <TableHead>Erros</TableHead>
                  <TableHead>Aproveitamento</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : books.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      Nenhum caderno encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  currentBooks.map((book) => {
                    const aproveitamento = book.answered_questions > 0
                      ? ((book.correct_answers / book.answered_questions) * 100).toFixed(1)
                      : '0.0';

                    return (
                      <TableRow key={book.id}>
                        <TableCell>
                          <button
                            onClick={() => navigate(`/cadernos/${book.id}`)}
                            className="font-medium text-purple-600 hover:text-purple-800 transition-colors"
                          >
                            {book.nome}
                          </button>
                        </TableCell>
                        <TableCell>
                          {new Date(book.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-center">{book.total_questions}</TableCell>
                        <TableCell className="text-center">{book.answered_questions}</TableCell>
                        <TableCell className="text-center">{book.correct_answers}</TableCell>
                        <TableCell className="text-center">{book.wrong_answers}</TableCell>
                        <TableCell className="text-center">
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              Number(aproveitamento) >= 70
                                ? 'bg-green-100 text-green-800'
                                : Number(aproveitamento) >= 50
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {aproveitamento}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEditing(book)}
                              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                            >
                              <Pencil className="h-4 w-4" />
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
                    );
                  })
                )}
              </TableBody>
            </Table>
            {books.length > 0 && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>

          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Cadernos públicos</h2>
              <div className="w-1/3">
                <Input
                  placeholder="Pesquisar cadernos públicos..."
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
                    <TableHead>Data da Criação</TableHead>
                    <TableHead>Questões</TableHead>
                    <TableHead>Respondidas</TableHead>
                    <TableHead>Acertos</TableHead>
                    <TableHead>Erros</TableHead>
                    <TableHead>Aproveitamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : filteredPublicBooks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Nenhum caderno público encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentPublicBooks.map((book) => (
                      <TableRow
                        key={book.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate(`/cadernos/${book.id}`)}
                      >
                        <TableCell>{book.nome}</TableCell>
                        <TableCell>
                          {new Date(book.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>{book.total_questions}</TableCell>
                        <TableCell>{book.answered_questions}</TableCell>
                        <TableCell>{book.correct_answers}</TableCell>
                        <TableCell>{book.wrong_answers}</TableCell>
                        <TableCell>
                          <span className={`text-${book.correct_answers === 0 ? 'gray' : book.correct_answers / book.answered_questions >= 0.7 ? 'green' : 'red'}-500`}>
                            {book.answered_questions === 0 ? '0.0%' : ((book.correct_answers / book.answered_questions) * 100).toFixed(1) + '%'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {filteredPublicBooks.length > 0 && (
                <PaginationControls
                  currentPage={publicCurrentPage}
                  totalPages={totalPublicPages}
                  onPageChange={setPublicCurrentPage}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 