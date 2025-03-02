
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  CalendarIcon, 
  Image as ImageIcon,
  CheckCircle, 
  XCircle, 
  PauseCircle 
} from "lucide-react";

interface Anuncio {
  id: string;
  imagem: string;
  pagina: string;
  posicao: string;
  dataInicio: Date | undefined;
  dataTermino: Date | undefined;
  status: "ativo" | "pausado" | "expirado";
  url: string;
}

// Dados iniciais para demonstração
const anunciosIniciais: Anuncio[] = [
  {
    id: "1",
    imagem: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&auto=format&fit=crop",
    pagina: "landing-page",
    posicao: "topo",
    dataInicio: new Date(2023, 9, 1),
    dataTermino: new Date(2023, 11, 31),
    status: "ativo",
    url: "https://example.com/promocao"
  },
  {
    id: "2",
    imagem: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop",
    pagina: "explore",
    posicao: "lateral",
    dataInicio: new Date(2023, 10, 15),
    dataTermino: new Date(2024, 1, 15),
    status: "ativo",
    url: "https://example.com/black-friday"
  },
  {
    id: "3",
    imagem: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&auto=format&fit=crop",
    pagina: "blog",
    posicao: "rodape",
    dataInicio: new Date(2023, 8, 15),
    dataTermino: new Date(2023, 9, 15),
    status: "expirado",
    url: "https://example.com/oferta-anterior"
  }
];

