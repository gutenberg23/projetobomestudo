import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash, ClipboardPaste, Filter } from "lucide-react";
import { Disciplina } from "./types";
import { useToast } from "@/hooks/use-toast";
import { ColarTopicosModal } from "./ColarTopicosModal";
import { DisciplinaFiltersModal } from "./DisciplinaFiltersModal";
import { filtersFromColumns, hasAnyFilter, parseQuestionsLink, splitFilterValue } from "@/utils/editalQuestionFilters";

// Garante uma lista de valores, mesmo que venha uma string "a|b" do banco.
// Espalhar uma string com [...valor] separava cada letra ("Coesão" virava "C|o|e|s|ã|o").
const toFilterList = (value: unknown): string[] => splitFilterValue(value);

interface DisciplinaFormProps {
  onAddDisciplina: (disciplina: Omit<Disciplina, 'id' | 'selecionada'>) => void;
  onEditDisciplina?: (disciplina: Disciplina) => void;
  disciplinaParaEditar?: Disciplina | null;
}

const DisciplinaForm: React.FC<DisciplinaFormProps> = ({
  onAddDisciplina,
  onEditDisciplina,
  disciplinaParaEditar
}) => {
  const { toast } = useToast();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [topicos, setTopicos] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [assuntosPorTopico, setAssuntosPorTopico] = useState<string[][]>([]);
  const [topicosPorTopico, setTopicosPorTopico] = useState<string[][]>([]);
  const [disciplinasPorTopico, setDisciplinasPorTopico] = useState<string[][]>([]);
  const [bancasPorTopico, setBancasPorTopico] = useState<string[][]>([]);
  const [quantidadeQuestoesPorTopico, setQuantidadeQuestoesPorTopico] = useState<number[]>([]);
  const [novoTopico, setNovoTopico] = useState("");
  const [novoLink, setNovoLink] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [currentTopicIndex, setCurrentTopicIndex] = useState<number | null>(null);

  useEffect(() => {
    if (disciplinaParaEditar) {
      setTitulo(disciplinaParaEditar.titulo || "");
      setDescricao(disciplinaParaEditar.descricao || "");
      setTopicos(disciplinaParaEditar.topicos || []);
      setLinks(disciplinaParaEditar.links || []);
      
      // Inicializar os filtros de cada tópico. No banco, cada posição é uma
      // string com valores separados por "|"; aqui viram listas. Quando o
      // tópico tem link de questões, os filtros vêm do link, que é o que o
      // aluno vê ao clicar.
      const topicosLength = Math.max(
        (disciplinaParaEditar.topicos || []).length,
        (disciplinaParaEditar.links || []).length
      );
      const assuntos: string[][] = [];
      const topicosFiltro: string[][] = [];
      const disciplinasFiltro: string[][] = [];
      const bancasFiltro: string[][] = [];
      for (let i = 0; i < topicosLength; i++) {
        const fromLink = parseQuestionsLink(disciplinaParaEditar.links?.[i]);
        const filtros = fromLink && hasAnyFilter(fromLink)
          ? fromLink
          : filtersFromColumns(disciplinaParaEditar as any, i);
        assuntos.push(filtros.topics);
        topicosFiltro.push(filtros.subtopics);
        disciplinasFiltro.push(filtros.disciplines);
        bancasFiltro.push(filtros.institutions);
      }
      const quantidadeQuestoes = disciplinaParaEditar.quantidade_questoes_filtro || Array(topicosLength).fill(0);
      
      setAssuntosPorTopico(assuntos);
      setTopicosPorTopico(topicosFiltro);
      setDisciplinasPorTopico(disciplinasFiltro);
      setBancasPorTopico(bancasFiltro);
      setQuantidadeQuestoesPorTopico(quantidadeQuestoes);
    } else {
      // Limpar formulário quando não há disciplina para editar
      setTitulo("");
      setDescricao("");
      setTopicos([]);
      setLinks([]);
      setAssuntosPorTopico([]);
      setTopicosPorTopico([]);
      setDisciplinasPorTopico([]);
      setBancasPorTopico([]);
      setQuantidadeQuestoesPorTopico([]);
    }
  }, [disciplinaParaEditar]);

  const handleAddTopico = () => {
    if (novoTopico.trim()) {
      const novoTopicoTrim = novoTopico.trim();
      const novoLinkTrim = novoLink.trim();
      
      setTopicos(prev => [...prev, novoTopicoTrim]);
      setLinks(prev => [...prev, novoLinkTrim]);
      setAssuntosPorTopico(prev => [...prev, []]);
      setTopicosPorTopico(prev => [...prev, []]);
      setDisciplinasPorTopico(prev => [...prev, []]);
      setBancasPorTopico(prev => [...prev, []]);
      setQuantidadeQuestoesPorTopico(prev => [...prev, 0]);
      
      setNovoTopico("");
      setNovoLink("");
    }
  };

  const handleRemoveTopico = (index: number) => {
    const novosTopicos = [...topicos];
    const novosLinks = [...links];
    const novosAssuntos = [...assuntosPorTopico];
    const novosTopicosFiltro = [...topicosPorTopico];
    const novasDisciplinasFiltro = [...disciplinasPorTopico];
    const novasBancasFiltro = [...bancasPorTopico];
    const novasQuantidades = [...quantidadeQuestoesPorTopico];
    
    novosTopicos.splice(index, 1);
    novosLinks.splice(index, 1);
    novosAssuntos.splice(index, 1);
    novosTopicosFiltro.splice(index, 1);
    novasDisciplinasFiltro.splice(index, 1);
    novasBancasFiltro.splice(index, 1);
    novasQuantidades.splice(index, 1);
    
    setTopicos(novosTopicos);
    setLinks(novosLinks);
    setAssuntosPorTopico(novosAssuntos);
    setTopicosPorTopico(novosTopicosFiltro);
    setDisciplinasPorTopico(novasDisciplinasFiltro);
    setBancasPorTopico(novasBancasFiltro);
    setQuantidadeQuestoesPorTopico(novasQuantidades);
  };

  const handleEditTopico = (index: number, novoTopico: string) => {
    const novosTopicos = [...topicos];
    novosTopicos[index] = novoTopico.trim();
    setTopicos(novosTopicos);
  };

  const handleEditLink = (index: number, novoLink: string) => {
    const novosLinks = [...links];
    novosLinks[index] = novoLink.trim();
    setLinks(novosLinks);

    // Manter os filtros do tópico iguais aos do link editado à mão
    const fromLink = parseQuestionsLink(novoLink);
    if (fromLink && hasAnyFilter(fromLink)) {
      const setAt = (prev: string[][], value: string[]) => {
        const next = [...prev];
        next[index] = value;
        return next;
      };
      setAssuntosPorTopico(prev => setAt(prev, fromLink.topics));
      setTopicosPorTopico(prev => setAt(prev, fromLink.subtopics));
      setDisciplinasPorTopico(prev => setAt(prev, fromLink.disciplines));
      setBancasPorTopico(prev => setAt(prev, fromLink.institutions));
    }
  };


  const handleOpenFiltersModal = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentTopicIndex(index);
    setIsFiltersModalOpen(true);
  };

  const handleApplyFilters = (filters: { assuntos: string[]; topicos: string[]; disciplinas: string[]; bancas: string[] }, link: string, quantidadeQuestoes?: number) => {
    if (currentTopicIndex !== null) {
      // Atualizar o link com o link gerado
      const novosLinks = [...links];
      novosLinks[currentTopicIndex] = link.trim();
      setLinks(novosLinks);
      
      // Atualizar os arrays de assuntos e tópicos
      const novosAssuntos = [...assuntosPorTopico];
      novosAssuntos[currentTopicIndex] = filters.assuntos ? [...filters.assuntos] : [];
      setAssuntosPorTopico(novosAssuntos);
      
      const novosTopicos = [...topicosPorTopico];
      novosTopicos[currentTopicIndex] = filters.topicos ? [...filters.topicos] : [];
      setTopicosPorTopico(novosTopicos);
      
      // Atualizar os arrays de disciplinas e bancas
      const novasDisciplinas = [...disciplinasPorTopico];
      novasDisciplinas[currentTopicIndex] = filters.disciplinas ? [...filters.disciplinas] : [];
      setDisciplinasPorTopico(novasDisciplinas);
      
      const novasBancas = [...bancasPorTopico];
      novasBancas[currentTopicIndex] = filters.bancas ? [...filters.bancas] : [];
      setBancasPorTopico(novasBancas);
      
      // Atualizar a quantidade de questões se fornecida
      if (quantidadeQuestoes !== undefined) {
        const novasQuantidades = [...quantidadeQuestoesPorTopico];
        novasQuantidades[currentTopicIndex] = quantidadeQuestoes;
        setQuantidadeQuestoesPorTopico(novasQuantidades);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim()) {
      toast({
        title: "Atenção",
        description: "O título é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    if (topicos.length === 0) {
      toast({
        title: "Atenção",
        description: "Adicione pelo menos um tópico.",
        variant: "destructive"
      });
      return;
    }

    if (topicos.some(t => !t.trim())) {
      toast({
        title: "Atenção",
        description: "Todos os tópicos devem ser preenchidos.",
        variant: "destructive"
      });
      return;
    }

    const disciplina: Omit<Disciplina, 'id' | 'selecionada'> = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      topicos: topicos.map(t => t.trim()).filter(t => t.length > 0),
      links: links.map(l => l.trim()),
      assuntos: topicos.map((_, i) => toFilterList(assuntosPorTopico[i])),
      topicos_filtro: topicos.map((_, i) => toFilterList(topicosPorTopico[i])),
      disciplinas_filtro: topicos.map((_, i) => toFilterList(disciplinasPorTopico[i])),
      bancas_filtro: topicos.map((_, i) => toFilterList(bancasPorTopico[i])),
      quantidade_questoes_filtro: [...quantidadeQuestoesPorTopico]
    };

    if (disciplinaParaEditar) {
      console.log('📝 Editando disciplina:', {
        ...disciplina,
        id: disciplinaParaEditar.id,
        selecionada: disciplinaParaEditar.selecionada
      });
      onEditDisciplina?.({
        ...disciplina,
        id: disciplinaParaEditar.id,
        selecionada: disciplinaParaEditar.selecionada
      } as Disciplina);
    } else {
      console.log('➕ Adicionando nova disciplina:', disciplina);
      onAddDisciplina(disciplina);
    }

    // Limpar formulário
    setTitulo("");
    setDescricao("");
    setTopicos([]);
    setLinks([]);
    setAssuntosPorTopico([]);
    setTopicosPorTopico([]);
    setDisciplinasPorTopico([]);
    setBancasPorTopico([]);
    setQuantidadeQuestoesPorTopico([]);
  };

  const handleDistribuirTopicos = (novosTopicos: string[]) => {
    const topicosTrim = novosTopicos.map(t => t.trim()).filter(t => t.length > 0);
    setTopicos(topicosTrim);
    setLinks(Array(topicosTrim.length).fill(""));
    setAssuntosPorTopico(Array(topicosTrim.length).fill([]));
    setTopicosPorTopico(Array(topicosTrim.length).fill([]));
    setDisciplinasPorTopico(Array(topicosTrim.length).fill([]));
    setBancasPorTopico(Array(topicosTrim.length).fill([]));
    setQuantidadeQuestoesPorTopico(Array(topicosTrim.length).fill(0));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {disciplinaParaEditar ? "Editar Disciplina" : "Adicionar Disciplina"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título da disciplina</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Digite o título da disciplina"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Concurso/Cargo</Label>
            <Input
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Digite o concurso/cargo"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Tópicos</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2"
              >
                <ClipboardPaste className="h-4 w-4" />
                Colar Tópicos
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={novoTopico}
                onChange={(e) => setNovoTopico(e.target.value)}
                placeholder="Digite um tópico"
                className="flex-1"
              />
              {/* Input de Link (opcional) escondido conforme solicitado */}
              <Input
                value={novoLink}
                onChange={(e) => setNovoLink(e.target.value)}
                placeholder="Link (opcional)"
                className="w-48 hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTopico}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>

            {topicos.length > 0 && (
              <div className="mt-4 space-y-2">
                {topicos.map((topico, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                    <Input
                      value={topico}
                      onChange={(e) => handleEditTopico(index, e.target.value)}
                      placeholder="Nome do tópico"
                      className="flex-1"
                    />
                    {/* Input de Link (opcional) escondido conforme solicitado */}
                    <Input
                      value={links[index] || ""}
                      onChange={(e) => handleEditLink(index, e.target.value)}
                      placeholder="Link (opcional)"
                      className="w-48 hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleOpenFiltersModal(index, e);
                      }}
                      className={`flex items-center gap-2 ${links[index] ? "border-[#5f2ebe]" : ""}`}
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                    {links[index] && (
                      <a
                        href={links[index]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm px-2"
                      >
                        Abrir
                      </a>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveTopico(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit}>
          {disciplinaParaEditar ? "Salvar Alterações" : "Adicionar Disciplina"}
        </Button>
      </CardFooter>

      <ColarTopicosModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDistribuirTopicos={handleDistribuirTopicos}
      />
      
      <DisciplinaFiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        initialAssuntos={currentTopicIndex !== null ? (assuntosPorTopico[currentTopicIndex] || []) : []}
        initialTopicos={currentTopicIndex !== null ? (topicosPorTopico[currentTopicIndex] || []) : []}
        initialDisciplinas={currentTopicIndex !== null ? (disciplinasPorTopico[currentTopicIndex] || []) : []}
        initialBancas={currentTopicIndex !== null ? (bancasPorTopico[currentTopicIndex] || []) : []}
      />
    </Card>
  );
};

export default DisciplinaForm;