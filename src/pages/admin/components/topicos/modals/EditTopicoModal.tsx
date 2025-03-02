
import React from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { Topico } from "../TopicosTypes";

interface EditTopicoModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentTopico: Topico | null;
  setCurrentTopico: React.Dispatch<React.SetStateAction<Topico | null>>;
  editQuestaoId: string;
  setEditQuestaoId: (id: string) => void;
  handleEditTopico: () => void;
  addQuestaoIdToEdit: () => void;
  removeQuestaoIdFromEdit: (index: number) => void;
  handleThumbnailUpload: (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => void;
  disciplinas: string[];
}

export const EditTopicoModal: React.FC<EditTopicoModalProps> = ({
  isOpen,
  setIsOpen,
  currentTopico,
  setCurrentTopico,
  editQuestaoId,
  setEditQuestaoId,
  handleEditTopico,
  addQuestaoIdToEdit,
  removeQuestaoIdFromEdit,
  handleThumbnailUpload,
  disciplinas
}) => {
  if (!currentTopico) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Tópico</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="edit-titulo">Título *</Label>
              <Input
                id="edit-titulo"
                value={currentTopico.titulo}
                onChange={(e) => setCurrentTopico({ ...currentTopico, titulo: e.target.value })}
                placeholder="Digite o título do tópico"
              />
            </div>

            <div>
              <Label htmlFor="edit-disciplina">Disciplina</Label>
              <Select
                value={currentTopico.disciplina}
                onValueChange={(value) => setCurrentTopico({ ...currentTopico, disciplina: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma disciplina" />
                </SelectTrigger>
                <SelectContent>
                  {disciplinas.map((disciplina) => (
                    <SelectItem key={disciplina} value={disciplina}>
                      {disciplina}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-thumbnail">Thumbnail</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="edit-thumbnail"
                  type="file"
                  onChange={(e) => handleThumbnailUpload(e, true)}
                  className="hidden"
                />
                <div className="flex-1 flex">
                  <Input
                    value={currentTopico.thumbnail}
                    onChange={(e) => setCurrentTopico({ ...currentTopico, thumbnail: e.target.value })}
                    placeholder="URL da imagem de capa"
                    className="rounded-r-none"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    className="rounded-l-none"
                    onClick={() => document.getElementById('edit-thumbnail')?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-patrocinador">Patrocinador</Label>
              <Input
                id="edit-patrocinador"
                value={currentTopico.patrocinador}
                onChange={(e) => setCurrentTopico({ ...currentTopico, patrocinador: e.target.value })}
                placeholder="Nome do patrocinador"
              />
            </div>

            <div>
              <Label htmlFor="edit-videoUrl">Link do Vídeo</Label>
              <Input
                id="edit-videoUrl"
                value={currentTopico.videoUrl}
                onChange={(e) => setCurrentTopico({ ...currentTopico, videoUrl: e.target.value })}
                placeholder="URL do vídeo (YouTube, Vimeo, etc.)"
              />
            </div>

            <div>
              <Label htmlFor="edit-abrirVideoEm">Abrir Vídeo</Label>
              <Select
                value={currentTopico.abrirVideoEm || "site"}
                onValueChange={(value: "site" | "destino") => setCurrentTopico({ ...currentTopico, abrirVideoEm: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione onde abrir o vídeo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="site">No site</SelectItem>
                  <SelectItem value="destino">No destino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-pdfUrl">Link do PDF</Label>
              <Input
                id="edit-pdfUrl"
                value={currentTopico.pdfUrl}
                onChange={(e) => setCurrentTopico({ ...currentTopico, pdfUrl: e.target.value })}
                placeholder="URL do arquivo PDF"
              />
            </div>

            <div>
              <Label htmlFor="edit-mapaUrl">Link do Mapa Mental</Label>
              <Input
                id="edit-mapaUrl"
                value={currentTopico.mapaUrl}
                onChange={(e) => setCurrentTopico({ ...currentTopico, mapaUrl: e.target.value })}
                placeholder="URL do mapa mental"
              />
            </div>

            <div>
              <Label htmlFor="edit-resumoUrl">Link do Resumo</Label>
              <Input
                id="edit-resumoUrl"
                value={currentTopico.resumoUrl}
                onChange={(e) => setCurrentTopico({ ...currentTopico, resumoUrl: e.target.value })}
                placeholder="URL do resumo"
              />
            </div>

            <div className="space-y-2">
              <Label>IDs das Questões</Label>
              <div className="flex gap-2">
                <Input
                  value={editQuestaoId}
                  onChange={(e) => setEditQuestaoId(e.target.value)}
                  placeholder="Digite o ID da questão"
                />
                <Button 
                  type="button" 
                  onClick={addQuestaoIdToEdit}
                  className="bg-[#ea2be2] hover:bg-[#ea2be2]/90"
                >
                  Adicionar
                </Button>
              </div>
              
              {currentTopico.questoesIds.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm font-medium">Questões Adicionadas:</p>
                  <div className="flex flex-wrap gap-2">
                    {currentTopico.questoesIds.map((id, index) => (
                      <div 
                        key={index}
                        className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
                      >
                        <span className="text-sm">ID: {id}</span>
                        <button
                          onClick={() => removeQuestaoIdFromEdit(index)}
                          className="ml-2 text-gray-500 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button 
            type="button" 
            onClick={handleEditTopico}
            className="bg-[#ea2be2] hover:bg-[#ea2be2]/90"
          >
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
