import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";
import InputMask from "react-input-mask";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Camera, User as UserIcon } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface FormData {
  nome: string;
  sobrenome: string;
  nome_social: string;
  email: string;
  nascimento: string;
  sexo: string;
  escolaridade: string;
  estado_civil: string;
  celular: string;
  telefone: string;
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
  complemento: string;
  estado: string;
  cidade: string;
  foto_perfil: string;
}

// Componente personalizado para Input com máscara
const MaskedInput = React.forwardRef<HTMLInputElement, {
  mask: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}>((props, ref) => {
  const { mask, value, onChange, placeholder, id, className } = props;
  return (
    <div className="relative">
      <InputMask
        mask={mask}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        id={id}
      >
        {(inputProps: any) => (
          <input
            {...inputProps}
            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
            ref={ref}
          />
        )}
      </InputMask>
    </div>
  );
});

MaskedInput.displayName = "MaskedInput";

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    sobrenome: "",
    nome_social: "",
    email: "",
    nascimento: "",
    sexo: "",
    escolaridade: "",
    estado_civil: "",
    celular: "",
    telefone: "",
    cep: "",
    endereco: "",
    numero: "",
    bairro: "",
    complemento: "",
    estado: "",
    cidade: "",
    foto_perfil: "",
  });
  const formInitializedRef = useRef(false);

  useEffect(() => {
    if (!user?.id) return;
    
    const loadProfileData = async () => {
      try {
        console.log("Buscando dados do perfil para o usuário:", user.id);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error("Erro ao buscar perfil:", error);
          toast("Erro ao carregar dados do perfil", {
            type: "error"
          });
          return;
        }
        
        if (data) {
          console.log("Dados do perfil encontrados:", data);
          setFormData({
            nome: data.nome || "",
            sobrenome: data.sobrenome || "",
            nome_social: data.nome_social || "",
            email: data.email || "",
            nascimento: data.nascimento || "",
            sexo: data.sexo || "",
            escolaridade: data.escolaridade || "",
            estado_civil: data.estado_civil || "",
            celular: data.celular || "",
            telefone: data.telefone || "",
            cep: data.cep || "",
            endereco: data.endereco || "",
            numero: data.numero || "",
            bairro: data.bairro || "",
            complemento: data.complemento || "",
            estado: data.estado || "",
            cidade: data.cidade || "",
            foto_perfil: data.foto_perfil || ""
          });
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        toast("Erro ao carregar dados do perfil", {
          type: "error"
        });
      }
    };

    loadProfileData();
  }, [user?.id]);

  const handleChange = (field: keyof FormData, value: string) => {
    // Remove todos os caracteres não numéricos para campos específicos
    if (field === 'celular' || field === 'telefone' || field === 'cep') {
      value = value.replace(/\D/g, '');
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validar tamanho do arquivo (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast("A imagem deve ter no máximo 2MB", {
          type: "error"
        });
        return;
      }

      // Validar tipo do arquivo
      if (!file.type.startsWith("image/")) {
        toast("O arquivo deve ser uma imagem", {
          type: "error"
        });
        return;
      }

      setLoading(true);

      // Gerar nome único para o arquivo
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      // Fazer upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Erro de upload:", uploadError);
        toast(uploadError.message, {
          type: "error"
        });
        return;
      }

      // Obter URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(filePath);

      // Atualizar foto do usuário no banco
      const { error: updateError } = await updateProfile({ foto_perfil: publicUrl });

      if (updateError) {
        throw updateError;
      }

      setFormData(prev => ({ ...prev, foto_perfil: publicUrl }));

      toast("Sua foto de perfil foi atualizada com sucesso", {
        type: "success"
      });
    } catch (error) {
      console.error("Erro ao atualizar foto:", error);
      toast(error instanceof Error ? error.message : "Erro desconhecido ao fazer upload", {
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Formatar a data antes de enviar
      const formattedData = {
        ...formData,
        email: undefined, // Não atualizar o email
        nascimento: formData.nascimento ? new Date(formData.nascimento).toISOString() : null
      };

      const { error } = await updateProfile(formattedData);

      if (error) throw error;

      toast("Suas informações foram atualizadas com sucesso", {
        type: "success"
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast(error instanceof Error ? error.message : "Erro desconhecido ao atualizar perfil", {
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar dados diretamente do banco
  const debugFetchProfile = async () => {
    if (!user?.id) {
      toast("Usuário não encontrado", {
        type: "error"
      });
      return;
    }
    
    try {
      console.log("Buscando dados diretamente da tabela profiles para id:", user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      console.log("Resultado direto da consulta a profiles:", { data, error });
      
      if (error) {
        toast(error.message, {
          type: "error"
        });
        return;
      }
      
      if (data) {
        toast("Perfil carregado com sucesso", {
          type: "success"
        });
        
        // Mostrar os dados encontrados
        console.log("Dados completos do perfil:", data);
        
        // Preencher o formulário com os dados encontrados
        setFormData({
          nome: data.nome || "",
          sobrenome: data.sobrenome || "",
          nome_social: data.nome_social || "",
          email: data.email || "",
          nascimento: data.nascimento || "",
          sexo: data.sexo || "",
          escolaridade: data.escolaridade || "",
          estado_civil: data.estado_civil || "",
          celular: data.celular || "",
          telefone: data.telefone || "",
          cep: data.cep || "",
          endereco: data.endereco || "",
          numero: data.numero || "",
          bairro: data.bairro || "",
          complemento: data.complemento || "",
          estado: data.estado || "",
          cidade: data.cidade || "",
          foto_perfil: data.foto_perfil || ""
        });
        
        formInitializedRef.current = true;
      } else {
        toast("Não foi possível encontrar dados do perfil", {
          type: "error"
        });
      }
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      toast("Erro ao buscar dados do perfil", {
        type: "error"
      });
    }
  };
  
  // Executar debug no carregamento se o formulário não estiver inicializado
  useEffect(() => {
    if (!formInitializedRef.current && user?.id) {
      debugFetchProfile();
    }
  }, [user?.id]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 pt-[88px] bg-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-[#272f3c] mb-4">Minha conta</h1>
          <p className="text-[#67748a] mb-6">
            Mantendo sua conta atualizada, você nos ajuda a disponibilizar dados mais precisos sobre as aprovações pelo Brasil.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Coluna com foto */}
            <div className="space-y-6">
              <div className="flex flex-col items-center bg-gray-50 p-6 rounded-lg">
                <div className="relative mb-4">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-sm">
                    <AvatarImage src={user?.foto_perfil || ""} />
                    <AvatarFallback className="bg-[#ea2be2] text-white text-xl">
                      <UserIcon className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="foto-perfil" className="absolute bottom-0 right-0 bg-[#ea2be2] text-white p-2 rounded-full cursor-pointer">
                    <Camera className="h-4 w-4" />
                    <input
                      id="foto-perfil"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <h2 className="text-lg font-medium">{formData.nome}</h2>
                <p className="text-gray-500 text-sm">{formData.email}</p>
              </div>
            </div>

            {/* Coluna com formulário */}
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <h3 className="text-sm uppercase text-[#67748a] font-medium mb-4">Sobre você</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => handleChange("nome", e.target.value)}
                        placeholder="Seu nome"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sobrenome">Sobrenome</Label>
                      <Input
                        id="sobrenome"
                        value={formData.sobrenome}
                        onChange={(e) => handleChange("sobrenome", e.target.value)}
                        placeholder="Seu sobrenome"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nome_social">Nome social</Label>
                      <Input
                        id="nome_social"
                        value={formData.nome_social}
                        onChange={(e) => handleChange("nome_social", e.target.value)}
                        placeholder="Seu nome social"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nascimento">Data de Nascimento</Label>
                      <Input
                        id="nascimento"
                        type="date"
                        value={formData.nascimento ? new Date(formData.nascimento).toISOString().split('T')[0] : ""}
                        onChange={(e) => {
                          const date = e.target.value;
                          if (date) {
                            handleChange("nascimento", date);
                          }
                        }}
                        min="1900-01-01"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sexo">Sexo</Label>
                      <Select
                        onValueChange={(value) => handleChange("sexo", value)}
                        value={formData.sexo}
                      >
                        <SelectTrigger id="sexo">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculino</SelectItem>
                          <SelectItem value="F">Feminino</SelectItem>
                          <SelectItem value="O">Outro</SelectItem>
                          <SelectItem value="N">Prefiro não informar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="escolaridade">Escolaridade</Label>
                      <Select
                        onValueChange={(value) => handleChange("escolaridade", value)}
                        value={formData.escolaridade}
                      >
                        <SelectTrigger id="escolaridade">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fundamental">Ensino Fundamental</SelectItem>
                          <SelectItem value="medio">Ensino Médio</SelectItem>
                          <SelectItem value="superior">Ensino Superior</SelectItem>
                          <SelectItem value="pos">Pós-graduação</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estado_civil">Estado Civil</Label>
                      <Select
                        onValueChange={(value) => handleChange("estado_civil", value)}
                        value={formData.estado_civil}
                      >
                        <SelectTrigger id="estado_civil">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                          <SelectItem value="casado">Casado(a)</SelectItem>
                          <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                          <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm uppercase text-[#67748a] font-medium mb-4">Contato</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="celular">Celular</Label>
                      <MaskedInput
                        mask="(99)99999-9999"
                        id="celular"
                        value={formData.celular}
                        onChange={(e) => handleChange("celular", e.target.value)}
                        placeholder="(00)00000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <MaskedInput
                        mask="(99)9999-9999"
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => handleChange("telefone", e.target.value)}
                        placeholder="(00)0000-0000"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm uppercase text-[#67748a] font-medium mb-4">Endereço</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP</Label>
                      <MaskedInput
                        mask="99999-999"
                        id="cep"
                        value={formData.cep}
                        onChange={(e) => handleChange("cep", e.target.value)}
                        placeholder="00000-000"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="endereco">Endereço</Label>
                      <Input
                        id="endereco"
                        value={formData.endereco}
                        onChange={(e) => handleChange("endereco", e.target.value)}
                        placeholder="Rua, Avenida, etc"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numero">Número</Label>
                      <Input
                        id="numero"
                        value={formData.numero}
                        onChange={(e) => handleChange("numero", e.target.value)}
                        placeholder="123"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input
                        id="bairro"
                        value={formData.bairro}
                        onChange={(e) => handleChange("bairro", e.target.value)}
                        placeholder="Seu bairro"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="complemento">Complemento</Label>
                      <Input
                        id="complemento"
                        value={formData.complemento}
                        onChange={(e) => handleChange("complemento", e.target.value)}
                        placeholder="Apto, bloco, etc"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado</Label>
                      <Select
                        onValueChange={(value) => handleChange("estado", value)}
                        value={formData.estado}
                      >
                        <SelectTrigger id="estado">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AC">Acre</SelectItem>
                          <SelectItem value="AL">Alagoas</SelectItem>
                          <SelectItem value="AP">Amapá</SelectItem>
                          <SelectItem value="AM">Amazonas</SelectItem>
                          <SelectItem value="BA">Bahia</SelectItem>
                          <SelectItem value="CE">Ceará</SelectItem>
                          <SelectItem value="DF">Distrito Federal</SelectItem>
                          <SelectItem value="ES">Espírito Santo</SelectItem>
                          <SelectItem value="GO">Goiás</SelectItem>
                          <SelectItem value="MA">Maranhão</SelectItem>
                          <SelectItem value="MT">Mato Grosso</SelectItem>
                          <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                          <SelectItem value="MG">Minas Gerais</SelectItem>
                          <SelectItem value="PA">Pará</SelectItem>
                          <SelectItem value="PB">Paraíba</SelectItem>
                          <SelectItem value="PR">Paraná</SelectItem>
                          <SelectItem value="PE">Pernambuco</SelectItem>
                          <SelectItem value="PI">Piauí</SelectItem>
                          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                          <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                          <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                          <SelectItem value="RO">Rondônia</SelectItem>
                          <SelectItem value="RR">Roraima</SelectItem>
                          <SelectItem value="SC">Santa Catarina</SelectItem>
                          <SelectItem value="SP">São Paulo</SelectItem>
                          <SelectItem value="SE">Sergipe</SelectItem>
                          <SelectItem value="TO">Tocantins</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        value={formData.cidade}
                        onChange={(e) => handleChange("cidade", e.target.value)}
                        placeholder="Sua cidade"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="bg-[#ea2be2] hover:bg-opacity-90 w-full md:w-auto"
                    disabled={loading}
                  >
                    {loading ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </div>

                <div className="mt-4 mb-2 flex justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="ml-2"
                    onClick={debugFetchProfile}
                  >
                    Recarregar dados
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;
