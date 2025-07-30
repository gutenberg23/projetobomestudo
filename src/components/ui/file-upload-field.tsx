import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileManager } from '@/components/ui/file-manager';
import { Upload, File, X } from 'lucide-react';

interface FileUploadFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowedTypes?: string[];
  rootFolder: string;
  id?: string;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  allowedTypes = ['*'],
  rootFolder,
  id
}) => {
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);

  const handleFileSelect = (fileUrl: string) => {
    onChange(fileUrl);
  };

  const clearFile = () => {
    onChange('');
  };

  const getFileTypeDescription = () => {
    if (allowedTypes[0] === '*') return 'Todos os tipos';
    return allowedTypes.join(', ').toUpperCase();
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <Input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || `URL do arquivo ou clique em "Procurar" para fazer upload`}
            className="pr-10"
          />
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsFileManagerOpen(true)}
          className="flex items-center space-x-1"
        >
          <Upload className="h-4 w-4" />
          <span>Procurar</span>
        </Button>
        
        {value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearFile}
            className="flex items-center space-x-1 text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="text-xs text-gray-500">
        Tipos aceitos: {getFileTypeDescription()}
      </div>
      
      {value && (
        <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-md">
          <File className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700 break-all">
            {typeof value === 'string' ? (value.split('/').pop() || value) : String(value)}
          </span>
        </div>
      )}
      
      <FileManager
        isOpen={isFileManagerOpen}
        onClose={() => setIsFileManagerOpen(false)}
        onFileSelect={handleFileSelect}
        currentValue={value}
        title={`Selecionar arquivo - ${label}`}
        allowedTypes={allowedTypes}
        rootFolder={rootFolder}
      />
    </div>
  );
};