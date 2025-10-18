import { useToast } from "@/hooks/use-toast";
import { UserData, UseUsersStateReturn, UserType } from "../types";
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
    setDialogEnviarMensagem,
    setDialogNovoUsuario,
    setUsuarioSelecionado,
    novoUsuario,
    filtros,
    setPaginaAtual
  } = state;

  const selecionarUsuario = (usuario: UserData) => {
    setUsuarioSelecionado(usuario);
  };
  
  const alterarStatus = async (id: string, novoStatus: "ativo" | "inativo") => {
    try {
      // Verificar se o usuário atual é administrador
      const { data: { user } } = await supabase.auth.getUser();
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('nivel')
        .eq('id', user?.id)
        .single();

      if (!currentUserProfile || currentUserProfile.nivel !== 'admin') {
        throw new Error('Apenas administradores podem alterar o status dos usuários');
      }

      // Atualizar na tabela profiles
      const { error: profilesError } = await supabase
        .from('profiles')
        .update({ 
          status: novoStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (profilesError) throw profilesError;

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
        description: error instanceof Error ? error.message : "Não foi possível alterar o status do usuário. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  const excluirUsuario = async () => {
    if (!usuarioSelecionado) return;
    
    const userId = usuarioSelecionado.id;
    
    try {
      // Chamar Edge Function para excluir usuário com service role
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      // Atualizar na interface
      setUsuarios(usuarios.filter(usuario => usuario.id !== userId));
      setUsuariosFiltrados(usuariosFiltrados.filter(usuario => usuario.id !== userId));
      
      setDialogExcluirUsuario(false);
      
      toast({
        title: "Usuário excluído",
        description: "O usuário foi removido permanentemente do sistema.",
      });
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível excluir o usuário. Tente novamente.",
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
      // Verificar se o usuário atual é administrador
      const { data: { user } } = await supabase.auth.getUser();
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('nivel')
        .eq('id', user?.id)
        .single();

      if (!currentUserProfile || currentUserProfile.nivel !== 'admin') {
        throw new Error('Apenas administradores podem criar novos usuários');
      }

      // Mapear tipo para nivel e role
      const nivelMap = {
        'aluno': 'usuario',
        'professor': 'professor',
        'administrador': 'admin',
        'assistente': 'assistente',
        'jornalista': 'usuario'
      };

      const roleMap = {
        'aluno': 'aluno',
        'professor': 'professor',
        'administrador': 'admin',
        'assistente': 'assistente',
        'jornalista': 'jornalista'
      };

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

      // Preparar dados básicos do usuário
      const baseUserData = {
        id: data.user.id,
        email: novoUsuario.email,
        nome: novoUsuario.nome,
        nivel: nivelMap[novoUsuario.tipo || 'aluno'], // Converter tipo para nivel usando o mapa
        status: novoUsuario.status || 'ativo',
        role: roleMap[novoUsuario.tipo || 'aluno'], // Converter tipo para role usando o mapa
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Inserir na tabela profiles
      const { error: profilesError } = await supabase
        .from('profiles')
        .insert([baseUserData]);
      
      if (profilesError) throw profilesError;

      // Adicionar o novo usuário à lista
      const novoUsuarioData: UserData = {
        id: data.user.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        tipo: novoUsuario.tipo || 'aluno',
        status: novoUsuario.status || 'ativo',
        dataCadastro: new Date().toLocaleDateString('pt-BR'),
        ultimoLogin: '-',
        fotoPerfil: '',
        assinante: false,
        inicioAssinatura: '',
        terminoAssinatura: ''
      };
      
      setUsuarios([...usuarios, novoUsuarioData]);
      setUsuariosFiltrados([...usuariosFiltrados, novoUsuarioData]);
      setDialogNovoUsuario(false);
      
      toast({
        title: "Usuário criado",
        description: "Novo usuário criado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível criar o usuário. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  const formatarData = (data: string | null): string => {
    if (!data) return '';
    
    try {
      // Se já estiver no formato yyyy-MM-dd, não é necessário converter
      if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        return data;
      }
      
      // Se contiver T, é um formato ISO completo, então pegamos apenas a parte da data
      if (data.includes('T')) {
        return data.split('T')[0];
      }
      
      // Tenta converter a data para o formato esperado
      const dateObj = new Date(data);
      if (isNaN(dateObj.getTime())) {
        console.error('Data inválida:', data);
        return '';
      }
      
      // Formato yyyy-MM-dd
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error('Erro ao formatar data:', e);
      return '';
    }
  };

  const atualizarUsuario = async () => {
    if (!usuarioSelecionado) return;
    
    try {
      // Verificar se o usuário atual é administrador
      const { data: { user } } = await supabase.auth.getUser();
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('nivel')
        .eq('id', user?.id)
        .single();

      if (!currentUserProfile || currentUserProfile.nivel !== 'admin') {
        throw new Error('Apenas administradores podem editar usuários');
      }

      // Mapear tipo para nivel e role
      const nivelMap = {
        'aluno': 'usuario',
        'professor': 'professor',
        'administrador': 'admin',
        'assistente': 'assistente',
        'jornalista': 'usuario'
      };

      const roleMap = {
        'aluno': 'aluno',
        'professor': 'professor',
        'administrador': 'admin',
        'assistente': 'assistente',
        'jornalista': 'jornalista'
      };

      // Preparar dados do usuário
      const userData: {
        nome: string;
        nivel: string;
        role: string;
        status: string;
        updated_at: string;
        assinante: boolean;
        inicio_assinatura?: string;
        termino_assinatura?: string;
      } = {
        nome: usuarioSelecionado.nome,
        nivel: nivelMap[usuarioSelecionado.tipo],
        role: roleMap[usuarioSelecionado.tipo],
        status: usuarioSelecionado.status,
        updated_at: new Date().toISOString(),
        assinante: usuarioSelecionado.assinante || false
      };

      // Adicionar datas de assinatura apenas se o usuário for assinante e as datas existirem
      if (usuarioSelecionado.assinante) {
        if (usuarioSelecionado.inicioAssinatura && usuarioSelecionado.inicioAssinatura !== '') {
          userData.inicio_assinatura = formatarData(usuarioSelecionado.inicioAssinatura);
          // Verificação adicional para garantir formato correto
          if (userData.inicio_assinatura && !/^\d{4}-\d{2}-\d{2}$/.test(userData.inicio_assinatura)) {
            console.error('Formato de data inválido para inicio_assinatura:', userData.inicio_assinatura);
            delete userData.inicio_assinatura;
          }
        }
        if (usuarioSelecionado.terminoAssinatura && usuarioSelecionado.terminoAssinatura !== '') {
          userData.termino_assinatura = formatarData(usuarioSelecionado.terminoAssinatura);
          // Verificação adicional para garantir formato correto
          if (userData.termino_assinatura && !/^\d{4}-\d{2}-\d{2}$/.test(userData.termino_assinatura)) {
            console.error('Formato de data inválido para termino_assinatura:', userData.termino_assinatura);
            delete userData.termino_assinatura;
          }
        }
      }

      // Remover campos vazios para evitar erro no banco
      const cleanUserData = Object.fromEntries(
        Object.entries(userData).filter(([_, value]) => value !== '')
      );

      // Atualizar na tabela profiles
      const { error: profilesError } = await supabase
        .from('profiles')
        .update(cleanUserData)
        .eq('id', usuarioSelecionado.id);
      
      if (profilesError) throw profilesError;

      // Buscar dados atualizados do usuário
      const { data: perfilAtualizado, error: perfilError2 } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', usuarioSelecionado.id)
        .single();
      
      if (perfilError2) throw perfilError2;

      if (perfilAtualizado) {
        // Determinar o tipo baseado no nivel ou role
        let tipoAtualizado: UserType = 'aluno';
        
        if (perfilAtualizado.nivel === 'assistente' || perfilAtualizado.role === 'assistente') {
          tipoAtualizado = 'assistente';
        } else if (perfilAtualizado.nivel === 'admin' || perfilAtualizado.role === 'admin') {
          tipoAtualizado = 'administrador';
        } else if (perfilAtualizado.nivel === 'professor' || perfilAtualizado.role === 'professor') {
          tipoAtualizado = 'professor';
        } else if (perfilAtualizado.role === 'jornalista') {
          tipoAtualizado = 'jornalista';
        } else if (perfilAtualizado.nivel === 'usuario' || perfilAtualizado.role === 'aluno') {
          tipoAtualizado = 'aluno';
        }
        
        // Atualizar na interface apenas o usuário modificado
        const novosUsuarios = usuarios.map(usuario => 
          usuario.id === usuarioSelecionado.id ? {
            ...usuario,
            nome: perfilAtualizado.nome || '',
            tipo: tipoAtualizado,
            status: perfilAtualizado.status as UserData['status'] || 'ativo',
            assinante: perfilAtualizado.assinante || false,
            inicioAssinatura: perfilAtualizado.inicio_assinatura || '',
            terminoAssinatura: perfilAtualizado.termino_assinatura || ''
          } : usuario
        );
        
        setUsuarios(novosUsuarios);
        setUsuariosFiltrados(
          usuariosFiltrados.map(usuario => 
            usuario.id === usuarioSelecionado.id ? {
              ...usuario,
              nome: perfilAtualizado.nome || '',
              tipo: tipoAtualizado,
              status: perfilAtualizado.status as UserData['status'] || 'ativo',
              assinante: perfilAtualizado.assinante || false,
              inicioAssinatura: perfilAtualizado.inicio_assinatura || '',
              terminoAssinatura: perfilAtualizado.termino_assinatura || ''
            } : usuario
          )
        );
      }
      
      setDialogEditarUsuario(false);
      
      toast({
        title: "Usuário atualizado",
        description: "Dados do usuário atualizados com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível atualizar o usuário. Tente novamente.",
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
    alterarStatus,
    excluirUsuario,
    salvarNovoUsuario,
    atualizarUsuario,
    enviarMensagem,
    filtrarUsuarios
  };
};
