"use client";
import React from "react";
import { Header } from "../layout/Header";
import { CourseNavigation } from "./CourseNavigation";
import { LessonCard } from "./LessonCard";
import { Footer } from "../layout/Footer";

const sampleLesson = {
  id: "1",
  title: "Aula 01 - Lei das Licitações - 14.133/2021",
  description:
    "5 Licitação. 5.1 Princípios. 5.2 Contratação direta: dispensa e inexigibilidade. 5.3 Modalidades. 5.4 Tipos. 5.5 Procedimento",
  sections: [
    { id: "1", title: "Contratação Direta", contentType: "video" as const, videoUrl: "https://example.com/video1" },
    { id: "2", title: "Inexigibilidade", contentType: "video" as const, videoUrl: "https://example.com/video2" },
    { id: "3", title: "Licitação Dispensável", contentType: "video" as const, videoUrl: "https://example.com/video3" },
    { id: "4", title: "Licitação Dispensada", contentType: "video" as const, videoUrl: "https://example.com/video4" },
    { id: "5", title: "Fases da Licitação", contentType: "video" as const, videoUrl: "https://example.com/video5" },
    { id: "6", title: "Modos de Disputa", contentType: "video" as const, videoUrl: "https://example.com/video6" },
  ],
};

const sampleQuestion = {
  id: "202502241605",
  year: "2025",
  institution: "SELECON",
  organization: "Prefeitura de Sinop - MT",
  role: "Assistente Social",
  content:
    "A Constituição Federal de 1988 estabelece que o Estado exercerá a função de planejamento das políticas sociais, assegurando, na forma da lei, a participação da sociedade nos processos de formulação, de monitoramento, de controle e de avaliação dessas políticas. Define que a ordem social tem como objetivo o bem-estar e a justiça sociais e, como base, o primado do(da):",
  options: [
    { id: "a", text: "Saúde", isCorrect: false },
    { id: "b", text: "Assistencialismo", isCorrect: false },
    { id: "c", text: "Individualismo", isCorrect: false },
    { id: "d", text: "Trabalho", isCorrect: true },
    { id: "e", text: "Fraternidade", isCorrect: false },
  ],
  comments: [
    {
      id: "1",
      author: "Gutenberg Nunes",
      avatar:
        "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/53bd675aced9cd35bef2bdde64d667b38352b92776785d91dc81b5813eb0aba0",
      content:
        "Sempre que um estado for citado, lembre-se do Senado Federal. Ele possui a competência para quase tudo em relação aos estados.",
      timestamp: "6:39 AM - 24/02/2025",
      likes: 6,
    },
    {
      id: "2",
      author: "Iasmin Melo",
      avatar:
        "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/53bd675aced9cd35bef2bdde64d667b38352b92776785d91dc81b5813eb0aba0",
      content:
        "Oi, Gutenberg. Essa dica é ótima mesmo. Eu mesmo já chutei uma questão parecida e acertei. Se eu não me engano, a maioria das coisas relacionadas aos estados é de competência do Senado Federal.\nValeu!",
      timestamp: "6:39 AM - 24/02/2025",
      likes: 3,
    },
  ],
};

export const MainLayout: React.FC = () => {
  return (
    <div className="overflow-hidden bg-white">
      <Header />
      <main>
        <section className="flex overflow-hidden justify-between items-center w-full bg-white border-b border-zinc-100">
          <div className="flex flex-1 shrink justify-between items-center self-stretch px-2.5 py-12 my-auto w-full basis-0 min-w-60">
            <div className="flex flex-col flex-1 shrink justify-center items-start self-stretch py-2.5 my-auto w-full basis-0 min-w-60">
              <h1 className="flex overflow-hidden gap-2.5 items-start text-4xl font-bold leading-none text-slate-800">
                <span className="flex-1 shrink basis-0">
                  Direito Administrativo
                </span>
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/a0f9984cff03e9fa83ef9ea97baa15c8894dc71b7ec39c753f2f9bf81103812d"
                  alt="Course Icon"
                  className="object-contain shrink-0 aspect-[0.56] w-[15px]"
                />
              </h1>
              <nav className="overflow-hidden gap-2.5 self-stretch text-lg text-slate-500">
                Breadcrumb / Meus cursos /{" "}
                <span className="text-slate-800">
                  Secretaria de Fazenda do Estado do Rio de Janeiro
                </span>
              </nav>
            </div>
          </div>
        </section>

        <CourseNavigation />

        <section className="flex overflow-hidden flex-wrap gap-5 justify-center items-start px-2.5 w-full bg-slate-50">
          <div className="flex-1 shrink pt-px pb-5 w-full basis-0 bg-slate-50 min-w-60">
            <LessonCard lesson={sampleLesson} question={sampleQuestion} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
