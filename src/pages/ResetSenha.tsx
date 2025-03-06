
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ResetSenha = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se o usuário chegou a esta página por um link válido de recuperação de senha
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          title: "Link inválido ou expirado",
          description: "Por favor, solicite uma nova recuperação de senha.",
          variant: "destructive",
        });
        navigate("/esqueci-senha");
      }
    };

    checkSession();
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message);
        toast({
          title: "Erro ao redefinir senha",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Senha redefinida com sucesso",
          description: "Sua senha foi atualizada. Você já pode fazer login com a nova senha.",
        });
        navigate("/login");
      }
    } catch (err: any) {
      setError(err.message);
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
            Crie uma nova senha
          </h1>
          <p className="text-[#67748a] text-center md:text-left mb-8">
            Digite e confirme sua nova senha abaixo.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <div>
              <Label htmlFor="password">Nova Senha</Label>
              <Input 
                id="password" 
                type="password" 
                className="w-full" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                className="w-full" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#ea2be2] hover:bg-[#ea2be2]/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Redefinindo..." : "Redefinir Senha"}
            </Button>

            <div className="text-center mt-6">
              <Link to="/login" className="text-[#5f2ebe] hover:underline font-medium">
                Voltar para o login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetSenha;
