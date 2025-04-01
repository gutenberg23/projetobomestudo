import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MoreVertical, File, Folder, Upload, Trash2, Download } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useKanban } from "@/hooks/useKanban";
import { useFileManager } from "@/hooks/useFileManager";
import { ItemType } from "@/types/kanban";
import { Spinner } from "@/components/ui/spinner";

const getTypeColor = (type: ItemType) => {
  switch (type) {
    case "Funcionalidades Novas":
      return "bg-blue-100 text-blue-800";
    case "Bugs":
      return "bg-red-100 text-red-800";
    case "Administrativo":
      return "bg-purple-100 text-purple-800";
    case "Outros":
      return "bg-gray-100 text-gray-800";
  }
};

const Kanban = () => {
  const {
    columns,
    items,
    loading: loadingKanban,
    addItem,
    moveItem,
    deleteItem
  } = useKanban();

  const {
    files,
    loading: loadingFiles,
    createFolder,
    uploadFile,
    deleteFile,
    downloadFile
  } = useFileManager();

  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    title: "",
    type: "Funcionalidades Novas" as ItemType
  });

  // Funções do Kanban
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId !== destination.droppableId) {
      await moveItem(draggableId, destination.droppableId);
    }
  };

  const handleAddItem = (columnId: string) => {
    setSelectedColumn(columnId);
    setNewItem({ title: "", type: "Funcionalidades Novas" });
    setIsAddModalOpen(true);
  };

  const handleSubmitNewItem = async () => {
    if (!selectedColumn || !newItem.title) return;
    await addItem(selectedColumn, newItem.title, newItem.type);
    setIsAddModalOpen(false);
    setNewItem({ title: "", type: "Funcionalidades Novas" });
  };

  // Funções do Gerenciador de Arquivos
  const handleCreateFolder = async () => {
    if (!newFolderName) return;
    await createFolder(newFolderName, currentFolder);
    setNewFolderName("");
    setIsNewFolderDialogOpen(false);
  };

  const handleUploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      await uploadFile(file, currentFolder);
    }
  };

  const getCurrentFolderFiles = () => {
    return files.filter(file => file.parent_id === currentFolder);
  };

  const getParentFolder = () => {
    if (!currentFolder) return null;
    return files.find(file => file.id === currentFolder);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="kanban">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="files">Arquivos</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#272f3c]">Kanban</h1>
              <p className="text-[#67748a]">Gerencie suas tarefas e projetos</p>
            </div>
          </div>

          {loadingKanban ? (
            <div className="flex justify-center items-center h-64">
              <Spinner />
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-4 gap-4">
                {columns.map((column) => (
                  <div key={column.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="font-semibold text-[#272f3c] flex items-center gap-2">
                        {column.title}
                        <span className="text-sm bg-gray-100 px-2 py-0.5 rounded-full">
                          {items.filter(item => item.column_id === column.id).length}
                        </span>
                      </h2>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAddItem(column.id)}
                        className="h-8 w-8"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <Droppable droppableId={column.id}>
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2 min-h-[200px]"
                        >
                          {items
                            .filter(item => item.column_id === column.id)
                            .map((item, index) => (
                              <Draggable key={item.id} draggableId={item.id} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="bg-white border rounded-lg p-3 shadow-sm"
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(item.type)}`}>
                                        {item.type}
                                      </span>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-6 w-6">
                                            <MoreVertical className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                          <DropdownMenuItem onClick={() => deleteItem(item.id)}>
                                            Excluir
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </DragDropContext>
          )}
        </TabsContent>

        <TabsContent value="files">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-[#272f3c]">Gerenciador de Arquivos</h1>
                <p className="text-[#67748a]">Organize seus arquivos e pastas</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsNewFolderDialogOpen(true)}
                  className="border-[#5f2ebe] text-[#5f2ebe] hover:bg-[#5f2ebe] hover:text-white transition-colors"
                >
                  <Folder className="h-4 w-4 mr-2" />
                  Nova Pasta
                </Button>
                <Button 
                  onClick={() => document.getElementById("file-upload")?.click()}
                  className="bg-[#5f2ebe] hover:bg-[#4f25a0] text-white transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleUploadFile}
                />
              </div>
            </div>

            {loadingFiles ? (
              <div className="flex justify-center items-center h-64">
                <Spinner />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Breadcrumb e Estatísticas */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-[#67748a] bg-white p-2 rounded-lg border">
                    <Button 
                      variant="ghost" 
                      onClick={() => setCurrentFolder(null)}
                      className="h-8 px-3 text-[#5f2ebe] hover:text-[#4f25a0] hover:bg-[#5f2ebe10]"
                    >
                      <Folder className="h-4 w-4 mr-2" />
                      Início
                    </Button>
                    {getParentFolder() && (
                      <>
                        <div className="flex items-center">
                          <span className="mx-2 text-[#67748a]">/</span>
                          <Button 
                            variant="ghost" 
                            onClick={() => setCurrentFolder(getParentFolder()?.parent_id || null)}
                            className="h-8 px-3 text-[#5f2ebe] hover:text-[#4f25a0] hover:bg-[#5f2ebe10]"
                          >
                            <Folder className="h-4 w-4 mr-2" />
                            {getParentFolder()?.name}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex gap-4 text-sm text-[#67748a] bg-white p-2 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-[#5f2ebe]" />
                      <span>
                        <span className="font-medium text-[#272f3c]">
                          {getCurrentFolderFiles().filter(f => f.type === "folder").length}
                        </span> pastas
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4 text-[#5f2ebe]" />
                      <span>
                        <span className="font-medium text-[#272f3c]">
                          {getCurrentFolderFiles().filter(f => f.type === "file").length}
                        </span> arquivos
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lista de Arquivos */}
                <div className="grid grid-cols-1 gap-2">
                  {getCurrentFolderFiles().map((file) => (
                    <div
                      key={file.id}
                      className="group flex items-center justify-between p-4 border rounded-lg hover:border-[#5f2ebe] transition-colors cursor-pointer bg-white"
                      onClick={() => file.type === "folder" && setCurrentFolder(file.id)}
                    >
                      <div className="flex items-center gap-4">
                        {file.type === "folder" ? (
                          <div className="p-2 bg-[#5f2ebe10] rounded-lg group-hover:bg-[#5f2ebe20]">
                            <Folder className="h-6 w-6 text-[#5f2ebe]" />
                          </div>
                        ) : (
                          <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100">
                            <File className="h-6 w-6 text-[#67748a]" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-[#272f3c] group-hover:text-[#5f2ebe]">
                            {file.name}
                          </p>
                          <div className="flex gap-4 text-sm text-[#67748a]">
                            <span>{file.type === "file" ? "Arquivo" : "Pasta"}</span>
                            {file.type === "file" && file.size && (
                              <span>{(file.size / 1024).toFixed(2)} KB</span>
                            )}
                            <span>
                              {new Date(file.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.type === "file" && file.url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[#67748a] hover:text-[#5f2ebe]"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadFile(file.url);
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#67748a] hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFile(file.id, file.type === "folder");
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {getCurrentFolderFiles().length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-[#67748a]">
                      <Folder className="h-12 w-12 mb-4 text-[#5f2ebe20]" />
                      <p className="text-lg font-medium">Pasta vazia</p>
                      <p className="text-sm">Adicione arquivos ou crie uma nova pasta</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar novo item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newItem.title}
                onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Digite o título do item..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={newItem.type}
                onValueChange={(value: ItemType) => setNewItem(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Funcionalidades Novas">Funcionalidades Novas</SelectItem>
                  <SelectItem value="Bugs">Bugs</SelectItem>
                  <SelectItem value="Administrativo">Administrativo</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmitNewItem}>
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Pasta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Nome da Pasta</Label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Digite o nome da pasta..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsNewFolderDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateFolder}>
                Criar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Kanban; 