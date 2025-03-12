
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TeacherData, TeacherNote } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { StickyNote, Trash2 } from "lucide-react";

interface TeacherNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: TeacherData | null;
}

const TeacherNotesDialog: React.FC<TeacherNotesDialogProps> = ({
  open,
  onOpenChange,
  teacher
}) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState<TeacherNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && teacher) {
      fetchNotes();
    }
  }, [open, teacher]);

  const fetchNotes = async () => {
    if (!teacher) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notas_professores')
        .select('*')
        .eq('professor_id', teacher.id)
        .order('data_criacao', { ascending: false });
      
      if (error) throw error;
      
      const formattedNotes: TeacherNote[] = data.map(note => ({
        id: note.id,
        professorId: note.professor_id,
        conteudo: note.conteudo,
        dataCriacao: new Date(note.data_criacao).toLocaleString('pt-BR'),
        usuarioId: note.usuario_id
      }));
      
      setNotes(formattedNotes);
    } catch (error) {
      console.error("Erro ao buscar notas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notas. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!teacher || !newNote.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('notas_professores')
        .insert({
          professor_id: teacher.id,
          conteudo: newNote.trim()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newNoteItem: TeacherNote = {
        id: data.id,
        professorId: data.professor_id,
        conteudo: data.conteudo,
        dataCriacao: new Date(data.data_criacao).toLocaleString('pt-BR'),
        usuarioId: data.usuario_id
      };
      
      setNotes([newNoteItem, ...notes]);
      setNewNote("");
      
      toast({
        title: "Nota adicionada",
        description: "A nota foi adicionada com sucesso."
      });
    } catch (error) {
      console.error("Erro ao adicionar nota:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a nota. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notas_professores')
        .delete()
        .eq('id', noteId);
      
      if (error) throw error;
      
      // Atualizar a lista local de notas
      setNotes(notes.filter(note => note.id !== noteId));
      
      toast({
        title: "Nota excluída",
        description: "A nota foi excluída com sucesso."
      });
    } catch (error) {
      console.error("Erro ao excluir nota:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a nota. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#272f3c] text-xl font-bold">Notas - {teacher.nomeCompleto}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Textarea
                  placeholder="Digite uma nova nota..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="border-[#5f2ebe]/30 focus-visible:ring-[#5f2ebe]"
                  rows={3}
                />
              </div>
              <Button
                type="button"
                onClick={handleAddNote}
                disabled={isSubmitting || !newNote.trim()}
                className="bg-[#5f2ebe] hover:bg-[#5f2ebe]/90 text-white"
              >
                {isSubmitting ? <Spinner size="sm" /> : "Adicionar"}
              </Button>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-medium text-[#272f3c] mb-3">Notas salvas</h3>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner className="text-[#5f2ebe]" />
              </div>
            ) : notes.length > 0 ? (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="bg-[#f6f8fa] p-3 rounded-md">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2 text-sm text-[#67748a] mb-1">
                        <StickyNote className="h-3.5 w-3.5" />
                        <span>{note.dataCriacao}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-[#272f3c] whitespace-pre-wrap">{note.conteudo}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#67748a]">
                <StickyNote className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                <p>Nenhuma nota adicionada</p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#5f2ebe] text-[#5f2ebe]"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherNotesDialog;
