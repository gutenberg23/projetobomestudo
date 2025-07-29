import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Folder, File, Upload, Plus, ArrowLeft, Check, Trash2, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';

// Constantes
const BUCKET_NAME = 'files';
const PLACEHOLDER_FILE = '.keep';
const MAX_FILES_LIMIT = 100;
const CACHE_CONTROL = '3600';

// Função para sanitizar nomes de arquivos e pastas
const sanitizeFileName = (name: string): string => {
  return name
    .normalize('NFD') // Decompor caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Substituir caracteres especiais por underscore
    .replace(/_{2,}/g, '_') // Substituir múltiplos underscores por um único
    .replace(/^_+|_+$/g, '') // Remover underscores do início e fim
    .toLowerCase(); // Converter para minúsculas
};

// Função para validar e construir caminhos
const buildBucketPath = (rootFolder: string, currentPath: string): string => {
  const sanitizedRoot = sanitizeFileName(rootFolder);
  const pathParts = currentPath.split('/').filter(Boolean).map(sanitizeFileName);
  return sanitizedRoot + (pathParts.length > 0 ? '/' + pathParts.join('/') : '');
};

// Função para validar se o bucket existe (usando listFiles para buckets públicos)
const validateBucket = async (bucketName: string): Promise<boolean> => {
  try {
    // Para buckets públicos, tentamos listar arquivos na raiz
    const { error } = await supabase.storage.from(bucketName).list('', { limit: 1 });
    return !error;
  } catch {
    return false;
  }
};

// Função para tratar erros do Supabase Storage
const handleStorageError = (error: any, operation: string): string => {
  if (error.message.includes('Invalid key')) {
    return `Caminho inválido para ${operation}. Verifique o nome e tente novamente.`;
  } else if (error.message.includes('Bucket not found')) {
    return 'Bucket de armazenamento não encontrado';
  } else if (error.message.includes('Object not found')) {
    return `${operation} não encontrado`;
  } else {
    return `Erro ao ${operation}: ${error.message}`;
  }
};

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  url?: string;
  size?: number;
  createdAt: Date;
}

interface FileManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (fileUrl: string) => void;
  currentValue?: string;
  title: string;
  allowedTypes?: string[];
  rootFolder: string; // 'pdf', 'mapa-mental', 'resumo', 'musica'
}

