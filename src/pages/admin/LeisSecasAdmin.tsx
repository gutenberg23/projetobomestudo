import { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface LeiSeca {
  id: string;
  titulo: string;
  conteudo: string;
  palavras_treino: Array<{
    palavra: string;
    posicao: number;
  }>;
  curso_id: string;
  ativo: boolean;
  ordem: number;
}

interface Curso {
  id: string;
  titulo: string;
}

export default function LeisSecasAdmin() {
  const [leis, setLeis] = useState<LeiSeca[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: "",
    conteudo: "",
    curso_id: "",
    palavras: [] as Array<{ palavra: string; posicao: number }>,
    ordem: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar cursos
      const { data: cursosData, error: cursosError } = await supabase
        .from('cursos')
        .select('id, titulo')
        .order('titulo');
      
      if (cursosError) throw cursosError;
      setCursos(cursosData || []);

      // Buscar leis secas
      const { data: leisData, error: leisError } = await supabase
        .from('leis_secas')
        .select('*')
        .order('ordem');
      
      if (leisError) throw leisError;
      setLeis(leisData || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const processarPalavrasTreino = (conteudo: string): Array<{ palavra: string; posicao: number }> => {
    const regex = /\[treino:(.*?)\]/g;
    const palavras: Array<{ palavra: string; posicao: number }> = [];
    let match;
    let offset = 0;

    while ((match = regex.exec(conteudo)) !== null) {
      const palavra = match[1];
      const posicaoOriginal = match.index;
      const posicaoAjustada = posicaoOriginal - offset;
      
      palavras.push({
        palavra,
        posicao: posicaoAjustada,
      });
      
      // Ajustar offset para próximas iterações
      offset += match[0].length - palavra.length;
    }

    return palavras;
  };

  const limparMarcacoes = (conteudo: string): string => {
    return conteudo.replace(/\[treino:(.*?)\]/g, '$1');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.conteudo || !formData.curso_id) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const palavrasTreino = processarPalavrasTreino(formData.conteudo);
      const conteudoLimpo = limparMarcacoes(formData.conteudo);

      const dados = {
        titulo: formData.titulo,
        conteudo: conteudoLimpo,
        palavras_treino: palavrasTreino,
        curso_id: formData.curso_id,
        ordem: formData.ordem,
        ativo: true,
      };

      if (editingId) {
        const { error } = await supabase
          .from('leis_secas')
          .update(dados)
          .eq('id', editingId);
        
        if (error) throw error;
        toast.success('Lei atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('leis_secas')
          .insert(dados);
        
        if (error) throw error;
        toast.success('Lei criada com sucesso!');
      }

      resetForm();
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar lei:', error);
      toast.error('Erro ao salvar lei');
    }
  };

  const handleEdit = (lei: LeiSeca) => {
    setEditingId(lei.id);
    setShowForm(true);
    
    // Reconstruir o conteúdo com as marcações [treino:]
    let conteudoComMarcacoes = lei.conteudo;
    const palavrasOrdenadas = [...(lei.palavras_treino || [])].sort((a, b) => b.posicao - a.posicao);
    
    palavrasOrdenadas.forEach(item => {
      const antes = conteudoComMarcacoes.substring(0, item.posicao);
      const depois = conteudoComMarcacoes.substring(item.posicao + item.palavra.length);
      conteudoComMarcacoes = `${antes}[treino:${item.palavra}]${depois}`;
    });

    setFormData({
      titulo: lei.titulo,
      conteudo: conteudoComMarcacoes,
      curso_id: lei.curso_id,
      palavras: lei.palavras_treino || [],
      ordem: lei.ordem,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta lei?')) return;

    try {
      const { error } = await supabase
        .from('leis_secas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Lei excluída com sucesso!');
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir lei:', error);
      toast.error('Erro ao excluir lei');
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: "",
      conteudo: "",
      curso_id: "",
      palavras: [],
      ordem: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gerenciar Leis Secas</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showForm ? 'Cancelar' : 'Nova Lei'}
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Editar Lei' : 'Nova Lei'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ex: Lei 8.112/90 - Regime Jurídico dos Servidores"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="curso">Curso</Label>
                  <Select
                    value={formData.curso_id}
                    onValueChange={(value) => setFormData({ ...formData, curso_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {cursos.map((curso) => (
                        <SelectItem key={curso.id} value={curso.id}>
                          {curso.titulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ordem">Ordem de Exibição</Label>
                  <Input
                    id="ordem"
                    type="number"
                    value={formData.ordem}
                    onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conteudo">
                    Conteúdo da Lei
                    <span className="text-sm text-muted-foreground ml-2">
                      (Use [treino:palavra] para marcar palavras para treino)
                    </span>
                  </Label>
                  <Textarea
                    id="conteudo"
                    value={formData.conteudo}
                    onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                    rows={15}
                    placeholder="Ex: O servidor público está [treino:sujeito] aos deveres de..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Exemplo: "O servidor [treino:estável] não poderá ser demitido..."
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Carregando...</p>
          ) : leis.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Nenhuma lei cadastrada ainda.
            </p>
          ) : (
            leis.map((lei) => (
              <Card key={lei.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg">{lei.titulo}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(lei)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(lei.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {lei.conteudo.substring(0, 200)}...
                  </p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Ordem: {lei.ordem}</span>
                    <span>
                      Palavras para treino: {lei.palavras_treino?.length || 0}
                    </span>
                    <span>
                      Curso: {cursos.find(c => c.id === lei.curso_id)?.titulo || 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}