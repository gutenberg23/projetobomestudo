import React from "react";
import { Header } from "../layout/Header";
import { CourseNavigation } from "./CourseNavigation";
import { LessonCard } from "./LessonCard";
import { Footer } from "../layout/Footer";
const sampleLesson = {
  id: "1",
  title: "Aula 01 - Lei das Licitações - 14.133/2021",
  description: "5 Licitação. 5.1 Princípios. 5.2 Contratação direta: dispensa e inexigibilidade. 5.3 Modalidades. 5.4 Tipos. 5.5 Procedimento",
  rating: "V",
  sections: [{
    id: "1",
    title: "Contratação Direta",
    isActive: true
  }, {
    id: "2",
    title: "Inexigibilidade",
    isActive: false
  }, {
    id: "3",
    title: "Licitação Dispensável",
    isActive: false
  }, {
    id: "4",
    title: "Licitação Dispensada",
    isActive: false
  }, {
    id: "5",
    title: "Fases da Licitação",
    isActive: false
  }, {
    id: "6",
    title: "Modos de Disputa",
    isActive: false
  }]
};
const sampleQuestion = {
  id: "202502241605",
  year: "2025",
  institution: "SELECON",
  organization: "Prefeitura de Sinop - MT",
  role: "Assistente Social",
  content: "A Constituição Federal de 1988 estabelece que o Estado exercerá a função de planejamento das políticas sociais, assegurando, na forma da lei, a participação da sociedade nos processos de formulação, de monitoramento, de controle e de avaliação dessas políticas. Define que a ordem social tem como objetivo o bem-estar e a justiça sociais e, como base, o primado do(da):",
  options: [{
    id: "a",
    text: "Saúde",
    isCorrect: false
  }, {
    id: "b",
    text: "Assistencialismo",
    isCorrect: false
  }, {
    id: "c",
    text: "Individualismo",
    isCorrect: false
  }, {
    id: "d",
    text: "Trabalho",
    isCorrect: true
  }, {
    id: "e",
    text: "Fraternidade",
    isCorrect: false
  }],
  comments: [{
    id: "1",
    author: "Gutenberg Nunes",
    avatar: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/53bd675aced9cd35bef2bdde64d667b38352b92776785d91dc81b5813eb0aba0",
    content: "Sempre que um estado for citado, lembre-se do Senado Federal. Ele possui a competência para quase tudo em relação aos estados.",
    timestamp: "6:39 AM - 24/02/2025",
    likes: 6
  }, {
    id: "2",
    author: "Iasmin Melo",
    avatar: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/53bd675aced9cd35bef2bdde64d667b38352b92776785d91dc81b5813eb0aba0",
    content: "Oi, Gutenberg. Essa dica é ótima mesmo. Eu mesmo já chutei uma questão parecida e acertei. Se eu não me engano, a maioria das coisas relacionadas aos estados é de competência do Senado Federal.\nValeu!",
    timestamp: "6:39 AM - 24/02/2025",
    likes: 3
  }]
};
export const SubjectLayout: React.FC = () => {
  return <div className="overflow-hidden bg-white">
      <Header />
      <main className="pt-[88px]">
        <div className="bg-white w-full border-b border-[rgba(239,239,239,1)]">
          <div className="flex min-w-60 w-full items-center justify-between flex-wrap px-2.5 py-[50px]">
            <div className="flex min-w-60 flex-col justify-center py-2.5 w-full">
              <div className="flex w-full max-w-[859px] gap-2.5 text-[35px] md:text-[35px] text-[24px] text-[rgba(38,47,60,1)] font-bold leading-[31px] flex-wrap">
                <h1 className="flex-1">Direito Administrativo</h1>
                <img src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/f2ee8cd2aefa09163acda192ff9f1de8bc542520273506ca2b91bcc73721d412" alt="Course Icon" className="w-[15px] aspect-[0.56]" />
              </div>
              <nav className="text-[17px] text-[rgba(99,115,138,1)]">
                <span>Breadcrumb</span> / <span>Meus cursos</span> /{" "}
                <span className="text-[rgba(38,47,60,1)]">
                  Secretaria de Fazenda do Estado do Rio de Janeiro
                </span>
              </nav>
            </div>
          </div>
        </div>

        <CourseNavigation />

        <section className="flex overflow-hidden flex-wrap gap-5 justify-center items-start px-2.5 w-full bg-slate-50">
          <div className="flex-1 shrink pt-px pb-5 w-full basis-0 min-w-60 bg-[#f6f8fa]">
            <LessonCard lesson={sampleLesson} question={sampleQuestion} />
          </div>
        </section>
      </main>
      <Footer />
    </div>;
};