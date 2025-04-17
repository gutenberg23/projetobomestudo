import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
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
import { ActivityLogger } from '@/services/activity-logger';

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
  is_favorite?: boolean;
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
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
    fetchPublicBooks();
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('cadernos_favoritos')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data && data.cadernos_favoritos) {
        setFavoriteIds(data.cadernos_favoritos);
      }
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
    }
  };

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

      // Marcar cadernos favoritos
      const booksWithFavorites = (data || []).map(book => ({
        ...book,
        is_favorite: favoriteIds.includes(book.id)
      }));

      setPublicBooks(booksWithFavorites);
    } catch (error) {
      console.error('Erro ao buscar cadernos públicos:', error);
      toast.error('Erro ao carregar os cadernos públicos');
    }
  };

  useEffect(() => {
    // Atualizar flag de favorito quando favoriteIds mudar
    setPublicBooks(prevBooks => 
      prevBooks.map(book => ({
        ...book,
        is_favorite: favoriteIds.includes(book.id)
      }))
    );
  }, [favoriteIds]);

  const filteredPublicBooks = publicBooks.filter(book => 
    book.nome.toLowerCase().includes(searchQuery.toLowerCase()) && 
    (!showOnlyFavorites || book.is_favorite)
  );

  // Ordenar para mostrar favoritos no topo
  const sortedPublicBooks = [...filteredPublicBooks].sort((a, b) => {
    if (a.is_favorite && !b.is_favorite) return -1;
    if (!a.is_favorite && b.is_favorite) return 1;
    return 0;
  });

  // Cálculos para paginação dos meus cadernos
  const totalPages = Math.ceil(books.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBooks = books.slice(startIndex, endIndex);

  // Cálculos para paginação dos cadernos públicos
  const totalPublicPages = Math.ceil(sortedPublicBooks.length / itemsPerPage);
  const publicStartIndex = (publicCurrentPage - 1) * itemsPerPage;
  const publicEndIndex = publicStartIndex + itemsPerPage;
  const currentPublicBooks = sortedPublicBooks.slice(publicStartIndex, publicEndIndex);

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

      // Registrar atividade de criação de caderno
      await ActivityLogger.logNotebookCreate(
        data.id, 
        newBookTitle.trim()
      );

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

      // Registrar atividade de exclusão de caderno
      await ActivityLogger.logNotebookDelete(
        book.id, 
        book.nome
      );

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

  const handleToggleFavorite = async (book: QuestionBook) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar logado para favoritar um caderno');
        return;
      }

      const isCurrentlyFavorite = favoriteIds.includes(book.id);
      let newFavoriteIds: string[];
      
      if (isCurrentlyFavorite) {
        // Remover dos favoritos
        newFavoriteIds = favoriteIds.filter(id => id !== book.id);
      } else {
        // Adicionar aos favoritos
        newFavoriteIds = [...favoriteIds, book.id];
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          cadernos_favoritos: newFavoriteIds
        })
        .eq('id', user.id);

      if (error) throw error;

      setFavoriteIds(newFavoriteIds);
      toast.success(isCurrentlyFavorite 
        ? 'Caderno removido dos favoritos' 
        : 'Caderno adicionado aos favoritos');
    } catch (error) {
      console.error('Erro ao atualizar favoritos:', error);
      toast.error('Erro ao atualizar favoritos');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-[#272f3c]">
      <Header />
      <main className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-screen-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-3xl text-[#272f3c] font-extrabold md:text-3xl">Meus cadernos</h1>
          <div>
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
                  Novo
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
        </div>

        <div className="bg-white rounded-lg">
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
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <h2 className="text-3xl text-[#272f3c] font-extrabold md:text-3xl">Cadernos públicos</h2>
              
              <div className="flex items-center gap-2">
                <label htmlFor="showFavorites" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-1">
                  <input
                    id="showFavorites"
                    type="checkbox"
                    checked={showOnlyFavorites}
                    onChange={(e) => setShowOnlyFavorites(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <Heart className="h-4 w-4 text-[#5f2ebe]" />
                  Apenas favoritos
                </label>
              </div>
            </div>
            <div className="w-full md:w-1/3">
              <Input
                placeholder="Pesquisar cadernos públicos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg">
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
                  <TableHead>Favorito</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : sortedPublicBooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      Nenhum caderno público encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  currentPublicBooks.map((book) => {
                    const aproveitamento = book.answered_questions > 0
                      ? ((book.correct_answers / book.answered_questions) * 100).toFixed(1)
                      : '0.0';
                      
                    return (
                      <TableRow
                        key={book.id}
                        className={`hover:bg-gray-50 ${book.is_favorite ? 'bg-purple-50' : ''}`}
                      >
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
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            Number(aproveitamento) >= 70
                              ? 'bg-green-100 text-green-800'
                              : Number(aproveitamento) >= 50
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {aproveitamento}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(book);
                            }}
                            className={`${book.is_favorite ? 'text-[#5f2ebe]' : 'text-gray-400'} hover:text-[#5f2ebe]`}
                          >
                            <Heart className="h-5 w-5" fill={book.is_favorite ? "currentColor" : "none"} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            {sortedPublicBooks.length > 0 && (
              <PaginationControls
                currentPage={publicCurrentPage}
                totalPages={totalPublicPages}
                onPageChange={setPublicCurrentPage}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 