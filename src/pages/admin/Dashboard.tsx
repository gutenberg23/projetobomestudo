import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart, ResponsiveContainer, XAxis, YAxis, Bar, Line, Tooltip, CartesianGrid, Pie, Cell, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserPlus, UserMinus, DollarSign, TrendingUp, Calendar, Percent, ArrowUpRight, ArrowDownRight, FileDown, Ticket } from "lucide-react";

const dadosAssinantes = [{
  name: 'Jan',
  ativos: 120,
  novos: 30,
  cancelados: 10
}, {
  name: 'Fev',
  ativos: 140,
  novos: 35,
  cancelados: 15
}, {
  name: 'Mar',
  ativos: 160,
  novos: 40,
  cancelados: 20
}, {
  name: 'Abr',
  ativos: 180,
  novos: 45,
  cancelados: 25
}, {
  name: 'Mai',
  ativos: 200,
  novos: 50,
  cancelados: 30
}, {
  name: 'Jun',
  ativos: 220,
  novos: 40,
  cancelados: 20
}, {
  name: 'Jul',
  ativos: 240,
  novos: 45,
  cancelados: 25
}, {
  name: 'Ago',
  ativos: 260,
  novos: 50,
  cancelados: 30
}, {
  name: 'Set',
  ativos: 280,
  novos: 55,
  cancelados: 35
}, {
  name: 'Out',
  ativos: 300,
  novos: 60,
  cancelados: 40
}, {
  name: 'Nov',
  ativos: 320,
  novos: 65,
  cancelados: 45
}, {
  name: 'Dez',
  ativos: 340,
  novos: 70,
  cancelados: 50
}];
const dadosReceita = [{
  name: 'Jan',
  receita: 12000,
  mrr: 10000
}, {
  name: 'Fev',
  receita: 14000,
  mrr: 11000
}, {
  name: 'Mar',
  receita: 16000,
  mrr: 12000
}, {
  name: 'Abr',
  receita: 18000,
  mrr: 13000
}, {
  name: 'Mai',
  receita: 20000,
  mrr: 14000
}, {
  name: 'Jun',
  receita: 22000,
  mrr: 15000
}, {
  name: 'Jul',
  receita: 24000,
  mrr: 16000
}, {
  name: 'Ago',
  receita: 26000,
  mrr: 17000
}, {
  name: 'Set',
  receita: 28000,
  mrr: 18000
}, {
  name: 'Out',
  receita: 30000,
  mrr: 19000
}, {
  name: 'Nov',
  receita: 32000,
  mrr: 20000
}, {
  name: 'Dez',
  receita: 34000,
  mrr: 21000
}];
const dadosPlanos = [{
  name: 'Mensal',
  value: 65
}, {
  name: 'Trimestral',
  value: 15
}, {
  name: 'Anual',
  value: 20
}];
const cuponsAtivos = [{
  codigo: 'BEMVINDO10',
  desconto: '10%',
  validade: '30/06/2025',
  usos: 45,
  limite: 100
}, {
  codigo: 'VOLTA20',
  desconto: '20%',
  validade: '15/04/2025',
  usos: 23,
  limite: 50
}, {
  codigo: 'PROMO50',
  desconto: '50%',
  validade: '10/03/2025',
  usos: 18,
  limite: 20
}];
const COLORS = ['#ea2be2', '#0088FE', '#00C49F', '#FFBB28'];

