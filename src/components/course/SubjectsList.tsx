import React from "react";
interface Subject {
  name: string;
  rating: number;
}
const subjects: Subject[] = [{
  name: "Língua Portuguesa",
  rating: 10
}, {
  name: "Matemática",
  rating: 10
}, {
  name: "Direito Constitucional",
  rating: 10
}, {
  name: "Direito Administrativo",
  rating: 9
}, {
  name: "Direito Tributário",
  rating: 9
}, {
  name: "Administração Pública",
  rating: 9
}, {
  name: "Administração Geral",
  rating: 8
}, {
  name: "Legislação Específica",
  rating: 8
}, {
  name: "Direito Econ��mico",
  rating: 8
}, {
  name: "Raciocínio Lógico",
  rating: 7
}];
export const SubjectsList = () => {
  return <div className="bg-white rounded-[10px]">
      {subjects.map((subject, index) => <div key={index} className="flex min-h-[90px] w-full items-stretch justify-between px-4 md:px-10 border-b border-[rgba(239,239,239,1)]">
          <div className="flex min-w-60 w-full items-center justify-between my-0">
            <h2 className="text-xl md:text-[28px] text-[rgba(38,47,60,1)] leading-none w-full mr-5 py-1 font-bold">
              {subject.name}
            </h2>
            <div className="bg-[rgba(246,248,250,1)] flex items-center gap-2.5 text-xl text-[rgba(241,28,227,1)] text-center w-[76px] p-2.5 rounded-[10px]">
              <div className="bg-white border min-h-[42px] w-14 px-2.5 py-[9px] rounded-[10px] border-[rgba(241,28,227,1)]">
                {subject.rating}
              </div>
            </div>
          </div>
        </div>)}
    </div>;
};