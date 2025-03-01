
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { FormLayout } from "@/components/admin/FormLayout";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquareText, Search, PlusCircle, ExternalLink, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Dados fictícios
const MOCK_ANUNCIOS = [
  {
    id: 1,
    titulo: "Curso Preparatório OAB",
    posicao: "Topo",
    tipo: "Banner",
    status: "Ativo",
    inicioExibicao: "01/06/2023",
    fimExibicao: "30/06/2023",
  },
  {
    id: 2,
    titulo: "Desconto em Material Complementar",
    posicao: "Lateral",
    tipo: "Retângulo",
    status: "Inativo",
    inicioExibicao: "15/05/2023",
    fimExibicao: "15/06/2023",
  },
  {
    id: 3,
    titulo: "Pré-venda Curso ENEM 2023",
    posicao: "Rodapé",
    tipo: "Banner",
    status: "Ativo",
    inicioExibicao: "20/05/2023",
    fimExibicao: "20/07/2023",
  },
];

const Anuncios = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [anuncios, setAnuncios] = useState(MOCK_ANUNCIOS);

  const handleEdit = (anuncio: any) => {
    setIsEditing(true);
    // Aqui você carregaria os dados do anúncio para edição
  };

  const handleDelete = (anuncio: any) => {
    // Implementar lógica de exclusão
    setAnuncios(anuncios.filter((a) => a.id !== anuncio.id));
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
      header: "Posição",
      accessorKey: "posicao",
    },
    {
      header: "Tipo",
      accessorKey: "tipo",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (value: string) => (
        <div className="flex items-center">
          <span
            className={`w-2 h-2 rounded-full mr-2 ${
              value === "Ativo" ? "bg-green-500" : "bg-gray-400"
            }`}
          ></span>
          {value}
        </div>
      ),
    },
    {
      header: "Início",
      accessorKey: "inicioExibicao",
    },
    {
      header: "Fim",
      accessorKey: "fimExibicao",
    },
  ];

  if (isCreating || isEditing) {
    return (
      <FormLayout
        title={isEditing ? "Editar Anúncio" : "Novo Anúncio"}
        onCancel={() => {
          setIsCreating(false);
          setIsEditing(false);
        }}
        onSubmit={handleFormSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 md:col-span-2">
            <Label htmlFor="titulo">Título</Label>
            <Input id="titulo" placeholder="Digite o título do anúncio" />
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="posicao">Posição</Label>
            <Select defaultValue="topo">
              <SelectTrigger>
                <SelectValue placeholder="Selecione a posição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="topo">Topo</SelectItem>
                <SelectItem value="lateral">Lateral</SelectItem>
                <SelectItem value="rodape">Rodapé</SelectItem>
                <SelectItem value="entreConteudo">Entre conteúdo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="tipo">Tipo</Label>
            <Select defaultValue="banner">
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="banner">Banner</SelectItem>
                <SelectItem value="retangulo">Retângulo</SelectItem>
                <SelectItem value="popup">Pop-up</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="inicioExibicao">Início de Exibição</Label>
            <Input id="inicioExibicao" type="date" />
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="fimExibicao">Fim de Exibição</Label>
            <Input id="fimExibicao" type="date" />
          </div>
          
          <div className="space-y-4 md:col-span-2">
            <Label htmlFor="url">URL de Destino</Label>
            <div className="flex">
              <Input id="url" placeholder="https://..." className="rounded-r-none" />
              <Button variant="outline" className="rounded-l-none border-l-0">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-4 md:col-span-2">
            <Label>Imagem do Anúncio</Label>
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
          
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="status" className="cursor-pointer">Ativar Anúncio</Label>
              <Switch id="status" />
            </div>
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
            placeholder="Pesquisar anúncios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-[#ea2be2] hover:bg-[#d026d5] whitespace-nowrap"
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Novo Anúncio
        </Button>
      </div>

      {anuncios.length === 0 ? (
        <EmptyState
          title="Nenhum anúncio encontrado"
          description="Crie seu primeiro anúncio para exibir no BomEstudo."
          buttonText="Criar Anúncio"
          onClick={() => setIsCreating(true)}
          icon={<MessageSquareText className="h-6 w-6 text-gray-400" />}
        />
      ) : (
        <DataTable
          columns={columns}
          data={anuncios}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Anuncios;
