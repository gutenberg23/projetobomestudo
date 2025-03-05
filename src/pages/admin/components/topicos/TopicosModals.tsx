
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
        onClose={() => setIsOpenEdit(false)}
        topico={currentTopico}
        onSave={handleEditTopico}
      />
      
      <DeleteTopicoModal
        isOpen={isOpenDelete}
        onClose={() => setIsOpenDelete(false)}
        topico={currentTopico}
        onDelete={handleDeleteTopico}
      />
    </>
  );
};
