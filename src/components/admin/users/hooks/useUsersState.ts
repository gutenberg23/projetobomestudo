import { useState, useEffect } from "react";
import { UserData, UserFiltersState, UseUsersStateReturn, UserType } from "../types";
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
        // Buscar dados da tabela profiles que contém todas as informações
        const { data: perfis, error: perfilError } = await supabase
          .from('profiles')
          .select('*');
        
        if (perfilError) throw perfilError;
        
        // Transformar os dados dos perfis em usuários
        const usuariosCombinados: UserData[] = perfis.map(perfil => {
          // Determinar o tipo baseado no nivel ou role
          let tipo: UserType = 'aluno';
          
          if (perfil.nivel === 'assistente' || perfil.role === 'assistente') {
            tipo = 'assistente';
          } else if (perfil.nivel === 'admin' || perfil.role === 'admin') {
            tipo = 'administrador';
          } else if (perfil.nivel === 'professor' || perfil.role === 'professor') {
            tipo = 'professor';
          } else if (perfil.nivel === 'jornalista' || perfil.role === 'jornalista') {
            tipo = 'jornalista';
          } else if (perfil.nivel === 'usuario' || perfil.role === 'aluno') {
            tipo = 'aluno';
          }
          
          return {
            id: perfil.id || '',
            nome: perfil.nome || '',
            email: perfil.email || '',
            tipo,
            status: perfil.status as UserData['status'] || 'ativo',
            dataCadastro: perfil.created_at ? new Date(perfil.created_at).toLocaleDateString('pt-BR') : '-',
            ultimoLogin: perfil.ultimo_login ? new Date(perfil.ultimo_login).toLocaleString('pt-BR') : '-',
            fotoPerfil: perfil.foto_url || '',
            assinante: perfil.assinante || false,
            inicioAssinatura: perfil.inicio_assinatura || '',
            terminoAssinatura: perfil.termino_assinatura || ''
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
    setDialogEnviarMensagem,
    setDialogVerHistorico,
    setDialogNotasUsuario,
    setUsuarioSelecionado,
    setNovoUsuario
  };
};
