import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MoreVertical, File, Folder, Upload, Trash2, Download } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ItemType = "Funcionalidades Novas" | "Bugs" | "Administrativo" | "Outros";

interface KanbanItem {
  id: string;
  title: string;
  type: ItemType;
  votes: number;
  comments: number;
  upvotes: number;
}

interface Column {
  id: string;
  title: string;
  items: KanbanItem[];
}

interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: number;
  lastModified: Date;
  parentId: string | null;
}

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
  // Estado do Kanban
  const [columns, setColumns] = useState<{ [key: string]: Column }>({
    ideias: {
      id: "ideias",
      title: "Ideias",
      items: []
    },
    proximo: {
      id: "proximo",
      title: "Próximo",
      items: []
    },
    emProgresso: {
      id: "emProgresso",
      title: "Em Progresso",
      items: []
    },
    feito: {
      id: "feito",
      title: "Feito",
      items: []
    }
  });

  // Estado do Gerenciador de Arquivos
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const savedColumns = localStorage.getItem("kanbanColumns");
    const savedFiles = localStorage.getItem("fileManagerFiles");
    
    if (savedColumns) {
      setColumns(JSON.parse(savedColumns));
    }
    
    if (savedFiles) {
      setFiles(JSON.parse(savedFiles));
    }
  }, []);

  // Salvar dados no localStorage quando houver mudanças
  useEffect(() => {
    localStorage.setItem("kanbanColumns", JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem("fileManagerFiles", JSON.stringify(files));
  }, [files]);

  // Funções do Kanban
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = source.droppableId === destination.droppableId 
      ? sourceItems 
      : [...destColumn.items];

    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);

    setColumns({
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
        items: sourceItems
      },
      [destination.droppableId]: {
        ...destColumn,
        items: destItems
      }
    });
  };

  const handleAddItem = (columnId: string) => {
    setSelectedColumn(columnId);
    setNewItem({ title: "", type: "Funcionalidades Novas" });
    setIsAddModalOpen(true);
  };

  const handleSubmitNewItem = () => {
    if (!selectedColumn || !newItem.title) return;

    const newKanbanItem: KanbanItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: newItem.title,
      type: newItem.type,
      votes: 0,
      comments: 0,
      upvotes: 0
    };

    setColumns(prev => ({
      ...prev,
      [selectedColumn]: {
        ...prev[selectedColumn],
        items: [...prev[selectedColumn].items, newKanbanItem]
      }
    }));

    setIsAddModalOpen(false);
    setNewItem({ title: "", type: "Funcionalidades Novas" });
  };

  const handleDeleteItem = (columnId: string, itemId: string) => {
    setColumns(prev => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        items: prev[columnId].items.filter(item => item.id !== itemId)
      }
    }));
  };

  // Funções do Gerenciador de Arquivos
  const handleCreateFolder = () => {
    if (!newFolderName) return;

    const newFolder: FileItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newFolderName,
      type: "folder",
      lastModified: new Date(),
      parentId: currentFolder
    };

    setFiles(prev => [...prev, newFolder]);
    setNewFolderName("");
    setIsNewFolderDialogOpen(false);
  };

  const handleUploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const newFile: FileItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: "file",
        size: file.size,
        lastModified: new Date(file.lastModified),
        parentId: currentFolder
      };

      setFiles(prev => [...prev, newFile]);
    });
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleDownloadFile = (file: FileItem) => {
    // Implementar lógica de download
    console.log("Downloading file:", file);
  };

  const getCurrentFolderFiles = () => {
    return files.filter(file => file.parentId === currentFolder);
  };

  const getParentFolder = () => {
    if (!currentFolder) return null;
    return files.find(file => file.id === currentFolder);
  };

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    title: "",
    type: "Funcionalidades Novas" as ItemType
  });

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

          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(columns).map(([columnId, column]) => (
                <div key={columnId} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-[#272f3c] flex items-center gap-2">
                      {column.title}
                      <span className="text-sm bg-gray-100 px-2 py-0.5 rounded-full">
                        {column.items.length}
                      </span>
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAddItem(columnId)}
                      className="h-8 w-8"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <Droppable droppableId={columnId}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2 min-h-[200px]"
                      >
                        {column.items.map((item, index) => (
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
                                      <DropdownMenuItem onClick={() => handleDeleteItem(columnId, item.id)}>
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
        </TabsContent>

        <TabsContent value="files">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#272f3c]">Gerenciador de Arquivos</h1>
              <p className="text-[#67748a]">Organize seus arquivos e pastas</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsNewFolderDialogOpen(true)}>
                <Folder className="h-4 w-4 mr-2" />
                Nova Pasta
              </Button>
              <Button onClick={() => document.getElementById("file-upload")?.click()}>
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

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" onClick={() => setCurrentFolder(null)}>
                Início
              </Button>
              {getParentFolder() && (
                <>
                  <span>/</span>
                  <Button variant="ghost" onClick={() => setCurrentFolder(getParentFolder()?.parentId || null)}>
                    {getParentFolder()?.name}
                  </Button>
                </>
              )}
            </div>

            <div className="grid grid-cols-4 gap-4">
              {getCurrentFolderFiles().map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => file.type === "folder" && setCurrentFolder(file.id)}
                >
                  <div className="flex items-center gap-2">
                    {file.type === "folder" ? (
                      <Folder className="h-6 w-6 text-blue-500" />
                    ) : (
                      <File className="h-6 w-6 text-gray-500" />
                    )}
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {file.type === "file" && file.size
                          ? `${(file.size / 1024).toFixed(2)} KB`
                          : "Pasta"}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {file.type === "file" && (
                        <DropdownMenuItem onClick={() => handleDownloadFile(file)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteFile(file.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="column">Coluna</Label>
              <Select value={selectedColumn || ""} onValueChange={setSelectedColumn}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a coluna" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(columns).map(([id, column]) => (
                    <SelectItem key={id} value={id}>
                      {column.title}
                    </SelectItem>
                  ))}
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