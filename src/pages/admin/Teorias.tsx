import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Plus, Search, Trash2, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { teoriasService } from "@/services/teoriasService";
import { supabase } from "@/integrations/supabase/client";

interface Teoria {
  id: string;
  titulo: string;
  disciplina_id: string; // Agora armazena o nome da disciplina como string
  assunto_id: string;    // Agora armazena o nome do assunto como string
  topicos_ids: string[];
  conteudo: string;
  no_edital: string;
  status: "draft" | "published";
  professor_id?: string; // Adicionado
  created_at: string;
  updated_at: string;
}

interface Disciplina {
  id: string;
  titulo: string;
}

interface Assunto {
  id: string;
  nome: string;
}

const TeoriasAdmin = () => {
  const navigate = useNavigate();
  const [teorias, setTeorias] = useState<Teoria[]>([]);
  const [professores, setProfessores] = useState<{id: string, nome: string}[]>([]); // Atualizado
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Carregar teorias do banco de dados
  useEffect(() => {
    Promise.all([
      fetchTeorias(),
      fetchProfessores() // Atualizado
    ]).catch(error => {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    });
  }, []);

  const fetchTeorias = async () => {
    try {
      setLoading(true);
      const data = await teoriasService.getTeorias();
      setTeorias(data || []);
    } catch (error) {
      console.error("Erro ao buscar teorias:", error);
      toast.error("Erro ao carregar teorias");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfessores = async () => {
    try {
      // Buscar professores da tabela professores
      const { data, error } = await supabase
        .from('professores')
        .select('id, nome_completo');
      
      if (error) throw error;
      
      const professoresFormatados = data?.map(professor => ({
        id: professor.id,
        nome: professor.nome_completo
      })) || [];
      
      setProfessores(professoresFormatados);
    } catch (error) {
      console.error("Erro ao carregar professores:", error);
      toast.error("Erro ao carregar professores");
    }
  };

  // Obter nome da disciplina pelo ID
  const getDisciplinaNome = (id: string) => {
    // Agora id é o nome da disciplina diretamente
    return id || "Não encontrada";
  };

  // Obter nome do assunto pelo ID
  const getAssuntoNome = (id: string) => {
    // Agora id é o nome do assunto diretamente
    return id || "Não encontrado";
  };

  // Obter nome do professor pelo ID
  const getProfessorNome = (id: string) => {
    const professor = professores.find(p => p.id === id);
    return professor ? professor.nome : "Não encontrado";
  };

  // Filter teorias based on search term
  const filteredTeorias = teorias.filter(teoria => 
    teoria.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teoria.disciplina_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teoria.assunto_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNew = () => {
    navigate("/admin/teorias/new");
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/teorias/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta teoria?")) {
      try {
        await teoriasService.deleteTeoria(id);
        // Atualizar a lista local
        setTeorias(teorias.filter(teoria => teoria.id !== id));
        toast.success("Teoria excluída com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir teoria:", error);
        toast.error("Erro ao excluir teoria");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gerenciar Teorias</h1>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Teoria
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Lista de Teorias</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar teorias..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Título</th>
                  <th className="text-left py-3 px-4">Professor</th>
                  <th className="text-left py-3 px-4">Disciplina</th>
                  <th className="text-left py-3 px-4">Assunto</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Atualizado</th>
                  <th className="text-left py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeorias.map((teoria) => (
                  <tr key={teoria.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{teoria.titulo}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">{getProfessorNome(teoria.professor_id || "")}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">{getDisciplinaNome(teoria.disciplina_id)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">{getAssuntoNome(teoria.assunto_id)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        teoria.status === "published" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {teoria.status === "published" ? "Publicado" : "Rascunho"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {format(new Date(teoria.updated_at), "dd/MM/yyyy", { locale: ptBR })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(teoria.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(teoria.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTeorias.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma teoria encontrada</h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? "Não encontramos teorias que correspondam à sua busca." 
                  : "Comece criando sua primeira teoria."
                }
              </p>
              {!searchTerm && (
                <Button className="mt-4" onClick={handleCreateNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Nova Teoria
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeoriasAdmin;