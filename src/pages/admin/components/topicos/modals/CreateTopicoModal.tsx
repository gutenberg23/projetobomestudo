
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

interface CreateTopicoModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  newTopico: Omit<Topico, 'id'>;
  setNewTopico: React.Dispatch<React.SetStateAction<Omit<Topico, 'id'>>>;
  newQuestaoId: string;
  setNewQuestaoId: (id: string) => void;
  handleCreateTopico: () => void;
  addQuestaoId: () => void;
  removeQuestaoId: (index: number) => void;
  handleThumbnailUpload: (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => void;
  disciplinas: string[];
}

export const CreateTopicoModal: React.FC<CreateTopicoModalProps> = ({
  isOpen,
  setIsOpen,
  newTopico,
  setNewTopico,
  newQuestaoId,
  setNewQuestaoId,
  handleCreateTopico,
  addQuestaoId,
  removeQuestaoId,
  handleThumbnailUpload,
  disciplinas
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Tópico</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={newTopico.titulo}
                onChange={(e) => setNewTopico({ ...newTopico, titulo: e.target.value })}
                placeholder="Digite o título do tópico"
              />
            </div>

            <div>
              <Label htmlFor="disciplina">Disciplina</Label>
              <Select
                value={newTopico.disciplina}
                onValueChange={(value) => setNewTopico({ ...newTopico, disciplina: value })}
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
              <Label htmlFor="thumbnail">Thumbnail</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="thumbnail"
                  type="file"
                  onChange={(e) => handleThumbnailUpload(e, false)}
                  className="hidden"
                />
                <div className="flex-1 flex">
                  <Input
                    value={newTopico.thumbnail}
                    onChange={(e) => setNewTopico({ ...newTopico, thumbnail: e.target.value })}
                    placeholder="URL da imagem de capa"
                    className="rounded-r-none"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    className="rounded-l-none"
                    onClick={() => document.getElementById('thumbnail')?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="patrocinador">Patrocinador</Label>
              <Input
                id="patrocinador"
                value={newTopico.patrocinador}
                onChange={(e) => setNewTopico({ ...newTopico, patrocinador: e.target.value })}
                placeholder="Nome do patrocinador"
              />
            </div>

            <div>
              <Label htmlFor="videoUrl">Link do Vídeo</Label>
              <Input
                id="videoUrl"
                value={newTopico.videoUrl}
                onChange={(e) => setNewTopico({ ...newTopico, videoUrl: e.target.value })}
                placeholder="URL do vídeo (YouTube, Vimeo, etc.)"
              />
            </div>

            <div>
              <Label htmlFor="abrirVideoEm">Abrir Vídeo</Label>
              <Select
                value={newTopico.abrirVideoEm}
                onValueChange={(value: "site" | "destino") => setNewTopico({ ...newTopico, abrirVideoEm: value })}
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
              <Label htmlFor="pdfUrl">Link do PDF</Label>
              <Input
                id="pdfUrl"
                value={newTopico.pdfUrl}
                onChange={(e) => setNewTopico({ ...newTopico, pdfUrl: e.target.value })}
                placeholder="URL do arquivo PDF"
              />
            </div>

            <div>
              <Label htmlFor="mapaUrl">Link do Mapa Mental</Label>
              <Input
                id="mapaUrl"
                value={newTopico.mapaUrl}
                onChange={(e) => setNewTopico({ ...newTopico, mapaUrl: e.target.value })}
                placeholder="URL do mapa mental"
              />
            </div>

            <div>
              <Label htmlFor="resumoUrl">Link do Resumo</Label>
              <Input
                id="resumoUrl"
                value={newTopico.resumoUrl}
                onChange={(e) => setNewTopico({ ...newTopico, resumoUrl: e.target.value })}
                placeholder="URL do resumo"
              />
            </div>

            <div className="space-y-2">
              <Label>IDs das Questões</Label>
              <div className="flex gap-2">
                <Input
                  value={newQuestaoId}
                  onChange={(e) => setNewQuestaoId(e.target.value)}
                  placeholder="Digite o ID da questão"
                />
                <Button 
                  type="button" 
                  onClick={addQuestaoId}
                  className="bg-[#ea2be2] hover:bg-[#ea2be2]/90"
                >
                  Adicionar
                </Button>
              </div>
              
              {newTopico.questoesIds.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm font-medium">Questões Adicionadas:</p>
                  <div className="flex flex-wrap gap-2">
                    {newTopico.questoesIds.map((id, index) => (
                      <div 
                        key={index}
                        className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
                      >
                        <span className="text-sm">ID: {id}</span>
                        <button
                          onClick={() => removeQuestaoId(index)}
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
            onClick={handleCreateTopico}
            className="bg-[#ea2be2] hover:bg-[#ea2be2]/90"
          >
            Criar Tópico
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
