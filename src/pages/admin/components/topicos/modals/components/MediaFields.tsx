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
import { FileUploadField } from "@/components/ui/file-upload-field";
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

      <FileUploadField
        id="pdfUrl"
        label="Link da Aula em PDF"
        value={newTopico.pdfUrl}
        onChange={(value) => setNewTopico({ ...newTopico, pdfUrl: value })}
        placeholder="URL do arquivo PDF ou faça upload"
        allowedTypes={['pdf']}
        rootFolder="pdf"
      />

      <FileUploadField
        id="mapaUrl"
        label="Link do Mapa Mental"
        value={newTopico.mapaUrl}
        onChange={(value) => setNewTopico({ ...newTopico, mapaUrl: value })}
        placeholder="URL do mapa mental ou faça upload"
        allowedTypes={['pdf', 'jpg', 'jpeg', 'png', 'gif']}
        rootFolder="mapa-mental"
      />

      <FileUploadField
        id="resumoUrl"
        label="Link do Resumo"
        value={newTopico.resumoUrl}
        onChange={(value) => setNewTopico({ ...newTopico, resumoUrl: value })}
        placeholder="URL do resumo ou faça upload"
        allowedTypes={['pdf', 'doc', 'docx']}
        rootFolder="resumo"
      />

      <FileUploadField
        id="musicaUrl"
        label="Link da Música"
        value={newTopico.musicaUrl}
        onChange={(value) => setNewTopico({ ...newTopico, musicaUrl: value })}
        placeholder="URL da música ou faça upload"
        allowedTypes={['mp3', 'wav', 'ogg', 'm4a']}
        rootFolder="musica"
      />

      <FileUploadField
        id="resumoAudioUrl"
        label="Link do Resumo em Áudio"
        value={newTopico.resumoAudioUrl}
        onChange={(value) => setNewTopico({ ...newTopico, resumoAudioUrl: value })}
        placeholder="URL do resumo em áudio ou faça upload"
        allowedTypes={['mp3', 'wav', 'ogg', 'm4a']}
        rootFolder="resumo-audio"
      />

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
