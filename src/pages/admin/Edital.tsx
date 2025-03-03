
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Plus, Edit, Trash, Power } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Tipos para os dados das disciplinas e editais
interface Disciplina {
  id: string;
  titulo: string;
  descricao: string;
  topicos: string[];
  selecionada: boolean;
}

interface Edital {
  id: string;
  titulo: string;
  disciplinasIds: string[];
  cursoId: string;
  ativo: boolean;
}

const Edital = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("disciplinas");
  
  // Estados para o formulário de disciplina
  const [disciplinaId, setDisciplinaId] = useState("");
  const [disciplinaTitulo, setDisciplinaTitulo] = useState("");
  const [disciplinaDescricao, setDisciplinaDescricao] = useState("");
  const [topicos, setTopicos] = useState<string[]>([""]);
  
  // Estados para as listas
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [editais, setEditais] = useState<Edital[]>([]);
  
  // Estado para o modal de criação de edital
  const [showCriarEditalCard, setShowCriarEditalCard] = useState(false);
  const [cursoId, setCursoId] = useState("");
  const [editalTitulo, setEditalTitulo] = useState("");
  
  // Funções auxiliares
  const adicionarTopico = () => {
    setTopicos([...topicos, ""]);
  };
  
  const atualizarTopico = (index: number, valor: string) => {
    const novosTopicos = [...topicos];
    novosTopicos[index] = valor;
    setTopicos(novosTopicos);
  };
  
  const removerTopico = (index: number) => {
    if (topicos.length > 1) {
      const novosTopicos = [...topicos];
      novosTopicos.splice(index, 1);
      setTopicos(novosTopicos);
    }
  };
  
  const limparFormularioDisciplina = () => {
    setDisciplinaId("");
    setDisciplinaTitulo("");
    setDisciplinaDescricao("");
    setTopicos([""]);
  };
  
  const todasDisciplinasSelecionadas = disciplinas.length > 0 && disciplinas.every(d => d.selecionada);
  
  const handleToggleSelecaoTodas = () => {
    setDisciplinas(disciplinas.map(d => ({...d, selecionada: !todasDisciplinasSelecionadas})));
  };
  
  const handleToggleSelecaoDisciplina = (id: string) => {
    setDisciplinas(disciplinas.map(d => 
      d.id === id ? {...d, selecionada: !d.selecionada} : d
    ));
  };
  
  // Função para adicionar disciplina
  const adicionarDisciplina = () => {
    if (!disciplinaId || !disciplinaTitulo) {
      toast({
        title: "Erro",
        description: "ID e Disciplina são campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    // Verificar se já existe uma disciplina com esse ID
    if (disciplinas.some(d => d.id === disciplinaId)) {
      toast({
        title: "Erro",
        description: "Já existe uma disciplina com esse ID.",
        variant: "destructive"
      });
      return;
    }
    
    // Filtrar tópicos vazios
    const topicosFiltrados = topicos.filter(t => t.trim() !== "");
    
    const novaDisciplina: Disciplina = {
      id: disciplinaId,
      titulo: disciplinaTitulo,
      descricao: disciplinaDescricao,
      topicos: topicosFiltrados,
      selecionada: false
    };
    
    setDisciplinas([...disciplinas, novaDisciplina]);
    limparFormularioDisciplina();
    
    toast({
      title: "Sucesso",
      description: "Disciplina adicionada com sucesso!",
    });
  };
  
  // Função para criar edital
  const criarEdital = () => {
    const disciplinasSelecionadas = disciplinas.filter(d => d.selecionada);
    
    if (disciplinasSelecionadas.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma disciplina para criar o edital.",
        variant: "destructive"
      });
      return;
    }
    
    setShowCriarEditalCard(true);
  };
  
  // Função para salvar edital
  const salvarEdital = () => {
    if (!cursoId || !editalTitulo) {
      toast({
        title: "Erro",
        description: "ID do Curso e Título do Edital são obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    const disciplinasSelecionadas = disciplinas.filter(d => d.selecionada);
    
    const novoEdital: Edital = {
      id: `edital-${editais.length + 1}`,
      titulo: editalTitulo,
      disciplinasIds: disciplinasSelecionadas.map(d => d.id),
      cursoId: cursoId,
      ativo: true
    };
    
    setEditais([...editais, novoEdital]);
    
    // Limpar seleções e fechar o card
    setDisciplinas(disciplinas.map(d => ({...d, selecionada: false})));
    setShowCriarEditalCard(false);
    setCursoId("");
    setEditalTitulo("");
    
    toast({
      title: "Sucesso",
      description: "Edital criado com sucesso!",
    });
  };
  
  // Funções para gerenciar editais
  const toggleAtivoEdital = (id: string) => {
    setEditais(editais.map(e => 
      e.id === id ? {...e, ativo: !e.ativo} : e
    ));
    
    toast({
      title: "Sucesso",
      description: "Status do edital alterado com sucesso!",
    });
  };
  
  const excluirEdital = (id: string) => {
    setEditais(editais.filter(e => e.id !== id));
    
    toast({
      title: "Sucesso",
      description: "Edital excluído com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#272f3c]">Edital Verticalizado</h1>
      <p className="text-[#67748a]">Gerenciamento de editais verticalizados</p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="disciplinas">Disciplinas Cadastradas</TabsTrigger>
          <TabsTrigger value="editais">Editais Verticalizados</TabsTrigger>
        </TabsList>
        
        {/* Aba de Disciplinas Cadastradas */}
        <TabsContent value="disciplinas" className="space-y-6">
          {/* Formulário de cadastro de disciplina */}
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Disciplina</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="disciplina-id">ID</Label>
                  <Input 
                    id="disciplina-id" 
                    value={disciplinaId} 
                    onChange={(e) => setDisciplinaId(e.target.value)}
                    placeholder="Digite o ID da disciplina"
                  />
                </div>
                <div>
                  <Label htmlFor="disciplina-titulo">Disciplina</Label>
                  <Input 
                    id="disciplina-titulo" 
                    value={disciplinaTitulo} 
                    onChange={(e) => setDisciplinaTitulo(e.target.value)}
                    placeholder="Digite o nome da disciplina"
                  />
                </div>
                <div>
                  <Label htmlFor="disciplina-descricao">Descrição</Label>
                  <Input 
                    id="disciplina-descricao" 
                    value={disciplinaDescricao} 
                    onChange={(e) => setDisciplinaDescricao(e.target.value)}
                    placeholder="Digite a descrição da disciplina"
                  />
                </div>
              </div>
              
              <div>
                <Label>Tópicos</Label>
                {topicos.map((topico, index) => (
                  <div key={index} className="flex items-center mt-2 gap-2">
                    <Input 
                      value={topico} 
                      onChange={(e) => atualizarTopico(index, e.target.value)}
                      placeholder={`Tópico ${index + 1}`}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => removerTopico(index)}
                      title="Remover tópico"
                      disabled={topicos.length <= 1}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    {index === topicos.length - 1 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={adicionarTopico}
                        title="Adicionar novo tópico"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={adicionarDisciplina}
                className="bg-[#ea2be2] hover:bg-[#d01ec7] text-white"
              >
                Adicionar Disciplina
              </Button>
            </CardFooter>
          </Card>
          
          {/* Lista de disciplinas */}
          <Card>
            <CardHeader>
              <CardTitle>Disciplinas Cadastradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input 
                          type="checkbox" 
                          checked={todasDisciplinasSelecionadas} 
                          onChange={handleToggleSelecaoTodas}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Disciplina</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Tópicos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disciplinas.length > 0 ? (
                      disciplinas.map((disciplina) => (
                        <TableRow key={disciplina.id}>
                          <TableCell>
                            <input 
                              type="checkbox" 
                              checked={disciplina.selecionada} 
                              onChange={() => handleToggleSelecaoDisciplina(disciplina.id)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          </TableCell>
                          <TableCell>{disciplina.id}</TableCell>
                          <TableCell>{disciplina.titulo}</TableCell>
                          <TableCell>{disciplina.descricao}</TableCell>
                          <TableCell>
                            {disciplina.topicos.length > 0 ? (
                              <ul className="list-disc pl-5">
                                {disciplina.topicos.map((topico, index) => (
                                  <li key={index}>{topico}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-gray-400">Nenhum tópico</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-[#67748a]">
                          Nenhuma disciplina cadastrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={criarEdital}
                className="bg-[#ea2be2] hover:bg-[#d01ec7] text-white"
                disabled={disciplinas.filter(d => d.selecionada).length === 0}
              >
                Criar Edital Verticalizado
              </Button>
            </CardFooter>
          </Card>
          
          {/* Card para criar edital */}
          {showCriarEditalCard && (
            <Card>
              <CardHeader>
                <CardTitle>Criar Edital Verticalizado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="edital-titulo">Título do Edital</Label>
                  <Input 
                    id="edital-titulo" 
                    value={editalTitulo} 
                    onChange={(e) => setEditalTitulo(e.target.value)}
                    placeholder="Digite o título do edital"
                  />
                </div>
                <div>
                  <Label htmlFor="curso-id">ID do Curso</Label>
                  <Input 
                    id="curso-id" 
                    value={cursoId} 
                    onChange={(e) => setCursoId(e.target.value)}
                    placeholder="Digite o ID do curso"
                  />
                </div>
                <div>
                  <Label>Disciplinas Selecionadas</Label>
                  <ul className="list-disc pl-5 mt-2">
                    {disciplinas
                      .filter(d => d.selecionada)
                      .map((d) => (
                        <li key={d.id}>{d.titulo}</li>
                      ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setShowCriarEditalCard(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={salvarEdital}
                  className="bg-[#ea2be2] hover:bg-[#d01ec7] text-white"
                >
                  Salvar Edital
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        {/* Aba de Editais Verticalizados */}
        <TabsContent value="editais" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Editais Verticalizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>ID do Curso</TableHead>
                      <TableHead>Disciplinas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editais.length > 0 ? (
                      editais.map((edital) => (
                        <TableRow key={edital.id}>
                          <TableCell>{edital.id}</TableCell>
                          <TableCell>{edital.titulo}</TableCell>
                          <TableCell>{edital.cursoId}</TableCell>
                          <TableCell>{edital.disciplinasIds.length} disciplinas</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${edital.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {edital.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => {}} // Função para editar edital
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => toggleAtivoEdital(edital.id)}
                                title={edital.ativo ? "Desativar" : "Ativar"}
                              >
                                <Power className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => excluirEdital(edital.id)}
                                title="Excluir"
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-[#67748a]">
                          Nenhum edital cadastrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Edital;
