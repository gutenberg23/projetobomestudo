import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
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
import AdBanner from '@/components/ads/AdBanner';
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
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );

  const handleCreateBook = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar logado para criar um caderno');
        return;
      }

      if (!newBookTitle.trim()) {
        toast.error('Por favor, informe um nome para o caderno');
        return;
      }

      const { data, error } = await supabase
        .from('cadernos_questoes')
        .insert({
          nome: newBookTitle,
          user_id: user.id,
          is_public: newBookType === 'public'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Caderno criado com sucesso!');
      setOpen(false);
      setNewBookTitle('');
      setNewBookType('private');
      fetchBooks();
      
      // Registrar atividade
      await ActivityLogger.logActivity('question_book_created', {
        bookId: data.id,
        bookName: data.nome
      });
    } catch (error) {
      console.error('Erro ao criar caderno:', error);
      toast.error('Erro ao criar o caderno');
    }
  };

  const handleEditBook = async () => {
    try {
      if (!editingBook) return;

      const { error } = await supabase
        .from('cadernos_questoes')
        .update({
          nome: newBookTitle,
          is_public: newBookType === 'public',
          updated_at: new Date().toISOString()
        })
        .eq('id', editingBook.id);

      if (error) throw error;

      toast.success('Caderno atualizado com sucesso!');
      setOpen(false);
      setEditingBook(null);
      setNewBookTitle('');
      setNewBookType('private');
      fetchBooks();
    } catch (error) {
      console.error('Erro ao editar caderno:', error);
      toast.error('Erro ao atualizar o caderno');
    }
  };

  const handleDeleteBook = async (id: string) => {
    try {
      if (!confirm('Tem certeza que deseja excluir este caderno?')) return;

      const { error } = await supabase
        .from('cadernos_questoes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Caderno excluído com sucesso!');
      fetchBooks();
    } catch (error) {
      console.error('Erro ao excluir caderno:', error);
      toast.error('Erro ao excluir o caderno');
    }
  };

  const handleOpenEdit = (book: QuestionBook) => {
    setEditingBook(book);
    setNewBookTitle(book.nome);
    setNewBookType(book.is_public ? 'public' : 'private');
    setOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingBook(null);
    setNewBookTitle('');
    setNewBookType('private');
    setOpen(true);
  };

  const handleToggleFavorite = async (book: QuestionBook) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar logado para favoritar');
        return;
      }

      // Atualizar estado local primeiro para feedback imediato
      const newFavoriteIds = book.is_favorite
        ? favoriteIds.filter(id => id !== book.id)
        : [...favoriteIds, book.id];

      setFavoriteIds(newFavoriteIds);

      // Atualizar no banco de dados
      const { error } = await supabase
        .from('profiles')
        .update({
          cadernos_favoritos: newFavoriteIds
        })
        .eq('id', user.id);

      if (error) throw error;

      // Atualizar a lista de cadernos públicos
      setPublicBooks(prevBooks => 
        prevBooks.map(b => 
          b.id === book.id 
            ? { ...b, is_favorite: !book.is_favorite } 
            : b
        )
      );

      toast.success(
        book.is_favorite 
          ? 'Caderno removido dos favoritos' 
          : 'Caderno adicionado aos favoritos'
      );
    } catch (error) {
      console.error('Erro ao favoritar:', error);
      // Reverter estado local em caso de erro
      setFavoriteIds(prev => 
        book.is_favorite 
          ? [...prev, book.id] 
          : prev.filter(id => id !== book.id)
      );
      toast.error('Erro ao atualizar favoritos');
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

  return (
    <PublicLayout>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Cadernos de Questões</h1>
              <p className="text-gray-600">Organize e estude suas questões favoritas</p>
            </div>

            <div className="mb-6">
              <AdBanner position="question_books_top" className="rounded-lg" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Meus Cadernos */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Meus Cadernos</h2>
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={handleOpenCreate} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Novo Caderno
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingBook ? 'Editar Caderno' : 'Criar Novo Caderno'}
                        </DialogTitle>
                        <DialogDescription>
                          {editingBook 
                            ? 'Edite as informações do seu caderno' 
                            : 'Crie um novo caderno para organizar suas questões'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Nome do Caderno
                          </label>
                          <Input
                            value={newBookTitle}
                            onChange={(e) => setNewBookTitle(e.target.value)}
                            placeholder="Ex: Matemática - Concursos Federais"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Visibilidade
                          </label>
                          <Select value={newBookType} onValueChange={(value: 'public' | 'private') => setNewBookType(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="private">Privado</SelectItem>
                              <SelectItem value="public">Público</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={editingBook ? handleEditBook : handleCreateBook}>
                            {editingBook ? 'Atualizar' : 'Criar'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Questões</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentBooks.length > 0 ? (
                      currentBooks.map((book) => (
                        <TableRow 
                          key={book.id} 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => navigate(`/cadernos/${book.id}`)}
                        >
                          <TableCell className="font-medium">{book.nome}</TableCell>
                          <TableCell>{book.total_questions || 0}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              book.is_public 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {book.is_public ? 'Público' : 'Privado'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEdit(book);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteBook(book.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                          Você ainda não criou nenhum caderno.
                        </TableCell>
                      </TableRow>
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

              {/* Cadernos Públicos */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Cadernos Públicos</h2>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="favorites-only"
                        checked={showOnlyFavorites}
                        onChange={(e) => setShowOnlyFavorites(e.target.checked)}
                        className="rounded border-gray-300 text-[#5f2ebe] focus:ring-[#5f2ebe]"
                      />
                      <label htmlFor="favorites-only" className="text-sm text-gray-700">
                        Apenas favoritos
                      </label>
                    </div>
                  </div>
                  <Input
                    placeholder="Buscar cadernos públicos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Autor</TableHead>
                      <TableHead>Questões</TableHead>
                      <TableHead className="text-right">Favorito</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPublicBooks.length > 0 ? (
                      currentPublicBooks.map((book) => (
                        <TableRow 
                          key={book.id} 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => navigate(`/cadernos/${book.id}`)}
                        >
                          <TableCell className="font-medium">{book.nome}</TableCell>
                          <TableCell>
                            {book.user_id === supabase.auth.getUser()?.data?.user?.id 
                              ? 'Você' 
                              : 'Outro usuário'}
                          </TableCell>
                          <TableCell>{book.total_questions || 0}</TableCell>
                          <TableCell className="text-right">
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
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                          {searchQuery 
                            ? 'Nenhum caderno encontrado com esse termo.' 
                            : 'Nenhum caderno público disponível.'}
                        </TableCell>
                      </TableRow>
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
          </div>
        </main>
        <Footer />
      </div>
    </PublicLayout>
  );
}