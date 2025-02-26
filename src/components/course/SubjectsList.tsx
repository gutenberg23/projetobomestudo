import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { LessonCard } from "../new/LessonCard";
interface Subject {
  name: string;
  rating: number;
  lessons: Array<{
    id: string;
    title: string;
    description: string;
    rating: string;
    sections: Array<{
      id: string;
      title: string;
      isActive: boolean;
    }>;
    question: {
      id: string;
      year: string;
      institution: string;
      organization: string;
      role: string;
      content: string;
      options: Array<{
        id: string;
        text: string;
        isCorrect: boolean;
      }>;
      comments: Array<{
        id: string;
        author: string;
        avatar: string;
        content: string;
        timestamp: string;
        likes: number;
      }>;
    };
  }>;
}
const subjects: Subject[] = [{
  name: "Língua Portuguesa",
  rating: 10,
  lessons: [{
    id: "1",
    title: "Aula 01 - Interpretação de Texto",
    description: "Compreensão e interpretação de textos de gêneros variados. Reconhecimento de tipos e gêneros textuais.",
    rating: "V",
    sections: [{
      id: "1",
      title: "Identificação de informações explícitas",
      isActive: true
    }, {
      id: "2",
      title: "Inferência de informações implícitas",
      isActive: false
    }, {
      id: "3",
      title: "Tema e ideia principal",
      isActive: false
    }, {
      id: "4",
      title: "Distinção de fato e opinião",
      isActive: false
    }, {
      id: "5",
      title: "Relações de coesão e coerência",
      isActive: false
    }],
    question: {
      id: "1",
      year: "2024",
      institution: "SELECON",
      organization: "Prefeitura Municipal",
      role: "Auditor",
      content: "Leia o texto a seguir e responda: [...] De acordo com o texto, pode-se inferir que:",
      options: [{
        id: "a",
        text: "A coesão textual é estabelecida por meio de elementos referenciais",
        isCorrect: false
      }, {
        id: "b",
        text: "A progressão temática se dá de forma linear",
        isCorrect: true
      }, {
        id: "c",
        text: "O texto apresenta predominância de sequências narrativas",
        isCorrect: false
      }, {
        id: "d",
        text: "Os argumentos são organizados de forma dedutiva",
        isCorrect: false
      }],
      comments: [{
        id: "1",
        author: "Prof. Silva",
        avatar: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/53bd675aced9cd35bef2bdde64d667b38352b92776785d91dc81b5813eb0aba0",
        content: "A progressão temática linear é caracterizada pelo desenvolvimento sequencial das ideias, onde cada novo parágrafo retoma e desenvolve o tema do parágrafo anterior.",
        timestamp: "10:30 AM - 24/02/2024",
        likes: 5
      }]
    }
  }]
}, {
  name: "Matemática",
  rating: 10,
  lessons: [{
    id: "2",
    title: "Aula 01 - Análise Combinatória",
    description: "Princípio fundamental da contagem. Arranjos, permutações e combinações.",
    rating: "V",
    sections: [{
      id: "1",
      title: "Princípio Multiplicativo",
      isActive: true
    }, {
      id: "2",
      title: "Arranjos Simples",
      isActive: false
    }, {
      id: "3",
      title: "Permutações Simples",
      isActive: false
    }, {
      id: "4",
      title: "Permutações com Repetição",
      isActive: false
    }, {
      id: "5",
      title: "Combinações Simples",
      isActive: false
    }],
    question: {
      id: "2",
      year: "2024",
      institution: "SELECON",
      organization: "Prefeitura Municipal",
      role: "Auditor",
      content: "Em uma empresa, 5 funcionários devem ser escolhidos para formar uma comissão. De quantas maneiras diferentes essa comissão pode ser formada?",
      options: [{
        id: "a",
        text: "120",
        isCorrect: true
      }, {
        id: "b",
        text: "60",
        isCorrect: false
      }, {
        id: "c",
        text: "24",
        isCorrect: false
      }, {
        id: "d",
        text: "20",
        isCorrect: false
      }],
      comments: [{
        id: "1",
        author: "Prof. Santos",
        avatar: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/53bd675aced9cd35bef2bdde64d667b38352b92776785d91dc81b5813eb0aba0",
        content: "Para resolver esta questão, utilizamos o conceito de arranjos simples: A(5,5) = 5!",
        timestamp: "11:15 AM - 24/02/2024",
        likes: 3
      }]
    }
  }]
}, {
  name: "Direito Constitucional",
  rating: 10,
  lessons: [{
    id: "3",
    title: "Aula 01 - Direitos Fundamentais",
    description: "Direitos e garantias fundamentais. Direitos e deveres individuais e coletivos.",
    rating: "V",
    sections: [{
      id: "1",
      title: "Conceito e Características",
      isActive: true
    }, {
      id: "2",
      title: "Gerações de Direitos",
      isActive: false
    }, {
      id: "3",
      title: "Aplicabilidade",
      isActive: false
    }, {
      id: "4",
      title: "Direitos Individuais",
      isActive: false
    }, {
      id: "5",
      title: "Direitos Coletivos",
      isActive: false
    }],
    question: {
      id: "3",
      year: "2024",
      institution: "SELECON",
      organization: "Prefeitura Municipal",
      role: "Auditor",
      content: "Sobre os direitos fundamentais previstos na Constituição Federal de 1988, é correto afirmar que:",
      options: [{
        id: "a",
        text: "São absolutos e ilimitados",
        isCorrect: false
      }, {
        id: "b",
        text: "Possuem aplicabilidade imediata",
        isCorrect: true
      }, {
        id: "c",
        text: "São exclusivos dos brasileiros natos",
        isCorrect: false
      }, {
        id: "d",
        text: "Não admitem restrições",
        isCorrect: false
      }],
      comments: [{
        id: "1",
        author: "Prof. Lima",
        avatar: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/53bd675aced9cd35bef2bdde64d667b38352b92776785d91dc81b5813eb0aba0",
        content: "O §1º do art. 5º da CF/88 estabelece que as normas definidoras dos direitos e garantias fundamentais têm aplicação imediata.",
        timestamp: "2:20 PM - 24/02/2024",
        likes: 7
      }]
    }
  }]
}, {
  name: "Direito Administrativo",
  rating: 9,
  lessons: [{
    id: "4",
    title: "Aula 01 - Atos Administrativos",
    description: "Conceito, requisitos, atributos, classificação e espécies de atos administrativos.",
    rating: "V",
    sections: [{
      id: "1",
      title: "Conceito e Requisitos",
      isActive: true
    }, {
      id: "2",
      title: "Atributos e Presunção de Legitimidade",
      isActive: false
    }, {
      id: "3",
      title: "Imperatividade",
      isActive: false
    }, {
      id: "4",
      title: "Autoexecutoriedade",
      isActive: false
    }, {
      id: "5",
      title: "Classificação dos Atos",
      isActive: false
    }],
    question: {
      id: "4",
      year: "2024",
      institution: "SELECON",
      organization: "Prefeitura Municipal",
      role: "Auditor",
      content: "São atributos do ato administrativo:",
      options: [{
        id: "a",
        text: "Presunção de legitimidade, imperatividade e autoexecutoriedade",
        isCorrect: true
      }, {
        id: "b",
        text: "Competência, finalidade e forma",
        isCorrect: false
      }, {
        id: "c",
        text: "Motivo, objeto e eficiência",
        isCorrect: false
      }, {
        id: "d",
        text: "Legalidade, impessoalidade e moralidade",
        isCorrect: false
      }],
      comments: [{
        id: "1",
        author: "Prof. Costa",
        avatar: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/53bd675aced9cd35bef2bdde64d667b38352b92776785d91dc81b5813eb0aba0",
        content: "Os atributos são características próprias do ato administrativo que o diferem dos atos de direito privado.",
        timestamp: "3:45 PM - 24/02/2024",
        likes: 4
      }]
    }
  }]
}, {
  name: "Direito Tributário",
  rating: 9,
  lessons: [{
    id: "5",
    title: "Aula 01 - Sistema Tributário Nacional",
    description: "Princípios gerais. Limitações do poder de tributar. Impostos da União, dos Estados e dos Municípios.",
    rating: "V",
    sections: [{
      id: "1",
      title: "Princípios Gerais",
      isActive: true
    }, {
      id: "2",
      title: "Limitações Constitucionais",
      isActive: false
    }, {
      id: "3",
      title: "Competência Tributária",
      isActive: false
    }, {
      id: "4",
      title: "Impostos da União",
      isActive: false
    }, {
      id: "5",
      title: "Impostos Estaduais e Municipais",
      isActive: false
    }],
    question: {
      id: "5",
      year: "2024",
      institution: "SELECON",
      organization: "Prefeitura Municipal",
      role: "Auditor",
      content: "O princípio da anterioridade nonagesimal determina que:",
      options: [{
        id: "a",
        text: "O tributo só pode ser cobrado no exercício seguinte",
        isCorrect: false
      }, {
        id: "b",
        text: "É necessário esperar 90 dias após a publicação da lei",
        isCorrect: true
      }, {
        id: "c",
        text: "A lei deve ser publicada no mesmo exercício",
        isCorrect: false
      }, {
        id: "d",
        text: "O tributo só pode ser instituído a cada 90 dias",
        isCorrect: false
      }],
      comments: [{
        id: "1",
        author: "Prof. Oliveira",
        avatar: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/53bd675aced9cd35bef2bdde64d667b38352b92776785d91dc81b5813eb0aba0",
        content: "A anterioridade nonagesimal está prevista no art. 150, III, 'c' da CF/88, também conhecida como anterioridade mitigada.",
        timestamp: "4:10 PM - 24/02/2024",
        likes: 6
      }]
    }
  }]
}, {
  name: "Administração Pública",
  rating: 9,
  lessons: [{
    id: "6",
    title: "Aula 01 - Princípios da Administração Pública",
    description: "Princípios expressos e implícitos da administração pública.",
    rating: "V",
    sections: [{
      id: "1",
      title: "Legalidade",
      isActive: true
    }, {
      id: "2",
      title: "Impessoalidade",
      isActive: false
    }, {
      id: "3",
      title: "Moralidade",
      isActive: false
    }],
    question: {
      id: "6",
      year: "2024",
      institution: "SELECON",
      organization: "Prefeitura Municipal",
      role: "Auditor",
      content: "Qual princípio determina que o administrador público só pode fazer o que a lei autoriza?",
      options: [{
        id: "a",
        text: "Legalidade",
        isCorrect: true
      }, {
        id: "b",
        text: "Moralidade",
        isCorrect: false
      }, {
        id: "c",
        text: "Eficiência",
        isCorrect: false
      }, {
        id: "d",
        text: "Publicidade",
        isCorrect: false
      }],
      comments: [{
        id: "1",
        author: "Prof. Pereira",
        avatar: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/53bd675aced9cd35bef2bdde64d667b38352b92776785d91dc81b5813eb0aba0",
        content: "O princípio da legalidade é a base do Estado de Direito e determina que a administração pública só pode fazer o que a lei permite.",
        timestamp: "5:30 PM - 24/02/2024",
        likes: 5
      }]
    }
  }]
}, {
  name: "Administração Geral",
  rating: 8,
  lessons: [{
    id: "7",
    title: "Aula 01 - Teoria Geral da Administração",
    description: "Evolução da administração. Principais teorias administrativas.",
    rating: "V",
    sections: [{
      id: "1",
      title: "Teoria Clássica",
      isActive: true
    }, {
      id: "2",
      title: "Teoria das Relações Humanas",
      isActive: false
    }, {
      id: "3",
      title: "Teoria Neoclássica",
      isActive: false
    }],
    question: {
      id: "7",
      year: "2024",
      institution: "SELECON",
      organization: "Prefeitura Municipal",
      role: "Auditor",
      content: "Quem é considerado o pai da Administração Científica?",
      options: [{
        id: "a",
        text: "Frederick Taylor",
        isCorrect: true
      }, {
        id: "b",
        text: "Henri Fayol",
        isCorrect: false
      }, {
        id: "c",
        text: "Max Weber",
        isCorrect: false
      }, {
        id: "d",
        text: "Elton Mayo",
        isCorrect: false
      }],
      comments: [{
        id: "1",
        author: "Prof. Carvalho",
        avatar: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/53bd675aced9cd35bef2bdde64d667b38352b92776785d91dc81b5813eb0aba0",
        content: "Taylor desenvolveu os princípios da Administração Científica, focando na eficiência e produtividade do trabalho.",
        timestamp: "9:15 AM - 24/02/2024",
        likes: 8
      }]
    }
  }]
}, {
  name: "Legislação Específica",
  rating: 8,
  lessons: [{
    id: "8",
    title: "Aula 01 - Lei Orgânica Municipal",
    description: "Organização do município. Competências municipais. Processo legislativo municipal.",
    rating: "V",
    sections: [{
      id: "1",
      title: "Disposições Preliminares",
      isActive: true
    }, {
      id: "2",
      title: "Competências",
      isActive: false
    }, {
      id: "3",
      title: "Processo Legislativo",
      isActive: false
    }],
    question: {
      id: "8",
      year: "2024",
      institution: "SELECON",
      organization: "Prefeitura Municipal",
      role: "Auditor",
      content: "Segundo a Lei Orgânica Municipal, são símbolos do município:",
      options: [{
        id: "a",
        text: "A bandeira, o brasão e o hino",
        isCorrect: true
      }, {
        id: "b",
        text: "Apenas a bandeira e o brasão",
        isCorrect: false
      }, {
        id: "c",
        text: "O hino e a bandeira",
        isCorrect: false
      }, {
        id: "d",
        text: "Somente o brasão",
        isCorrect: false
      }],
      comments: [{
        id: "1",
        author: "Prof. Mendes",
        avatar: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/53bd675aced9cd35bef2bdde64d667b38352b92776785d91dc81b5813eb0aba0",
        content: "Os símbolos municipais representam a identidade e a história do município.",
        timestamp: "10:45 AM - 24/02/2024",
        likes: 4
      }]
    }
  }]
}, {
  name: "Direito Econômico",
  rating: 8,
  lessons: [{
    id: "9",
    title: "Aula 01 - Ordem Econômica",
    description: "Princípios gerais da atividade econômica. Intervenção do Estado no domínio econômico.",
    rating: "V",
    sections: [{
      id: "1",
      title: "Princípios Gerais",
      isActive: true
    }, {
      id: "2",
      title: "Intervenção Estatal",
      isActive: false
    }, {
      id: "3",
      title: "Regulação",
      isActive: false
    }],
    question: {
      id: "9",
      year: "2024",
      institution: "SELECON",
      organization: "Prefeitura Municipal",
      role: "Auditor",
      content: "A ordem econômica tem por fim assegurar a todos existência digna, conforme os ditames da justiça social, observados os seguintes princípios, EXCETO:",
      options: [{
        id: "a",
        text: "Soberania nacional",
        isCorrect: false
      }, {
        id: "b",
        text: "Propriedade privada",
        isCorrect: false
      }, {
        id: "c",
        text: "Monopólio estatal",
        isCorrect: true
      }, {
        id: "d",
        text: "Livre concorrência",
        isCorrect: false
      }],
      comments: [{
        id: "1",
        author: "Prof. Almeida",
        avatar: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/53bd675aced9cd35bef2bdde64d667b38352b92776785d91dc81b5813eb0aba0",
        content: "O monopólio estatal não é um princípio da ordem econômica, mas sim uma exceção prevista em casos específicos.",
        timestamp: "1:20 PM - 24/02/2024",
        likes: 6
      }]
    }
  }]
}, {
  name: "Raciocínio Lógico",
  rating: 7,
  lessons: [{
    id: "10",
    title: "Aula 01 - Lógica Proposicional",
    description: "Proposições simples e compostas. Conectivos lógicos. Tabelas-verdade.",
    rating: "V",
    sections: [{
      id: "1",
      title: "Proposições",
      isActive: true
    }, {
      id: "2",
      title: "Conectivos",
      isActive: false
    }, {
      id: "3",
      title: "Tabelas-verdade",
      isActive: false
    }],
    question: {
      id: "10",
      year: "2024",
      institution: "SELECON",
      organization: "Prefeitura Municipal",
      role: "Auditor",
      content: "Se p e q são proposições verdadeiras e r é uma proposição falsa, qual é o valor lógico de (p ∧ q) → r?",
      options: [{
        id: "a",
        text: "Verdadeiro",
        isCorrect: false
      }, {
        id: "b",
        text: "Falso",
        isCorrect: true
      }, {
        id: "c",
        text: "Inconclusivo",
        isCorrect: false
      }, {
        id: "d",
        text: "Depende do contexto",
        isCorrect: false
      }],
      comments: [{
        id: "1",
        author: "Prof. Ribeiro",
        avatar: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/53bd675aced9cd35bef2bdde64d667b38352b92776785d91dc81b5813eb0aba0",
        content: "Como p e q são verdadeiras, p ∧ q é verdadeira. Se o antecedente é verdadeiro e o consequente (r) é falso, a implicação é falsa.",
        timestamp: "11:55 AM - 24/02/2024",
        likes: 7
      }]
    }
  }]
}];
export const SubjectsList = () => {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const toggleExpand = (subjectName: string) => {
    setExpandedSubject(expandedSubject === subjectName ? null : subjectName);
  };
  return <div className="bg-white rounded-[10px] mb-10">
      {subjects.map(subject => <div key={subject.name} className="border-b border-[rgba(246,248,250,1)]">
          <div onClick={() => toggleExpand(subject.name)} className="flex min-h-[90px] w-full items-stretch justify-between px-4 cursor-pointer md:px-[15px] my-0">
            <div className="flex min-w-60 w-full items-center justify-between my-0">
              <h2 className="text-xl md:text-[28px] text-[rgba(38,47,60,1)] leading-none w-full mr-5 py-1 font-bold">
                {subject.name}
              </h2>
              <div className="flex items-center gap-4">
                <div className="bg-[rgba(246,248,250,1)] flex items-center gap-2.5 text-xl text-[rgba(241,28,227,1)] text-center w-[76px] p-2.5 rounded-[10px]">
                  <div className="bg-white border min-h-[42px] w-14 px-2.5 py-[9px] rounded-[10px] border-[rgba(241,28,227,1)]">
                    {subject.rating}
                  </div>
                </div>
                {expandedSubject === subject.name ? <ChevronUp className="w-6 h-6 text-slate-400" /> : <ChevronDown className="w-6 h-6 text-slate-400" />}
              </div>
            </div>
          </div>
          {expandedSubject === subject.name && <div className="px-4 pb-8 md:px-[15px] bg-slate-50 py-[30px] border-l-2 border-r-2 border-[#fff]">
              {subject.lessons.map(lesson => <LessonCard key={lesson.id} lesson={{
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          rating: lesson.rating,
          sections: lesson.sections
        }} question={lesson.question} />)}
            </div>}
        </div>)}
    </div>;
};