
import React from "react";
import {
  UserList,
  UserFilters,
  UserStats,
  Pagination,
  EditUserDialog,
  NewUserDialog,
  DeleteUserDialog,
  ChangePasswordDialog,
  SendMessageDialog,
  ViewHistoryDialog,
  UserNotesDialog
} from "@/components/admin/users";
import { useUsersState } from "@/components/admin/users/hooks/useUsersState";
import { useUserActions } from "@/components/admin/users/hooks/useUserActions";

const Usuarios = () => {
  const state = useUsersState();
  const {
    usuariosPaginados,
    usuariosFiltrados,
    filtros,
    paginaAtual,
    totalPaginas,
    indiceInicial,
    indiceFinal,
    usuarios,
    isLoading,
    dialogEditarUsuario,
    dialogNovoUsuario,
    dialogExcluirUsuario,
    dialogAlterarSenha,
    dialogEnviarMensagem,
    dialogVerHistorico,
    dialogNotasUsuario,
    usuarioSelecionado,
    novoUsuario,
    setFiltros,
    setPaginaAtual,
    setDialogNovoUsuario,
    setDialogEditarUsuario,
    setDialogAlterarSenha,
    setDialogEnviarMensagem,
    setDialogVerHistorico,
    setDialogNotasUsuario,
    setDialogExcluirUsuario,
    setUsuarioSelecionado,
    setNovoUsuario
  } = state;

  const {
    selecionarUsuario,
    alterarStatusUsuario,
    excluirUsuario,
    salvarNovoUsuario,
    atualizarUsuario,
    enviarMensagem,
    alterarSenha,
    filtrarUsuarios
  } = useUserActions(state);

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
        isLoading={isLoading}
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
        onViewNotes={(usuario) => {
          selecionarUsuario(usuario);
          setDialogNotasUsuario(true);
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

      <UserNotesDialog
        open={dialogNotasUsuario}
        onOpenChange={setDialogNotasUsuario}
        usuario={usuarioSelecionado}
      />
    </div>
  );
};

export default Usuarios;
