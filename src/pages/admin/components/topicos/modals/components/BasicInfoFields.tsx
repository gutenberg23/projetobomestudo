
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Topico } from "../../TopicosTypes";

interface BasicInfoFieldsProps {
  newTopico: Omit<Topico, 'id'>;
  setNewTopico: React.Dispatch<React.SetStateAction<Omit<Topico, 'id'>>>;
  handleThumbnailUpload: (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => void;
}

export const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({
  newTopico,
  setNewTopico,
  handleThumbnailUpload
}) => {
  return (
    <>
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
        <Label htmlFor="disciplina">Descrição / Disciplina</Label>
        <Input
          id="disciplina"
          value={newTopico.disciplina}
          onChange={(e) => setNewTopico({ ...newTopico, disciplina: e.target.value })}
          placeholder="Digite a descrição ou disciplina"
        />
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
    </>
  );
};
