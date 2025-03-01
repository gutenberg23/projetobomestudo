
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { FormLayout } from "@/components/admin/FormLayout";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, PlusCircle, Check, X } from "lucide-react";

// Dados fictícios
const MOCK_POSTS = [
  {
    id: 1,
    title: "Como se preparar para concursos públicos",
    category: "Dicas de Estudo",
    status: "Publicado",
    date: "15/05/2023",
    author: "Maria Oliveira",
  },
  {
    id: 2,
    title: "As principais questões do ENEM nos últimos anos",
    category: "Vestibular",
    status: "Rascunho",
    date: "10/05/2023",
    author: "João Silva",
  },
  {
    id: 3,
    title: "Técnicas de memorização para estudantes",
    category: "Dicas de Estudo",
    status: "Publicado",
    date: "05/05/2023",
    author: "Carlos Santos",
  },
];

const Posts = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState(MOCK_POSTS);

  const handleEdit = (post: any) => {
    setIsEditing(true);
    // Aqui você carregaria os dados do post para edição
  };

  const handleDelete = (post: any) => {
    // Implementar lógica de exclusão
    setPosts(posts.filter((p) => p.id !== post.id));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar lógica de envio do formulário
    setIsCreating(false);
    setIsEditing(false);
  };

  const columns = [
    {
      header: "Título",
      accessorKey: "title",
    },
    {
      header: "Categoria",
      accessorKey: "category",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (value: string) => (
        <div className="flex items-center">
          <span
            className={`w-2 h-2 rounded-full mr-2 ${
              value === "Publicado" ? "bg-green-500" : "bg-orange-500"
            }`}
          ></span>
          {value}
        </div>
      ),
    },
    {
      header: "Data",
      accessorKey: "date",
    },
    {
      header: "Autor",
      accessorKey: "author",
    },
  ];

  if (isCreating || isEditing) {
    return (
      <FormLayout
        title={isEditing ? "Editar Post" : "Novo Post"}
        onCancel={() => {
          setIsCreating(false);
          setIsEditing(false);
        }}
        onSubmit={handleFormSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 md:col-span-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" placeholder="Digite o título do post" />
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="category">Categoria</Label>
            <Select defaultValue="dicas">
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dicas">Dicas de Estudo</SelectItem>
                <SelectItem value="vestibular">Vestibular</SelectItem>
                <SelectItem value="concursos">Concursos Públicos</SelectItem>
                <SelectItem value="carreira">Carreira</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="status">Status</Label>
            <Select defaultValue="draft">
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-4 md:col-span-2">
            <Label htmlFor="summary">Resumo</Label>
            <Textarea id="summary" placeholder="Digite um breve resumo do post" />
          </div>
          
          <div className="space-y-4 md:col-span-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea id="content" placeholder="Digite o conteúdo do post" className="min-h-[200px]" />
          </div>
        </div>
      </FormLayout>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Pesquisar posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-[#ea2be2] hover:bg-[#d026d5] whitespace-nowrap"
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Novo Post
        </Button>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          title="Nenhum post encontrado"
          description="Crie seu primeiro post para o blog do BomEstudo."
          buttonText="Criar Post"
          onClick={() => setIsCreating(true)}
          icon={<FileText className="h-6 w-6 text-gray-400" />}
        />
      ) : (
        <DataTable
          columns={columns}
          data={posts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Posts;
