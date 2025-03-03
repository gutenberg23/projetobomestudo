
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Topico } from "../../TopicosTypes";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface BasicInfoFieldsProps {
  newTopico: Omit<Topico, 'id'> | Topico;
  setNewTopico: React.Dispatch<React.SetStateAction<any>>;
  handleThumbnailUpload: (e: React.ChangeEvent<HTMLInputElement>, isEdit?: boolean) => void;
  isEditMode?: boolean;
}

export const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({
  newTopico,
  setNewTopico,
  handleThumbnailUpload,
  isEditMode = false
}) => {
  const inputId = isEditMode ? 'edit-thumbnail' : 'thumbnail';

  return (
    <>
      <div>
        <Label htmlFor={isEditMode ? "edit-titulo" : "titulo"}>Título *</Label>
        <Input
          id={isEditMode ? "edit-titulo" : "titulo"}
          value={newTopico.titulo}
          onChange={(e) => setNewTopico({ ...newTopico, titulo: e.target.value })}
          placeholder="Digite o título do tópico"
        />
      </div>

      <div>
        <Label htmlFor={isEditMode ? "edit-disciplina" : "disciplina"}>Descrição / Disciplina</Label>
        {isEditMode ? (
          <Select
            value={newTopico.disciplina}
            onValueChange={(value) => setNewTopico({ ...newTopico, disciplina: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma disciplina" />
            </SelectTrigger>
            <SelectContent>
              {/* Aqui, idealmente, passaríamos disciplinas como prop */}
              <SelectItem value="Direito Administrativo">Direito Administrativo</SelectItem>
              <SelectItem value="Direito Constitucional">Direito Constitucional</SelectItem>
              <SelectItem value="Direito Civil">Direito Civil</SelectItem>
              <SelectItem value="Direito Penal">Direito Penal</SelectItem>
              <SelectItem value="Direito Tributário">Direito Tributário</SelectItem>
              <SelectItem value="Português">Português</SelectItem>
              <SelectItem value="Matemática">Matemática</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="disciplina"
            value={newTopico.disciplina}
            onChange={(e) => setNewTopico({ ...newTopico, disciplina: e.target.value })}
            placeholder="Digite a descrição ou disciplina"
          />
        )}
      </div>

      <div>
        <Label htmlFor={inputId}>Thumbnail</Label>
        <div className="flex gap-2 items-center">
          <Input
            id={inputId}
            type="file"
            onChange={(e) => handleThumbnailUpload(e)}
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
              onClick={() => document.getElementById(inputId)?.click()}
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor={isEditMode ? "edit-patrocinador" : "patrocinador"}>Patrocinador</Label>
        <Input
          id={isEditMode ? "edit-patrocinador" : "patrocinador"}
          value={newTopico.patrocinador}
          onChange={(e) => setNewTopico({ ...newTopico, patrocinador: e.target.value })}
          placeholder="Nome do patrocinador"
        />
      </div>
    </>
  );
};
