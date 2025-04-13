import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const TermosEPoliticas = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold text-center text-[#272f3c] mb-6">
            Termos de Serviço e Política de Privacidade
          </h1>
          <p className="text-[#67748a] text-center mb-10">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <Tabs defaultValue="termos" className="w-full">
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="termos" className="text-[#272f3c]">
                Termos de Serviço
              </TabsTrigger>
              <TabsTrigger value="privacidade" className="text-[#272f3c]">
                Política de Privacidade
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="termos" className="space-y-8">
              <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-[#272f3c] mb-4">1. Introdução</h2>
                <p className="text-[#67748a] mb-4">
                  Bem-vindo ao BomEstudo! Ao utilizar nossos serviços, você concorda com estes termos. 
                  Por favor, leia-os atentamente.
                </p>
                <p className="text-[#67748a]">
                  Este documento estabelece os termos e condições para o uso da plataforma BomEstudo, 
                  que oferece cursos, questões comentadas e estatísticas de desempenho para 
                  candidatos de concursos públicos.
                </p>
              </section>

              <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-[#272f3c] mb-4">2. Definições</h2>
                <ul className="list-disc pl-5 text-[#67748a] space-y-2">
                  <li><strong>Plataforma:</strong> Refere-se ao site BomEstudo e todos os seus serviços.</li>
                  <li><strong>Usuário:</strong> Qualquer pessoa que acesse ou utilize a plataforma.</li>
                  <li><strong>Aluno:</strong> Usuário que se registra para acessar o conteúdo educacional.</li>
                  <li><strong>Professor:</strong> Profissional contratado ou parceiro que disponibiliza conteúdo na plataforma.</li>
                  <li><strong>Conteúdo:</strong> Materiais educacionais, incluindo vídeos, textos, questões e exercícios.</li>
                </ul>
              </section>

              <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-[#272f3c] mb-4">3. Cadastro e Conta</h2>
                <p className="text-[#67748a] mb-4">
                  Para acessar recursos completos da plataforma, é necessário criar uma conta e fornecer 
                  informações precisas e atualizadas. Você é responsável por manter a confidencialidade 
                  de sua senha e por todas as atividades realizadas em sua conta.
                </p>
                <p className="text-[#67748a]">
                  O BomEstudo reserva-se o direito de recusar ou cancelar cadastros a seu critério, 
                  especialmente em casos de violação dos termos de uso ou comportamento inadequado.
                </p>
              </section>

              <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-[#272f3c] mb-4">4. Termos para Alunos</h2>
                <div className="space-y-4 text-[#67748a]">
                  <p>
                    <strong>4.1. Assinaturas e Pagamentos:</strong> Oferecemos planos de assinatura que 
                    dão acesso ao conteúdo da plataforma. Os preços e condições específicas estão sujeitos 
                    a alterações e serão sempre informados antes da contratação.
                  </p>
                  <p>
                    <strong>4.2. Cancelamento:</strong> Você pode cancelar sua assinatura a qualquer 
                    momento através de sua conta. O acesso continua disponível até o final do período pago.
                  </p>
                  <p>
                    <strong>4.3. Uso do Conteúdo:</strong> O conteúdo da plataforma destina-se apenas ao 
                    uso pessoal e não comercial. É proibido copiar, distribuir ou compartilhar o material 
                    da plataforma sem autorização.
                  </p>
                  <p>
                    <strong>4.4. Comportamento:</strong> Ao interagir em fóruns ou comentários, você 
                    deve respeitar outros usuários e professores, não utilizando linguagem ofensiva ou 
                    discriminatória.
                  </p>
                </div>
              </section>

              <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-[#272f3c] mb-4">5. Termos para Professores</h2>
                <div className="space-y-4 text-[#67748a]">
                  <p>
                    <strong>5.1. Parceria:</strong> Professores podem se candidatar para criar e 
                    disponibilizar conteúdo na plataforma, sujeito à aprovação da equipe BomEstudo.
                  </p>
                  <p>
                    <strong>5.2. Direitos de Propriedade Intelectual:</strong> Ao submeter conteúdo,
                    o professor mantém os direitos autorais, mas concede à plataforma uma licença para 
                    uso, reprodução e distribuição do material dentro do ambiente BomEstudo.
                  </p>
                  <p>
                    <strong>5.3. Qualidade do Conteúdo:</strong> O conteúdo deve ser original, preciso e 
                    de alta qualidade. A plataforma reserva-se o direito de remover material que não 
                    atenda aos padrões estabelecidos.
                  </p>
                  <p>
                    <strong>5.4. Remuneração:</strong> Os termos de remuneração serão estabelecidos 
                    individualmente com cada professor parceiro, conforme contrato específico.
                  </p>
                  <p>
                    <strong>5.5. Responsabilidade:</strong> Professores são responsáveis pela precisão 
                    e legalidade do conteúdo que produzem, garantindo que não infringe direitos de 
                    terceiros.
                  </p>
                </div>
              </section>

              <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-[#272f3c] mb-4">6. Limitações de Responsabilidade</h2>
                <p className="text-[#67748a] mb-4">
                  O BomEstudo se esforça para fornecer conteúdo educacional de qualidade, mas não 
                  garante aprovação em concursos ou resultados específicos.
                </p>
                <p className="text-[#67748a]">
                  A plataforma não se responsabiliza por interrupções temporárias no serviço devido a 
                  manutenção técnica ou problemas fora de nosso controle.
                </p>
              </section>

              <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-[#272f3c] mb-4">7. Alterações nos Termos</h2>
                <p className="text-[#67748a]">
                  O BomEstudo pode modificar estes termos a qualquer momento. As alterações entrarão 
                  em vigor após publicação na plataforma. O uso continuado dos serviços após as 
                  modificações constitui aceitação dos novos termos.
                </p>
              </section>
            </TabsContent>
            
            <TabsContent value="privacidade" className="space-y-8">
              <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-[#272f3c] mb-4">1. Introdução à Política de Privacidade</h2>
                <p className="text-[#67748a] mb-4">
                  Esta Política de Privacidade descreve como o BomEstudo coleta, usa, armazena e protege 
                  suas informações pessoais quando você utiliza nossa plataforma.
                </p>
                <p className="text-[#67748a]">
                  Respeitamos sua privacidade e estamos comprometidos em proteger suas informações pessoais. 
                  Ao utilizar nossos serviços, você concorda com as práticas descritas nesta política.
                </p>
              </section>

              <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-[#272f3c] mb-4">2. Informações que Coletamos</h2>
                <div className="space-y-4 text-[#67748a]">
                  <p>
                    <strong>2.1. Informações de Registro:</strong> Nome, e-mail, telefone, endereço e 
                    dados de pagamento quando você cria uma conta ou assina nossos serviços.
                  </p>
                  <p>
                    <strong>2.2. Informações de Uso:</strong> Dados sobre como você interage com a 
                    plataforma, incluindo cursos acessados, questões respondidas e tempo de estudo.
                  </p>
                  <p>
                    <strong>2.3. Informações Técnicas:</strong> Endereço IP, tipo de dispositivo, 
                    navegador, páginas visitadas e dados de cookies.
                  </p>
                  <p>
                    <strong>2.4. Para Professores:</strong> Além dos dados básicos, coletamos informações 
                    sobre qualificações acadêmicas, experiência profissional e links para redes sociais 
                    e canal do YouTube.
                  </p>
                </div>
              </section>

              <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-[#272f3c] mb-4">3. Como Utilizamos suas Informações</h2>
                <ul className="list-disc pl-5 text-[#67748a] space-y-2">
                  <li>Fornecer e melhorar nossos serviços educacionais</li>
                  <li>Personalizar sua experiência de aprendizado</li>
                  <li>Processar pagamentos e gerenciar assinaturas</li>
                  <li>Comunicar-se com você sobre atualizações e novos conteúdos</li>
                  <li>Fornecer suporte ao cliente</li>
                  <li>Analisar tendências de uso para melhorar a plataforma</li>
                  <li>Prevenir atividades fraudulentas e proteger nossos usuários</li>
                </ul>
              </section>

              <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-[#272f3c] mb-4">4. Compartilhamento de Informações</h2>
                <p className="text-[#67748a] mb-4">
                  Não vendemos suas informações pessoais a terceiros. Podemos compartilhar dados nas 
                  seguintes circunstâncias:
                </p>
                <ul className="list-disc pl-5 text-[#67748a] space-y-2">
                  <li>Com provedores de serviços que nos ajudam a operar a plataforma</li>
                  <li>Para cumprir obrigações legais ou responder a solicitações governamentais</li>
                  <li>Para proteger direitos, propriedade ou segurança</li>
                  <li>Com seu consentimento explícito</li>
                </ul>
              </section>

              <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-[#272f3c] mb-4">5. Segurança dos Dados</h2>
                <p className="text-[#67748a] mb-4">
                  Implementamos medidas técnicas e organizacionais para proteger suas informações contra 
                  acesso não autorizado, perda ou alteração. No entanto, nenhum sistema é completamente 
                  seguro, e não podemos garantir a segurança absoluta dos dados.
                </p>
                <p className="text-[#67748a]">
                  Seus dados são armazenados em servidores seguros e processados de acordo com as melhores 
                  práticas de segurança da informação.
                </p>
              </section>

              <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-[#272f3c] mb-4">6. Seus Direitos de Privacidade</h2>
                <p className="text-[#67748a] mb-4">
                  De acordo com as leis de proteção de dados aplicáveis, você tem direito a:
                </p>
                <ul className="list-disc pl-5 text-[#67748a] space-y-2">
                  <li>Acessar seus dados pessoais</li>
                  <li>Corrigir informações imprecisas</li>
                  <li>Excluir seus dados (sujeito a certas condições)</li>
                  <li>Restringir ou opor-se ao processamento de seus dados</li>
                  <li>Solicitar a portabilidade de seus dados</li>
                  <li>Retirar seu consentimento a qualquer momento</li>
                </ul>
              </section>

              <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-[#272f3c] mb-4">7. Política para Professores</h2>
                <div className="space-y-4 text-[#67748a]">
                  <p>
                    <strong>7.1. Informações Públicas:</strong> Como professor, certas informações, como seu 
                    nome, foto, biografia profissional e disciplinas lecionadas, serão exibidas publicamente 
                    na plataforma para que os alunos possam conhecer seu perfil.
                  </p>
                  <p>
                    <strong>7.2. Canal do YouTube e Redes Sociais:</strong> Links para seu canal do YouTube e 
                    perfis em redes sociais serão compartilhados apenas com seu consentimento explícito, para 
                    promover sua visibilidade como educador.
                  </p>
                  <p>
                    <strong>7.3. Avaliações:</strong> Os alunos podem avaliar suas aulas e deixar comentários 
                    que serão visíveis na plataforma. Monitoramos estas avaliações para garantir que sejam 
                    respeitosas e construtivas.
                  </p>
                </div>
              </section>

              <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-[#272f3c] mb-4">8. Cookies e Tecnologias Semelhantes</h2>
                <p className="text-[#67748a] mb-4">
                  Utilizamos cookies e tecnologias semelhantes para melhorar sua experiência, analisar o uso 
                  da plataforma e personalizar conteúdos. Você pode gerenciar suas preferências de cookies 
                  através das configurações do seu navegador.
                </p>
              </section>

              <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-[#272f3c] mb-4">9. Alterações na Política de Privacidade</h2>
                <p className="text-[#67748a]">
                  Podemos atualizar esta política periodicamente para refletir mudanças em nossas práticas ou por 
                  outros motivos operacionais ou legais. Notificaremos você sobre alterações significativas 
                  através da plataforma ou por e-mail.
                </p>
              </section>
            </TabsContent>
          </Tabs>

          <Separator className="my-8" />
          
          <div className="text-center">
            <p className="text-[#67748a] mb-4">
              Se você tiver dúvidas sobre nossos Termos de Serviço ou Política de Privacidade, 
              entre em contato conosco:
            </p>
            <p className="text-[#ea2be2] font-medium">contato@bomestudo.com.br</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermosEPoliticas;
