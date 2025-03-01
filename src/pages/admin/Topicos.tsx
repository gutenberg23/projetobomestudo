
import React, { useState } from "react";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash, Plus, X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Tipo para os tópicos
interface Topico {
  id: string;
  titulo: string;
  thumbnail: string;
  patrocinador: string;
  videoUrl: string;
  pdfUrl: string;
  mapaUrl: string;
  resumoUrl: string;
  questoesIds: string[];
}

const Topicos = () => {
  const { toast } = useToast();
  // Estado para armazenar tópicos
  const [topicos, setTopicos] = useState<Topico[]>([
    {
      id: "1",
      titulo: "Introdução ao Direito Administrativo",
      thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
      patrocinador: "JurisConsult",
      videoUrl: "https://www.youtube.com/watch?v=example1",
      pdfUrl: "https://example.com/pdf/direito-admin.pdf",
      mapaUrl: "https://example.com/mapa/direito-admin.pdf",
      resumoUrl: "https://example.com/resumo/direito-admin.pdf",
      questoesIds: ["101", "102", "103"]
    },
    {
      id: "2",
      titulo: "Princípios Constitucionais",
      thumbnail: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
      patrocinador: "LegisPro",
      videoUrl: "https://www.youtube.com/watch?v=example2",
      pdfUrl: "https://example.com/pdf/principios.pdf",
      mapaUrl: "https://example.com/mapa/principios.pdf",
      resumoUrl: "https://example.com/resumo/principios.pdf",
      questoesIds: ["201", "202"]
    }
  ]);

  // Estados para diálogos
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  
  // Estado para o tópico atual (edição/exclusão)
  const [currentTopico, setCurrentTopico] = useState<Topico | null>(null);
  
  // Estado para novo tópico
  const [newTopico, setNewTopico] = useState<Omit<Topico, 'id'>>({
    titulo: "",
    thumbnail: "",
    patrocinador: "",
    videoUrl: "",
    pdfUrl: "",
    mapaUrl: "",
    resumoUrl: "",
    questoesIds: []
  });
  
  // Estado para novo ID de questão
  const [newQuestaoId, setNewQuestaoId] = useState("");
  const [editQuestaoId, setEditQuestaoId] = useState("");

  // Função para adicionar ID de questão
  const addQuestaoId = () => {
    if (newQuestaoId.trim() !== "") {
      setNewTopico({
        ...newTopico,
        questoesIds: [...newTopico.questoesIds, newQuestaoId.trim()]
      });
      setNewQuestaoId("");
    }
  };

  // Função para adicionar ID de questão durante edição
  const addQuestaoIdToEdit = () => {
    if (editQuestaoId.trim() !== "" && currentTopico) {
      setCurrentTopico({
        ...currentTopico,
        questoesIds: [...currentTopico.questoesIds, editQuestaoId.trim()]
      });
      setEditQuestaoId("");
    }
  };

  // Função para remover ID de questão
  const removeQuestaoId = (index: number) => {
    setNewTopico({
      ...newTopico,
      questoesIds: newTopico.questoesIds.filter((_, i) => i !== index)
    });
  };

  // Função para remover ID de questão durante edição
  const removeQuestaoIdFromEdit = (index: number) => {
    if (currentTopico) {
      setCurrentTopico({
        ...currentTopico,
        questoesIds: currentTopico.questoesIds.filter((_, i) => i !== index)
      });
    }
  };

  // Função para criar tópico
  const handleCreateTopico = () => {
    if (!newTopico.titulo) {
      toast({
        title: "Erro",
        description: "O título é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    const id = (topicos.length + 1).toString();
    setTopicos([...topicos, { ...newTopico, id }]);
    
    // Resetar formulário
    setNewTopico({
      titulo: "",
      thumbnail: "",
      patrocinador: "",
      videoUrl: "",
      pdfUrl: "",
      mapaUrl: "",
      resumoUrl: "",
      questoesIds: []
    });
    
    setIsOpenCreate(false);
    
    toast({
      title: "Sucesso",
      description: "Tópico criado com sucesso!",
    });
  };

  // Função para editar tópico
  const handleEditTopico = () => {
    if (currentTopico && !currentTopico.titulo) {
      toast({
        title: "Erro",
        description: "O título é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    if (currentTopico) {
      setTopicos(topicos.map(t => t.id === currentTopico.id ? currentTopico : t));
      setIsOpenEdit(false);
      
      toast({
        title: "Sucesso",
        description: "Tópico atualizado com sucesso!",
      });
    }
  };

  // Função para deletar tópico
  const handleDeleteTopico = () => {
    if (currentTopico) {
      setTopicos(topicos.filter(t => t.id !== currentTopico.id));
      setIsOpenDelete(false);
      
      toast({
        title: "Sucesso",
        description: "Tópico removido com sucesso!",
      });
    }
  };

  // Função para abrir modal de edição
  const openEditModal = (topico: Topico) => {
    setCurrentTopico(topico);
    setIsOpenEdit(true);
  };

  // Função para abrir modal de exclusão
  const openDeleteModal = (topico: Topico) => {
    setCurrentTopico(topico);
    setIsOpenDelete(true);
  };

  // Função para simular o upload de thumbnail
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      // Em um ambiente real, você enviaria o arquivo para um servidor
      // Aqui, vamos apenas simular com uma URL fictícia
      const fakeThumbnailUrl = `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158`;
      
      if (isEdit && currentTopico) {
        setCurrentTopico({
          ...currentTopico,
          thumbnail: fakeThumbnailUrl
        });
      } else {
        setNewTopico({
          ...newTopico,
          thumbnail: fakeThumbnailUrl
        });
      }

      toast({
        title: "Upload realizado",
        description: "Thumbnail carregada com sucesso!",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#272f3c]">Tópicos</h1>
          <p className="text-[#67748a]">Gerenciamento de tópicos das aulas</p>
        </div>
        <Button 
          onClick={() => setIsOpenCreate(true)}
          className="bg-[#ea2be2] hover:bg-[#ea2be2]/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Tópico
        </Button>
      </div>

      {/* Tabela de Tópicos */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead className="w-[200px]">Título</TableHead>
              <TableHead className="w-[150px]">Patrocinador</TableHead>
              <TableHead className="w-[150px]">Questões</TableHead>
              <TableHead className="w-[150px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topicos.map((topico) => (
              <TableRow key={topico.id}>
                <TableCell className="font-medium">{topico.id}</TableCell>
                <TableCell>{topico.titulo}</TableCell>
                <TableCell>{topico.patrocinador}</TableCell>
                <TableCell>{topico.questoesIds.length} questões</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => openEditModal(topico)} 
                      variant="outline" 
                      size="sm"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => openDeleteModal(topico)} 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Criação */}
      <Dialog open={isOpenCreate} onOpenChange={setIsOpenCreate}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Tópico</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={newTopico.titulo}
                  onChange={(e) => setNewTopico({ ...newTopico, titulo: e.target.value })}
                  placeholder="Digite o título do tópico"
                />
              </div>

              <div>
                <Label htmlFor="thumbnail">Thumbnail</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="thumbnail"
                    type="file"
                    onChange={(e) => handleThumbnailUpload(e, false)}
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
                      onClick={() => document.getElementById('thumbnail')?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="patrocinador">Patrocinador</Label>
                <Input
                  id="patrocinador"
                  value={newTopico.patrocinador}
                  onChange={(e) => setNewTopico({ ...newTopico, patrocinador: e.target.value })}
                  placeholder="Nome do patrocinador"
                />
              </div>

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

              <div className="space-y-2">
                <Label>IDs das Questões</Label>
                <div className="flex gap-2">
                  <Input
                    value={newQuestaoId}
                    onChange={(e) => setNewQuestaoId(e.target.value)}
                    placeholder="Digite o ID da questão"
                  />
                  <Button 
                    type="button" 
                    onClick={addQuestaoId}
                    className="bg-[#ea2be2] hover:bg-[#ea2be2]/90"
                  >
                    Adicionar
                  </Button>
                </div>
                
                {newTopico.questoesIds.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm font-medium">Questões Adicionadas:</p>
                    <div className="flex flex-wrap gap-2">
                      {newTopico.questoesIds.map((id, index) => (
                        <div 
                          key={index}
                          className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
                        >
                          <span className="text-sm">ID: {id}</span>
                          <button
                            onClick={() => removeQuestaoId(index)}
                            className="ml-2 text-gray-500 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              type="button" 
              onClick={handleCreateTopico}
              className="bg-[#ea2be2] hover:bg-[#ea2be2]/90"
            >
              Criar Tópico
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isOpenEdit} onOpenChange={setIsOpenEdit}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Tópico</DialogTitle>
          </DialogHeader>
          {currentTopico && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="edit-titulo">Título *</Label>
                  <Input
                    id="edit-titulo"
                    value={currentTopico.titulo}
                    onChange={(e) => setCurrentTopico({ ...currentTopico, titulo: e.target.value })}
                    placeholder="Digite o título do tópico"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-thumbnail">Thumbnail</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="edit-thumbnail"
                      type="file"
                      onChange={(e) => handleThumbnailUpload(e, true)}
                      className="hidden"
                    />
                    <div className="flex-1 flex">
                      <Input
                        value={currentTopico.thumbnail}
                        onChange={(e) => setCurrentTopico({ ...currentTopico, thumbnail: e.target.value })}
                        placeholder="URL da imagem de capa"
                        className="rounded-r-none"
                      />
                      <Button 
                        type="button" 
                        variant="outline"
                        className="rounded-l-none"
                        onClick={() => document.getElementById('edit-thumbnail')?.click()}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-patrocinador">Patrocinador</Label>
                  <Input
                    id="edit-patrocinador"
                    value={currentTopico.patrocinador}
                    onChange={(e) => setCurrentTopico({ ...currentTopico, patrocinador: e.target.value })}
                    placeholder="Nome do patrocinador"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-videoUrl">Link do Vídeo</Label>
                  <Input
                    id="edit-videoUrl"
                    value={currentTopico.videoUrl}
                    onChange={(e) => setCurrentTopico({ ...currentTopico, videoUrl: e.target.value })}
                    placeholder="URL do vídeo (YouTube, Vimeo, etc.)"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-pdfUrl">Link do PDF</Label>
                  <Input
                    id="edit-pdfUrl"
                    value={currentTopico.pdfUrl}
                    onChange={(e) => setCurrentTopico({ ...currentTopico, pdfUrl: e.target.value })}
                    placeholder="URL do arquivo PDF"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-mapaUrl">Link do Mapa Mental</Label>
                  <Input
                    id="edit-mapaUrl"
                    value={currentTopico.mapaUrl}
                    onChange={(e) => setCurrentTopico({ ...currentTopico, mapaUrl: e.target.value })}
                    placeholder="URL do mapa mental"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-resumoUrl">Link do Resumo</Label>
                  <Input
                    id="edit-resumoUrl"
                    value={currentTopico.resumoUrl}
                    onChange={(e) => setCurrentTopico({ ...currentTopico, resumoUrl: e.target.value })}
                    placeholder="URL do resumo"
                  />
                </div>

                <div className="space-y-2">
                  <Label>IDs das Questões</Label>
                  <div className="flex gap-2">
                    <Input
                      value={editQuestaoId}
                      onChange={(e) => setEditQuestaoId(e.target.value)}
                      placeholder="Digite o ID da questão"
                    />
                    <Button 
                      type="button" 
                      onClick={addQuestaoIdToEdit}
                      className="bg-[#ea2be2] hover:bg-[#ea2be2]/90"
                    >
                      Adicionar
                    </Button>
                  </div>
                  
                  {currentTopico.questoesIds.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm font-medium">Questões Adicionadas:</p>
                      <div className="flex flex-wrap gap-2">
                        {currentTopico.questoesIds.map((id, index) => (
                          <div 
                            key={index}
                            className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
                          >
                            <span className="text-sm">ID: {id}</span>
                            <button
                              onClick={() => removeQuestaoIdFromEdit(index)}
                              className="ml-2 text-gray-500 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              type="button" 
              onClick={handleEditTopico}
              className="bg-[#ea2be2] hover:bg-[#ea2be2]/90"
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Exclusão */}
      <Dialog open={isOpenDelete} onOpenChange={setIsOpenDelete}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Excluir Tópico</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Tem certeza que deseja excluir o tópico "{currentTopico?.titulo}"?</p>
            <p className="text-red-500 mt-2">Esta ação não pode ser desfeita.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleDeleteTopico}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Topicos;
