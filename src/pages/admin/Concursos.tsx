import { useState, useEffect } from 'react';
import { Concurso, ConcursoFormData } from '../../types/concurso';
import { BlogPost } from '../../components/blog/types';
import FormularioConcurso from './components/concursos/FormularioConcurso';
import ListagemConcursos from './components/concursos/ListagemConcursos';
import { toast } from 'react-toastify';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { concursosService } from '@/services/concursosService';
import { usePermissions } from '@/hooks/usePermissions';

enum ModoInterface {
  LISTAR,
  CRIAR,
  EDITAR
}

const ConcursosAdmin = () => {
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [postIdsUtilizados, setPostIdsUtilizados] = useState<Set<string>>(new Set());
  const [modo, setModo] = useState<ModoInterface>(ModoInterface.LISTAR);
  const [concursoAtual, setConcursoAtual] = useState<Concurso | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { isJornalista } = usePermissions();

  // Função para carregar concursos usando o serviço
  const carregarConcursos = async () => {
    setLoading(true);
    try {
      const concursosCarregados = await concursosService.listarConcursos();
      console.log('Concursos carregados:', concursosCarregados); // Log para debug
      setConcursos(concursosCarregados);
    } catch (error: any) {
      console.error('Erro ao carregar concursos:', error);
      toast.error(`Erro ao carregar concursos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar posts do blog para seleção
  const carregarPosts = async () => {
    try {
      // Se for jornalista, só mostra posts do autor
      const postsData = await concursosService.listarPostsBlog(isJornalista());
      
      // Formatar posts para exibição
      const postsFormatados = postsData.map((post: any): BlogPost => ({
        id: post.id,
        title: post.title,
        summary: '', // Não precisamos dessas informações para o select
        content: '',
        author: post.author || '',
        commentCount: 0,
        likesCount: 0,
        viewCount: 0,
        createdAt: '',
        slug: '',
        category: post.category
      }));

      setPosts(postsFormatados);
    } catch (error: any) {
      console.error('Erro ao carregar posts:', error);
      toast.error(`Erro ao carregar posts do blog: ${error.message}`);
    }
  };

  // Função para carregar IDs de posts já utilizados
  const carregarPostIdsUtilizados = async () => {
    try {
      const ids = await concursosService.listarPostIdsUtilizados();
      setPostIdsUtilizados(new Set(ids));
    } catch (error: any) {
      console.error('Erro ao carregar posts utilizados:', error);
      toast.error(`Erro ao carregar posts utilizados: ${error.message}`);
    }
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    carregarConcursos();
    carregarPosts();
    carregarPostIdsUtilizados();
  }, []);

  // Função para criar um novo concurso
  const criarConcurso = async (formData: ConcursoFormData) => {
    try {
      const novoConcurso = await concursosService.criarConcurso(formData);
      setConcursos([novoConcurso, ...concursos]);
      setModo(ModoInterface.LISTAR);
      toast.success('Concurso criado com sucesso!');
      
      // Atualizar a lista de posts utilizados
      if (formData.postId) {
        setPostIdsUtilizados(prev => new Set([...prev, formData.postId!]));
      }
    } catch (error: any) {
      console.error('Erro ao criar concurso:', error);
      toast.error(`Erro ao criar concurso: ${error.message}`);
    }
  };

  // Função para atualizar um concurso existente
  const atualizarConcurso = async (id: string, formData: ConcursoFormData) => {
    try {
      await concursosService.atualizarConcurso(id, formData);
      
      // Atualizar o estado sem precisar buscar novamente do banco
      const concursosAtualizados = concursos.map(c => 
        c.id === id 
          ? { 
              ...c, 
              titulo: formData.titulo,
              dataInicioInscricao: formData.dataInicioInscricao,
              dataFimInscricao: formData.dataFimInscricao,
              prorrogado: formData.prorrogado,
              niveis: formData.niveis,
              cargos: formData.cargos,
              vagas: formData.vagas,
              salario: formData.salario,
              estados: formData.estados,
              postId: formData.postId,
              updatedAt: new Date().toISOString()
            } 
          : c
      );
      
      setConcursos(concursosAtualizados);
      setModo(ModoInterface.LISTAR);
      setConcursoAtual(null);
      toast.success('Concurso atualizado com sucesso!');
      
      // Atualizar a lista de posts utilizados
      carregarPostIdsUtilizados();
    } catch (error: any) {
      console.error('Erro ao atualizar concurso:', error);
      toast.error(`Erro ao atualizar concurso: ${error.message}`);
    }
  };

  // Função para excluir um concurso
  const excluirConcurso = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este concurso?')) {
      return;
    }
    
    try {
      await concursosService.excluirConcurso(id);
      setConcursos(concursos.filter(c => c.id !== id));
      
      // Atualizar a lista de posts utilizados
      carregarPostIdsUtilizados();
      
      toast.success('Concurso excluído com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir concurso:', error);
      toast.error(`Erro ao excluir concurso: ${error.message}`);
    }
  };

  // Função para editar um concurso
  const iniciarEdicao = (concurso: Concurso) => {
    console.log('Iniciando edição do concurso:', concurso); // Log para debug
    setConcursoAtual(concurso);
    setModo(ModoInterface.EDITAR);
  };

  // Função para salvar um concurso (criar ou atualizar)
  const salvarConcurso = (formData: ConcursoFormData) => {
    if (modo === ModoInterface.CRIAR) {
      criarConcurso(formData);
    } else if (modo === ModoInterface.EDITAR && concursoAtual) {
      atualizarConcurso(concursoAtual.id, formData);
    }
  };

  // Função para cancelar a edição/criação
  const cancelar = () => {
    setModo(ModoInterface.LISTAR);
    setConcursoAtual(null);
  };

  // Função para recarregar os dados
  const recarregarDados = () => {
    carregarConcursos();
    carregarPosts();
    carregarPostIdsUtilizados();
    toast.info('Dados recarregados');
  };

  // Renderização condicional com base no modo
  const renderContent = () => {
    if (modo !== ModoInterface.LISTAR) {
      return (
        <div className="container max-w-6xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {modo === ModoInterface.CRIAR ? 'Novo Concurso' : 'Editar Concurso'}
            </h1>
            <Button
              variant="outline"
              onClick={cancelar}
            >
              Voltar
            </Button>
          </div>

          <FormularioConcurso 
            posts={posts}
            postIdsUtilizados={postIdsUtilizados}
            concursoInicial={concursoAtual}
            onSalvar={salvarConcurso}
            onCancelar={cancelar}
          />
        </div>
      );
    }

    return (
      <div className="container max-w-6xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gerenciamento de Concursos</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={recarregarDados}
            >
              Atualizar
            </Button>
            <Button
              onClick={() => setModo(ModoInterface.CRIAR)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Novo Concurso
            </Button>
          </div>
        </div>

        {loading ? (
          <Card className="p-8 flex justify-center items-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando concursos...</p>
            </div>
          </Card>
        ) : (
          <Tabs defaultValue="todos" className="mb-6">
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="ativos">Ativos</TabsTrigger>
              <TabsTrigger value="encerrados">Encerrados</TabsTrigger>
            </TabsList>
            <TabsContent value="todos">
              <ListagemConcursos 
                concursos={concursos}
                onEditar={iniciarEdicao}
                onExcluir={excluirConcurso}
              />
            </TabsContent>
            <TabsContent value="ativos">
              <ListagemConcursos 
                concursos={concursos.filter(c => {
                  const hoje = new Date();
                  const dataFim = new Date(c.dataFimInscricao);
                  return dataFim >= hoje;
                })}
                onEditar={iniciarEdicao}
                onExcluir={excluirConcurso}
              />
            </TabsContent>
            <TabsContent value="encerrados">
              <ListagemConcursos 
                concursos={concursos.filter(c => {
                  const hoje = new Date();
                  const dataFim = new Date(c.dataFimInscricao);
                  return dataFim < hoje;
                })}
                onEditar={iniciarEdicao}
                onExcluir={excluirConcurso}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    );
  };

  return renderContent();
};

export default ConcursosAdmin;