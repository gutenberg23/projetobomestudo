import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Plus, Search, Trash2, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data for demonstration
const MOCK_TEORIAS = [
  {
    id: "1",
    title: "Teoria de Direito Administrativo",
    slug: "teoria-direito-administrativo",
    author: "Prof. João Silva",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: "Direito",
    tags: ["direito", "administrativo", "princípios"],
    status: "published"
  },
  {
    id: "2",
    title: "Teoria de Direito Constitucional",
    slug: "teoria-direito-constitucional",
    author: "Prof. Maria Oliveira",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    category: "Direito",
    tags: ["direito", "constitucional", "direitos"],
    status: "published"
  },
  {
    id: "3",
    title: "Teoria de Matemática Financeira",
    slug: "teoria-matematica-financeira",
    author: "Prof. Carlos Santos",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
    category: "Matemática",
    tags: ["matemática", "financeira", "juros"],
    status: "draft"
  }
];

const TeoriasAdmin = () => {
  const [teorias, setTeorias] = useState<any[]>(MOCK_TEORIAS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentTeoria, setCurrentTeoria] = useState<any>(null);

  // Filter teorias based on search term
  const filteredTeorias = teorias.filter(teoria => 
    teoria.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teoria.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teoria.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateNew = () => {
    setIsEditing(true);
    setCurrentTeoria({
      id: "",
      title: "",
      slug: "",
      author: "",
      category: "",
      tags: [],
      content: "",
      status: "draft"
    });
  };

  const handleEdit = (teoria: any) => {
    setIsEditing(true);
    setCurrentTeoria({...teoria});
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta teoria?")) {
      setTeorias(teorias.filter(teoria => teoria.id !== id));
    }
  };

  const handleSave = () => {
    if (currentTeoria.id) {
      // Update existing
      setTeorias(teorias.map(teoria => 
        teoria.id === currentTeoria.id 
          ? {...currentTeoria, updatedAt: new Date().toISOString()}
          : teoria
      ));
    } else {
      // Create new
      const newTeoria = {
        ...currentTeoria,
        id: String(teorias.length + 1),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setTeorias([...teorias, newTeoria]);
    }
    
    setIsEditing(false);
    setCurrentTeoria(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentTeoria(null);
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {currentTeoria.id ? "Editar Teoria" : "Nova Teoria"}
          </h1>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Teoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={currentTeoria.title}
                  onChange={(e) => setCurrentTeoria({...currentTeoria, title: e.target.value})}
                  placeholder="Título da teoria"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="author">Autor</Label>
                <Input
                  id="author"
                  value={currentTeoria.author}
                  onChange={(e) => setCurrentTeoria({...currentTeoria, author: e.target.value})}
                  placeholder="Nome do autor"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={currentTeoria.category}
                  onChange={(e) => setCurrentTeoria({...currentTeoria, category: e.target.value})}
                  placeholder="Categoria"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                <Input
                  id="tags"
                  value={currentTeoria.tags.join(", ")}
                  onChange={(e) => setCurrentTeoria({...currentTeoria, tags: e.target.value.split(",").map(tag => tag.trim())})}
                  placeholder="Tags"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                value={currentTeoria.content}
                onChange={(e) => setCurrentTeoria({...currentTeoria, content: e.target.value})}
                placeholder="Conteúdo da teoria em HTML"
                rows={15}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <Button onClick={handleSave}>
                {currentTeoria.id ? "Atualizar" : "Criar"} Teoria
              </Button>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="status">Status:</Label>
                <select
                  id="status"
                  value={currentTeoria.status}
                  onChange={(e) => setCurrentTeoria({...currentTeoria, status: e.target.value})}
                  className="border rounded px-2 py-1"
                >
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
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
                  <th className="text-left py-3 px-4">Categoria</th>
                  <th className="text-left py-3 px-4">Autor</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Atualizado</th>
                  <th className="text-left py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeorias.map((teoria) => (
                  <tr key={teoria.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{teoria.title}</div>
                        <div className="text-sm text-gray-500">
                          {teoria.tags.map((tag: string) => `#${tag}`).join(", ")}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {teoria.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">{teoria.author}</td>
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
                      {format(new Date(teoria.updatedAt), "dd/MM/yyyy", { locale: ptBR })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(teoria)}
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