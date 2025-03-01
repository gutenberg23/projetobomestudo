
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { FormLayout } from "@/components/admin/FormLayout";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollText, Search, PlusCircle, CalendarRange, Clock, HelpCircle, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

// Dados fictícios
const MOCK_SIMULADOS = [
  {
    id: 1,
    titulo: "Simulado OAB 1ª Fase",
    curso: "Preparatório OAB",
    questoes: 80,
    duracao: "5 horas",
    status: "Ativo",
    dataInicio: "10/06/2023",
  },
  {
    id: 2,
    titulo: "Simulado Concurso TRF",
    curso: "Preparatório TRF",
    questoes: 60,
    duracao: "4 horas",
    status: "Inativo",
    dataInicio: "15/06/2023",
  },
  {
    id: 3,
    titulo: "Simulado ENEM Completo",
    curso: "ENEM 2023",
    questoes: 180,
    duracao: "5 horas",
    status: "Ativo",
    dataInicio: "20/06/2023",
  },
];

const Simulados = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [simulados, setSimulados] = useState(MOCK_SIMULADOS);
  const [showQuestoesList, setShowQuestoesList] = useState(false);

  const handleEdit = (simulado: any) => {
    setIsEditing(true);
    // Aqui você carregaria os dados do simulado para edição
  };

  const handleDelete = (simulado: any) => {
    // Implementar lógica de exclusão
    setSimulados(simulados.filter((s) => s.id !== simulado.id));
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
      header: "Curso",
      accessorKey: "curso",
    },
    {
      header: "Questões",
      accessorKey: "questoes",
      cell: (value: number) => (
        <span>{value} questões</span>
      ),
    },
    {
      header: "Duração",
      accessorKey: "duracao",
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
      header: "Data de Início",
      accessorKey: "dataInicio",
    },
  ];

  if (isCreating || isEditing) {
    return (
      <FormLayout
        title={isEditing ? "Editar Simulado" : "Novo Simulado"}
        onCancel={() => {
          setIsCreating(false);
          setIsEditing(false);
        }}
        onSubmit={handleFormSubmit}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 md:col-span-2">
              <Label htmlFor="titulo">Título do Simulado</Label>
              <Input id="titulo" placeholder="Digite o título do simulado" />
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="curso">Curso</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o curso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oab">Preparatório OAB</SelectItem>
                  <SelectItem value="trf">Preparatório TRF</SelectItem>
                  <SelectItem value="enem">ENEM 2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="duracao">Duração</Label>
              <Input id="duracao" placeholder="Ex: 5 horas" />
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="dataInicio">Data de Início</Label>
              <Input id="dataInicio" type="date" />
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="horaInicio">Hora de Início</Label>
              <Input id="horaInicio" type="time" />
            </div>
            
            <div className="space-y-4 md:col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea id="descricao" placeholder="Digite uma descrição para o simulado" />
            </div>
            
            <div className="space-y-4 md:col-span-2">
              <Label htmlFor="instrucoes">Instruções</Label>
              <Textarea id="instrucoes" placeholder="Digite instruções para os candidatos" />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowQuestoesList(!showQuestoesList)}
              className="w-full justify-between"
            >
              <span>Questões do Simulado</span>
              {showQuestoesList ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            {showQuestoesList && (
              <div className="border rounded-md p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Questões Selecionadas: 0</span>
                  <Button type="button" variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Questões
                  </Button>
                </div>
                
                <div className="text-center p-8 text-gray-500">
                  <HelpCircle className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  <p>Nenhuma questão adicionada ao simulado</p>
                  <p className="text-sm mt-1">Clique em "Adicionar Questões" para selecionar questões</p>
                </div>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <Label htmlFor="ativoSimulado" className="cursor-pointer">Ativar Simulado</Label>
            <Switch id="ativoSimulado" />
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
            placeholder="Pesquisar simulados..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-[#ea2be2] hover:bg-[#d026d5] whitespace-nowrap"
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Novo Simulado
        </Button>
      </div>

      {simulados.length === 0 ? (
        <EmptyState
          title="Nenhum simulado encontrado"
          description="Crie simulados para os alunos testarem seus conhecimentos."
          buttonText="Criar Simulado"
          onClick={() => setIsCreating(true)}
          icon={<ScrollText className="h-6 w-6 text-gray-400" />}
        />
      ) : (
        <DataTable
          columns={columns}
          data={simulados}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Simulados;
