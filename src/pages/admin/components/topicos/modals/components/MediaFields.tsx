import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Topico } from "../../TopicosTypes";

interface MediaFieldsProps {
  newTopico: Omit<Topico, 'id'>;
  setNewTopico: React.Dispatch<React.SetStateAction<Omit<Topico, 'id'>>>;
}

export const MediaFields: React.FC<MediaFieldsProps> = ({
  newTopico,
  setNewTopico
}) => {
  return (
    <>
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

      <div className="flex items-center space-x-2 mt-2">
        <Checkbox 
          id="abrirEmNovaGuia" 
          checked={newTopico.abrirEmNovaGuia} 
          onCheckedChange={(checked) => setNewTopico({ ...newTopico, abrirEmNovaGuia: checked === true })}
        />
        <Label htmlFor="abrirEmNovaGuia" className="cursor-pointer">
          Abrir aula em nova guia
        </Label>
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

      <div>
        <Label htmlFor="musicaUrl">Link da Música</Label>
        <Input
          id="musicaUrl"
          value={newTopico.musicaUrl}
          onChange={(e) => setNewTopico({ ...newTopico, musicaUrl: e.target.value })}
          placeholder="URL da música"
        />
      </div>

      <div>
        <Label htmlFor="cadernoQuestoesUrl">Link do Caderno de Questões</Label>
        <Input
          id="cadernoQuestoesUrl"
          value={newTopico.cadernoQuestoesUrl}
          onChange={(e) => setNewTopico({ ...newTopico, cadernoQuestoesUrl: e.target.value })}
          placeholder="URL do caderno de questões"
        />
      </div>
    </>
  );
};
