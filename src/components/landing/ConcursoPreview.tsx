import { useState, useEffect } from "react";
import { Calendar, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { concursosService } from "@/services/concursosService";
import { fetchBlogPostById } from "@/services/blogService";
import { Concurso } from "@/types/concurso";

export const ConcursoPreview = () => {
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConcursosDestacados = async () => {
      try {
        setLoading(true);
        const concursosDestacados = await concursosService.listarConcursosDestacados();
        setConcursos(concursosDestacados);
      } catch (error) {
        console.error("Erro ao buscar concursos destacados:", error);
        // Em caso de erro, usar dados fictícios como fallback
        setConcursos([
          {
            id: "1",
            titulo: "Banco do Brasil - Escriturário",
            vagas: 4000,
            salario: "R$ 3.022,37",
            dataInicioInscricao: "2025-06-01",
            dataFimInscricao: "2025-06-30",
            dataProva: "2025-08-15",
            prorrogado: false,
            niveis: ["Ensino Médio"],
            cargos: ["Escriturário"],
            estados: ["Federal"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "2",
            titulo: "INSS - Técnico do Seguro Social",
            vagas: 3500,
            salario: "R$ 5.905,79",
            dataInicioInscricao: "2025-05-15",
            dataFimInscricao: "2025-06-15",
            dataProva: "2025-08-01",
            prorrogado: false,
            niveis: ["Ensino Superior"],
            cargos: ["Técnico do Seguro Social"],
            estados: ["Federal"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "3",
            titulo: "Receita Federal - Auditor Fiscal",
            vagas: 699,
            salario: "R$ 21.029,09",
            dataInicioInscricao: "2025-04-10",
            dataFimInscricao: "2025-05-10",
            dataProva: "2025-06-21",
            prorrogado: false,
            niveis: ["Ensino Superior"],
            cargos: ["Auditor Fiscal"],
            estados: ["Federal"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchConcursosDestacados();
  }, []);

  // Formatar datas para exibição (tratando corretamente datas do tipo DATE do PostgreSQL)
  const formatarData = (data: string | undefined | null) => {
    // Tratar casos de null ou undefined
    if (!data) {
      return 'Data não definida';
    }
    
    try {
      // Para datas do tipo DATE do PostgreSQL, usar diretamente sem conversão de fuso horário
      if (data.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Formato YYYY-MM-DD - tratar como data local
        const [year, month, day] = data.split('-').map(Number);
        const date = new Date(year, month - 1, day); // Mês é 0-indexed
        return date.toLocaleDateString('pt-BR');
      } else {
        // Outros formatos - usar o comportamento padrão
        const date = new Date(data);
        return date.toLocaleDateString('pt-BR');
      }
    } catch {
      return data;
    }
  };

  // Formatar período de inscrição
  const formatarPeriodoInscricao = (inicio: string, fim: string) => {
    return `${formatarData(inicio)} a ${formatarData(fim)}`;
  };

  // Formatar data da prova (usando data da prova ou data de fim como fallback)
  const formatarDataProva = (dataProva?: string | null, dataFimInscricao?: string) => {
    if (dataProva) {
      return formatarData(dataProva);
    }
    // Fallback para data de fim de inscrição se data da prova não estiver disponível
    return dataFimInscricao ? formatarData(dataFimInscricao) : 'Data não definida';
  };

  // Navegar para o post do blog relacionado ao concurso ou para a página do concurso
  const navegarParaDetalhes = async (concurso: Concurso) => {
    if (!concurso.postId) {
      // Se não tiver postId, redireciona para página de detalhes do concurso
      navigate(`/concursos/${concurso.id}`);
      return;
    }

    try {
      // Tenta buscar informações do post para obter o slug
      const post = await fetchBlogPostById(concurso.postId);
      if (post && post.slug) {
        navigate(`/blog/${post.slug}`);
      } else {
        // Caso não encontre o slug, usa o ID do post
        navigate(`/blog/${concurso.postId}`);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do post:', error);
      navigate(`/blog/${concurso.postId}`);
    }
  };

  if (loading) {
    return (
      <section className="w-full py-16 md:py-24 bg-[#f2f4f6]">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Concursos em destaque</h2>
              <p className="text-lg text-gray-600 mt-2">Carregando concursos...</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button variant="outline" className="border-[#f52ebe] text-[#f52ebe] hover:bg-[#f52ebe]/5" disabled>
                Ver todos os concursos
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="bg-gray-200 h-4 w-4 rounded-full mr-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="space-y-3 text-gray-600 mb-6">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (concursos.length === 0) {
    return null; // Não mostrar a seção se não houver concursos destacados
  }

  return (
    <section className="w-full py-16 md:py-24 bg-[#f2f4f6]">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">Concursos em destaque</h2>
            <p className="text-lg text-gray-600 mt-2">Fique por dentro dos principais concursos de 2025</p>
          </div>
          <Link to="/concursos" className="mt-4 md:mt-0">
            <Button variant="outline" className="border-[#f52ebe] text-[#f52ebe] hover:bg-[#f52ebe]/5">
              Ver todos os concursos
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {concursos.map((concurso) => (
            <div key={concurso.id} className="bg-white p-6 rounded-xl border border-gray-100">
              <div className="flex items-center mb-4">
                <span className="bg-[#c9ff33] h-4 w-4 rounded-full mr-2"></span>
                <h3 className="text-lg font-bold">{concurso.titulo}</h3>
              </div>
              <div className="space-y-3 text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span>Vagas:</span>
                  <span className="font-medium">{concurso.vagas}</span>
                </div>
                <div className="flex justify-between">
                  <span>Salário:</span>
                  <span className="font-medium">{concurso.salario}</span>
                </div>
                <div className="flex justify-between">
                  <span>Inscrições:</span>
                  <span className="font-medium">{formatarPeriodoInscricao(concurso.dataInicioInscricao, concurso.dataFimInscricao)}</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <span>Data da prova:</span>
                  <span className="flex items-center font-medium">
                    <Calendar className="w-4 h-4 mr-1 text-[#f52ebe]" />
                    {formatarDataProva(concurso.dataProva, concurso.dataFimInscricao)}
                  </span>
                </div>
              </div>
              <Button 
                className="w-full bg-[#f52ebe] hover:bg-[#f52ebe]/90 text-white"
                onClick={() => navegarParaDetalhes(concurso)}
              >
                Ver detalhes
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};