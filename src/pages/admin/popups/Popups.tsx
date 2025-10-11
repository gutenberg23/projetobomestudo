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
import { popupsService } from "@/services/popupsService";
import { Popup } from "@/types/popup";

const Popups = () => {
  console.log('Popups component initializing');
  
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
  const [formData, setFormData] = useState<Omit<Popup, 'id' | 'created_at' | 'updated_at'>>({
    titulo: "",
    conteudo: "",
    imagem_url: undefined,
    link_destino: undefined,
    data_inicio: new Date().toISOString(),
    data_fim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    pagina: "home",
    ativo: true,
    ordem: 0
  });

  console.log('Popups component mounted');

  const paginas = [
    { value: "home", label: "Página Inicial" },
    { value: "concursos", label: "Concursos" },
    { value: "blog", label: "Blog" },
    { value: "questoes", label: "Questões" },
    { value: "simulados", label: "Simulados" },
    { value: "cursos", label: "Cursos" },
    { value: "ranking", label: "Ranking" },
    { value: "explorar", label: "Explorar" }
  ];

  useEffect(() => {
    console.log('Popups useEffect triggered');
    fetchPopups();
  }, []);

  const fetchPopups = async () => {
    try {
      console.log('Fetching popups...');
      setLoading(true);
      const data = await popupsService.getAll();
      console.log('Popups fetched:', data);
      setPopups(data || []);
    } catch (error) {
      console.error("Erro ao buscar popups:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar popups",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPopup) {
        // Atualizar popup existente
        if (editingPopup?.id) {
          await popupsService.update(editingPopup.id, formData);
        }
        
        toast({
          title: "Sucesso",
          description: "Popup atualizado com sucesso"
        });
      } else {
        // Criar novo popup
        await popupsService.create(formData);
        
        toast({
          title: "Sucesso",
          description: "Popup criado com sucesso"
        });
      }

      // Resetar formulário e recarregar dados
      setShowForm(false);
      setEditingPopup(null);
      setFormData({
        titulo: "",
        conteudo: "",
        imagem_url: undefined,
        link_destino: undefined,
        data_inicio: new Date().toISOString(),
        data_fim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        pagina: "home",
        ativo: true,
        ordem: 0
      });
      
      fetchPopups();
    } catch (error) {
      console.error("Erro ao salvar popup:", error);
      toast({
        title: "Erro",
        description: "Falha ao salvar popup",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (popup: Popup) => {
    setEditingPopup(popup);
    setFormData({
      titulo: popup.titulo,
      conteudo: popup.conteudo || "",
      imagem_url: popup.imagem_url || undefined,
      link_destino: popup.link_destino || undefined,
      data_inicio: popup.data_inicio,
      data_fim: popup.data_fim,
      pagina: popup.pagina,
      ativo: popup.ativo !== null ? popup.ativo : false,
      ordem: popup.ordem || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este popup?")) return;

    try {
      await popupsService.delete(id);

      toast({
        title: "Sucesso",
        description: "Popup excluído com sucesso"
      });

      fetchPopups();
    } catch (error) {
      console.error("Erro ao excluir popup:", error);
      toast({
        title: "Erro",
        description: "Falha ao excluir popup",
        variant: "destructive"
      });
    }
  };

  const toggleAtivo = async (id: string, currentStatus: boolean) => {
    try {
      await popupsService.toggleStatus(id, currentStatus);

      toast({
        title: "Sucesso",
        description: `Popup ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`
      });

      fetchPopups();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar status do popup",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const getPaginaLabel = (pagina: string) => {
    const pag = paginas.find(p => p.value === pagina);
    return pag ? pag.label : pagina;
  };

  console.log('Popups component rendering with state:', { popups, loading, showForm });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Popups</h1>
        <button
          onClick={() => {
            setEditingPopup(null);
            setFormData({
              titulo: "",
              conteudo: "",
              imagem_url: undefined,
              link_destino: undefined,
              data_inicio: new Date().toISOString(),
              data_fim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              pagina: "home",
              ativo: true,
              ordem: 0
            });
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-[#5f2ebe] text-white px-4 py-2 rounded-md hover:bg-[#4a259e] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Popup
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">
            {editingPopup ? "Editar Popup" : "Novo Popup"}
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
                  Página *
                </label>
                <select
                  value={formData.pagina}
                  onChange={(e) => setFormData({...formData, pagina: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5f2ebe]"
                  required
                >
                  {paginas.map((pagina) => (
                    <option key={pagina.value} value={pagina.value}>
                      {pagina.label}
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
                    checked={formData.ativo !== null ? formData.ativo : false}
                    onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                    className="rounded border-gray-300 text-[#5f2ebe] focus:ring-[#5f2ebe]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Ativo</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conteúdo HTML
              </label>
              <textarea
                value={formData.conteudo}
                onChange={(e) => setFormData({...formData, conteudo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5f2ebe]"
                rows={4}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL da Imagem
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.imagem_url || ""}
                  onChange={(e) => setFormData({...formData, imagem_url: e.target.value || undefined})}
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
                  onChange={(e) => setFormData({...formData, link_destino: e.target.value || undefined})}
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
                {editingPopup ? "Atualizar" : "Criar"} Popup
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingPopup(null);
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
                    Página
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
                {popups.map((popup) => (
                  <tr key={popup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{popup.titulo}</div>
                      {popup.imagem_url && (
                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                          <ImageIcon className="w-4 h-4" />
                          Imagem configurada
                        </div>
                      )}
                      {popup.link_destino && (
                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                          <LinkIcon className="w-4 h-4" />
                          Link configurado
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getPaginaLabel(popup.pagina)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(popup.data_inicio)} - {formatDate(popup.data_fim)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        popup.ativo 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {popup.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => popup.id && toggleAtivo(popup.id, popup.ativo === true)}
                          className={`p-1 rounded ${
                            popup.ativo 
                              ? "text-red-600 hover:text-red-900 hover:bg-red-50" 
                              : "text-green-600 hover:text-green-900 hover:bg-green-50"
                          }`}
                          title={popup.ativo ? "Desativar" : "Ativar"}
                        >
                          {popup.ativo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(popup)}
                          className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => popup.id && handleDelete(popup.id)}
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
          
          {popups.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum popup cadastrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece criando seu primeiro popup.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Popups;