export const FileManager: React.FC<FileManagerProps> = ({
  isOpen,
  onClose,
  onFileSelect,
  currentValue,
  title,
  allowedTypes = ['*'],
  rootFolder
}) => {
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<string | null>(null);

  // Simular dados de arquivos para demonstração
  const mockFiles: Record<string, FileItem[]> = {
    '/': [
      {
        id: '1',
        name: 'Matemática',
        type: 'folder',
        path: '/matematica',
        createdAt: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Português',
        type: 'folder',
        path: '/portugues',
        createdAt: new Date('2024-01-16')
      },
      {
        id: '3',
        name: 'História',
        type: 'folder',
        path: '/historia',
        createdAt: new Date('2024-01-17')
      }
    ],
    '/matematica': [
      {
        id: '4',
        name: 'Álgebra',
        type: 'folder',
        path: '/matematica/algebra',
        createdAt: new Date('2024-01-18')
      },
      {
        id: '5',
        name: 'Geometria',
        type: 'folder',
        path: '/matematica/geometria',
        createdAt: new Date('2024-01-19')
      },
      {
        id: '6',
        name: 'funcoes-quadraticas.pdf',
        type: 'file',
        path: '/matematica/funcoes-quadraticas.pdf',
        url: 'https://example.com/files/funcoes-quadraticas.pdf',
        size: 2048576,
        createdAt: new Date('2024-01-20')
      }
    ],
    '/matematica/algebra': [
      {
        id: '7',
        name: 'equacoes-primeiro-grau.pdf',
        type: 'file',
        path: '/matematica/algebra/equacoes-primeiro-grau.pdf',
        url: 'https://example.com/files/equacoes-primeiro-grau.pdf',
        size: 1536000,
        createdAt: new Date('2024-01-21')
      },
      {
        id: '8',
        name: 'sistemas-lineares.pdf',
        type: 'file',
        path: '/matematica/algebra/sistemas-lineares.pdf',
        url: 'https://example.com/files/sistemas-lineares.pdf',
        size: 2097152,
        createdAt: new Date('2024-01-22')
      }
    ]
  };

  useEffect(() => {
    if (isOpen) {
      loadFiles(currentPath);
      if (currentValue) {
        setSelectedFile(currentValue);
      }
    }
  }, [isOpen, currentPath, currentValue]);

  const loadFiles = async (path: string) => {
    setIsLoading(true);
    try {
      // Validar se o bucket existe
      const bucketExists = await validateBucket(BUCKET_NAME);
      if (!bucketExists) {
        console.warn(`Bucket "${BUCKET_NAME}" não encontrado, usando dados mock`);
        // Usar dados mock se o bucket não existir
        setFiles(mockFiles[path] || []);
        return;
      }

      // Construir o caminho no bucket usando a função de validação
      const bucketPath = buildBucketPath(rootFolder, path);
      
      // Listar arquivos e pastas do Supabase Storage
      const { data: filesList, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(bucketPath, {
          limit: MAX_FILES_LIMIT,
          offset: 0
        });

      if (error) {
        console.error('Erro ao carregar do Supabase:', error);
        toast.error(handleStorageError(error, 'carregar arquivos'));
        // Fallback para dados mock em caso de erro
        setFiles(mockFiles[path] || []);
        return;
      }

      if (!filesList) {
        setFiles([]);
        return;
      }

      // Converter dados do Supabase para o formato FileItem
      const convertedFiles: FileItem[] = filesList
        .filter(item => item.name !== PLACEHOLDER_FILE) // Filtrar arquivos placeholder
        .map(item => {
          const isFolder = !item.metadata || Object.keys(item.metadata).length === 0;
          
          return {
            id: item.id || item.name,
            name: item.name,
            type: isFolder ? 'folder' : 'file',
            path: `${path === '/' ? '' : path}/${item.name}`,
            size: item.metadata?.size,
            createdAt: new Date(item.created_at || Date.now()),
            url: isFolder ? undefined : supabase.storage
              .from(BUCKET_NAME)
              .getPublicUrl(`${bucketPath}/${item.name}`).data.publicUrl
          };
        });

      setFiles(convertedFiles);
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
      toast.error('Erro inesperado ao carregar arquivos');
      // Fallback para dados mock em caso de erro
      setFiles(mockFiles[path] || []);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar tipos permitidos
    if (allowedTypes[0] !== '*') {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExtension || '')) {
        toast.error(`Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`);
        return;
      }
    }

    setIsLoading(true);
    try {
      // Validar se o bucket existe
      const bucketExists = await validateBucket(BUCKET_NAME);
      if (!bucketExists) {
        toast.error('Bucket de armazenamento não encontrado');
        return;
      }

      // Sanitizar o nome do arquivo
      const sanitizedFileName = sanitizeFileName(file.name);
      if (!sanitizedFileName) {
        toast.error('Nome do arquivo inválido');
        return;
      }

      // Construir o caminho completo no bucket usando a função de validação
      const bucketPath = buildBucketPath(rootFolder, currentPath);
      const filePath = `${bucketPath}/${sanitizedFileName}`;

      // Upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: CACHE_CONTROL,
          upsert: true
        });

      if (error) {
        console.error('Erro no upload para Supabase:', error);
        toast.error(handleStorageError(error, 'enviar arquivo'));
        return;
      }

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      const newFile: FileItem = {
        id: data.path || Date.now().toString(),
        name: sanitizedFileName,
        type: 'file',
        path: `${currentPath}/${sanitizedFileName}`,
        url: urlData.publicUrl,
        size: file.size,
        createdAt: new Date()
      };
      
      setFiles(prev => [...prev, newFile]);
      toast.success('Arquivo enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro inesperado ao enviar arquivo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    setIsLoading(true);
    try {
      // Validar se o bucket existe
      const bucketExists = await validateBucket(BUCKET_NAME);
      if (!bucketExists) {
        toast.error('Bucket de armazenamento não encontrado');
        return;
      }

      // Sanitizar o nome da pasta
      const sanitizedFolderName = sanitizeFileName(newFolderName.trim());
      if (!sanitizedFolderName) {
        toast.error('Nome da pasta inválido');
        return;
      }

      // Construir o caminho da pasta no bucket usando a função de validação
      const bucketPath = buildBucketPath(rootFolder, currentPath);
      const folderPath = `${bucketPath}/${sanitizedFolderName}/${PLACEHOLDER_FILE}`;

      // Criar um arquivo placeholder para simular a pasta (Supabase Storage não suporta pastas vazias)
      const placeholderContent = new Blob([''], { type: 'text/plain' });
      
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(folderPath, placeholderContent, {
          cacheControl: CACHE_CONTROL,
          upsert: true
        });

      if (error) {
        console.error('Erro ao criar pasta no Supabase:', error);
        toast.error(handleStorageError(error, 'criar pasta'));
        return;
      }

      const newFolder: FileItem = {
        id: Date.now().toString(),
        name: sanitizedFolderName,
        type: 'folder',
        path: `${currentPath}/${sanitizedFolderName}`,
        createdAt: new Date()
      };
      
      setFiles(prev => [...prev, newFolder]);
      setNewFolderName('');
      setShowNewFolderInput(false);
      toast.success('Pasta criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar pasta:', error);
      toast.error('Erro inesperado ao criar pasta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (item: FileItem) => {
    if (!confirm(`Tem certeza que deseja excluir ${item.type === 'folder' ? 'a pasta' : 'o arquivo'} "${item.name}"?`)) {
      return;
    }

    setDeletingItem(item.id);
    try {
      // Validar se o bucket existe
      const bucketExists = await validateBucket(BUCKET_NAME);
      if (!bucketExists) {
        toast.error('Bucket de armazenamento não encontrado');
        return;
      }

      // Construir o caminho usando a função de validação
      const bucketPath = buildBucketPath(rootFolder, currentPath);
      
      if (item.type === 'file') {
        // Excluir arquivo individual
        const filePath = `${bucketPath}/${item.name}`;
        const { error } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([filePath]);

        if (error) {
          console.error('Erro ao excluir arquivo do Supabase:', error);
          toast.error(handleStorageError(error, 'excluir arquivo'));
          return;
        }
      } else {
        // Excluir pasta (listar todos os arquivos da pasta e excluir)
        const folderPath = `${bucketPath}/${item.name}`;
        
        // Listar todos os arquivos na pasta
        const { data: filesList, error: listError } = await supabase.storage
          .from(BUCKET_NAME)
          .list(folderPath, {
            limit: MAX_FILES_LIMIT
          });

        if (listError) {
          console.error('Erro ao listar arquivos da pasta:', listError);
          toast.error(handleStorageError(listError, 'listar arquivos da pasta'));
          return;
        }

        // Excluir todos os arquivos da pasta
        if (filesList && filesList.length > 0) {
          const filesToDelete = filesList.map(file => `${folderPath}/${file.name}`);
          const { error: deleteError } = await supabase.storage
            .from(BUCKET_NAME)
            .remove(filesToDelete);

          if (deleteError) {
            console.error('Erro ao excluir arquivos da pasta:', deleteError);
            toast.error(handleStorageError(deleteError, 'excluir pasta'));
            return;
          }
        }
      }

      setFiles(prev => prev.filter(f => f.id !== item.id));
      toast.success(`${item.type === 'folder' ? 'Pasta' : 'Arquivo'} excluído com sucesso!`);
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      toast.error(`Erro inesperado ao excluir ${item.type === 'folder' ? 'pasta' : 'arquivo'}`);
    } finally {
      setDeletingItem(null);
    }
  };

  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath);
  };

  const goBack = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    pathParts.pop();
    const newPath = pathParts.length > 0 ? `/${pathParts.join('/')}` : '/';
    setCurrentPath(newPath);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSelectFile = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Navegação */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {currentPath !== '/' && (
                <Button variant="outline" size="sm" onClick={goBack}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <span className="text-sm text-gray-600">Pasta atual: {currentPath}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewFolderInput(!showNewFolderInput)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Nova Pasta
              </Button>
              
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                  </span>
                </Button>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept={allowedTypes[0] === '*' ? undefined : allowedTypes.map(t => `.${t}`).join(',')}
                />
              </label>
            </div>
          </div>

          {/* Input para nova pasta */}
          {showNewFolderInput && (
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Nome da pasta"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
              <Button onClick={handleCreateFolder} size="sm">
                Criar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setShowNewFolderInput(false);
                  setNewFolderName('');
                }}
              >
                Cancelar
              </Button>
            </div>
          )}

          {/* Lista de arquivos */}
          <div className="border rounded-lg max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                Carregando...
              </div>
            ) : files.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Nenhum arquivo encontrado
              </div>
            ) : (
              <div className="divide-y">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={`p-3 flex items-center justify-between hover:bg-gray-50 ${
                      selectedFile === file.url ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div 
                      className="flex items-center space-x-3 flex-1 cursor-pointer"
                      onClick={() => {
                        if (file.type === 'folder') {
                          navigateToFolder(file.path);
                        } else {
                          setSelectedFile(file.url || '');
                        }
                      }}
                    >
                      {file.type === 'folder' ? (
                        <Folder className="h-5 w-5 text-blue-500" />
                      ) : (
                        <File className="h-5 w-5 text-gray-500" />
                      )}
                      <div>
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-gray-500">
                          {file.type === 'file' && file.size && formatFileSize(file.size)}
                          {' • '}
                          {file.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {file.type === 'file' && selectedFile === file.url && (
                        <Check className="h-5 w-5 text-green-500" />
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDeleteItem(file)}
                            className="text-red-600 focus:text-red-600"
                            disabled={deletingItem === file.id}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deletingItem === file.id ? 'Excluindo...' : 'Excluir'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Arquivo selecionado */}
          {selectedFile && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900">Arquivo selecionado:</div>
              <div className="text-sm text-blue-700 break-all">{selectedFile}</div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSelectFile}
            disabled={!selectedFile}
            className="bg-[#ea2be2] hover:bg-[#ea2be2]/90"
          >
            Selecionar Arquivo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};