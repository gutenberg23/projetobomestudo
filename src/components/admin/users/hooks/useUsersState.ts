
import { useState, useEffect } from "react";
import { UserData, UserFiltersState, UseUsersStateReturn } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useUsersState = (): UseUsersStateReturn => {
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<UserData[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const [dialogNotasUsuario, setDialogNotasUsuario] = useState(false);
  
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

  // Buscar usuários do Supabase
  useEffect(() => {
    const fetchUsuarios = async () => {
      setIsLoading(true);
      try {
        // Simular a busca de usuários já que não temos acesso admin
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
        
        if (profilesError) throw profilesError;
        
        // Transformar os dados dos perfis em usuários
        const usuariosCombinados = profiles.map(profile => {
          return {
            id: profile.id || '',
            nome: profile.nome || '',
            email: profile.email || '',
            tipo: (profile.tipo as UserData['tipo']) || 'aluno',
            status: (profile.status as UserData['status']) || 'ativo',
            dataCadastro: '2023-01-01', // Valor padrão
            ultimoLogin: profile.ultimo_login ? new Date(profile.ultimo_login).toLocaleString('pt-BR') : '-',
            fotoPerfil: profile.foto_perfil || '',
            assinante: profile.assinante || false,
            inicioAssinatura: profile.inicio_assinatura || '',
            terminoAssinatura: profile.termino_assinatura || ''
          };
        });
        
        setUsuarios(usuariosCombinados);
        setUsuariosFiltrados(usuariosCombinados);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os usuários. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsuarios();
  }, [toast]);

  // Paginação
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;
  const usuariosPaginados = usuariosFiltrados.slice(indiceInicial, indiceFinal);
  const totalPaginas = Math.ceil(usuariosFiltrados.length / itensPorPagina);

  return {
    usuarios,
    usuariosFiltrados,
    usuariosPaginados,
    isLoading,
    filtros,
    paginaAtual,
    totalPaginas,
    indiceInicial,
    indiceFinal,
    dialogEditarUsuario,
    dialogNovoUsuario,
    dialogExcluirUsuario,
    dialogAlterarSenha,
    dialogEnviarMensagem,
    dialogVerHistorico,
    dialogNotasUsuario,
    usuarioSelecionado,
    novoUsuario,
    itensPorPagina,
    setUsuarios,
    setUsuariosFiltrados,
    setFiltros,
    setPaginaAtual,
    setDialogEditarUsuario,
    setDialogNovoUsuario,
    setDialogExcluirUsuario,
    setDialogAlterarSenha,
    setDialogEnviarMensagem,
    setDialogVerHistorico,
    setDialogNotasUsuario,
    setUsuarioSelecionado,
    setNovoUsuario
  };
};
