
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { FormLayout } from "@/components/admin/FormLayout";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, PlusCircle, UserPlus, Mail, Phone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Dados fictícios
const MOCK_USUARIOS = [
  {
    id: 1,
    nome: "João Silva",
    email: "joao.silva@email.com",
    nivel: "Premium",
    ultimoAcesso: "12/05/2023",
    status: "Ativo",
    progressoGeral: "78%",
  },
  {
    id: 2,
    nome: "Maria Oliveira",
    email: "maria.oliveira@email.com",
    nivel: "Básico",
    ultimoAcesso: "10/05/2023",
    status: "Ativo",
    progressoGeral: "45%",
  },
  {
    id: 3,
    nome: "Pedro Santos",
    email: "pedro.santos@email.com",
    nivel: "Premium",
    ultimoAcesso: "05/05/2023",
    status: "Inativo",
    progressoGeral: "92%",
  },
];

const Usuarios = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [usuarios, setUsuarios] = useState(MOCK_USUARIOS);
  const [activeTab, setActiveTab] = useState("todos");

  const handleEdit = (usuario: any) => {
    setIsEditing(true);
    // Aqui você carregaria os dados do usuário para edição
  };

  const handleDelete = (usuario: any) => {
    // Implementar lógica de exclusão
    setUsuarios(usuarios.filter((u) => u.id !== usuario.id));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar lógica de envio do formulário
    setIsCreating(false);
    setIsEditing(false);
  };

  const columns = [
    {
      header: "Usuário",
      accessorKey: "nome",
      cell: (value: string) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{value.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{value}</span>
        </div>
      ),
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Nível",
      accessorKey: "nivel",
      cell: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === "Premium" ? "bg-[#fce7fc] text-[#ea2be2]" : "bg-blue-100 text-blue-700"
        }`}>
          {value}
        </span>
      ),
    },
    {
      header: "Último Acesso",
      accessorKey: "ultimoAcesso",
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
      header: "Progresso",
      accessorKey: "progressoGeral",
      cell: (value: string) => (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-[#ea2be2] h-2.5 rounded-full" 
            style={{ width: value }}
          ></div>
        </div>
      ),
    },
  ];

  if (isCreating || isEditing) {
    return (
      <FormLayout
        title={isEditing ? "Editar Usuário" : "Novo Usuário"}
        onCancel={() => {
          setIsCreating(false);
          setIsEditing(false);
        }}
        onSubmit={handleFormSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input id="nome" placeholder="Digite o nome completo" />
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="usuario@email.com" />
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" placeholder="(00) 00000-0000" />
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="nivel">Nível de Acesso</Label>
            <Select defaultValue="basico">
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basico">Básico</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {!isEditing && (
            <>
              <div className="space-y-4">
                <Label htmlFor="senha">Senha</Label>
                <Input id="senha" type="password" placeholder="********" />
              </div>
              
              <div className="space-y-4">
                <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                <Input id="confirmarSenha" type="password" placeholder="********" />
              </div>
            </>
          )}
          
          <div className="space-y-4 md:col-span-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea id="observacoes" placeholder="Observações sobre o usuário" />
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
            placeholder="Pesquisar usuários..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-[#ea2be2] hover:bg-[#d026d5] whitespace-nowrap"
        >
          <UserPlus className="h-4 w-4 mr-2" /> Novo Usuário
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="ativos">Ativos</TabsTrigger>
          <TabsTrigger value="inativos">Inativos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="todos" className="mt-0">
          {usuarios.length === 0 ? (
            <EmptyState
              title="Nenhum usuário encontrado"
              description="Adicione usuários ao sistema BomEstudo."
              buttonText="Adicionar Usuário"
              onClick={() => setIsCreating(true)}
              icon={<Users className="h-6 w-6 text-gray-400" />}
            />
          ) : (
            <DataTable
              columns={columns}
              data={usuarios}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </TabsContent>
        
        <TabsContent value="ativos" className="mt-0">
          <DataTable
            columns={columns}
            data={usuarios.filter(u => u.status === "Ativo")}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>
        
        <TabsContent value="inativos" className="mt-0">
          <DataTable
            columns={columns}
            data={usuarios.filter(u => u.status === "Inativo")}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Usuarios;
