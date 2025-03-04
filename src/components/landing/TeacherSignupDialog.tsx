
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface TeacherSignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Lista de disciplinas para o dropdown
const disciplinas = [
  "Português",
  "Matemática",
  "Direito Constitucional",
  "Direito Administrativo",
  "Raciocínio Lógico",
  "Contabilidade",
  "Informática",
  "Administração"
];

// Mock dos tópicos por disciplina
const topicosPorDisciplina: Record<string, string[]> = {
  "Português": ["Gramática", "Interpretação de Texto", "Redação", "Literatura"],
  "Matemática": ["Álgebra", "Geometria", "Estatística", "Probabilidade"],
  "Direito Constitucional": ["Princípios Fundamentais", "Direitos e Garantias", "Organização do Estado"],
  "Direito Administrativo": ["Atos Administrativos", "Licitação", "Contratos Administrativos"],
  "Raciocínio Lógico": ["Lógica de Argumentação", "Estruturas Lógicas", "Diagramas Lógicos"],
  "Contabilidade": ["Contabilidade Básica", "Demonstrações Financeiras", "Análise de Balanços"],
  "Informática": ["Sistemas Operacionais", "Excel", "Word", "Segurança da Informação"],
  "Administração": ["Gestão de Pessoas", "Processos Organizacionais", "Planejamento Estratégico"]
};

