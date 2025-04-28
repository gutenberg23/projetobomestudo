
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft } from "lucide-react";

const EsqueciSenha = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const { resetPassword } = useAuth();
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    setError("");
    setSuccess(false);
    setIsSubmitting(true);
    
    try {
      const { error: resetError } = await resetPassword(email);
      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-6 md:p-10">
        <div className="w-full">
          <Link to="/" className="inline-block mb-8">
            <img loading="lazy" src="/lovable-uploads/logo.svg" alt="BomEstudo Logo" className="h-10" />
          </Link>
          
          <Link to="/login" className="flex items-center text-sm text-gray-500 mb-8 hover:text-[#5f2ebe] transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Voltar para o login
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold text-[#272f3c] mb-2">
            Recuperação de senha
          </h1>
          <p className="text-[#67748a] mb-8">
            Digite seu email para receber um link de recuperação de senha.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
              <p className="font-medium">Email enviado com sucesso!</p>
              <p>Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</p>
            </div>
          ) : (
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
                  autoComplete="email"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#ea2be2] hover:bg-[#ea2be2]/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
            </form>
          )}

          <div className="text-center mt-8">
            <p className="text-[#67748a]">
              Lembrou sua senha?{" "}
              <Link to="/login" className="text-[#5f2ebe] hover:underline font-medium">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EsqueciSenha;
