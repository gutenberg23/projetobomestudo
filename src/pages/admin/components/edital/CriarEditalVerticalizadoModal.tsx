import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Curso {
  id: string;
  titulo: string;
  descricao: string;
  selecionado: boolean;
}

interface CriarEditalVerticalizadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  disciplinasSelecionadas: string[];
  onCriarEdital: (cursoId: string, titulo: string) => void;
}

export const CriarEditalVerticalizadoModal: React.FC<CriarEditalVerticalizadoModalProps> = ({
  isOpen,
  onClose,
  disciplinasSelecionadas,
  onCriarEdital
}) => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursosFiltrados, setCursosFiltrados] = useState<Curso[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [titulo, setTitulo] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchCursos();
    }
  }, [isOpen]);

  useEffect(() => {
    const filtered = cursos.filter(curso =>
      curso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setCursosFiltrados(filtered);
  }, [searchTerm, cursos]);

  const fetchCursos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .order('titulo');

      if (error) throw error;

      const cursosComSelecao = data.map(curso => ({
        ...curso,
        selecionado: false
      }));

      setCursos(cursosComSelecao);
      setCursosFiltrados(cursosComSelecao);
    } catch (error) {
      console.error('Erro ao buscar cursos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar os cursos. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCurso = (cursoId: string) => {
    setCursos(cursos.map(curso =>
      curso.id === cursoId ? { ...curso, selecionado: !curso.selecionado } : curso
    ));
    setCursosFiltrados(cursosFiltrados.map(curso =>
      curso.id === cursoId ? { ...curso, selecionado: !curso.selecionado } : curso
    ));
  };

  const handleCriarEdital = () => {
    if (!titulo.trim()) {
      toast({
        title: "Atenção",
        description: "Digite um título para o edital.",
        variant: "destructive"
      });
      return;
    }

    const cursoSelecionado = cursos.find(curso => curso.selecionado);
    if (!cursoSelecionado) {
      toast({
        title: "Atenção",
        description: "Selecione um curso para criar o edital.",
        variant: "destructive"
      });
      return;
    }

    onCriarEdital(cursoSelecionado.id, titulo);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Edital Verticalizado</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              placeholder="Digite o título do edital"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Selecione o curso</Label>
            <div className="relative">
              <Input
                placeholder="Pesquisar curso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <ScrollArea className="h-[400px] pr-4">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {cursosFiltrados.map((curso) => (
                  <div key={curso.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={curso.id}
                      checked={curso.selecionado}
                      onCheckedChange={() => handleToggleCurso(curso.id)}
                    />
                    <label
                      htmlFor={curso.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {curso.titulo}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleCriarEdital}>
            Cadastrar Edital
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 