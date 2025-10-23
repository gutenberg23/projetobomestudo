import { useState, useEffect, useRef } from 'react';
import { Concurso, ConcursoFormData, Estado, NivelEnsino, Cargo } from '@/types/concurso';
import { BlogPost } from '@/components/blog/types';
import { XCircle, PlusCircle, HelpCircle, Search, X } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface FormularioConcursoProps {
  concursoInicial: Concurso | null;
  posts: BlogPost[];
  onSalvar: (formData: ConcursoFormData) => void;
  onCancelar: () => void;
}

// Lista de estados brasileiros
const ESTADOS: Estado[] = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR',
  'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
  'Federal', 'Nacional'
];

// Lista de níveis de ensino
const NIVEIS: NivelEnsino[] = ['Ensino Fundamental', 'Ensino Médio', 'Ensino Superior'];

const FormularioConcurso = ({ concursoInicial, posts, onSalvar, onCancelar }: FormularioConcursoProps) => {
  // Estado do formulário
  const [formData, setFormData] = useState<ConcursoFormData>({
    titulo: '',
    dataInicioInscricao: '',
    dataFimInscricao: '',
    dataProva: undefined,
    prorrogado: false,
    niveis: [],
    cargos: [],
    vagas: 0,
    salario: '',
    estados: [],
    postId: undefined,
    destacar: false
  });
  
  // Estado para novo cargo a ser adicionado
  const [novoCargo, setNovoCargo] = useState<string>('');
  
  // Estado para o textarea de múltiplos cargos
  const [cargosText, setCargosText] = useState<string>('');
  
  // Estado para controlar a visibilidade do diálogo de cargos em massa
  const [isMassCargoDialogOpen, setIsMassCargoDialogOpen] = useState<boolean>(false);
  
  // Estados para o campo de pesquisa de posts
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(posts);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Post selecionado (para exibição)
  const selectedPost = posts.find(post => post.id === formData.postId) || null;
  
  // Preencher o formulário se estiver editando um concurso existente
  useEffect(() => {
    if (concursoInicial) {
      // Tratar datas para garantir o formato correto para inputs date
      const formatarDataParaInput = (dataString?: string | null): string => {
        if (!dataString) return '';
        // Se já estiver no formato correto (YYYY-MM-DD), usar diretamente
        if (dataString.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return dataString;
        }
        // Se for um datetime, extrair apenas a data
        try {
          const date = new Date(dataString);
          return date.toISOString().split('T')[0];
        } catch {
          return '';
        }
      };

      setFormData({
        titulo: concursoInicial.titulo,
        dataInicioInscricao: formatarDataParaInput(concursoInicial.dataInicioInscricao),
        dataFimInscricao: formatarDataParaInput(concursoInicial.dataFimInscricao),
        dataProva: concursoInicial.dataProva ? formatarDataParaInput(concursoInicial.dataProva) : undefined,
        prorrogado: concursoInicial.prorrogado || false,
        niveis: concursoInicial.niveis,
        cargos: concursoInicial.cargos,
        vagas: concursoInicial.vagas,
        salario: concursoInicial.salario,
        estados: concursoInicial.estados,
        postId: concursoInicial.postId,
        destacar: concursoInicial.destacar || false
      });
    }
  }, [concursoInicial]);
  
  // Filtrar posts com base no termo de busca
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPosts(posts);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = posts.filter(post => 
        post.title.toLowerCase().includes(term) || 
        post.category.toLowerCase().includes(term)
      );
      setFilteredPosts(filtered);
    }
  }, [searchTerm, posts]);
  
  // Focar no input de pesquisa quando o campo é aberto
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);
  
  // Manipuladores de eventos para campos do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'vagas') {
      setFormData({
        ...formData,
        [name]: parseInt(value) || 0
      });
    } else if (name === 'dataProva') {
      // Tratar o valor null/empty do campo de data da prova
      setFormData({
        ...formData,
        [name]: value || undefined
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Manipulador para checkbox de prorrogação
  const handleProrrogadoChange = (checked: boolean) => {
    setFormData({
      ...formData,
      prorrogado: checked
    });
  };
  
  // Manipulador para checkbox de destaque
  const handleDestacarChange = (checked: boolean) => {
    setFormData({
      ...formData,
      destacar: checked
    });
  };
  
  // Manipulador para checkboxes de níveis
  const handleNivelChange = (nivel: NivelEnsino) => {
    const niveis = formData.niveis.includes(nivel)
      ? formData.niveis.filter(n => n !== nivel)
      : [...formData.niveis, nivel];
    
    setFormData({
      ...formData,
      niveis
    });
  };
  
  // Manipulador para checkboxes de estados
  const handleEstadoChange = (estado: Estado) => {
    const estados = formData.estados.includes(estado)
      ? formData.estados.filter(e => e !== estado)
      : [...formData.estados, estado];
    
    setFormData({
      ...formData,
      estados
    });
  };

  // Função para selecionar/desmarcar todos os estados
  const toggleTodosEstados = () => {
    // Se já tiver todos os estados selecionados, desmarca todos
    // Caso contrário, seleciona todos
    const todosEstadosSelecionados = ESTADOS.length === formData.estados.length;
    
    setFormData({
      ...formData,
      estados: todosEstadosSelecionados ? [] : [...ESTADOS]
    });
  };

  // Manipulador para seleção de post
  const handlePostChange = (postId: string) => {
    setFormData({
      ...formData,
      postId: postId === "none" ? undefined : postId,
    });
    setIsSearchOpen(false);
    setSearchTerm('');
  };
  
  // Limpar seleção de post
  const clearPostSelection = () => {
    setFormData({
      ...formData,
      postId: undefined,
    });
  };
  
  // Adicionar novo cargo
  const adicionarCargo = () => {
    if (novoCargo.trim() && !formData.cargos.some(c => 
      (typeof c === 'string' && c === novoCargo.trim()) || 
      (typeof c === 'object' && c.nome === novoCargo.trim())
    )) {
      setFormData({
        ...formData,
        cargos: [...formData.cargos, novoCargo.trim()]
      });
      setNovoCargo('');
    }
  };
  
  // Adicionar múltiplos cargos
  const adicionarCargosEmMassa = () => {
    if (cargosText.trim()) {
      const novosCargos = cargosText
        .split('\n')
        .map(cargo => cargo.trim())
        .filter(cargo => cargo.length > 0)
        .filter(cargo => !formData.cargos.some(c => 
          (typeof c === 'string' && c === cargo) || 
          (typeof c === 'object' && c.nome === cargo)
        ));
      
      if (novosCargos.length > 0) {
        setFormData({
          ...formData,
          cargos: [...formData.cargos, ...novosCargos]
        });
        setCargosText('');
        setIsMassCargoDialogOpen(false);
      }
    }
  };
  
  // Remover cargo
  const removerCargo = (cargoParaRemover: Cargo) => {
    setFormData({
      ...formData,
      cargos: formData.cargos.filter(cargo => {
        if (typeof cargo === 'string' && typeof cargoParaRemover === 'string') {
          return cargo !== cargoParaRemover;
        } else if (typeof cargo === 'object' && typeof cargoParaRemover === 'object') {
          return cargo.nome !== cargoParaRemover.nome;
        } else if (typeof cargo === 'string' && typeof cargoParaRemover === 'object') {
          return cargo !== cargoParaRemover.nome;
        } else {
          return (cargo as {nome: string}).nome !== cargoParaRemover;
        }
      })
    });
  };
  
  // Submeter formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvar(formData);
  };
  
  // Helper para exibir texto do cargo
  const exibirTextoCargo = (cargo: Cargo): string => {
    return typeof cargo === 'string' ? cargo : cargo.nome;
  };
  
  return (
    <Card className="border bg-white shadow-sm">
      <CardHeader className="border-b bg-gray-50/80">
        <CardTitle>{concursoInicial ? 'Editar Concurso' : 'Novo Concurso'}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título do Concurso */}
          <div className="space-y-2">
            <Label htmlFor="titulo" className="font-medium">
              Título do Concurso
            </Label>
            <Input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              className="w-full"
              required
            />
          </div>
          
          {/* Período de Inscrição e Data da Prova */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="dataInicioInscricao" className="font-medium">
                Data de Início
              </Label>
              <Input
                type="date"
                id="dataInicioInscricao"
                name="dataInicioInscricao"
                value={formData.dataInicioInscricao}
                onChange={handleInputChange}
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataFimInscricao" className="font-medium">
                Data de Término
              </Label>
              <Input
                type="date"
                id="dataFimInscricao"
                name="dataFimInscricao"
                value={formData.dataFimInscricao}
                onChange={handleInputChange}
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataProva" className="font-medium">
                Data da Prova
              </Label>
              <Input
                type="date"
                id="dataProva"
                name="dataProva"
                value={formData.dataProva ?? ''}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="prorrogado" 
                checked={formData.prorrogado} 
                onCheckedChange={handleProrrogadoChange}
              />
              <div className="flex items-center">
                <Label htmlFor="prorrogado" className="font-medium cursor-pointer">
                  Inscrição Prorrogada
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Marque esta opção se a data de inscrição foi prorrogada</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          
          {/* Opção de Destaque */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="destacar" 
              checked={formData.destacar || false} 
              onCheckedChange={handleDestacarChange}
            />
            <div className="flex items-center">
              <Label htmlFor="destacar" className="font-medium cursor-pointer">
                Destacar na página inicial
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Marque esta opção para destacar este concurso na homepage</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* Níveis de Ensino */}
          <div className="space-y-2">
            <Label className="font-medium">Nível</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {NIVEIS.map((nivel) => (
                <div key={nivel} className="flex items-center space-x-2">
                  <Checkbox
                    id={`nivel-${nivel}`}
                    checked={formData.niveis.includes(nivel)}
                    onCheckedChange={() => handleNivelChange(nivel)}
                  />
                  <Label htmlFor={`nivel-${nivel}`} className="cursor-pointer">
                    {nivel}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Cargos */}
          <div className="space-y-2">
            <Label className="font-medium">Cargos</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={novoCargo}
                onChange={(e) => setNovoCargo(e.target.value)}
                className="flex-grow"
                placeholder="Adicionar cargo"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    adicionarCargo();
                  }
                }}
              />
              <Button
                type="button"
                onClick={adicionarCargo}
                variant="default"
                size="icon"
              >
                <PlusCircle className="h-5 w-5" />
              </Button>
              <Dialog open={isMassCargoDialogOpen} onOpenChange={setIsMassCargoDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    Adicionar vários
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Adicionar múltiplos cargos</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Cole um cargo por linha. Cargos já existentes serão ignorados.
                    </p>
                    <Textarea
                      value={cargosText}
                      onChange={(e) => setCargosText(e.target.value)}
                      placeholder="Exemplo:
Professor
Médico
Enfermeiro"
                      className="min-h-[200px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsMassCargoDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        onClick={adicionarCargosEmMassa}
                      >
                        Adicionar todos
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Tags de cargos adicionados */}
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.cargos.map((cargo, index) => (
                <div
                  key={`cargo-${index}`}
                  className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm"
                >
                  <span>{exibirTextoCargo(cargo)}</span>
                  <button
                    type="button"
                    onClick={() => removerCargo(cargo)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Vagas e Salário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vagas" className="font-medium">
                Vagas
              </Label>
              <Input
                type="number"
                id="vagas"
                name="vagas"
                value={formData.vagas}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salario" className="font-medium">
                Salário
              </Label>
              <Input
                type="text"
                id="salario"
                name="salario"
                value={formData.salario}
                onChange={handleInputChange}
                placeholder="Ex: Até R$ 10.450,00"
                required
              />
            </div>
          </div>
          
          {/* Estados */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
            <Label className="font-medium">Estados</Label>
              <Button
                type="button"
                onClick={toggleTodosEstados}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                {ESTADOS.length === formData.estados.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {ESTADOS.map((estado) => (
                <div key={estado} className="flex items-center space-x-2">
                  <Checkbox
                    id={`estado-${estado}`}
                    checked={formData.estados.includes(estado)}
                    onCheckedChange={() => handleEstadoChange(estado)}
                  />
                  <Label htmlFor={`estado-${estado}`} className="cursor-pointer">
                    {estado}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Post Relacionado */}
          <div className="space-y-2">
            <Label className="font-medium">
              Post Relacionado
            </Label>
            
            {/* Exibição do post selecionado */}
            {selectedPost ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedPost.title}</p>
                  <p className="text-xs text-gray-500">{selectedPost.category}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearPostSelection}
                  className="ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="relative">
                <div 
                  className="flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-gray-50"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <span className="text-gray-500">
                    {isSearchOpen ? "Digite para pesquisar..." : "Selecione um post relacionado"}
                  </span>
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                
                {/* Campo de pesquisa */}
                {isSearchOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                    <div className="p-2 border-b">
                      <Input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Pesquisar posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto">
                      <div 
                        className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                        onClick={() => handlePostChange("none")}
                      >
                        Nenhum
                      </div>
                      {filteredPosts.map((post) => (
                        <div 
                          key={post.id}
                          className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
                          onClick={() => handlePostChange(post.id)}
                        >
                          <p className="font-medium">{post.title}</p>
                          <p className="text-xs text-gray-500">{post.category}</p>
                        </div>
                      ))}
                      {filteredPosts.length === 0 && searchTerm && (
                        <div className="px-4 py-2 text-sm text-gray-500">
                          Nenhum post encontrado
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <p className="text-sm text-gray-500 mt-1">
              Opcional. Você pode vincular um post do blog com mais detalhes sobre este concurso.
            </p>
          </div>
          
          {/* Botões de ação */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline" 
              onClick={onCancelar}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {concursoInicial ? 'Salvar alterações' : 'Criar concurso'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FormularioConcurso;