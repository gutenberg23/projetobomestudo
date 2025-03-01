
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { FormLayout } from "@/components/admin/FormLayout";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Search, PlusCircle, FileText, Video, Upload, PlusCircle as PlusIcon, Paperclip } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Dados fictícios
const MOCK_TOPICOS = [
  {
    id: 1,
    titulo: "Direitos Fundamentais na CF/88",
    aula: "Princípios Constitucionais",
    tipo: "Vídeo",
    duracao: "25 minutos",
    importancia: "Alta",
    dificuldade: "Médio",
  },
  {
    id: 2,
    titulo: "Controle de Constitucionalidade",
    aula: "Controle Constitucional",
    tipo: "Texto",
    duracao: "15 minutos",
    importancia: "Média",
    dificuldade: "Difícil",
  },
  {
    id: 3,
    titulo: "Concordância Verbal",
    aula: "Língua Portuguesa Básica",
    tipo: "Mapa Mental",
    duracao: "10 minutos",
    importancia: "Alta",
    dificuldade: "Fácil",
  },
];

const Topicos = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [topicos, setTopicos] = useState(MOCK_TOPICOS);
  const [tipoConteudo, setTipoConteudo] = useState("video");

  const handleEdit = (topico: any) => {
    setIsEditing(true);
    // Aqui você carregaria os dados do tópico para edição
  };

  const handleDelete = (topico: any) => {
    // Implementar lógica de exclusão
    setTopicos(topicos.filter((t) => t.id !== topico.id));
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
      accessorKey: "titulo",
    },
    {
      header: "Aula",
      accessorKey: "aula",
    },
    {
      header: "Tipo",
      accessorKey: "tipo",
      cell: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === "Vídeo" ? "bg-blue-100 text-blue-700" :
          value === "Texto" ? "bg-green-100 text-green-700" :
          "bg-purple-100 text-purple-700"
        }`}>
          {value}
        </span>
      ),
    },
    {
      header: "Duração",
      accessorKey: "duracao",
    },
    {
      header: "Importância",
      accessorKey: "importancia",
      cell: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === "Alta" ? "bg-red-100 text-red-700" :
          value === "Média" ? "bg-yellow-100 text-yellow-700" :
          "bg-gray-100 text-gray-700"
        }`}>
          {value}
        </span>
      ),
    },
    {
      header: "Dificuldade",
      accessorKey: "dificuldade",
      cell: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === "Difícil" ? "bg-red-100 text-red-700" :
          value === "Médio" ? "bg-yellow-100 text-yellow-700" :
          "bg-green-100 text-green-700"
        }`}>
          {value}
        </span>
      ),
    },
  ];

  if (isCreating || isEditing) {
    return (
      <FormLayout
        title={isEditing ? "Editar Tópico" : "Novo Tópico"}
        onCancel={() => {
          setIsCreating(false);
          setIsEditing(false);
        }}
        onSubmit={handleFormSubmit}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 md:col-span-2">
              <Label htmlFor="titulo">Título do Tópico</Label>
              <Input id="titulo" placeholder="Digite o título do tópico" />
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="aula">Aula</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a aula" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="principios">Princípios Constitucionais</SelectItem>
                  <SelectItem value="controle">Controle Constitucional</SelectItem>
                  <SelectItem value="portugues">Língua Portuguesa Básica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="duracao">Duração Estimada</Label>
              <Input id="duracao" placeholder="Ex: 25 minutos" />
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="importancia">Importância</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a importância" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="dificuldade">Dificuldade</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a dificuldade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facil">Fácil</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="dificil">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4 md:col-span-2">
              <Label htmlFor="resumo">Resumo</Label>
              <Textarea id="resumo" placeholder="Digite um breve resumo sobre o tópico" />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <Label>Tipo de Conteúdo</Label>
            <Tabs value={tipoConteudo} onValueChange={setTipoConteudo} className="w-full">
              <TabsList className="grid grid-cols-3 w-full mb-4">
                <TabsTrigger value="video">Vídeo</TabsTrigger>
                <TabsTrigger value="texto">Texto</TabsTrigger>
                <TabsTrigger value="material">Material Complementar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="video" className="space-y-4">
                <div className="space-y-4">
                  <Label htmlFor="urlVideo">URL do Vídeo</Label>
                  <div className="flex">
                    <Input id="urlVideo" placeholder="Ex: https://youtube.com/watch?v=..." className="rounded-r-none" />
                    <Button variant="outline" className="rounded-l-none border-l-0">
                      <Video className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>Miniatura do Vídeo</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-[#67748a] mb-2">
                      Arraste e solte uma imagem ou clique para fazer upload
                    </p>
                    <Button variant="outline" size="sm">
                      Selecionar Arquivo
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="texto" className="space-y-4">
                <div className="space-y-4">
                  <Label htmlFor="conteudoTexto">Conteúdo do Texto</Label>
                  <Textarea id="conteudoTexto" placeholder="Digite ou cole o conteúdo do texto" className="min-h-[200px]" />
                </div>
              </TabsContent>
              
              <TabsContent value="material" className="space-y-4">
                <div className="space-y-4">
                  <Label>Arquivos Complementares</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-[#67748a] mb-2">
                      Arraste e solte arquivos ou clique para fazer upload
                    </p>
                    <Button variant="outline" size="sm">
                      Selecionar Arquivos
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">mapa_mental.pdf</span>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Paperclip className="h-4 w-4 text-gray-400" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
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
            placeholder="Pesquisar tópicos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-[#ea2be2] hover:bg-[#d026d5] whitespace-nowrap"
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Novo Tópico
        </Button>
      </div>

      {topicos.length === 0 ? (
        <EmptyState
          title="Nenhum tópico encontrado"
          description="Crie tópicos para as aulas do BomEstudo."
          buttonText="Criar Tópico"
          onClick={() => setIsCreating(true)}
          icon={<BookOpen className="h-6 w-6 text-gray-400" />}
        />
      ) : (
        <DataTable
          columns={columns}
          data={topicos}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Topicos;
