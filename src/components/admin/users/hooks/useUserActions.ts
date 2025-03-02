
import { useToast } from "@/hooks/use-toast";
import { UserData, UseUsersStateReturn } from "../types";

export const useUserActions = (state: UseUsersStateReturn) => {
  const { toast } = useToast();
  const {
    usuarios,
    usuariosFiltrados,
    usuarioSelecionado,
    setUsuarios,
    setUsuariosFiltrados,
    setDialogEditarUsuario,
    setDialogExcluirUsuario,
    setDialogAlterarSenha,
    setDialogEnviarMensagem,
    setDialogVerHistorico,
    setDialogNovoUsuario,
    setUsuarioSelecionado,
    novoUsuario,
    setNovoUsuario,
    filtros,
    setPaginaAtual
  } = state;

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

  return {
    selecionarUsuario,
    alterarStatusUsuario,
    excluirUsuario,
    salvarNovoUsuario,
    atualizarUsuario,
    enviarMensagem,
    alterarSenha,
    filtrarUsuarios
  };
};
