
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const EsqueciSenha = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await resetPassword(email);
      setIsEmailSent(true);
    } catch (error) {
      // Erro já tratado no contexto de autenticação
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f8fa]">
      <Header />
      <main className="flex-grow pt-[120px] px-4 md:px-8 w-full max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <Link to="/auth" className="flex items-center text-[#67748a] hover:text-[#5f2ebe] mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para login
          </Link>
          
          <h1 className="text-3xl mb-6 text-[#272f3c] font-extrabold md:text-3xl">
            Recuperação de senha
          </h1>
          
          {isEmailSent ? (
            <div className="max-w-md mx-auto text-center space-y-4">
              <div className="bg-green-50 p-4 rounded-md mb-4">
                <h2 className="text-green-800 font-medium mb-2">
                  Email enviado com sucesso!
                </h2>
                <p className="text-green-700">
                  Enviamos um link para recuperação de senha para o seu email. 
                  Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                </p>
              </div>
              
              <Button asChild className="mt-4">
                <Link to="/auth">Voltar para login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
              <p className="text-[#67748a] mb-4">
                Digite seu email abaixo e enviaremos um link para recuperar sua senha.
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar link de recuperação"
                )}
              </Button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EsqueciSenha;
