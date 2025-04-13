import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { ActivityLogger } from "@/services/activity-logger";

const Perfil = () => {
  const { user, updateProfile, loading } = useAuth();
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }

    if (user) {
      setFormData({
        nome: user.nome || "",
        sobrenome: user.sobrenome || "",
        email: user.email || "",
      });
    }
  }, [user, loading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateProfile({
        nome: formData.nome,
        sobrenome: formData.sobrenome,
      });

      // Registrar atividade de atualização de perfil
      await ActivityLogger.logProfileUpdate(`Atualizou nome para: ${formData.nome} ${formData.sobrenome}`);

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro ao atualizar perfil",
        description: "Não foi possível atualizar suas informações. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  const getInitials = () => {
    const nome = formData.nome.charAt(0);
    const sobrenome = formData.sobrenome.charAt(0);
    return (nome + sobrenome).toUpperCase();
  };

  const getNivelDisplay = () => {
    if (!user) return "";

    const nivelMap = {
      'usuario': 'Usuário',
      'assistente': 'Assistente',
      'professor': 'Professor',
      'admin': 'Administrador'
    };

    return nivelMap[user.nivel as keyof typeof nivelMap] || user.nivel;
  };

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-2xl font-bold mb-8">Meu Perfil</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Informações de Perfil</CardTitle>
            <CardDescription>
              Gerencie suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-4">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src={user?.foto_url || ""} alt={formData.nome} />
              <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
            </Avatar>
            <h3 className="font-medium text-lg">{formData.nome} {formData.sobrenome}</h3>
            <p className="text-sm text-gray-500 mb-2">{formData.email}</p>
            <p className="text-xs px-2 py-1 bg-gray-100 rounded-full">{getNivelDisplay()}</p>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Editar Perfil</CardTitle>
            <CardDescription>
              Atualize suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="profile-form" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sobrenome">Sobrenome</Label>
                  <Input
                    id="sobrenome"
                    name="sobrenome"
                    value={formData.sobrenome}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">O email não pode ser alterado</p>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              form="profile-form" 
              className="bg-[#ea2be2] hover:bg-[#ea2be2]/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar alterações"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Perfil; 