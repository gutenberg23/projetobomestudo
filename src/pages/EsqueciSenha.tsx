
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

const EsqueciSenha = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await resetPassword(email);
      
      if (!error) {
        setIsSent(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Coluna da esquerda com imagem */}
      <div className="hidden md:block md:w-1/2 bg-[#272f3c] relative">
        <div className="absolute top-8 left-8">
          <Link to="/">
            <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/ee47f81d3df30406eedeb997df60ffc12cce0b3965827fc005f4c7a2da4ca470" alt="BomEstudo Logo" className="w-[150px] h-auto" />
          </Link>
        </div>
        <div className="w-full h-full flex items-center justify-center p-10 px-0 py-0">
          <img alt="Estudante sorrindo" className="object-cover w-full h-full" src="/lovable-uploads/a63635e0-17bb-44d0-b68a-fb02fd8878d7.jpg" />
        </div>
        <div className="absolute bottom-10 left-10 text-white">
          <div className="text-2xl font-bold mb-1">
            "Simplesmente todas as ferramentas que
          </div>
          <div className="text-2xl font-bold mb-6">
            preciso para ser aprovado."
          </div>
          <div className="text-lg">João Silva</div>
          <div className="text-sm text-gray-300">Aprovado no concurso do INSS</div>
        </div>
      </div>

      {/* Coluna da direita com formulário */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-10 bg-white">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-8 flex justify-center">
            <Link to="/">
              <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/ee47f81d3df30406eedeb997df60ffc12cce0b3965827fc005f4c7a2da4ca470" alt="BomEstudo Logo" className="w-[150px] h-auto" />
            </Link>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-[#272f3c] mb-2 text-center md:text-left">
            Esqueceu sua senha?
          </h1>
          <p className="text-[#67748a] text-center md:text-left mb-8">
            {isSent 
              ? "Um e-mail foi enviado com instruções para redefinir sua senha."
              : "Informe seu e-mail cadastrado e enviaremos instruções para recuperação."
            }
          </p>

          {!isSent ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu.email@exemplo.com" 
                  className="w-full" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#ea2be2] hover:bg-[#ea2be2]/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar instruções"}
              </Button>

              <div className="text-center mt-6">
                <span className="text-[#67748a]">Lembrou sua senha?</span>{" "}
                <Link to="/login" className="text-[#5f2ebe] hover:underline font-medium">
                  Voltar para o login
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-[#67748a] mb-4">
                Verifique sua caixa de entrada e siga as instruções enviadas para recuperar sua senha.
              </p>
              
              <Button 
                className="w-full bg-[#ea2be2] hover:bg-[#ea2be2]/90"
                onClick={() => setIsSent(false)}
              >
                Enviar novamente
              </Button>
              
              <div className="text-center mt-6">
                <Link to="/login" className="text-[#5f2ebe] hover:underline font-medium">
                  Voltar para o login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EsqueciSenha;
