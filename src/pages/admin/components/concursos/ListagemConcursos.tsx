import { Concurso } from '../../../../types/concurso';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Trash2,
  AlertCircle,
  Star
} from 'lucide-react';

interface ListagemConcursosProps {
  concursos: Concurso[];
  onEditar: (concurso: Concurso) => void;
  onExcluir: (id: string) => void;
}

const ListagemConcursos = ({ concursos, onEditar, onExcluir }: ListagemConcursosProps) => {
  // Formatar data para exibição
  const formatarData = (data: string) => {
    try {
      return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  // Verificar se o concurso está no prazo de inscrição
  const isConcursoAtivo = (concurso: Concurso) => {
    try {
      const hoje = new Date();
      const dataFim = new Date(concurso.dataFimInscricao);
      return dataFim >= hoje;
    } catch (error) {
      console.error('Erro ao verificar status do concurso:', error);
      return false;
    }
  };

  // Manipuladores de eventos para os botões
  const handleEditar = (concurso: Concurso, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Clicou em editar concurso:', concurso);
    onEditar(concurso);
  };

  const handleExcluir = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Clicou em excluir concurso:', id);
    onExcluir(id);
  };

  return (
    <Card className="border bg-white shadow-sm">
      <CardHeader className="border-b bg-gray-50/80">
        <CardTitle>Concursos</CardTitle>
        <CardDescription>
          Gerenciamento de concursos disponíveis no sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Período de Inscrição</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Destacado</TableHead>
              <TableHead className="text-center">Vagas</TableHead>
              <TableHead>Níveis</TableHead>
              <TableHead>Estados</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {concursos.length > 0 ? (
              concursos.map((concurso) => (
                <TableRow key={concurso.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{concurso.titulo}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>
                        {formatarData(concurso.dataInicioInscricao)} a {formatarData(concurso.dataFimInscricao)}
                      </span>
                      {concurso.prorrogado && (
                        <Badge variant="outline" className="mt-1 border-purple-500 text-purple-600 w-fit">
                          Prorrogado
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {isConcursoAtivo(concurso) ? (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600">Ativo</Badge>
                    ) : (
                      <Badge variant="secondary">Encerrado</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {concurso.destacar ? (
                      <div className="flex justify-center">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <Star className="h-5 w-5 text-gray-300" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center font-medium">{concurso.vagas.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      {concurso.niveis.map(nivel => (
                        <Badge key={nivel} variant="outline" className="w-fit">
                          {nivel}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {concurso.estados.map(estado => (
                        <Badge key={estado} variant="outline" className="w-fit">
                          {estado}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        onClick={(e) => handleEditar(concurso, e)}
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Editar concurso"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={(e) => handleExcluir(concurso.id, e)}
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                        title="Excluir concurso"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="h-5 w-5 text-gray-400" />
                    <span>Nenhum concurso encontrado</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ListagemConcursos;