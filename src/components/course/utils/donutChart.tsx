import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const renderDonutChart = (percentage: number, size: number = 42) => {
  const data = [
    { name: 'Progress', value: percentage },
    { name: 'Remaining', value: 100 - percentage }
  ];
  
  // Define cores baseadas no percentual de aproveitamento
  let progressColor = '#E0E0E0'; // Cor padrão cinza
  
  if (percentage >= 85) {
    progressColor = '#4CAF50'; // Verde para aproveitamento excelente (≥ 85%)
  } else if (percentage >= 70) {
    progressColor = '#8BC34A'; // Verde claro para aproveitamento bom (≥ 70%)
  } else if (percentage >= 50) {
    progressColor = '#FFC107'; // Amarelo para aproveitamento médio (≥ 50%)
  } else if (percentage >= 30) {
    progressColor = '#FF9800'; // Laranja para aproveitamento baixo (≥ 30%)
  } else if (percentage > 0) {
    progressColor = '#F44336'; // Vermelho para aproveitamento muito baixo (> 0%)
  }
  
  const COLORS = [progressColor, '#E0E0E0'];

  return (
    <div style={{ width: size, height: size }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            innerRadius={size * 0.35}
            outerRadius={size * 0.45}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
