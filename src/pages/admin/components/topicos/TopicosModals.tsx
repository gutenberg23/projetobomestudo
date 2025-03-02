
import React from "react";
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { TopicosModalsProps } from "./TopicosTypes";

export const TopicosModals: React.FC<TopicosModalsProps> = ({
  isOpenCreate,
  setIsOpenCreate,
  isOpenEdit,
  setIsOpenEdit,
  isOpenDelete,
  setIsOpenDelete,
  currentTopico,
  setCurrentTopico,
  newTopico,
  setNewTopico,
  newQuestaoId,
  setNewQuestaoId,
  editQuestaoId,
  setEditQuestaoId,
  handleCreateTopico,
  handleEditTopico,
  handleDeleteTopico,
  addQuestaoId,
  removeQuestaoId,
  addQuestaoIdToEdit,
  removeQuestaoIdFromEdit,
  handleThumbnailUpload,
  disciplinas
}) => {
  return (
    <>
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
                <Label htmlFor="disciplina">Disciplina</Label>
                <Select
                  value={newTopico.disciplina}
                  onValueChange={(value) => setNewTopico({ ...newTopico, disciplina: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    {disciplinas.map((disciplina) => (
                      <SelectItem key={disciplina} value={disciplina}>
                        {disciplina}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <Label htmlFor="edit-disciplina">Disciplina</Label>
                  <Select
                    value={currentTopico.disciplina}
                    onValueChange={(value) => setCurrentTopico({ ...currentTopico, disciplina: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione uma disciplina" />
                    </SelectTrigger>
                    <SelectContent>
                      {disciplinas.map((disciplina) => (
                        <SelectItem key={disciplina} value={disciplina}>
                          {disciplina}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="edit-abrirVideoEm">Abrir Vídeo</Label>
                  <Select
                    value={currentTopico.abrirVideoEm || "site"}
                    onValueChange={(value: "site" | "destino") => setCurrentTopico({ ...currentTopico, abrirVideoEm: value })}
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
    </>
  );
};
