
import React from "react";

export const CourseHeader = () => {
  return (
    <div className="bg-white w-full border-b border-[rgba(239,239,239,1)]">
      <div className="flex min-w-60 w-full items-center justify-between flex-wrap px-2.5 py-[50px]">
        <div className="flex min-w-60 flex-col justify-center py-2.5 w-full">
          <div className="flex w-full max-w-[859px] items-center gap-2.5 text-[35px] md:text-[35px] text-[24px] text-[rgba(38,47,60,1)] font-bold leading-[31px]">
            <h1 className="flex-1">Título do Curso - Loren Ipsun Dolor</h1>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/f2ee8cd2aefa09163acda192ff9f1de8bc542520273506ca2b91bcc73721d412"
              alt="Course Icon"
              className="w-[15px] aspect-[0.56]"
            />
          </div>
          <nav
            aria-label="breadcrumb"
            className="text-[17px] text-[rgba(99,115,138,1)]"
          >
            <span>Breadcrumb</span> / <span>Meus cursos</span> /{" "}
            <span className="text-[rgba(38,47,60,1)]">Nome do Curso</span>
          </nav>
        </div>

        <div className="flex flex-col text-[17px] justify-center w-full md:w-[278px] py-[13px] mt-4 md:mt-0">
          <button className="bg-[rgba(241,28,227,1)] flex items-center gap-2.5 justify-center px-5 py-4 rounded-[10px] text-white">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/87eae3edb19d6590e38c55cc28e85559b7a359d44c6a2ea44df65f4dd696565f"
              alt="Certificate Icon"
              className="w-6"
            />
            Imprimir Certificado
          </button>
        </div>
      </div>
    </div>
  );
};
