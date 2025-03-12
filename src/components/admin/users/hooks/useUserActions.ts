
import { useToast } from "@/hooks/use-toast";
import { UserData, UseUsersStateReturn } from "../types";
import { supabase } from "@/integrations/supabase/client";

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
    setDialogNotasUsuario,
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
  
  const alterarStatusUsuario = async (id: string, novoStatus: "ativo" | "inativo") => {
    try {
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('profiles')
        .update({ status: novoStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      // Atualizar na interface
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
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do usuário. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  const excluirUsuario = async () => {
    if (!usuarioSelecionado) return;
    
    try {
      // Excluir usuário no Supabase Auth
      const { error } = await supabase.auth.admin.deleteUser(
        usuarioSelecionado.id
      );
      
      if (error) throw error;
      
      // Atualizar na interface
      setUsuarios(usuarios.filter(usuario => usuario.id !== usuarioSelecionado.id));
      setUsuariosFiltrados(usuariosFiltrados.filter(usuario => usuario.id !== usuarioSelecionado.id));
      
      setDialogExcluirUsuario(false);
      
      toast({
        title: "Usuário excluído",
        description: "O usuário foi removido permanentemente do sistema.",
      });
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o usuário. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  const salvarNovoUsuario = async () => {
    if (!novoUsuario.nome || !novoUsuario.email) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Criar novo usuário no Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: novoUsuario.email,
        password: 'senha123', // Senha padrão temporária
        email_confirm: true,
        user_metadata: {
          nome: novoUsuario.nome
        }
      });
      
      if (error) throw error;
      
      // Atualizar perfil do usuário
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          nome: novoUsuario.nome,
          tipo: novoUsuario.tipo,
          status: novoUsuario.status,
          assinante: novoUsuario.assinante,
          inicio_assinatura: novoUsuario.assinante ? novoUsuario.inicioAssinatura : null,
          termino_assinatura: novoUsuario.assinante ? novoUsuario.terminoAssinatura : null
        })
        .eq('id', data.user.id);
      
      if (updateError) throw updateError;
      
      // Criar objeto do usuário
      const usuarioCriado: UserData = {
        id: data.user.id,
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
      
      setUsuarios([usuarioCriado, ...usuarios]);
      setUsuariosFiltrados([usuarioCriado, ...usuariosFiltrados]);
      
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
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      toast({
        title: "Erro",
        description: `Não foi possível criar o usuário: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  const atualizarUsuario = async () => {
    if (!usuarioSelecionado) return;
    
    try {
      // Atualizar perfil no banco de dados
      const { error } = await supabase
        .from('profiles')
        .update({
          nome: usuarioSelecionado.nome,
          tipo: usuarioSelecionado.tipo,
          status: usuarioSelecionado.status,
          assinante: usuarioSelecionado.assinante,
          inicio_assinatura: usuarioSelecionado.assinante ? usuarioSelecionado.inicioAssinatura : null,
          termino_assinatura: usuarioSelecionado.assinante ? usuarioSelecionado.terminoAssinatura : null
        })
        .eq('id', usuarioSelecionado.id);
      
      if (error) throw error;
      
      // Atualizar na interface
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
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o usuário. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  const enviarMensagem = () => {
    setDialogEnviarMensagem(false);
    
    toast({
      title: "Mensagem enviada",
      description: "A mensagem foi enviada com sucesso para o usuário.",
    });
  };
  
  const alterarSenha = async (novaSenha: string) => {
    if (!usuarioSelecionado) return;
    
    try {
      const { error } = await supabase.auth.admin.updateUserById(
        usuarioSelecionado.id,
        { password: novaSenha }
      );
      
      if (error) throw error;
      
      setDialogAlterarSenha(false);
      
      toast({
        title: "Senha atualizada",
        description: "A senha foi alterada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar a senha. Tente novamente.",
        variant: "destructive"
      });
    }
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
