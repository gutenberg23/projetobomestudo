
import React from "react";
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  HelpCircle, 
  ScrollText 
} from "lucide-react";

const statsData = [
  {
    title: "Usuários Ativos",
    value: "2,453",
    change: "+12.5%",
    icon: Users,
    iconColor: "bg-blue-100 text-blue-600",
  },
  {
    title: "Questões Respondidas",
    value: "45,231",
    change: "+23.1%",
    icon: HelpCircle,
    iconColor: "bg-purple-100 text-purple-600",
  },
  {
    title: "Cursos Ativos",
    value: "15",
    change: "+5.0%",
    icon: BookOpen,
    iconColor: "bg-green-100 text-green-600",
  },
  {
    title: "Simulados Realizados",
    value: "543",
    change: "+16.8%",
    icon: ScrollText,
    iconColor: "bg-orange-100 text-orange-600",
  },
];

const recentActivity = [
  {
    action: "Novo usuário registrado",
    user: "João Silva",
    time: "Há 10 minutos",
  },
  {
    action: "Nova questão adicionada",
    user: "Maria Oliveira",
    time: "Há 25 minutos",
  },
  {
    action: "Curso atualizado",
    user: "Pedro Santos",
    time: "Há 1 hora",
  },
  {
    action: "Novo simulado criado",
    user: "Ana Souza",
    time: "Há 3 horas",
  },
  {
    action: "Relatório de desempenho gerado",
    user: "Carlos Ferreira",
    time: "Há 5 horas",
  },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-[#67748a]">{stat.title}</p>
                <h3 className="text-2xl font-bold text-[#272f3c] mt-1">{stat.value}</h3>
                <p className="text-xs font-medium text-green-600 mt-1">{stat.change} este mês</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.iconColor}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 md:col-span-2">
          <h3 className="text-lg font-bold text-[#272f3c] mb-4">Estatísticas de Desempenho</h3>
          <div className="aspect-[16/9] w-full bg-gray-100 rounded-md flex items-center justify-center">
            <BarChart3 className="h-12 w-12 text-gray-300" />
            <span className="ml-2 text-gray-400">Gráfico de estatísticas</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#272f3c] mb-4">Atividade Recente</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="h-2 w-2 rounded-full bg-[#ea2be2] mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-[#272f3c]">{activity.action}</p>
                  <p className="text-xs text-[#67748a]">
                    {activity.user} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