const Dashboard = () => {
  const [periodoSelecionado, setPeriodoSelecionado] = useState("mes");

  const estatisticas = {
    assinantesAtivos: 340,
    novosAssinantes: 70,
    assinantesCancelados: 50,
    receitaTotal: 'R$ 34.000,00',
    receitaMensal: 'R$ 21.000,00',
    crescimentoAssinantes: '+10.3%',
    crescimentoReceita: '+7.8%',
    taxaCancelamento: '4.2%',
    projecaoProximoMes: 'R$ 37.000,00'
  };

  const handleChangePeriodo = (value: string) => {
    setPeriodoSelecionado(value);
  };

  const exportarDados = (formato: string) => {
    console.log(`Exportando dados em formato ${formato}`);
  };

  return <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[#272f3c]">Dashboard</h1>
        <p className="text-[#67748a]">Visão geral das assinaturas e receitas</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select defaultValue={periodoSelecionado} onValueChange={handleChangePeriodo}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dia">Últimas 24 horas</SelectItem>
              <SelectItem value="semana">Última semana</SelectItem>
              <SelectItem value="mes">Último mês</SelectItem>
              <SelectItem value="ano">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-[#67748a]">Atualizado em: {new Date().toLocaleString('pt-BR')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportarDados('csv')} className="w-auto">
            <FileDown className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportarDados('pdf')} className="w-auto">
            <FileDown className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinantes Ativos</CardTitle>
            <Users className="h-4 w-4 text-[#5f2ebe]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.assinantesAtivos}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-green-500 flex items-center mr-1">
                <ArrowUpRight className="h-4 w-4" />
                {estatisticas.crescimentoAssinantes}
              </span>
              comparado ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Assinantes</CardTitle>
            <UserPlus className="h-4 w-4 text-[#5f2ebe]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.novosAssinantes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              neste mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelamentos</CardTitle>
            <UserMinus className="h-4 w-4 text-[#5f2ebe]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.assinantesCancelados}</div>
            <p className="text-xs text-muted-foreground mt-1">
              neste mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Cancelamento</CardTitle>
            <Percent className="h-4 w-4 text-[#5f2ebe]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.taxaCancelamento}</div>
            <Progress value={4.2} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="receita">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="receita">Receita e Faturamento</TabsTrigger>
          <TabsTrigger value="assinantes">Assinantes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="receita" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-[#5f2ebe]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas.receitaTotal}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <span className="text-green-500 flex items-center mr-1">
                    <ArrowUpRight className="h-4 w-4" />
                    {estatisticas.crescimentoReceita}
                  </span>
                  comparado ao mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Mensal (MRR)</CardTitle>
                <Calendar className="h-4 w-4 text-[#5f2ebe]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas.receitaMensal}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  assinaturas ativas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projeção Próximo Mês</CardTitle>
                <TrendingUp className="h-4 w-4 text-[#5f2ebe]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas.projecaoProximoMes}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  baseado na tendência atual
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Receita Anual</CardTitle>
              <CardDescription>
                Comparação de receita total e receita mensal recorrente (MRR)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosReceita}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={value => ['R$ ' + value.toLocaleString('pt-BR')]} labelFormatter={label => 'Mês: ' + label} />
                  <Legend />
                  <Bar dataKey="receita" name="Receita Total" fill="#ea2be2" />
                  <Bar dataKey="mrr" name="MRR" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Planos</CardTitle>
                <CardDescription>
                  Porcentagem de assinantes por tipo de plano
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dadosPlanos} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({
                    name,
                    percent
                  }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {dadosPlanos.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={value => [`${value}%`, 'Porcentagem']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Cupons de Desconto</span>
                  <Button variant="outline" size="sm" className="w-auto">
                    <Ticket className="mr-2 h-4 w-4" />
                    Novo Cupom
                  </Button>
                </CardTitle>
                <CardDescription>
                  Gerenciamento de cupons de desconto ativos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Desconto</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Usos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cuponsAtivos.map(cupom => <TableRow key={cupom.codigo}>
                        <TableCell className="font-medium">{cupom.codigo}</TableCell>
                        <TableCell>{cupom.desconto}</TableCell>
                        <TableCell>{cupom.validade}</TableCell>
                        <TableCell>
                          {cupom.usos}/{cupom.limite}
                          <Progress value={cupom.usos / cupom.limite * 100} className="h-1 mt-1" />
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assinantes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Assinantes</CardTitle>
              <CardDescription>
                Crescimento de assinantes ativos ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dadosAssinantes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ativos" name="Assinantes Ativos" stroke="#ea2be2" activeDot={{
                  r: 8
                }} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Novos Assinantes vs Cancelamentos</CardTitle>
              <CardDescription>
                Comparativo entre novos assinantes e cancelamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosAssinantes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="novos" name="Novos Assinantes" fill="#00C49F" />
                  <Bar dataKey="cancelados" name="Cancelamentos" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};
export default Dashboard;
