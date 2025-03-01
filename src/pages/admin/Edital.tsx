
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { FormLayout } from "@/components/admin/FormLayout";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutList, Search, PlusCircle, ChevronDown, ChevronUp, Plus, GripVertical } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Dados fictícios
const MOCK_EDITAIS = [
  {
    id: 1,
    titulo: "Edital TCU 2023",
    curso: "Preparatório TCU",
    categorias: 8,
    itens: 42,
    ultimaAtualizacao: "01/05/2023",
  },
  {
    id: 2,
    titulo: "Edital TRF 2023",
    curso: "Preparatório TRF",
    categorias: 10,
    itens: 56,
    ultimaAtualizacao: "15/04/2023",
  },
  {
    id: 3,
    titulo: "Edital INSS 2023",
    curso: "Preparatório INSS",
    categorias: 6,
    itens: 38,
    ultimaAtualizacao: "20/04/2023",
  },
];

const Edital = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editais, setEditais] = useState(MOCK_EDITAIS);
  const [categorias, setCategorias] = useState([
    { titulo: "Conhecimentos Básicos", expandido: true, items: [
      "Língua Portuguesa",
      "Raciocínio Lógico",
      "Direito Constitucional"
    ] },
    { titulo: "Conhecimentos Específicos", expandido: false, items: [
      "Auditoria Governamental",
      "Contabilidade Pública"
    ] }
  ]);

  const handleEdit = (edital: any) => {
    setIsEditing(true);
    // Aqui você carregaria os dados do edital para edição
  };

  const handleDelete = (edital: any) => {
    // Implementar lógica de exclusão
    setEditais(editais.filter((e) => e.id !== edital.id));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar lógica de envio do formulário
    setIsCreating(false);
    setIsEditing(false);
  };

  const handleAddCategoria = () => {
    setCategorias([...categorias, { titulo: "Nova Categoria", expandido: true, items: [] }]);
  };

  const handleAddItem = (categoriaIndex: number) => {
    const newCategorias = [...categorias];
    newCategorias[categoriaIndex].items.push("Novo Item");
    setCategorias(newCategorias);
  };

  const handleToggleCategoria = (index: number) => {
    const newCategorias = [...categorias];
    newCategorias[index].expandido = !newCategorias[index].expandido;
    setCategorias(newCategorias);
  };

  const columns = [
    {
      header: "Título",
      accessorKey: "titulo",
    },
    {
      header: "Curso",
      accessorKey: "curso",
    },
    {
      header: "Categorias",
      accessorKey: "categorias",
      cell: (value: number) => (
        <span>{value} categorias</span>
      ),
    },
    {
      header: "Itens",
      accessorKey: "itens",
      cell: (value: number) => (
        <span>{value} itens</span>
      ),
    },
    {
      header: "Última Atualização",
      accessorKey: "ultimaAtualizacao",
    },
  ];

  if (isCreating || isEditing) {
    return (
      <FormLayout
        title={isEditing ? "Editar Edital Verticalizado" : "Novo Edital Verticalizado"}
        onCancel={() => {
          setIsCreating(false);
          setIsEditing(false);
        }}
        onSubmit={handleFormSubmit}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 md:col-span-2">
              <Label htmlFor="titulo">Título do Edital</Label>
              <Input id="titulo" placeholder="Digite o título do edital" />
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="curso">Curso</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o curso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tcu">Preparatório TCU</SelectItem>
                  <SelectItem value="trf">Preparatório TRF</SelectItem>
                  <SelectItem value="inss">Preparatório INSS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="orgao">Órgão</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o órgão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tcu">TCU</SelectItem>
                  <SelectItem value="trf">TRF</SelectItem>
                  <SelectItem value="inss">INSS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4 md:col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea id="descricao" placeholder="Digite uma descrição para o edital" />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Estrutura do Edital</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddCategoria}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar Categoria
              </Button>
            </div>
            
            <div className="space-y-4">
              {categorias.map((categoria, cIndex) => (
                <div key={cIndex} className="border rounded-md overflow-hidden">
                  <div 
                    className="flex items-center gap-2 p-3 bg-gray-50 cursor-pointer"
                    onClick={() => handleToggleCategoria(cIndex)}
                  >
                    <GripVertical className="h-5 w-5 text-gray-400" />
                    <Input 
                      value={categoria.titulo} 
                      onChange={(e) => {
                        const newCategorias = [...categorias];
                        newCategorias[cIndex].titulo = e.target.value;
                        setCategorias(newCategorias);
                      }}
                      className="flex-1 bg-transparent border-0 px-0 focus-visible:ring-0"
                      placeholder="Título da categoria"
                    />
                    <Button type="button" variant="ghost" size="icon">
                      {categoria.expandido ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                  
                  {categoria.expandido && (
                    <div className="p-3 space-y-2">
                      {categoria.items.map((item, iIndex) => (
                        <div key={iIndex} className="flex items-center gap-2 pl-6">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                          <Input 
                            value={item} 
                            onChange={(e) => {
                              const newCategorias = [...categorias];
                              newCategorias[cIndex].items[iIndex] = e.target.value;
                              setCategorias(newCategorias);
                            }}
                            className="flex-1"
                            placeholder="Item do edital"
                          />
                        </div>
                      ))}
                      
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="ml-6 text-[#ea2be2]"
                        onClick={() => handleAddItem(cIndex)}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Adicionar Item
                      </Button>
                    </div>
                  )}
                </div>
              ))}
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
            placeholder="Pesquisar editais..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-[#ea2be2] hover:bg-[#d026d5] whitespace-nowrap"
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Novo Edital
        </Button>
      </div>

      {editais.length === 0 ? (
        <EmptyState
          title="Nenhum edital encontrado"
          description="Crie editais verticalizados para os cursos do BomEstudo."
          buttonText="Criar Edital"
          onClick={() => setIsCreating(true)}
          icon={<LayoutList className="h-6 w-6 text-gray-400" />}
        />
      ) : (
        <DataTable
          columns={columns}
          data={editais}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Edital;
