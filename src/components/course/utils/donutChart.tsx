
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const renderDonutChart = (percentage: number, size: number = 42) => {
  const data = [
    { name: 'Progress', value: percentage },
    { name: 'Remaining', value: 100 - percentage }
  ];
  const COLORS = ['rgba(241,28,227,1)', '#E0E0E0'];

  return (
    <div style={{ width: size, height: size }} className="relative">
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
      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-slate-600">
        {percentage}%
      </div>
    </div>
  );
};

