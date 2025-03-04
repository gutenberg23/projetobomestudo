
import React from "react";
import { Mail, Send, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Newsletter = () => {
  return (
    <div className="w-full px-2.5 py-20 bg-[#f5f9fa] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-r from-[#2a8e9e]/5 via-[#023347]/5 to-[#022731]/5 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute left-0 bottom-0 w-80 h-80 bg-gradient-to-r from-[#2a8e9e]/5 via-[#023347]/5 to-[#022731]/5 rounded-full -ml-40 -mb-40"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-sm">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-2/3 space-y-4">
              <div className="p-3 bg-gradient-to-r from-[#e8f1f3] via-[#2a8e9e]/10 to-[#023347]/10 w-fit rounded-full mb-2">
                <Bell className="h-6 w-6 text-[#2a8e9e]" />
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-[#022731]">
                Fique por dentro das novidades
              </h2>
              
              <p className="text-[#67748a]">
                Receba em primeira mão informações sobre concursos, dicas de estudos e conteúdos exclusivos para turbinar sua preparação.
              </p>
              
              <form className="flex flex-col sm:flex-row gap-3 mt-4">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#67748a] h-5 w-5" />
                  <input
                    type="email"
                    placeholder="Digite seu e-mail"
                    className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2a8e9e]/50 focus:border-[#2a8e9e]"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="text-white rounded-lg text-sm sm:text-base font-extrabold tracking-wider hover:bg-opacity-90 transition-all px-6 py-3 bg-[#2a8e9e] hover:shadow-lg hover:shadow-[#2a8e9e]/30 hover:-translate-y-1 border-b-4 border-[#023347] flex items-center gap-2"
                >
                  <span>Inscrever-se</span>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              
              <p className="text-xs text-[#67748a]">
                Ao se inscrever, você concorda com nossa política de privacidade. Nunca enviaremos spam.
              </p>
            </div>
            
            <div className="hidden md:block md:w-1/3">
              <img 
                src="/lovable-uploads/bb003461-c7e3-466c-8bbd-73478baae87b.jpg" 
                alt="Newsletter" 
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
