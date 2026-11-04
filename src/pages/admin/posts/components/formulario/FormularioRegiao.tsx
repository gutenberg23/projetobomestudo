import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { REGIOES, ESTADOS, CATEGORIAS } from "../../types";
import { Region } from "@/components/blog/types";
import { CardLateral } from "./CardLateral";

interface FormularioRegiaoProps {
  categoria: string;
  onChangeCategoria: (value: string) => void;
  regiao: Region | "none";
  onChangeRegiao: (value: Region | "none") => void;
  estado: string;
  onChangeEstado: (value: string) => void;
}

const NOME_REGIAO: Record<string, string> = {
  norte: "Norte",
  nordeste: "Nordeste",
  "centro-oeste": "Centro-Oeste",
  sudeste: "Sudeste",
  sul: "Sul",
  federal: "Federal",
  nacional: "Nacional",
};

/** Categoria, região e estado: usados nos filtros do blog. */
export const FormularioRegiao: React.FC<FormularioRegiaoProps> = ({
  categoria,
  onChangeCategoria,
  regiao,
  onChangeRegiao,
  estado,
  onChangeEstado,
}) => {
  const semEstado = !regiao || regiao === "none" || regiao === "federal" || regiao === "nacional";
  const estadosFiltrados = !semEstado ? ESTADOS.filter((e) => e.region === regiao) : ESTADOS;

  return (
    <CardLateral titulo="Classificação" descricao="Ajuda o leitor a filtrar as notícias no blog.">
      <div className="space-y-1.5">
        <Label htmlFor="categoria" className="text-xs">Categoria</Label>
        <Input
          id="categoria"
          list="categorias-posts"
          value={categoria}
          onChange={(e) => onChangeCategoria(e.target.value)}
          placeholder="Ex.: Concursos"
          required
          className="h-9"
        />
        <datalist id="categorias-posts">
          {CATEGORIAS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Região</Label>
          <Select
            value={regiao}
            onValueChange={(value) => {
              onChangeRegiao(value as Region | "none");
              onChangeEstado("none");
            }}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Região" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>
              {REGIOES.map((reg) => (
                <SelectItem key={reg} value={reg}>
                  {NOME_REGIAO[reg] || reg}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Estado</Label>
          <Select value={estado} onValueChange={onChangeEstado} disabled={semEstado}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {estadosFiltrados.map((e) => (
                <SelectItem key={e.id} value={e.value}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardLateral>
  );
};
