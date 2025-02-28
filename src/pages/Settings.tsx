
import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, CreditCard, AlertCircle, Camera } from "lucide-react";

const Settings = () => {
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    nomeSocial: "",
    nascimento: "",
    sexo: "",
    escolaridade: "",
    estadoCivil: "",
    email: "carlos@exemplo.com",
    celular: "",
    telefone: "",
    cep: "",
    endereco: "",
    numero: "",
    bairro: "",
    complemento: "",
    estado: "",
    cidade: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui seria implementada a lógica para salvar os dados
    console.log("Dados salvos:", formData);
    // Aqui poderia ter uma chamada para uma API
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 pt-[88px] bg-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-[#272f3c] mb-4">Minha conta</h1>
          <p className="text-[#67748a] mb-6">
            Mantendo sua conta atualizada, você nos ajuda a disponibilizar dados mais precisos sobre as aprovações pelo Brasil.
          </p>

          {/* Alerta de e-mail não validado */}
          <div className="bg-amber-50 p-4 rounded-lg mb-8 flex items-start justify-between">
            <div className="flex gap-2">
              <AlertCircle className="text-amber-500 h-5 w-5 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">O seu e-mail ainda não foi validado.</p>
                <p className="text-amber-700 text-sm">
                  Valide o seu e-mail através do link enviado para {formData.email}.
                  Caso não tenha recebido, clique no botão para reenviar.
                </p>
              </div>
            </div>
            <Button variant="outline" className="bg-amber-400 text-white border-amber-400 hover:bg-amber-500 hover:text-white">
              Reenviar e-mail
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Coluna com perfil e foto */}
            <div className="space-y-6">
              <div className="flex flex-col items-center bg-gray-50 p-6 rounded-lg">
                <div className="relative mb-4">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-sm">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback className="bg-[#ea2be2] text-white text-xl">
                      <User className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 bg-[#ea2be2] text-white p-2 rounded-full">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <h2 className="text-lg font-medium">Carlos Silva</h2>
                <p className="text-gray-500 text-sm">{formData.email}</p>
                <Button className="mt-4 w-full bg-[#ea2be2] hover:bg-opacity-90">
                  Assinatura Ilimitada
                </Button>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-medium text-[#272f3c] mb-4">Menu</h3>
                <nav className="space-y-2">
                  <a href="#" className="flex items-center gap-2 text-[#67748a] py-2 px-2 rounded-md hover:bg-gray-100 hover:text-[#ea2be2]">
                    <User className="h-4 w-4" />
                    <span>Minha conta</span>
                  </a>
                  <a href="#" className="flex items-center gap-2 text-[#67748a] py-2 px-2 rounded-md hover:bg-gray-100 hover:text-[#ea2be2]">
                    <CreditCard className="h-4 w-4" />
                    <span>Gerenciar assinatura</span>
                  </a>
                </nav>
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
                      <Label htmlFor="nomeSocial">Nome social</Label>
                      <Input
                        id="nomeSocial"
                        value={formData.nomeSocial}
                        onChange={(e) => handleChange("nomeSocial", e.target.value)}
                        placeholder="Seu nome social"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nascimento">Nascimento</Label>
                      <Input
                        id="nascimento"
                        value={formData.nascimento}
                        onChange={(e) => handleChange("nascimento", e.target.value)}
                        placeholder="dd/mm/aaaa"
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
                      <Label htmlFor="estadoCivil">Estado Civil</Label>
                      <Select
                        onValueChange={(value) => handleChange("estadoCivil", value)}
                        value={formData.estadoCivil}
                      >
                        <SelectTrigger id="estadoCivil">
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
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="seu@email.com"
                        disabled
                        className="bg-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="celular">Celular</Label>
                      <Input
                        id="celular"
                        value={formData.celular}
                        onChange={(e) => handleChange("celular", e.target.value)}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => handleChange("telefone", e.target.value)}
                        placeholder="(00) 0000-0000"
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
                      <Input
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
                  <Button type="submit" className="bg-[#ea2be2] hover:bg-opacity-90 w-full md:w-auto">
                    Salvar alterações
                  </Button>
                </div>
              </form>

              <Separator className="my-10" />

              {/* Seção de assinatura */}
              <div>
                <h2 className="text-xl font-bold text-[#272f3c] mb-6">Gerenciar Assinatura</h2>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-[#272f3c]">Plano Atual</h3>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Ativo</span>
                  </div>
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-[#272f3c]">Assinatura Ilimitada</p>
                    <p className="text-[#67748a]">Acesso a todos os cursos e materiais da plataforma</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-[#272f3c]">R$ 39,90 <span className="text-[#67748a] text-sm font-normal">/mês</span></p>
                    <Button variant="outline" className="border-[#ea2be2] text-[#ea2be2] hover:bg-[#ea2be2] hover:text-white">
                      Alterar plano
                    </Button>
                  </div>
                </div>

                {/* Seção de métodos de pagamento */}
                <h3 className="font-medium text-[#272f3c] mb-4">Métodos de Pagamento</h3>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-[#272f3c]">Cartão de crédito</p>
                        <p className="text-sm text-[#67748a]">**** **** **** 4242</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="text-sm h-8">
                      Editar
                    </Button>
                  </div>
                  
                  <Button className="w-full md:w-auto bg-[#ea2be2] hover:bg-opacity-90">
                    Adicionar novo método de pagamento
                  </Button>
                </div>

                {/* Histórico de faturas */}
                <h3 className="font-medium text-[#272f3c] mb-4">Histórico de Faturas</h3>
                
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Recibo</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">01/06/2023</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ 39,90</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Pago
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <a href="#" className="text-[#ea2be2] hover:text-[#ea2be2]">Download</a>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">01/05/2023</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ 39,90</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Pago
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <a href="#" className="text-[#ea2be2] hover:text-[#ea2be2]">Download</a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;
