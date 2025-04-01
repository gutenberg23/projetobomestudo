import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FileItem } from '@/types/kanban';
import { toast } from 'sonner';

export const useFileManager = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar arquivos
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('files')
        .select('*');

      if (error) throw error;

      setFiles(data);
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
      toast.error('Erro ao carregar arquivos');
    } finally {
      setLoading(false);
    }
  };

  // Criar pasta
  const createFolder = async (name: string, parentId: string | null = null) => {
    try {
      const newFolder: Omit<FileItem, 'id' | 'created_at'> = {
        name,
        type: 'folder',
        parent_id: parentId,
      };

      const { data, error } = await supabase
        .from('files')
        .insert([newFolder])
        .select()
        .single();

      if (error) throw error;

      setFiles(prev => [...prev, data]);
      toast.success('Pasta criada com sucesso');
      return data;
    } catch (error) {
      console.error('Erro ao criar pasta:', error);
      toast.error('Erro ao criar pasta');
      return null;
    }
  };

  // Upload de arquivo
  const uploadFile = async (file: File, parentId: string | null = null) => {
    try {
      // Upload do arquivo para o storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `files/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);

      // Criar registro no banco
      const newFile: Omit<FileItem, 'id' | 'created_at'> = {
        name: file.name,
        type: 'file',
        size: file.size,
        url: publicUrl,
        parent_id: parentId,
      };

      const { data, error } = await supabase
        .from('files')
        .insert([newFile])
        .select()
        .single();

      if (error) throw error;

      setFiles(prev => [...prev, data]);
      toast.success('Arquivo enviado com sucesso');
      return data;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload do arquivo');
      return null;
    }
  };

  // Excluir arquivo/pasta
  const deleteFile = async (fileId: string, isFolder: boolean = false) => {
    try {
      // Se for uma pasta, excluir todos os arquivos dentro
      if (isFolder) {
        const { error: deleteChildrenError } = await supabase
          .from('files')
          .delete()
          .eq('parent_id', fileId);

        if (deleteChildrenError) throw deleteChildrenError;
      }

      // Excluir o arquivo/pasta
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      setFiles(prev => prev.filter(file => file.id !== fileId));
      toast.success(`${isFolder ? 'Pasta' : 'Arquivo'} excluído com sucesso`);
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error(`Erro ao excluir ${isFolder ? 'pasta' : 'arquivo'}`);
    }
  };

  // Download de arquivo
  const downloadFile = async (fileUrl: string) => {
    try {
      window.open(fileUrl, '_blank');
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      toast.error('Erro ao baixar arquivo');
    }
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    fetchFiles();
  }, []);

  return {
    files,
    loading,
    createFolder,
    uploadFile,
    deleteFile,
    downloadFile,
  };
}; 