
import React from "react";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-[rgba(66,48,65,1)] w-full pt-[60px] px-2.5">
      <div className="flex w-full items-center gap-[40px_120px] text-xl text-white pb-[50px] border-b border-[rgba(122,90,120,1)] flex-col md:flex-row">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/d4f7b31dd1bc48e16547963f6b0cd0adc76ffe16e180c12ccfce3d8a912308a0"
          alt="Footer Logo"
          className="w-[194px]"
        />
        <nav className="flex gap-[40px] flex-wrap justify-center">
          <a href="#" className="hover:text-gray-300">
            Link 1
          </a>
          <a href="#" className="hover:text-gray-300">
            Link 2
          </a>
          <a href="#" className="hover:text-gray-300">
            Link 3
          </a>
          <a href="#" className="hover:text-gray-300">
            Link 4
          </a>
        </nav>
      </div>

      <div className="flex w-full gap-[40px] text-xl text-white justify-between flex-wrap py-[50px] border-b border-[rgba(122,90,120,1)]">
        {["CONCURSOS", "DISCIPLINAS", "NOTÍCIAS", "LINKS ÚTEIS"].map(
          (section, index) => (
            <div key={index} className="flex flex-col w-full md:w-auto">
              <h2 className="font-bold mb-2.5">{section}</h2>
              {[1, 2, 3, 4, 5].map((item) => (
                <a key={item} href="#" className="mt-2.5 hover:text-gray-300">
                  Link {item}
                </a>
              ))}
            </div>
          )
        )}
      </div>

      <div className="flex w-full items-center justify-between flex-wrap py-[50px] gap-4">
        <div className="text-sm text-white w-full md:w-auto text-center md:text-left">
          BomEstudo™ CNPJ 012345678/0001-10
        </div>

        <div className="flex items-center gap-[34px] text-sm text-white flex-wrap justify-center w-full md:w-auto">
          <a href="#" className="hover:text-gray-300">
            Termos de uso
          </a>
          <a href="#" className="hover:text-gray-300">
            Política de privacidade
          </a>
        </div>

        <div className="flex items-center gap-[40px] text-white justify-center w-full md:w-auto">
          <Facebook className="w-6 h-6 cursor-pointer hover:text-gray-300" />
          <Twitter className="w-6 h-6 cursor-pointer hover:text-gray-300" />
          <Instagram className="w-6 h-6 cursor-pointer hover:text-gray-300" />
          <Linkedin className="w-6 h-6 cursor-pointer hover:text-gray-300" />
          <Youtube className="w-6 h-6 cursor-pointer hover:text-gray-300" />
        </div>
      </div>
    </footer>
  );
};
