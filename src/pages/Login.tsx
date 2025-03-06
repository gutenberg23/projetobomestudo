import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  return <div className="flex flex-col md:flex-row h-screen">
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
            {isLogin ? "Bem-vindo de volta ao BomEstudo" : "Junte-se ao BomEstudo"}
          </h1>
          <p className="text-[#67748a] text-center md:text-left mb-8">
            {isLogin ? "Estude de forma eficiente com nossa plataforma completa de preparação." : "Crie sua conta e comece a estudar para concursos hoje mesmo."}
          </p>

          <form className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu.email@exemplo.com" className="w-full" />
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="••••••••" className="w-full" />
            </div>

            {!isLogin && <div>
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" className="w-full" />
              </div>}

            {isLogin && <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Switch id="remember" />
                  <Label htmlFor="remember" className="text-sm">
                    Lembrar de mim
                  </Label>
                </div>
                <Link to="/esqueci-senha" className="text-sm text-[#5f2ebe] hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>}

            <Button type="submit" className="w-full bg-[#ea2be2] hover:bg-[#ea2be2]/90">
              {isLogin ? "Entrar" : "Cadastrar"}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-[#67748a]">OU</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                <path fill="none" d="M1 1h22v22H1z" />
              </svg>
              Continuar com Google
            </Button>
          </form>

          <div className="text-center mt-6">
            <span className="text-[#67748a]">
              {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
            </span>{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-[#5f2ebe] hover:underline font-medium">
              {isLogin ? "Cadastre-se" : "Entrar"}
            </button>
          </div>
        </div>
      </div>
    </div>;
};
export default Login;