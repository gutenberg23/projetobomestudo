import { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Calendar,
  Link as LinkIcon,
  Image as ImageIcon
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { anunciosService, Anuncio } from "@/services/anunciosService";

const Anuncios = () => {
  console.log('Anuncios component initializing');
  
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAnuncio, setEditingAnuncio] = useState<Anuncio | null>(null);
  const [formData, setFormData] = useState<Omit<Anuncio, 'id' | 'created_at' | 'updated_at'> & { link_destino: string; ativo: boolean }>({
    titulo: "",
    imagem_url: "",
    link_destino: "",
    data_inicio: new Date().toISOString(),
    data_fim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    posicao: "questions_filters",
    ativo: true,
    ordem: 0
  });

  console.log('Anuncios component mounted');

  const posicoes = [
    { value: "questions_filters", label: "Questões - Abaixo dos filtros" },
    { value: "questions_list", label: "Questões - Entre questões (5 em 5)" },
    { value: "cadernos_top", label: "Cadernos - Acima dos cards" },
    { value: "explore_top", label: "Explorar - Acima dos cards" },
    { value: "concursos_list", label: "Concursos - Entre cards (5 em 5)" },
    { value: "my_courses_top", label: "Meus Cursos - Acima dos cards" },
    { value: "dashboard_top", label: "Dashboard - Acima dos cards" },
    { value: "dashboard_middle", label: "Dashboard - Meio dos cards" },
    { value: "ranking_comentarios_top", label: "Ranking Comentários - Topo" },
    { value: "ranking_comentarios_list", label: "Ranking Comentários - Entre itens (10 em 10)" },
    { value: "ranking_questoes_top", label: "Ranking Questões - Topo" },
    { value: "ranking_questoes_list", label: "Ranking Questões - Entre itens (10 em 10)" },
    { value: "blog_top_concursos", label: "Blog - Acima do banner concursos" },
    { value: "blog_posts_list", label: "Blog - Após 3 posts" },
    { value: "course_navigation", label: "Curso - Abaixo do menu de navegação" },
    { value: "blog_post_author", label: "Blog - Abaixo do card 'Sobre o autor'" }
  ];

  useEffect(() => {
    console.log('Anuncios useEffect triggered');
    fetchAnuncios();
  }, []);

  const fetchAnuncios = async () => {
    try {
      console.log('Fetching anuncios...');
      setLoading(true);
      const data = await anunciosService.getAll();
      console.log('Anuncios fetched:', data);
      setAnuncios(data || []);
    } catch (error) {
      console.error("Erro ao buscar anúncios:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar anúncios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAnuncio) {
        // Atualizar anúncio existente
        if (editingAnuncio?.id) {
          await anunciosService.update(editingAnuncio.id!, formData);
        }
        
        toast({
          title: "Sucesso",
          description: "Anúncio atualizado com sucesso"
        });
      } else {
        // Criar novo anúncio
        await anunciosService.create(formData);
        
        toast({
          title: "Sucesso",
          description: "Anúncio criado com sucesso"
        });
      }

      // Resetar formulário e recarregar dados
      setShowForm(false);
      setEditingAnuncio(null);
      setFormData({
        titulo: "",
        imagem_url: "",
        link_destino: "",
        data_inicio: new Date().toISOString(),
        data_fim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        posicao: "questions_filters",
        ativo: true,
        ordem: 0
      });
      
      fetchAnuncios();
    } catch (error) {
      console.error("Erro ao salvar anúncio:", error);
      toast({
        title: "Erro",
        description: "Falha ao salvar anúncio",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (anuncio: Anuncio) => {
    setEditingAnuncio(anuncio);
    setFormData({
      titulo: anuncio.titulo,
      imagem_url: anuncio.imagem_url || "",
      link_destino: anuncio.link_destino || "",
      data_inicio: anuncio.data_inicio,
      data_fim: anuncio.data_fim,
      posicao: anuncio.posicao,
      ativo: anuncio.ativo || false,
      ordem: anuncio.ordem || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este anúncio?")) return;

    try {
      await anunciosService.delete(id);

      toast({
        title: "Sucesso",
        description: "Anúncio excluído com sucesso"
      });

      fetchAnuncios();
    } catch (error) {
      console.error("Erro ao excluir anúncio:", error);
      toast({
        title: "Erro",
        description: "Falha ao excluir anúncio",
        variant: "destructive"
      });
    }
  };

  const toggleAtivo = async (id: string, currentStatus: boolean) => {
    try {
      await anunciosService.toggleStatus(id, currentStatus);

      toast({
        title: "Sucesso",
        description: `Anúncio ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`
      });

      fetchAnuncios();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar status do anúncio",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const getPosicaoLabel = (posicao: string) => {
    const pos = posicoes.find(p => p.value === posicao);
    return pos ? pos.label : posicao;
  };

  console.log('Anuncios component rendering with state:', { anuncios, loading, showForm });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Anúncios</h1>
        <button
          onClick={() => {
            setEditingAnuncio(null);
            setFormData({
              titulo: "",
              imagem_url: "",
              link_destino: "",
              data_inicio: new Date().toISOString(),
              data_fim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              posicao: "questions_filters",
              ativo: true,
              ordem: 0
            });
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-[#5f2ebe] text-white px-4 py-2 rounded-md hover:bg-[#4a259e] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Anúncio
        </button>
      </div>
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
        <p className="text-sm text-yellow-700">Debug: Anúncios carregados: {anuncios.length}</p>
        <p className="text-sm text-yellow-700">Debug: Loading state: {loading.toString()}</p>
        <p className="text-sm text-yellow-700">Debug: Show form: {showForm.toString()}</p>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">
            {editingAnuncio ? "Editar Anúncio" : "Novo Anúncio"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5f2ebe]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posição *
                </label>
                <select
                  value={formData.posicao}
                  onChange={(e) => setFormData({...formData, posicao: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5f2ebe]"
                  required
                >
                  {posicoes.map((pos) => (
                    <option key={pos.value} value={pos.value}>
                      {pos.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Início *
                </label>
                <input
                  type="datetime-local"
                  value={formData.data_inicio.slice(0, 16)}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    setFormData({...formData, data_inicio: date.toISOString()});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5f2ebe]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Término *
                </label>
                <input
                  type="datetime-local"
                  value={formData.data_fim.slice(0, 16)}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    setFormData({...formData, data_fim: date.toISOString()});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5f2ebe]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordem
                </label>
                <input
                  type="number"
                  value={formData.ordem || 0}
                  onChange={(e) => setFormData({...formData, ordem: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5f2ebe]"
                  min="0"
                />
              </div>
              
              <div className="flex items-center pt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                    className="rounded border-gray-300 text-[#5f2ebe] focus:ring-[#5f2ebe]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Ativo</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL da Imagem
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.imagem_url || ""}
                  onChange={(e) => setFormData({...formData, imagem_url: e.target.value})}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5f2ebe]"
                />
                <button
                  type="button"
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  onClick={() => {
                    // Aqui você pode implementar a integração com um serviço de upload de imagens
                    alert("Integração com upload de imagens não implementada neste exemplo");
                  }}
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link de Destino
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.link_destino || ""}
                  onChange={(e) => setFormData({...formData, link_destino: e.target.value})}
                  placeholder="https://exemplo.com"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5f2ebe]"
                />
                <button
                  type="button"
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-[#5f2ebe] text-white px-4 py-2 rounded-md hover:bg-[#4a259e] transition-colors"
              >
                {editingAnuncio ? "Atualizar" : "Criar"} Anúncio
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingAnuncio(null);
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5f2ebe]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {anuncios.map((anuncio) => (
                  <tr key={anuncio.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{anuncio.titulo}</div>
                      {anuncio.imagem_url && (
                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                          <ImageIcon className="w-4 h-4" />
                          Imagem configurada
                        </div>
                      )}
                      {anuncio.link_destino && (
                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                          <LinkIcon className="w-4 h-4" />
                          Link configurado
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getPosicaoLabel(anuncio.posicao)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(anuncio.data_inicio)} - {formatDate(anuncio.data_fim)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        anuncio.ativo 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {anuncio.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => anuncio.id && toggleAtivo(anuncio.id, anuncio.ativo === true)}
                          className={`p-1 rounded ${
                            anuncio.ativo 
                              ? "text-red-600 hover:text-red-900 hover:bg-red-50" 
                              : "text-green-600 hover:text-green-900 hover:bg-green-50"
                          }`}
                          title={anuncio.ativo ? "Desativar" : "Ativar"}
                        >
                          {anuncio.ativo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(anuncio)}
                          className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => anuncio.id && handleDelete(anuncio.id)}
                          className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {anuncios.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum anúncio cadastrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece criando seu primeiro anúncio.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Anuncios;