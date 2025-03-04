
import React from "react";
import EditTeacherDialog from "./dialogs/EditTeacherDialog";
import DeleteTeacherDialog from "./dialogs/DeleteTeacherDialog";
import ViewTeacherDialog from "./dialogs/ViewTeacherDialog";
import NewTeacherDialog from "./dialogs/NewTeacherDialog";
import { TeacherData } from "./types";

interface TeacherDialogsProps {
  editDialogOpen: boolean;
  deleteDialogOpen: boolean;
  detailsDialogOpen: boolean;
  newTeacherDialogOpen: boolean;
  selectedTeacher: TeacherData | null;
  disciplinas: string[];
  setEditDialogOpen: (open: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
  setDetailsDialogOpen: (open: boolean) => void;
  setNewTeacherDialogOpen: (open: boolean) => void;
  updateTeacher: (teacher: TeacherData) => void;
  deleteTeacher: (id: string) => void;
  addTeacher: (teacher: Omit<TeacherData, 'id'>) => void;
}

export const TeacherDialogs: React.FC<TeacherDialogsProps> = ({
  editDialogOpen,
  deleteDialogOpen,
  detailsDialogOpen,
  newTeacherDialogOpen,
  selectedTeacher,
  disciplinas,
  setEditDialogOpen,
  setDeleteDialogOpen,
  setDetailsDialogOpen,
  setNewTeacherDialogOpen,
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
        disciplinas={disciplinas}
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
        disciplinas={disciplinas}
      />
    </>
  );
};

export default TeacherDialogs;
