import React from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Eye } from "lucide-react";

interface FormularioStatusProps {
  isDraft: boolean;
  onChangeIsDraft: (value: boolean) => void;
}

export const FormularioStatus: React.FC<FormularioStatusProps> = ({
  isDraft,
  onChangeIsDraft
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isDraft ? <FileText className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          Status de Publicação
        </CardTitle>
        <CardDescription>
          Defina se o post será salvo como rascunho ou publicado imediatamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="draft-toggle" className="text-sm font-medium">
              {isDraft ? "Salvar como Rascunho" : "Publicar Post"}
            </Label>
            <p className="text-xs text-muted-foreground">
              {isDraft 
                ? "O post será salvo como rascunho e não aparecerá publicamente" 
                : "O post será publicado e ficará visível para todos os usuários"
              }
            </p>
          </div>
          <Switch
            id="draft-toggle"
            checked={!isDraft}
            onCheckedChange={(checked) => onChangeIsDraft(!checked)}
          />
        </div>
        
        <div className={`p-3 rounded-lg border ${
          isDraft 
            ? "bg-yellow-50 border-yellow-200 text-yellow-800" 
            : "bg-green-50 border-green-200 text-green-800"
        }`}>
          <div className="flex items-center gap-2">
            {isDraft ? (
              <>
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Rascunho</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span className="text-sm font-medium">Publicado</span>
              </>
            )}
          </div>
          <p className="text-xs mt-1">
            {isDraft 
              ? "Este post não será visível publicamente até ser publicado"
              : "Este post será visível publicamente após salvar"
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};