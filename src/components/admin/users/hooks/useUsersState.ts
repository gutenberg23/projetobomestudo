
import { useState } from "react";
import { UserData, UserFiltersState, UseUsersStateReturn } from "../types";

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

export const useUsersState = (): UseUsersStateReturn => {
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

  return {
    usuarios,
    usuariosFiltrados,
    usuariosPaginados,
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
    setUsuarioSelecionado,
    setNovoUsuario
  };
};