const Anuncios = () => {
  const [anuncios, setAnuncios] = useState<Anuncio[]>(anunciosIniciais);
  const [paginaAtual, setPaginaAtual] = useState<string>("landing-page");
  const [novoAnuncio, setNovoAnuncio] = useState<Omit<Anuncio, "id">>({
    imagem: "",
    pagina: "landing-page",
    posicao: "topo",
    dataInicio: undefined,
    dataTermino: undefined,
    status: "ativo",
    url: ""
  });

  const handleAdicionarAnuncio = () => {
    const id = Math.random().toString(36).substr(2, 9);
    const anuncioCompleto = { ...novoAnuncio, id };
    setAnuncios([...anuncios, anuncioCompleto]);
    
    // Resetar form
    setNovoAnuncio({
      imagem: "",
      pagina: paginaAtual,
      posicao: "topo",
      dataInicio: undefined,
      dataTermino: undefined,
      status: "ativo",
      url: ""
    });
  };

  const handleAtualizarStatus = (id: string, novoStatus: "ativo" | "pausado" | "expirado") => {
    setAnuncios(anuncios.map(anuncio => 
      anuncio.id === id ? { ...anuncio, status: novoStatus } : anuncio
    ));
  };

  const handleRemoverAnuncio = (id: string) => {
    if (confirm("Tem certeza que deseja remover este anúncio?")) {
      setAnuncios(anuncios.filter(anuncio => anuncio.id !== id));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ativo":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pausado":
        return <PauseCircle className="h-5 w-5 text-amber-500" />;
      case "expirado":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getPaginaLabel = (pagina: string) => {
    switch (pagina) {
      case "landing-page": return "Página Inicial";
      case "my-courses": return "Meus Cursos";
      case "explore": return "Explorar";
      case "courses": return "Cursos";
      case "questions": return "Questões";
      case "blog": return "Blog";
      default: return pagina;
    }
  };

  const getPosicaoLabel = (posicao: string) => {
    switch (posicao) {
      case "topo": return "Topo";
      case "lateral": return "Lateral";
      case "rodape": return "Rodapé";
      default: return posicao;
    }
  };

  const anunciosFiltrados = anuncios.filter(a => a.pagina === paginaAtual);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#272f3c]">Anúncios</h1>
          <p className="text-[#67748a]">Gerenciamento de anúncios do site</p>
        </div>
      </div>

      <Tabs defaultValue="landing-page" onValueChange={(value) => setPaginaAtual(value)}>
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 mb-6">
          <TabsTrigger value="landing-page">Página Inicial</TabsTrigger>
          <TabsTrigger value="my-courses">Meus Cursos</TabsTrigger>
          <TabsTrigger value="explore">Explorar</TabsTrigger>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="questions">Questões</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
        </TabsList>

        {["landing-page", "my-courses", "explore", "courses", "questions", "blog"].map((pagina) => (
          <TabsContent key={pagina} value={pagina} className="space-y-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Adicionar Novo Anúncio</CardTitle>
                <CardDescription>Configure um novo anúncio para a página {getPaginaLabel(pagina)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="imagem">URL da Imagem</Label>
                    <div className="flex">
                      <Input 
                        id="imagem" 
                        placeholder="https://example.com/imagem.jpg" 
                        value={novoAnuncio.imagem}
                        onChange={(e) => setNovoAnuncio({...novoAnuncio, imagem: e.target.value, pagina})}
                      />
                      <div className="ml-2">
                        <Button variant="outline" size="icon">
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url">URL de Destino</Label>
                    <Input 
                      id="url" 
                      placeholder="https://example.com/destino" 
                      value={novoAnuncio.url}
                      onChange={(e) => setNovoAnuncio({...novoAnuncio, url: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="posicao">Posição</Label>
                    <Select 
                      value={novoAnuncio.posicao}
                      onValueChange={(value) => setNovoAnuncio({...novoAnuncio, posicao: value})}
                    >
                      <SelectTrigger id="posicao">
                        <SelectValue placeholder="Selecione a posição" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="topo">Topo</SelectItem>
                        <SelectItem value="lateral">Lateral</SelectItem>
                        <SelectItem value="rodape">Rodapé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={novoAnuncio.status}
                      onValueChange={(value: "ativo" | "pausado" | "expirado") => setNovoAnuncio({...novoAnuncio, status: value})}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="pausado">Pausado</SelectItem>
                        <SelectItem value="expirado">Expirado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Data de Início</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {novoAnuncio.dataInicio ? (
                            format(novoAnuncio.dataInicio, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={novoAnuncio.dataInicio}
                          onSelect={(date) => setNovoAnuncio({...novoAnuncio, dataInicio: date})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Data de Término</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {novoAnuncio.dataTermino ? (
                            format(novoAnuncio.dataTermino, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={novoAnuncio.dataTermino}
                          onSelect={(date) => setNovoAnuncio({...novoAnuncio, dataTermino: date})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {novoAnuncio.imagem && (
                  <div className="mt-4 border rounded-md p-2">
                    <Label className="mb-2 block">Pré-visualização</Label>
                    <div className="aspect-video w-full max-w-md mx-auto overflow-hidden rounded-md bg-slate-100">
                      <img
                        src={novoAnuncio.imagem}
                        alt="Pré-visualização do anúncio"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://placehold.co/600x400?text=Imagem+não+encontrada";
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleAdicionarAnuncio}
                  disabled={!novoAnuncio.imagem || !novoAnuncio.url}
                  className="bg-[#ea2be2] hover:bg-[#ea2be2]/90"
                >
                  Adicionar Anúncio
                </Button>
              </CardFooter>
            </Card>

            <h3 className="text-lg font-medium mb-4">Anúncios Existentes ({anunciosFiltrados.length})</h3>
            
            {anunciosFiltrados.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border">
                <p className="text-[#67748a]">Nenhum anúncio cadastrado para esta página.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {anunciosFiltrados.map((anuncio) => (
                  <Card key={anuncio.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Anúncio - {getPosicaoLabel(anuncio.posicao)}</CardTitle>
                          <CardDescription>
                            <div className="flex items-center mt-1">
                              {getStatusIcon(anuncio.status)}
                              <span className="ml-1 capitalize">{anuncio.status}</span>
                            </div>
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAtualizarStatus(anuncio.id, "ativo")}
                            disabled={anuncio.status === "ativo"}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Ativar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAtualizarStatus(anuncio.id, "pausado")}
                            disabled={anuncio.status === "pausado"}
                          >
                            <PauseCircle className="h-4 w-4 mr-1" />
                            Pausar
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="aspect-video w-full overflow-hidden rounded-md bg-slate-100">
                          <img
                            src={anuncio.imagem}
                            alt={`Anúncio em ${getPaginaLabel(anuncio.pagina)}`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://placehold.co/600x400?text=Imagem+não+encontrada";
                            }}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-semibold">URL:</p>
                            <p className="truncate text-gray-500">{anuncio.url}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Posição:</p>
                            <p className="text-gray-500">{getPosicaoLabel(anuncio.posicao)}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Data de Início:</p>
                            <p className="text-gray-500">
                              {anuncio.dataInicio ? format(anuncio.dataInicio, "dd/MM/yyyy") : "Não definida"}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold">Data de Término:</p>
                            <p className="text-gray-500">
                              {anuncio.dataTermino ? format(anuncio.dataTermino, "dd/MM/yyyy") : "Não definida"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(anuncio.url, "_blank")}
                      >
                        Visualizar Link
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleRemoverAnuncio(anuncio.id)}
                      >
                        Remover
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Anuncios;
