
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, ZapIcon, Star, BadgeCheck, BarChart } from "lucide-react";
import { Link } from "react-router-dom";

export const Subscription = () => {
  return (
    <div className="w-full px-2.5 py-16 bg-white">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-[#272f3c] mb-4">
          Estude sem limites e alcance a aprovação
        </h2>
        <p className="text-[#67748a] max-w-2xl mx-auto">
          Tenha acesso a todo o conteúdo do BomEstudo e aumente suas chances de aprovação no concurso dos seus sonhos.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <Card className="border-2 border-[#ea2be2] shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="pb-4 text-center bg-gradient-to-r from-[#ea2be2]/10 to-transparent">
            <div className="mx-auto mb-2 bg-[#ea2be2] p-3 rounded-full w-16 h-16 flex items-center justify-center">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#272f3c]">Plano Premium</CardTitle>
            <CardDescription className="text-[#67748a]">Tudo o que você precisa para sua aprovação</CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="flex justify-center items-center mb-8">
              <span className="text-[#67748a] text-base line-through mr-2">R$ 29,99</span>
              <span className="text-4xl font-bold text-[#272f3c]">R$ 18,99</span>
              <span className="text-[#67748a] ml-1">/mês</span>
            </div>
            
            <div className="space-y-4 mb-8">
              {[
                { icon: <Check className="h-5 w-5 text-[#ea2be2]" />, text: "Acesso a 1,3 milhão de questões" },
                { icon: <Check className="h-5 w-5 text-[#ea2be2]" />, text: "Estudos personalizados por banca e cargo" },
                { icon: <Check className="h-5 w-5 text-[#ea2be2]" />, text: "Estatísticas detalhadas de desempenho" },
                { icon: <Check className="h-5 w-5 text-[#ea2be2]" />, text: "Todas as disciplinas e concursos" },
                { icon: <Check className="h-5 w-5 text-[#ea2be2]" />, text: "Simulados ilimitados" },
                { icon: <Check className="h-5 w-5 text-[#ea2be2]" />, text: "Suporte prioritário" }
              ].map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="mr-2 flex-shrink-0">{item.icon}</div>
                  <p className="text-[#67748a]">{item.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center pb-8">
            <Link to="/login" className="w-full">
              <Button className="w-full bg-[#ea2be2] hover:bg-[#ea2be2]/90 text-lg py-6">
                Assinar agora
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-[#67748a] text-sm flex items-center justify-center">
            <BadgeCheck className="h-4 w-4 text-[#ea2be2] mr-1" />
            Garantia de 7 dias ou seu dinheiro de volta
          </p>
        </div>
      </div>
    </div>
  );
};
