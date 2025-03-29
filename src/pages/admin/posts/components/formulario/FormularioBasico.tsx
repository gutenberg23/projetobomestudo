
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIAS } from "../../types";

interface FormularioBasicoProps {
  titulo: string;
  onChangeTitulo: (value: string) => void;
  resumo: string;
  onChangeResumo: (value: string) => void;
  autor: string;
  onChangeAutor: (value: string) => void;
  autorAvatar: string;
  onChangeAutorAvatar: (value: string) => void;
  categoria: string;
  onChangeCategoria: (value: string) => void;
  tempoLeitura: string;
  onChangeTempoLeitura: (value: string) => void;
}

export const FormularioBasico: React.FC<FormularioBasicoProps> = ({
  titulo,
  onChangeTitulo,
  resumo,
  onChangeResumo,
  autor,
  onChangeAutor,
  autorAvatar,
  onChangeAutorAvatar,
  categoria,
  onChangeCategoria,
  tempoLeitura,
  onChangeTempoLeitura
}) => {
  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold text-[#272f3c] mb-4">Informações Básicas</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="titulo">Título</Label>
          <Input 
            id="titulo" 
            value={titulo} 
            onChange={(e) => onChangeTitulo(e.target.value)} 
            placeholder="Título do post"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="resumo">Resumo</Label>
          <Input 
            id="resumo" 
            value={resumo} 
            onChange={(e) => onChangeResumo(e.target.value)} 
            placeholder="Breve resumo do post"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="autor">Autor</Label>
          <Input 
            id="autor" 
            value={autor} 
            onChange={(e) => onChangeAutor(e.target.value)} 
            placeholder="Nome do autor"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="autorAvatar">Avatar do Autor (URL)</Label>
          <Input 
            id="autorAvatar" 
            value={autorAvatar} 
            onChange={(e) => onChangeAutorAvatar(e.target.value)} 
            placeholder="URL da imagem do avatar do autor"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria</Label>
            <Select value={categoria} onValueChange={onChangeCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tempoLeitura">Tempo de leitura (minutos)</Label>
            <Input 
              id="tempoLeitura" 
              type="number" 
              value={tempoLeitura} 
              onChange={(e) => onChangeTempoLeitura(e.target.value)} 
              placeholder="Estimativa do tempo de leitura em minutos"
            />
            <p className="text-xs text-[#67748a]">Deixe vazio para calcular automaticamente.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
