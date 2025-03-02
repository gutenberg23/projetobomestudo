import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  UserPlus, 
  Filter, 
  Search, 
  Edit, 
  Trash2, 
  CheckSquare, 
  XSquare,
  Bell,
  Key,
  MailCheck,
  History,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

// Tipos
type UserType = "aluno" | "professor" | "administrador";
type UserStatus = "ativo" | "inativo";

interface UserData {
  id: string;
  nome: string;
  email: string;
  tipo: UserType;
  status: UserStatus;
  dataCadastro: string;
  ultimoLogin: string;
  fotoPerfil: string;
  assinante: boolean;
  inicioAssinatura: string;
  terminoAssinatura: string;
}

// Dados de exemplo para exibição
const usuariosExemplo: UserData[] = [
  {
    id: "1",
    nome: "João Silva",
    email: "joao.silva@exemplo.com",
    tipo: "aluno",
    status: "ativo",
    dataCadastro: "2023-01-15",
    ultimoLogin: "2023-05-10 14:30",
    fotoPerfil: "",
    assinante: true,
    inicioAssinatura: "2023-01-15",
    terminoAssinatura: "2024-01-15"
  },
  {
    id: "2",
    nome: "Maria Oliveira",
    email: "maria.oliveira@exemplo.com",
    tipo: "professor",
    status: "ativo",
    dataCadastro: "2022-11-05",
    ultimoLogin: "2023-05-12 09:15",
    fotoPerfil: "",
    assinante: true,
    inicioAssinatura: "2022-11-05",
    terminoAssinatura: "2023-11-05"
  },
  {
    id: "3",
    nome: "Carlos Ferreira",
    email: "carlos.ferreira@exemplo.com",
    tipo: "administrador",
    status: "ativo",
    dataCadastro: "2022-08-20",
    ultimoLogin: "2023-05-11 16:45",
    fotoPerfil: "",
    assinante: false,
    inicioAssinatura: "",
    terminoAssinatura: ""
  },
  {
    id: "4",
    nome: "Ana Beatriz",
    email: "ana.beatriz@exemplo.com",
    tipo: "aluno",
    status: "inativo",
    dataCadastro: "2023-02-10",
    ultimoLogin: "2023-04-25 11:20",
    fotoPerfil: "",
    assinante: false,
    inicioAssinatura: "",
    terminoAssinatura: ""
  },
  {
    id: "5",
    nome: "Pedro Santos",
    email: "pedro.santos@exemplo.com",
    tipo: "aluno",
    status: "ativo",
    dataCadastro: "2023-03-05",
    ultimoLogin: "2023-05-11 10:30",
    fotoPerfil: "",
    assinante: true,
    inicioAssinatura: "2023-03-05",
    terminoAssinatura: "2024-03-05"
  }
];