export const TeacherSignupDialog: React.FC<TeacherSignupDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    email: "",
    linkYoutube: "",
    disciplina: "",
    instagram: "",
    twitter: "",
    facebook: "",
    fotoPerfil: null as File | null,
    aceitouTermos: false
  });
  
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [topicosSelecionados, setTopicosSelecionados] = useState<string[]>([]);
  const [topicosDisponiveis, setTopicosDisponiveis] = useState<string[]>([]);
  const [linksVideos, setLinksVideos] = useState<Record<string, string>>({});

  useEffect(() => {
    if (formData.disciplina && topicosPorDisciplina[formData.disciplina]) {
      setTopicosDisponiveis(topicosPorDisciplina[formData.disciplina]);
    } else {
      setTopicosDisponiveis([]);
    }
    // Limpar tópicos selecionados ao mudar de disciplina
    setTopicosSelecionados([]);
    setLinksVideos({});
  }, [formData.disciplina]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, aceitouTermos: checked }));
  };

  const handleDisciplinaChange = (value: string) => {
    setFormData(prev => ({ ...prev, disciplina: value }));
  };

  const handleTopicoToggle = (topico: string) => {
    setTopicosSelecionados(prev => 
      prev.includes(topico) 
        ? prev.filter(t => t !== topico) 
        : [...prev, topico]
    );
  };

  const handleLinkVideoChange = (topico: string, valor: string) => {
    setLinksVideos(prev => ({
      ...prev,
      [topico]: valor
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, fotoPerfil: file }));
    
    // Criar preview da imagem
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFotoPreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.nomeCompleto || !formData.email || !formData.linkYoutube || !formData.disciplina) {
      toast({
        title: "Erro no formulário",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.aceitouTermos) {
      toast({
        title: "Termos de uso",
        description: "Você precisa aceitar os termos de uso para continuar.",
        variant: "destructive"
      });
      return;
    }
    
    // Simulação de envio
    setIsSubmitting(true);
    
    // Aqui seria a implementação real do envio dos dados para o backend
    setTimeout(() => {
      toast({
        title: "Cadastro recebido com sucesso!",
        description: "Entraremos em contato em breve para dar continuidade ao processo.",
      });
      
      // Resetar formulário e fechar diálogo
      setFormData({
        nomeCompleto: "",
        email: "",
        linkYoutube: "",
        disciplina: "",
        instagram: "",
        twitter: "",
        facebook: "",
        fotoPerfil: null,
        aceitouTermos: false
      });
      setFotoPreview(null);
      setTopicosSelecionados([]);
      setLinksVideos({});
      setIsSubmitting(false);
      onOpenChange(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#022731] text-2xl font-bold">Cadastro de Professor</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {/* Dados básicos */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomeCompleto" className="text-[#022731]">Nome Completo*</Label>
              <Input 
                id="nomeCompleto" 
                name="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={handleInputChange}
                placeholder="Digite seu nome completo"
                className="border-[#2a8e9e]/30 focus-visible:ring-[#2a8e9e]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#022731]">E-mail*</Label>
              <Input 
                id="email" 
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu.email@exemplo.com"
                className="border-[#2a8e9e]/30 focus-visible:ring-[#2a8e9e]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="linkYoutube" className="text-[#022731]">Link do Canal no YouTube*</Label>
              <Input 
                id="linkYoutube" 
                name="linkYoutube"
                value={formData.linkYoutube}
                onChange={handleInputChange}
                placeholder="https://youtube.com/c/seucanal"
                className="border-[#2a8e9e]/30 focus-visible:ring-[#2a8e9e]"
                required
              />
            </div>
          </div>
          
          {/* Foto de Perfil */}
          <div className="space-y-2">
            <Label className="text-[#022731]">Foto de Perfil</Label>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-24 h-24 bg-[#e8f1f3] rounded-full flex items-center justify-center overflow-hidden border-2 border-[#2a8e9e]/30">
                {fotoPreview ? (
                  <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-[#2a8e9e]" />
                )}
              </div>
              
              <div className="flex-1">
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full border-[#2a8e9e]/30 text-[#022731] hover:bg-[#2a8e9e]/10"
                  onClick={() => document.getElementById('fotoPerfil')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Enviar foto
                </Button>
                <input
                  id="fotoPerfil"
                  name="fotoPerfil"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-xs text-[#022731]/60 mt-1">
                  Formatos suportados: JPG, PNG. Tamanho máximo: 2MB
                </p>
              </div>
            </div>
          </div>
          
          {/* Disciplina */}
          <div className="space-y-2">
            <Label htmlFor="disciplina" className="text-[#022731]">Disciplina*</Label>
            <Select
              value={formData.disciplina}
              onValueChange={handleDisciplinaChange}
            >
              <SelectTrigger className="border-[#2a8e9e]/30 focus:ring-[#2a8e9e]">
                <SelectValue placeholder="Selecione sua disciplina principal" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {disciplinas.map((disciplina) => (
                  <SelectItem key={disciplina} value={disciplina}>
                    {disciplina}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Tópicos da disciplina selecionada */}
          {topicosDisponiveis.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="topicos" className="text-[#022731]">Tópicos da Disciplina</Label>
              <div className="border rounded-md border-[#2a8e9e]/30 p-4 max-h-[250px] overflow-y-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left pb-2 text-[#022731] w-1/2">Tópico</th>
                      <th className="text-left pb-2 text-[#022731] w-1/2">Link do Vídeo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topicosDisponiveis.map((topico) => (
                      <tr key={topico} className="border-t border-[#2a8e9e]/10">
                        <td className="py-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`topico-${topico}`}
                              checked={topicosSelecionados.includes(topico)}
                              onCheckedChange={() => handleTopicoToggle(topico)}
                              className="data-[state=checked]:bg-[#2a8e9e] data-[state=checked]:border-[#2a8e9e]"
                            />
                            <Label 
                              htmlFor={`topico-${topico}`}
                              className="text-sm text-[#022731] cursor-pointer"
                            >
                              {topico}
                            </Label>
                          </div>
                        </td>
                        <td className="py-2">
                          <Input
                            type="url"
                            placeholder="https://youtu.be/exemplo"
                            disabled={!topicosSelecionados.includes(topico)}
                            value={linksVideos[topico] || ''}
                            onChange={(e) => handleLinkVideoChange(topico, e.target.value)}
                            className="border-[#2a8e9e]/30 focus-visible:ring-[#2a8e9e]"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-[#022731]/60">
                Selecione os tópicos que você leciona e adicione links para seus vídeos sobre cada um.
              </p>
            </div>
          )}
          
          {/* Redes Sociais */}
          <div className="space-y-2">
            <Label className="text-[#022731]">Redes Sociais</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Input 
                  id="instagram" 
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  placeholder="Instagram (opcional)"
                  className="border-[#2a8e9e]/30 focus-visible:ring-[#2a8e9e]"
                />
              </div>
              <div>
                <Input 
                  id="twitter" 
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  placeholder="Twitter (opcional)"
                  className="border-[#2a8e9e]/30 focus-visible:ring-[#2a8e9e]"
                />
              </div>
              <div>
                <Input 
                  id="facebook" 
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleInputChange}
                  placeholder="Facebook (opcional)"
                  className="border-[#2a8e9e]/30 focus-visible:ring-[#2a8e9e]"
                />
              </div>
            </div>
          </div>
          
          {/* Termos e condições */}
          <div className="flex items-start space-x-2 pt-2">
            <Checkbox 
              id="termos" 
              checked={formData.aceitouTermos}
              onCheckedChange={handleCheckboxChange}
              className="data-[state=checked]:bg-[#2a8e9e] data-[state=checked]:border-[#2a8e9e] mt-1"
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="termos"
                className="text-sm font-medium leading-none text-[#022731] peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Aceito os termos e condições
              </label>
              <p className="text-xs text-[#022731]/70">
                Ao clicar, você concorda com nossos <Link to="/termos-e-politicas" className="text-[#2a8e9e] hover:underline">Termos de Serviço e Política de Privacidade</Link>, e autoriza o uso de seus dados para o processo de cadastro.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[#2a8e9e] hover:bg-[#2a8e9e]/90 text-white"
            >
              {isSubmitting ? "Enviando..." : "Enviar Cadastro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
