
import React from "react";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-[rgba(66,48,65,1)] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 py-12 border-b border-[rgba(122,90,120,1)]">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/d4f7b31dd1bc48e16547963f6b0cd0adc76ffe16e180c12ccfce3d8a912308a0"
            alt="Footer Logo"
            className="w-[194px]"
          />
          <nav className="flex flex-wrap justify-center gap-6 md:gap-12 text-white">
            <a href="#" className="hover:text-gray-300 transition-colors">Link 1</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Link 2</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Link 3</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Link 4</a>
          </nav>
        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-[rgba(122,90,120,1)]">
          {["CONCURSOS", "DISCIPLINAS", "NOTÍCIAS", "LINKS ÚTEIS"].map((section, index) => (
            <div key={index} className="flex flex-col">
              <h2 className="text-white font-bold mb-4">{section}</h2>
              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4, 5].map(item => (
                  <a key={item} href="#" className="text-white/80 hover:text-white transition-colors">
                    Link {item}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="py-8 flex flex-col md:flex-row justify-between items-center gap-6 text-white/80">
          <div className="text-sm">
            BomEstudo™ CNPJ 012345678/0001-10
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">
              Termos de uso
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Política de privacidade
            </a>
          </div>

          <div className="flex items-center gap-6">
            <Facebook className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
            <Twitter className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
            <Instagram className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
            <Linkedin className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
            <Youtube className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </footer>
  );
};
