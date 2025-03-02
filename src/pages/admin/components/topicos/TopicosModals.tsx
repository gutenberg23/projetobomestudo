
import React from "react";
import { TopicosModalsProps } from "./TopicosTypes";
import { 
  CreateTopicoModal,
  EditTopicoModal,
  DeleteTopicoModal
} from "./modals";

export const TopicosModals: React.FC<TopicosModalsProps> = ({
  isOpenCreate,
  setIsOpenCreate,
  isOpenEdit,
  setIsOpenEdit,
  isOpenDelete,
  setIsOpenDelete,
  currentTopico,
  setCurrentTopico,
  newTopico,
  setNewTopico,
  newQuestaoId,
  setNewQuestaoId,
  editQuestaoId,
  setEditQuestaoId,
  handleCreateTopico,
  handleEditTopico,
  handleDeleteTopico,
  addQuestaoId,
  removeQuestaoId,
  addQuestaoIdToEdit,
  removeQuestaoIdFromEdit,
  handleThumbnailUpload,
  disciplinas
}) => {
  return (
    <>
      <CreateTopicoModal
        isOpen={isOpenCreate}
        setIsOpen={setIsOpenCreate}
        newTopico={newTopico}
        setNewTopico={setNewTopico}
        newQuestaoId={newQuestaoId}
        setNewQuestaoId={setNewQuestaoId}
        handleCreateTopico={handleCreateTopico}
        addQuestaoId={addQuestaoId}
        removeQuestaoId={removeQuestaoId}
        handleThumbnailUpload={handleThumbnailUpload}
        disciplinas={disciplinas}
      />
      
      <EditTopicoModal
        isOpen={isOpenEdit}
        setIsOpen={setIsOpenEdit}
        currentTopico={currentTopico}
        setCurrentTopico={setCurrentTopico}
        editQuestaoId={editQuestaoId}
        setEditQuestaoId={setEditQuestaoId}
        handleEditTopico={handleEditTopico}
        addQuestaoIdToEdit={addQuestaoIdToEdit}
        removeQuestaoIdFromEdit={removeQuestaoIdFromEdit}
        handleThumbnailUpload={handleThumbnailUpload}
        disciplinas={disciplinas}
      />
      
      <DeleteTopicoModal
        isOpen={isOpenDelete}
        setIsOpen={setIsOpenDelete}
        currentTopico={currentTopico}
        handleDeleteTopico={handleDeleteTopico}
      />
    </>
  );
};
