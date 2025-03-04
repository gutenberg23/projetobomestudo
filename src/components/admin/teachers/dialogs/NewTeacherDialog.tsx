
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { TeacherData, TeacherStatus } from "../types";
import { Camera, Upload } from "lucide-react";

interface NewTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTeacher: (teacher: Omit<TeacherData, 'id'>) => void;
  disciplinas: string[];
}

const NewTeacherDialog: React.FC<NewTeacherDialogProps> = ({
  open,
  onOpenChange,
  onAddTeacher,
  disciplinas
}) => {
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    email: "",
    linkYoutube: "",
    disciplina: "",
    instagram: "",
    twitter: "",
    facebook: "",
    fotoPerfil: "https://i.pravatar.cc/150?img=" + Math.floor(Math.random() * 70), // Placeholder temporário
    status: "pendente" as TeacherStatus,
    ativo: true,
    rating: 0
  });
  
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [topicVideos, setTopicVideos] = useState<Record<string, string>>({});
  
  // Lista de tópicos simulada - em um caso real seria carregada do backend
  const topicsByDisciplina: Record<string, string[]> = {
    "Português": ["Gramática", "Interpretação de Texto", "Redação", "Literatura"],
    "Matemática": ["Álgebra", "Geometria", "Estatística", "Probabilidade"],
    "Direito Constitucional": ["Princípios Fundamentais", "Direitos e Garantias", "Organização do Estado"],
    "Direito Administrativo": ["Atos Administrativos", "Licitação", "Contratos Administrativos"],
    "Contabilidade": ["Contabilidade Básica", "Demonstrações Financeiras", "Análise de Balanços"]
  };
  
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  
  useEffect(() => {
    if (formData.disciplina && topicsByDisciplina[formData.disciplina]) {
      setAvailableTopics(topicsByDisciplina[formData.disciplina]);
    } else {
      setAvailableTopics([]);
    }
    // Limpar tópicos selecionados quando a disciplina mudar
    setSelectedTopics([]);
    setTopicVideos({});
  }, [formData.disciplina]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDisciplinaChange = (value: string) => {
    setFormData(prev => ({ ...prev, disciplina: value }));
  };
  
  const handleFileSelect = () => {
    // Simulação de upload de arquivo (em produção, usaríamos um sistema real de upload)
    const randomAvatar = "https://i.pravatar.cc/150?img=" + Math.floor(Math.random() * 70);
    setFormData(prev => ({ ...prev, fotoPerfil: randomAvatar }));
    setFotoPreview(randomAvatar);
  };
  
  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleVideoLinkChange = (topic: string, value: string) => {
    setTopicVideos(prev => ({
      ...prev,
      [topic]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nomeCompleto || !formData.email || !formData.disciplina) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    onAddTeacher({
      ...formData,
      // Adicionar outros dados necessários
      dataCadastro: new Date().toLocaleDateString('pt-BR')
    });
    
    // Resetar formulário
    setFormData({
      nomeCompleto: "",
      email: "",
      linkYoutube: "",
      disciplina: "",
      instagram: "",
      twitter: "",
      facebook: "",
      fotoPerfil: "https://i.pravatar.cc/150?img=" + Math.floor(Math.random() * 70),
      status: "pendente",
      ativo: true,
      rating: 0
    });
    setFotoPreview(null);
    setSelectedTopics([]);
    setTopicVideos({});
    
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#272f3c] text-xl font-bold">Adicionar Novo Professor</DialogTitle>
          <DialogDescription className="text-[#67748a]">
            Preencha os dados do novo professor.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Dados básicos */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nomeCompleto" className="text-[#272f3c]">Nome Completo*</Label>
              <Input 
                id="nomeCompleto" 
                name="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={handleInputChange}
                placeholder="Digite o nome completo"
                className="border-[#ea2be2]/30 focus-visible:ring-[#ea2be2]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#272f3c]">E-mail*</Label>
              <Input 
                id="email" 
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@exemplo.com"
                className="border-[#ea2be2]/30 focus-visible:ring-[#ea2be2]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="linkYoutube" className="text-[#272f3c]">Link do Canal no YouTube</Label>
              <Input 
                id="linkYoutube" 
                name="linkYoutube"
                value={formData.linkYoutube}
                onChange={handleInputChange}
                placeholder="https://youtube.com/c/seucanal"
                className="border-[#ea2be2]/30 focus-visible:ring-[#ea2be2]"
              />
            </div>
          </div>
          
          {/* Foto de Perfil */}
          <div className="space-y-2">
            <Label className="text-[#272f3c]">Foto de Perfil</Label>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-20 h-20 bg-[#f6f8fa] rounded-full flex items-center justify-center overflow-hidden border-2 border-[#ea2be2]/30">
                {fotoPreview ? (
                  <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-[#ea2be2]" />
                )}
              </div>
              
              <div className="flex-1">
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full border-[#ea2be2]/30 text-[#272f3c] hover:bg-[#ea2be2]/10"
                  onClick={handleFileSelect}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Selecionar foto
                </Button>
                <p className="text-xs text-[#67748a] mt-1">
                  Em produção: upload de arquivos JPG, PNG. Máx: 2MB
                </p>
              </div>
            </div>
          </div>
          
          {/* Disciplina */}
          <div className="space-y-2">
            <Label htmlFor="disciplina" className="text-[#272f3c]">Disciplina*</Label>
            <Select
              value={formData.disciplina}
              onValueChange={handleDisciplinaChange}
            >
              <SelectTrigger className="border-[#ea2be2]/30 focus:ring-[#ea2be2]">
                <SelectValue placeholder="Selecione a disciplina" />
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
          
          {/* Tópicos da disciplina */}
          {availableTopics.length > 0 && (
            <div className="space-y-2">
              <Label className="text-[#272f3c]">Tópicos</Label>
              <div className="border rounded-md p-3 border-[#ea2be2]/30 max-h-[150px] overflow-y-auto">
                <div className="grid grid-cols-1 gap-2">
                  {availableTopics.map((topic) => (
                    <div key={topic} className="flex items-start space-x-3">
                      <div className="flex items-center space-x-2 pt-2 min-w-[200px]">
                        <Checkbox 
                          id={`topic-${topic}`}
                          checked={selectedTopics.includes(topic)}
                          onCheckedChange={() => handleTopicToggle(topic)}
                          className="data-[state=checked]:bg-[#ea2be2] data-[state=checked]:border-[#ea2be2]"
                        />
                        <label
                          htmlFor={`topic-${topic}`}
                          className="text-sm font-medium leading-none text-[#272f3c]"
                        >
                          {topic}
                        </label>
                      </div>
                      
                      <div className="flex-1">
                        <Input
                          type="text"
                          placeholder="Link do vídeo"
                          disabled={!selectedTopics.includes(topic)}
                          value={topicVideos[topic] || ''}
                          onChange={(e) => handleVideoLinkChange(topic, e.target.value)}
                          className="border-[#ea2be2]/30 focus-visible:ring-[#ea2be2] text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Redes Sociais */}
          <div className="space-y-2">
            <Label className="text-[#272f3c]">Redes Sociais</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Input 
                  id="instagram" 
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  placeholder="Instagram (opcional)"
                  className="border-[#ea2be2]/30 focus-visible:ring-[#ea2be2]"
                />
              </div>
              <div>
                <Input 
                  id="twitter" 
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  placeholder="Twitter (opcional)"
                  className="border-[#ea2be2]/30 focus-visible:ring-[#ea2be2]"
                />
              </div>
              <div>
                <Input 
                  id="facebook" 
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleInputChange}
                  placeholder="Facebook (opcional)"
                  className="border-[#ea2be2]/30 focus-visible:ring-[#ea2be2]"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-[#ea2be2] text-[#ea2be2]"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-[#ea2be2] hover:bg-[#ea2be2]/90 text-white"
            >
              Adicionar Professor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTeacherDialog;
