
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { User, UserPlus } from "lucide-react";
import {
  UserList,
  UserFilters,
  UserStats,
  Pagination,
  UserData,
  UserFiltersState,
  EditUserDialog,
  NewUserDialog,
  DeleteUserDialog,
  ChangePasswordDialog,
  SendMessageDialog,
  ViewHistoryDialog
} from "@/components/admin/users";

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
  const [filtros, setFiltros] = useState<UserFiltersState>({
    termoPesquisa: "",
    filtroStatus: "todos",
    filtroTipo: "todos"
  });
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

  // Paginação
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;
  const usuariosPaginados = usuariosFiltrados.slice(indiceInicial, indiceFinal);
  const totalPaginas = Math.ceil(usuariosFiltrados.length / itensPorPagina);
  
  // Funções para manipulação de usuários
  const selecionarUsuario = (usuario: UserData) => {
    setUsuarioSelecionado(usuario);
  };
  
  const alterarStatusUsuario = (id: string, novoStatus: "ativo" | "inativo") => {
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
      tipo: novoUsuario.tipo as "aluno" | "professor" | "administrador" || "aluno",
      status: novoUsuario.status as "ativo" | "inativo" || "ativo",
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

  // Filtragem de usuários
  const filtrarUsuarios = () => {
    let resultado = [...usuarios];
    
    // Filtrar por termo de pesquisa
    if (filtros.termoPesquisa) {
      resultado = resultado.filter(
        usuario => 
          usuario.nome.toLowerCase().includes(filtros.termoPesquisa.toLowerCase()) ||
          usuario.email.toLowerCase().includes(filtros.termoPesquisa.toLowerCase())
      );
    }
    
    // Filtrar por status
    if (filtros.filtroStatus !== "todos") {
      resultado = resultado.filter(usuario => usuario.status === filtros.filtroStatus);
    }
    
    // Filtrar por tipo
    if (filtros.filtroTipo !== "todos") {
      resultado = resultado.filter(usuario => usuario.tipo === filtros.filtroTipo);
    }
    
    setUsuariosFiltrados(resultado);
    setPaginaAtual(1); // Voltar para a primeira página ao filtrar
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[#272f3c]">Usuários</h1>
        <p className="text-[#67748a]">Gerenciamento de usuários do sistema</p>
      </div>
      
      {/* Estatísticas */}
      <UserStats usuarios={usuarios} />
      
      {/* Barra de ferramentas */}
      <UserFilters 
        filtros={filtros}
        onChangeTermoPesquisa={(termo) => setFiltros({...filtros, termoPesquisa: termo})}
        onChangeFiltroStatus={(status) => setFiltros({...filtros, filtroStatus: status})}
        onChangeFiltroTipo={(tipo) => setFiltros({...filtros, filtroTipo: tipo})}
        onFilterSubmit={filtrarUsuarios}
        onAddNewUser={() => setDialogNovoUsuario(true)}
      />
      
      {/* Tabela de usuários */}
      <UserList 
        usuarios={usuariosPaginados}
        onEdit={(usuario) => {
          selecionarUsuario(usuario);
          setDialogEditarUsuario(true);
        }}
        onChangePassword={(usuario) => {
          selecionarUsuario(usuario);
          setDialogAlterarSenha(true);
        }}
        onSendMessage={(usuario) => {
          selecionarUsuario(usuario);
          setDialogEnviarMensagem(true);
        }}
        onViewHistory={(usuario) => {
          selecionarUsuario(usuario);
          setDialogVerHistorico(true);
        }}
        onChangeStatus={alterarStatusUsuario}
        onDelete={(usuario) => {
          selecionarUsuario(usuario);
          setDialogExcluirUsuario(true);
        }}
      />
      
      {/* Paginação */}
      {usuariosFiltrados.length > 0 && (
        <Pagination
          paginaAtual={paginaAtual}
          totalPaginas={totalPaginas}
          indiceInicial={indiceInicial}
          indiceFinal={indiceFinal}
          totalItens={usuariosFiltrados.length}
          onPageChange={setPaginaAtual}
        />
      )}
      
      {/* Diálogos */}
      <EditUserDialog
        open={dialogEditarUsuario}
        onOpenChange={setDialogEditarUsuario}
        usuario={usuarioSelecionado}
        onUpdateUsuario={atualizarUsuario}
        onChangeUsuario={setUsuarioSelecionado}
      />
      
      <NewUserDialog
        open={dialogNovoUsuario}
        onOpenChange={setDialogNovoUsuario}
        novoUsuario={novoUsuario}
        onChangeNovoUsuario={setNovoUsuario}
        onSalvarNovoUsuario={salvarNovoUsuario}
      />
      
      <DeleteUserDialog
        open={dialogExcluirUsuario}
        onOpenChange={setDialogExcluirUsuario}
        usuario={usuarioSelecionado}
        onDelete={excluirUsuario}
      />

      <ChangePasswordDialog
        open={dialogAlterarSenha}
        onOpenChange={setDialogAlterarSenha}
        usuario={usuarioSelecionado}
        onChangePassword={alterarSenha}
      />

      <SendMessageDialog
        open={dialogEnviarMensagem}
        onOpenChange={setDialogEnviarMensagem}
        usuario={usuarioSelecionado}
        onSendMessage={enviarMensagem}
      />

      <ViewHistoryDialog
        open={dialogVerHistorico}
        onOpenChange={setDialogVerHistorico}
        usuario={usuarioSelecionado}
      />
    </div>
  );
};

export default Usuarios;
