import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const renderDonutChart = (percentage: number, primaryColor: string = '#5f2ebe', backgroundColor: string = 'rgba(38,47,60,0.1)', size: number = 42) => {
  const data = [
    { name: 'Progress', value: percentage },
    { name: 'Remaining', value: 100 - percentage }
  ];
  
  const COLORS = [primaryColor, backgroundColor];

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
