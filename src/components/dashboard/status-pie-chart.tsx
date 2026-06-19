import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Visitor } from '@/app/(dashboard)/visitors/list/page';

export const StatusPieChart = ({ visitors }: { visitors: Visitor[] }) => {
  const data = useMemo(() => {
    const inside = visitors.filter(v => v.status === 'Inside').length;
    const exited = visitors.filter(v => v.status === 'Exited').length;
    return [
      { name: 'Inside', value: inside },
      { name: 'Exited', value: exited },
    ];
  }, [visitors]);

  const COLORS = ['#22C55E', '#EF4444']; // success green for inside, danger red for exited

  // If there are no visitors, render a friendly placeholder
  if (!visitors || visitors.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No visitor data available.
      </div>
    );
  }

  return (
    <ResponsiveContainer width='100%' height={300}>
      <PieChart>
        <Pie
          data={data}
          cx='50%'
          cy='50%'
          innerRadius={60}
          outerRadius={80}
          fill='currentColor'
          className="fill-primary"
          paddingAngle={5}
          dataKey='value'
          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};
