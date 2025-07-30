import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileManager } from '@/components/ui/file-manager';
import { Upload, File, X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MultiFileUploadFieldProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  allowedTypes?: string[];
  rootFolder: string;
  id?: string;
  maxFiles?: number;
}

export const MultiFileUploadField: React.FC<MultiFileUploadFieldProps> = ({
  label,
  values,
  onChange,
  placeholder,
  allowedTypes = ['*'],
  rootFolder,
  id,
  maxFiles = 5
}) => {
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);
  const [newFileUrl, setNewFileUrl] = useState('');

  const handleFileSelect = (fileUrl: string) => {
    if (!values.includes(fileUrl) && values.length < maxFiles) {
      onChange([...values, fileUrl]);
    }
  };

  const addManualUrl = () => {
    if (newFileUrl.trim() && !values.includes(newFileUrl.trim()) && values.length < maxFiles) {
      onChange([...values, newFileUrl.trim()]);
      setNewFileUrl('');
    }
  };

  const removeFile = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
  };

  const getFileTypeDescription = () => {
    if (allowedTypes[0] === '*') return 'Todos os tipos';
    return allowedTypes.join(', ').toUpperCase();
  };

  const getFileName = (url: string) => {
    return url.split('/').pop() || url;
  };

  return (
    <div className="space-y-3">
      <Label htmlFor={id}>{label}</Label>
      
      {/* Input para adicionar URL manualmente */}
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <Input
            id={id}
            value={newFileUrl}
            onChange={(e) => setNewFileUrl(e.target.value)}
            placeholder={placeholder || `URL do arquivo ou clique em "Procurar" para fazer upload`}
            onKeyPress={(e) => e.key === 'Enter' && addManualUrl()}
          />
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addManualUrl}
          disabled={!newFileUrl.trim() || values.includes(newFileUrl.trim()) || values.length >= maxFiles}
          className="flex items-center space-x-1"
        >
          <Plus className="h-4 w-4" />
          <span>Adicionar</span>
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsFileManagerOpen(true)}
          disabled={values.length >= maxFiles}
          className="flex items-center space-x-1"
        >
          <Upload className="h-4 w-4" />
          <span>Procurar</span>
        </Button>
      </div>
      
      <div className="text-xs text-gray-500 flex justify-between">
        <span>Tipos aceitos: {getFileTypeDescription()}</span>
        <span>{values.length}/{maxFiles} arquivos</span>
      </div>
      
      {/* Lista de arquivos selecionados */}
      {values.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Arquivos selecionados:</Label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {values.map((url, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <File className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-green-700 truncate" title={url}>
                    {getFileName(url)}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {index + 1}
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <FileManager
        isOpen={isFileManagerOpen}
        onClose={() => setIsFileManagerOpen(false)}
        onFileSelect={handleFileSelect}
        currentValue={''}
        title={`Selecionar arquivo - ${label}`}
        allowedTypes={allowedTypes}
        rootFolder={rootFolder}
      />
    </div>
  );
};