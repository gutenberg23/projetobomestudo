
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, BadgeCheck, Shield } from "lucide-react";
import { Link } from "react-router-dom";
export const PricingPlans = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const toggleBillingCycle = () => {
    setBillingCycle(billingCycle === 'monthly' ? 'annually' : 'monthly');
  };
  return <div className="w-full px-2.5 py-20 bg-white">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl text-[#022731] mb-4 font-extrabold">
          Potencialize seus estudos com ferramentas avançadas
        </h2>
        <p className="text-[#67748a] max-w-2xl mx-auto leading-none">
          Escolha o plano que melhor se adapta às suas necessidades e aumente suas chances de aprovação
        </p>
        
        <div className="flex justify-center items-center mt-8 mb-12">
          <span className={`text-sm mr-3 font-medium ${billingCycle === 'monthly' ? 'text-[#022731]' : 'text-[#67748a]'}`}>
            Mensal
          </span>
          <button onClick={toggleBillingCycle} className="relative inline-flex h-6 w-12 items-center rounded-full bg-gray-200">
            <span className="sr-only">Alternar ciclo de cobrança</span>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-[#2a8e9e] transition-transform ${billingCycle === 'annually' ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
          <span className={`text-sm ml-3 font-medium ${billingCycle === 'annually' ? 'text-[#022731]' : 'text-[#67748a]'}`}>
            Anual <span className="bg-[#e8f1f3] text-[#2a8e9e] text-xs px-2 py-1 rounded-full">Economize 25%</span>
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Plano Grátis */}
        <Card className="border shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-[#022731]">Plano Gratuito</CardTitle>
            <CardDescription className="text-[#67748a]">Acesso aos conteúdos básicos</CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="flex justify-center items-center mb-8">
              <span className="text-4xl font-bold text-[#022731]">R$ 0</span>
              <span className="text-[#67748a] ml-1">/para sempre</span>
            </div>
            
            <div className="space-y-4 mb-8">
              {[{
              text: "Acesso a todas as videoaulas"
            }, {
              text: "Banco de questões básico"
            }, {
              text: "Progresso de estudos limitado"
            }, {
              text: "Comunidade de alunos"
            }].map((item, index) => <div key={index} className="flex items-center">
                  <div className="mr-2 flex-shrink-0">
                    <Check className="h-5 w-5 text-[#67748a]" />
                  </div>
                  <p className="text-[#67748a]">{item.text}</p>
                </div>)}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center pb-8">
            <Link to="/login" className="w-full">
              <Button className="w-full rounded-lg text-sm sm:text-lg font-extrabold tracking-wider transition-all px-8 sm:px-10 py-6 sm:py-7 bg-white text-[#67748a] border-2 border-gray-200 hover:bg-gray-50 hover:shadow-lg hover:shadow-gray-200/20 hover:-translate-y-1">
                Começar Grátis
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Plano Premium */}
        <Card className="border-2 border-[#2a8e9e] shadow-lg hover:shadow-xl transition-all relative">
          <div className="absolute -top-4 right-4 bg-[#2a8e9e] text-white px-4 py-1 rounded-full text-sm font-medium">
            Mais Popular
          </div>
          <CardHeader className="pb-4 text-center bg-[#e8f1f3]">
            <div className="mx-auto mb-2 bg-[#2a8e9e] p-3 rounded-full w-16 h-16 flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#022731]">Plano Premium</CardTitle>
            <CardDescription className="text-[#67748a]">Ferramentas avançadas para aprovação</CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="flex justify-center items-center mb-8">
              {billingCycle === 'monthly' ? <>
                  <span className="text-[#67748a] text-base line-through mr-2">R$ 29,99</span>
                  <span className="text-4xl font-bold text-[#022731]">R$ 18,99</span>
                  <span className="text-[#67748a] ml-1">/mês</span>
                </> : <>
                  <span className="text-[#67748a] text-base line-through mr-2">R$ 359,88</span>
                  <span className="text-4xl font-bold text-[#022731]">R$ 189,90</span>
                  <span className="text-[#67748a] ml-1">/ano</span>
                </>}
            </div>
            
            <div className="space-y-4 mb-8">
              {[{
              text: "Acesso a todas as videoaulas"
            }, {
              text: "1,3 milhão de questões comentadas"
            }, {
              text: "Estatísticas detalhadas de desempenho"
            }, {
              text: "Simulados personalizados ilimitados"
            }, {
              text: "Edital verticalizado e organizado"
            }, {
              text: "Sistema de revisão espaçada"
            }, {
              text: "Suporte prioritário"
            }].map((item, index) => <div key={index} className="flex items-center">
                  <div className="mr-2 flex-shrink-0">
                    <Check className="h-5 w-5 text-[#2a8e9e]" />
                  </div>
                  <p className="text-[#67748a]">{item.text}</p>
                </div>)}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center pb-8">
            <Link to="/login" className="w-full">
              <Button className="w-full text-white rounded-lg text-sm sm:text-lg font-extrabold tracking-wider hover:bg-opacity-90 transition-all px-8 sm:px-10 py-6 sm:py-7 bg-[#2a8e9e] hover:shadow-lg hover:shadow-[#2a8e9e]/30 hover:-translate-y-1 border-b-4 border-[#023347]">
                Assinar agora
              </Button>
            </Link>
          </CardFooter>

          <div className="mx-6 mb-6 mt-0 text-center">
            <p className="text-[#67748a] text-sm flex items-center justify-center">
              <BadgeCheck className="h-4 w-4 text-[#2a8e9e] mr-1" />
              Garantia de 7 dias ou seu dinheiro de volta
            </p>
          </div>
        </Card>
      </div>
    </div>;
};