const Usuarios = () => {
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<UserData[]>(usuariosExemplo);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<UserData[]>(usuariosExemplo);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;
  
  // Estados para diálogos
  const [dialogEditarUsuario, setDialogEditarUsuario] = useState(false);
  const [dialogNovoUsuario, setDialogNovoUsuario] = useState(false);
  const [dialogExcluirUsuario, setDialogExcluirUsuario] = useState(false);
  const [dialogAlterarSenha, setDialogAlterarSenha] = useState(false);
  const [dialogEnviarMensagem, setDialogEnviarMensagem] = useState(false);
  const [dialogVerHistorico, setDialogVerHistorico] = useState(false);
  
  // Estado para armazenar usuário selecionado
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<UserData | null>(null);
  
  // Estado para formulário de novo usuário
  const [novoUsuario, setNovoUsuario] = useState<Partial<UserData>>({
    nome: "",
    email: "",
    tipo: "aluno",
    status: "ativo",
    assinante: false,
    inicioAssinatura: "",
    terminoAssinatura: ""
  });

  // Estado para estatísticas
  const totalUsuarios = usuarios.length;
  const usuariosAtivos = usuarios.filter(u => u.status === "ativo").length;
  const usuariosInativos = usuarios.filter(u => u.status === "inativo").length;
  
  // Filtragem de usuários
  const filtrarUsuarios = () => {
    let resultado = [...usuarios];
    
    // Filtrar por termo de pesquisa
    if (termoPesquisa) {
      resultado = resultado.filter(
        usuario => 
          usuario.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
          usuario.email.toLowerCase().includes(termoPesquisa.toLowerCase())
      );
    }
    
    // Filtrar por status
    if (filtroStatus !== "todos") {
      resultado = resultado.filter(usuario => usuario.status === filtroStatus);
    }
    
    // Filtrar por tipo
    if (filtroTipo !== "todos") {
      resultado = resultado.filter(usuario => usuario.tipo === filtroTipo);
    }
    
    setUsuariosFiltrados(resultado);
    setPaginaAtual(1); // Voltar para a primeira página ao filtrar
  };

  // Paginação
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;
  const usuariosPaginados = usuariosFiltrados.slice(indiceInicial, indiceFinal);
  const totalPaginas = Math.ceil(usuariosFiltrados.length / itensPorPagina);
  
  // Funções para manipulação de usuários
  const selecionarUsuario = (usuario: UserData) => {
    setUsuarioSelecionado(usuario);
  };
  
  const alterarStatusUsuario = (id: string, novoStatus: UserStatus) => {
    const novosUsuarios = usuarios.map(usuario => 
      usuario.id === id ? { ...usuario, status: novoStatus } : usuario
    );
    
    setUsuarios(novosUsuarios);
    setUsuariosFiltrados(
      usuariosFiltrados.map(usuario => 
        usuario.id === id ? { ...usuario, status: novoStatus } : usuario
      )
    );
    
    toast({
      title: "Status alterado",
      description: `Usuário ${novoStatus === "ativo" ? "ativado" : "desativado"} com sucesso!`,
    });
  };
  
  const excluirUsuario = () => {
    if (!usuarioSelecionado) return;
    
    const novosUsuarios = usuarios.filter(usuario => usuario.id !== usuarioSelecionado.id);
    setUsuarios(novosUsuarios);
    setUsuariosFiltrados(usuariosFiltrados.filter(usuario => usuario.id !== usuarioSelecionado.id));
    
    setDialogExcluirUsuario(false);
    
    toast({
      title: "Usuário excluído",
      description: "O usuário foi removido permanentemente do sistema.",
    });
  };
  
  const salvarNovoUsuario = () => {
    if (!novoUsuario.nome || !novoUsuario.email) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    const novoId = (parseInt(usuarios[usuarios.length - 1].id) + 1).toString();
    
    const usuarioCriado: UserData = {
      id: novoId,
      nome: novoUsuario.nome || "",
      email: novoUsuario.email || "",
      tipo: novoUsuario.tipo as UserType || "aluno",
      status: novoUsuario.status as UserStatus || "ativo",
      dataCadastro: new Date().toISOString().split('T')[0],
      ultimoLogin: "-",
      fotoPerfil: "",
      assinante: novoUsuario.assinante || false,
      inicioAssinatura: novoUsuario.inicioAssinatura || "",
      terminoAssinatura: novoUsuario.terminoAssinatura || ""
    };
    
    setUsuarios([...usuarios, usuarioCriado]);
    setUsuariosFiltrados([...usuariosFiltrados, usuarioCriado]);
    
    // Limpar formulário
    setNovoUsuario({
      nome: "",
      email: "",
      tipo: "aluno",
      status: "ativo",
      assinante: false,
      inicioAssinatura: "",
      terminoAssinatura: ""
    });
    
    setDialogNovoUsuario(false);
    
    toast({
      title: "Usuário criado",
      description: "Novo usuário adicionado com sucesso!",
    });
  };
  
  const atualizarUsuario = () => {
    if (!usuarioSelecionado) return;
    
    const novosUsuarios = usuarios.map(usuario => 
      usuario.id === usuarioSelecionado.id ? usuarioSelecionado : usuario
    );
    
    setUsuarios(novosUsuarios);
    setUsuariosFiltrados(
      usuariosFiltrados.map(usuario => 
        usuario.id === usuarioSelecionado.id ? usuarioSelecionado : usuario
      )
    );
    
    setDialogEditarUsuario(false);
    
    toast({
      title: "Usuário atualizado",
      description: "Os dados do usuário foram atualizados com sucesso!",
    });
  };
  
  const enviarMensagem = () => {
    setDialogEnviarMensagem(false);
    
    toast({
      title: "Mensagem enviada",
      description: "A mensagem foi enviada com sucesso para o usuário.",
    });
  };
  
  const alterarSenha = () => {
    setDialogAlterarSenha(false);
    
    toast({
      title: "Senha atualizada",
      description: "A senha foi alterada com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[#272f3c]">Usuários</h1>
        <p className="text-[#67748a]">Gerenciamento de usuários do sistema</p>
      </div>
      
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-[#272f3c] mb-2">Total de Usuários</h3>
          <p className="text-3xl font-bold text-[#ea2be2]">{totalUsuarios}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-[#272f3c] mb-2">Usuários Ativos</h3>
          <p className="text-3xl font-bold text-green-500">{usuariosAtivos}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-[#272f3c] mb-2">Usuários Inativos</h3>
          <p className="text-3xl font-bold text-red-500">{usuariosInativos}</p>
        </div>
      </div>
      
      {/* Barra de ferramentas */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Buscar por nome ou email..." 
            className="pl-10"
            value={termoPesquisa}
            onChange={(e) => setTermoPesquisa(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && filtrarUsuarios()}
          />
        </div>
        
        <div className="flex items-center">
          <Filter size={18} className="mr-2 text-[#67748a]" />
          <Select 
            value={filtroStatus} 
            onValueChange={(valor) => {
              setFiltroStatus(valor);
              setTimeout(filtrarUsuarios, 100);
            }}
          >
            <SelectTrigger className="w-[150px] h-10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="inativo">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center">
          <Select 
            value={filtroTipo} 
            onValueChange={(valor) => {
              setFiltroTipo(valor);
              setTimeout(filtrarUsuarios, 100);
            }}
          >
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="Tipo de usuário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="aluno">Alunos</SelectItem>
              <SelectItem value="professor">Professores</SelectItem>
              <SelectItem value="administrador">Administradores</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={() => filtrarUsuarios()} 
          variant="default" 
          className="bg-[#ea2be2] hover:bg-[#ea2be2]/90"
        >
          Filtrar
        </Button>
        
        <Button 
          onClick={() => setDialogNovoUsuario(true)} 
          className="ml-auto"
        >
          <UserPlus className="mr-2 h-4 w-4" /> Novo Usuário
        </Button>
      </div>
      
      {/* Tabela de usuários */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead>Último Login</TableHead>
              <TableHead>Assinante</TableHead>
              <TableHead>Início da Assinatura</TableHead>
              <TableHead>Término da Assinatura</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuariosPaginados.length > 0 ? (
              usuariosPaginados.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={usuario.fotoPerfil} />
                        <AvatarFallback className="bg-[#ea2be2] text-white">
                          {usuario.nome.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{usuario.nome}</div>
                        <div className="text-sm text-[#67748a]">{usuario.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      usuario.tipo === 'administrador' ? 'bg-purple-100 text-purple-800' :
                      usuario.tipo === 'professor' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {usuario.tipo === 'administrador' ? 'Admin' :
                       usuario.tipo === 'professor' ? 'Professor' : 'Aluno'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      usuario.status === 'ativo' ? 'bg-green-100 text-green-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {usuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell>{usuario.dataCadastro}</TableCell>
                  <TableCell>{usuario.ultimoLogin}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      usuario.assinante ? 'bg-green-100 text-green-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {usuario.assinante ? 'Sim' : 'Não'}
                    </span>
                  </TableCell>
                  <TableCell>{usuario.assinante ? usuario.inicioAssinatura : '-'}</TableCell>
                  <TableCell>{usuario.assinante ? usuario.terminoAssinatura : '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          selecionarUsuario(usuario);
                          setDialogEditarUsuario(true);
                        }}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          selecionarUsuario(usuario);
                          setDialogAlterarSenha(true);
                        }}
                      >
                        <Key size={16} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          selecionarUsuario(usuario);
                          setDialogEnviarMensagem(true);
                        }}
                      >
                        <Bell size={16} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          selecionarUsuario(usuario);
                          setDialogVerHistorico(true);
                        }}
                      >
                        <History size={16} />
                      </Button>
                      <Button 
                        variant={usuario.status === 'ativo' ? 'outline' : 'default'} 
                        size="sm" 
                        className={usuario.status === 'ativo' ? '' : 'bg-green-600 hover:bg-green-700'}
                        onClick={() => alterarStatusUsuario(usuario.id, usuario.status === 'ativo' ? 'inativo' : 'ativo')}
                      >
                        {usuario.status === 'ativo' ? <XSquare size={16} /> : <CheckSquare size={16} />}
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          selecionarUsuario(usuario);
                          setDialogExcluirUsuario(true);
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="text-center">
                    <User className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-lg font-medium text-[#272f3c]">Nenhum usuário encontrado</h3>
                    <p className="mt-1 text-sm text-[#67748a]">Não encontramos usuários com os filtros aplicados.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Paginação */}
      {usuariosFiltrados.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-[#67748a]">
            Mostrando <span className="font-medium">{indiceInicial + 1}</span> a <span className="font-medium">{Math.min(indiceFinal, usuariosFiltrados.length)}</span> de <span className="font-medium">{usuariosFiltrados.length}</span> resultados
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
              disabled={paginaAtual === 1}
            >
              <ChevronLeft size={16} />
            </Button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
              <Button
                key={pagina}
                variant={pagina === paginaAtual ? "default" : "outline"}
                size="sm"
                className={pagina === paginaAtual ? "bg-[#ea2be2] hover:bg-[#ea2be2]/90" : ""}
                onClick={() => setPaginaAtual(pagina)}
              >
                {pagina}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
              disabled={paginaAtual === totalPaginas}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
      
      {/* Diálogo: Editar usuário */}
      <Dialog open={dialogEditarUsuario} onOpenChange={setDialogEditarUsuario}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário
            </DialogDescription>
          </DialogHeader>
          {usuarioSelecionado && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input 
                  id="nome" 
                  value={usuarioSelecionado.nome} 
                  onChange={(e) => setUsuarioSelecionado({...usuarioSelecionado, nome: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={usuarioSelecionado.email} 
                  onChange={(e) => setUsuarioSelecionado({...usuarioSelecionado, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Usuário</Label>
                <Select 
                  value={usuarioSelecionado.tipo} 
                  onValueChange={(value: UserType) => 
                    setUsuarioSelecionado({...usuarioSelecionado, tipo: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aluno">Aluno</SelectItem>
                    <SelectItem value="professor">Professor</SelectItem>
                    <SelectItem value="administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="status">Status</Label>
                <Switch 
                  id="status" 
                  checked={usuarioSelecionado.status === 'ativo'} 
                  onCheckedChange={(checked) => 
                    setUsuarioSelecionado({...usuarioSelecionado, status: checked ? 'ativo' : 'inativo'})
                  }
                />
                <span className="text-sm text-[#67748a]">
                  {usuarioSelecionado.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="assinante">Assinante</Label>
                <Switch 
                  id="assinante" 
                  checked={usuarioSelecionado.assinante} 
                  onCheckedChange={(checked) => 
                    setUsuarioSelecionado({...usuarioSelecionado, assinante: checked})
                  }
                />
                <span className="text-sm text-[#67748a]">
                  {usuarioSelecionado.assinante ? 'Sim' : 'Não'}
                </span>
              </div>
              {usuarioSelecionado.assinante && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="inicioAssinatura">Início da Assinatura</Label>
                    <Input 
                      id="inicioAssinatura" 
                      type="date"
                      value={usuarioSelecionado.inicioAssinatura} 
                      onChange={(e) => setUsuarioSelecionado({...usuarioSelecionado, inicioAssinatura: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="terminoAssinatura">Término da Assinatura</Label>
                    <Input 
                      id="terminoAssinatura" 
                      type="date"
                      value={usuarioSelecionado.terminoAssinatura} 
                      onChange={(e) => setUsuarioSelecionado({...usuarioSelecionado, terminoAssinatura: e.target.value})}
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label>Permissões</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="conteudoPremium" />
                    <label htmlFor="conteudoPremium" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Acesso a conteúdo premium
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEditarUsuario(false)}>Cancelar</Button>
            <Button onClick={atualizarUsuario}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo: Novo usuário */}
      <Dialog open={dialogNovoUsuario} onOpenChange={setDialogNovoUsuario}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar um novo usuário
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input 
                id="nome" 
                value={novoUsuario.nome || ''} 
                onChange={(e) => setNovoUsuario({...novoUsuario, nome: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={novoUsuario.email || ''} 
                onChange={(e) => setNovoUsuario({...novoUsuario, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Usuário</Label>
              <Select 
                value={novoUsuario.tipo || 'aluno'} 
                onValueChange={(value: UserType) => 
                  setNovoUsuario({...novoUsuario, tipo: value})
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aluno">Aluno</SelectItem>
                  <SelectItem value="professor">Professor</SelectItem>
                  <SelectItem value="administrador">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="novoStatus">Status</Label>
              <Switch 
                id="novoStatus" 
                checked={novoUsuario.status === 'ativo'} 
                onCheckedChange={(checked) => 
                  setNovoUsuario({...novoUsuario, status: checked ? 'ativo' : 'inativo'})
                }
              />
              <span className="text-sm text-[#67748a]">
                {novoUsuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="novoAssinante">Assinante</Label>
              <Switch 
                id="novoAssinante" 
                checked={novoUsuario.assinante} 
                onCheckedChange={(checked) => 
                  setNovoUsuario({...novoUsuario, assinante: checked})
                }
              />
              <span className="text-sm text-[#67748a]">
                {novoUsuario.assinante ? 'Sim' : 'Não'}
              </span>
            </div>
            {novoUsuario.assinante && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="novoInicioAssinatura">Início da Assinatura</Label>
                  <Input 
                    id="novoInicioAssinatura" 
                    type="date"
                    value={novoUsuario.inicioAssinatura || ''} 
                    onChange={(e) => setNovoUsuario({...novoUsuario, inicioAssinatura: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="novoTerminoAssinatura">Término da Assinatura</Label>
                  <Input 
                    id="novoTerminoAssinatura" 
                    type="date"
                    value={novoUsuario.terminoAssinatura || ''} 
                    onChange={(e) => setNovoUsuario({...novoUsuario, terminoAssinatura: e.target.value})}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogNovoUsuario(false)}>Cancelar</Button>
            <Button onClick={salvarNovoUsuario}>Criar Usuário</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo: Excluir usuário */}
      <Dialog open={dialogExcluirUsuario} onOpenChange={setDialogExcluirUsuario}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Usuário</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Tem certeza que deseja continuar?
            </DialogDescription>
          </DialogHeader>
          {usuarioSelecionado && (
            <div className="py-4">
              <p className="text-center mb-4">
                Você está prestes a excluir o usuário:
              </p>
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Avatar>
                  <AvatarFallback className="bg-[#ea2be2] text-white">
                    {usuarioSelecionado.nome.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{usuarioSelecionado.nome}</div>
                  <div className="text-sm text-[#67748a]">{usuarioSelecionado.email}</div>
                </div>
              </div>
              <p className="text-sm text-center text-red-500">
                Todos os dados associados a este usuário serão permanentemente removidos.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogExcluirUsuario(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={excluirUsuario}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Usuarios;
