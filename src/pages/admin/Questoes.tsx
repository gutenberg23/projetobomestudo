
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { FormLayout } from "@/components/admin/FormLayout";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpCircle, Search, PlusCircle, CheckCircle2, X, Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

// Dados fictícios
const MOCK_QUESTOES = [
  {
    id: 1,
    enunciado: "Conforme a Constituição Federal de 1988, é CORRETO afirmar que:",
    disciplina: "Direito Constitucional",
    topico: "Princípios Fundamentais",
    banca: "CESPE",
    orgao: "TCU",
    ano: "2023",
    nivel: "Difícil",
  },
  {
    id: 2,
    enunciado: "Em relação ao Direito Administrativo, assinale a alternativa correta:",
    disciplina: "Direito Administrativo",
    topico: "Atos Administrativos",
    banca: "FGV",
    orgao: "Prefeitura de São Paulo",
    ano: "2022",
    nivel: "Médio",
  },
  {
    id: 3,
    enunciado: "Analise as afirmativas sobre verbo e substantivo e assinale a opção correta:",
    disciplina: "Português",
    topico: "Classes Gramaticais",
    banca: "VUNESP",
    orgao: "TJ-SP",
    ano: "2021",
    nivel: "Fácil",
  },
];

const Questoes = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [questoes, setQuestoes] = useState(MOCK_QUESTOES);
  const [alternativas, setAlternativas] = useState([
    { texto: "", correta: false },
    { texto: "", correta: false },
    { texto: "", correta: false },
    { texto: "", correta: false },
  ]);

  const handleEdit = (questao: any) => {
    setIsEditing(true);
    // Aqui você carregaria os dados da questão para edição
  };

  const handleDelete = (questao: any) => {
    // Implementar lógica de exclusão
    setQuestoes(questoes.filter((q) => q.id !== questao.id));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar lógica de envio do formulário
    setIsCreating(false);
    setIsEditing(false);
  };

  const handleAddAlternativa = () => {
    setAlternativas([...alternativas, { texto: "", correta: false }]);
  };

  const handleRemoveAlternativa = (index: number) => {
    setAlternativas(alternativas.filter((_, i) => i !== index));
  };

  const handleAlternativaChange = (index: number, texto: string) => {
    const newAlternativas = [...alternativas];
    newAlternativas[index] = { ...newAlternativas[index], texto };
    setAlternativas(newAlternativas);
  };

  const handleCorretaChange = (index: number, correta: boolean) => {
    const newAlternativas = alternativas.map((alt, i) => ({
      ...alt,
      correta: i === index ? correta : false,
    }));
    setAlternativas(newAlternativas);
  };

  const columns = [
    {
      header: "Enunciado",
      accessorKey: "enunciado",
      cell: (value: string) => (
        <div className="max-w-md truncate">{value}</div>
      ),
    },
    {
      header: "Disciplina",
      accessorKey: "disciplina",
    },
    {
      header: "Tópico",
      accessorKey: "topico",
    },
    {
      header: "Banca",
      accessorKey: "banca",
    },
    {
      header: "Órgão",
      accessorKey: "orgao",
    },
    {
      header: "Ano",
      accessorKey: "ano",
    },
    {
      header: "Nível",
      accessorKey: "nivel",
      cell: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === "Difícil" ? "bg-red-100 text-red-700" :
          value === "Médio" ? "bg-yellow-100 text-yellow-700" :
          "bg-green-100 text-green-700"
        }`}>
          {value}
        </span>
      ),
    },
  ];

  if (isCreating || isEditing) {
    return (
      <FormLayout
        title={isEditing ? "Editar Questão" : "Nova Questão"}
        onCancel={() => {
          setIsCreating(false);
          setIsEditing(false);
        }}
        onSubmit={handleFormSubmit}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="enunciado">Enunciado</Label>
            <Textarea id="enunciado" placeholder="Digite o enunciado da questão" className="min-h-[100px]" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label htmlFor="disciplina">Disciplina</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a disciplina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direito-constitucional">Direito Constitucional</SelectItem>
                  <SelectItem value="direito-administrativo">Direito Administrativo</SelectItem>
                  <SelectItem value="portugues">Português</SelectItem>
                  <SelectItem value="matematica">Matemática</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="topico">Tópico</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tópico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="principios-fundamentais">Princípios Fundamentais</SelectItem>
                  <SelectItem value="atos-administrativos">Atos Administrativos</SelectItem>
                  <SelectItem value="classes-gramaticais">Classes Gramaticais</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="banca">Banca</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a banca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cespe">CESPE</SelectItem>
                  <SelectItem value="fgv">FGV</SelectItem>
                  <SelectItem value="vunesp">VUNESP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="orgao">Órgão</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o órgão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tcu">TCU</SelectItem>
                  <SelectItem value="prefeitura-sp">Prefeitura de São Paulo</SelectItem>
                  <SelectItem value="tj-sp">TJ-SP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="ano">Ano</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="nivel">Nível</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facil">Fácil</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="dificil">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Alternativas</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddAlternativa}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar
              </Button>
            </div>
            
            <div className="space-y-3">
              {alternativas.map((alternativa, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Checkbox
                    id={`alternativa-${index}`}
                    checked={alternativa.correta}
                    onCheckedChange={(checked) => 
                      handleCorretaChange(index, checked as boolean)
                    }
                    className="mt-3"
                  />
                  <Textarea
                    value={alternativa.texto}
                    onChange={(e) => handleAlternativaChange(index, e.target.value)}
                    placeholder={`Alternativa ${index + 1}`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveAlternativa(index)}
                    disabled={alternativas.length <= 2}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <Label htmlFor="comentario">Comentário da Questão</Label>
            <Textarea id="comentario" placeholder="Digite o comentário explicativo da questão" className="min-h-[100px]" />
          </div>
        </div>
      </FormLayout>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Pesquisar questões..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-[#ea2be2] hover:bg-[#d026d5] whitespace-nowrap"
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Nova Questão
        </Button>
      </div>

      {questoes.length === 0 ? (
        <EmptyState
          title="Nenhuma questão encontrada"
          description="Adicione questões para os cursos do BomEstudo."
          buttonText="Adicionar Questão"
          onClick={() => setIsCreating(true)}
          icon={<HelpCircle className="h-6 w-6 text-gray-400" />}
        />
      ) : (
        <DataTable
          columns={columns}
          data={questoes}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Questoes;
