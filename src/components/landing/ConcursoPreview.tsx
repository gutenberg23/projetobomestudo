
import React from "react";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const ConcursoPreview = () => {
  // Concursos fictícios para demonstração
  const concursos = [
    {
      id: 1,
      title: "Banco do Brasil - Escriturário",
      vagas: 4000,
      salario: "R$ 3.022,37",
      inscricoes: "01/06/2025 a 30/06/2025",
      prova: "15/08/2025"
    },
    {
      id: 2,
      title: "INSS - Técnico do Seguro Social",
      vagas: 3500,
      salario: "R$ 5.905,79",
      inscricoes: "15/05/2025 a 15/06/2025",
      prova: "01/08/2025"
    },
    {
      id: 3,
      title: "Receita Federal - Auditor Fiscal",
      vagas: 699,
      salario: "R$ 21.029,09",
      inscricoes: "10/04/2025 a 10/05/2025",
      prova: "21/06/2025"
    }
  ];

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
                <h3 className="text-lg font-bold">{concurso.title}</h3>
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
                  <span className="font-medium">{concurso.inscricoes}</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <span>Data da prova:</span>
                  <span className="flex items-center font-medium">
                    <Calendar className="w-4 h-4 mr-1 text-[#f52ebe]" />
                    {concurso.prova}
                  </span>
                </div>
              </div>
              <Link to={`/concursos/${concurso.id}`}>
                <Button className="w-full bg-[#f52ebe] hover:bg-[#f52ebe]/90 text-white">
                  Ver detalhes
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
