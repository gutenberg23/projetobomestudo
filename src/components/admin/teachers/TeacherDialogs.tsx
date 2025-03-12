
import React from "react";
import EditTeacherDialog from "./dialogs/EditTeacherDialog";
import DeleteTeacherDialog from "./dialogs/DeleteTeacherDialog";
import ViewTeacherDialog from "./dialogs/ViewTeacherDialog";
import NewTeacherDialog from "./dialogs/NewTeacherDialog";
import TeacherNotesDialog from "./dialogs/TeacherNotesDialog";
import { TeacherData } from "./types";

interface TeacherDialogsProps {
  editDialogOpen: boolean;
  deleteDialogOpen: boolean;
  detailsDialogOpen: boolean;
  newTeacherDialogOpen: boolean;
  notesDialogOpen: boolean;
  selectedTeacher: TeacherData | null;
  setEditDialogOpen: (open: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
  setDetailsDialogOpen: (open: boolean) => void;
  setNewTeacherDialogOpen: (open: boolean) => void;
  setNotesDialogOpen: (open: boolean) => void;
  updateTeacher: (teacher: TeacherData) => void;
  deleteTeacher: (id: string) => void;
  addTeacher: (teacher: Omit<TeacherData, 'id'>) => void;
}

export const TeacherDialogs: React.FC<TeacherDialogsProps> = ({
  editDialogOpen,
  deleteDialogOpen,
  detailsDialogOpen,
  newTeacherDialogOpen,
  notesDialogOpen,
  selectedTeacher,
  setEditDialogOpen,
  setDeleteDialogOpen,
  setDetailsDialogOpen,
  setNewTeacherDialogOpen,
  setNotesDialogOpen,
  updateTeacher,
  deleteTeacher,
  addTeacher
}) => {
  return (
    <>
      <EditTeacherDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        teacher={selectedTeacher}
        onUpdateTeacher={updateTeacher}
      />
      
      <DeleteTeacherDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        teacher={selectedTeacher}
        onDelete={deleteTeacher}
      />
      
      <ViewTeacherDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        teacher={selectedTeacher}
      />
      
      <NewTeacherDialog
        open={newTeacherDialogOpen}
        onOpenChange={setNewTeacherDialogOpen}
        onAddTeacher={addTeacher}
      />
      
      <TeacherNotesDialog
        open={notesDialogOpen}
        onOpenChange={setNotesDialogOpen}
        teacher={selectedTeacher}
      />
    </>
  );
};

export default TeacherDialogs;
