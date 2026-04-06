import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// Segments aligned with the 5 KPI cards
const SEGMENTS = [
  { key: 'completed',  label: 'Completed',   color: '#16a34a', dot: 'bg-emerald-500' },
  { key: 'failed',     label: 'Failed',       color: '#dc2626', dot: 'bg-red-500'     },
  { key: 'inProgress', label: 'In Progress',  color: '#9ca3af', dot: 'bg-slate-400'   },
  { key: 'missingDoc', label: 'Missing Doc',  color: '#7c3aed', dot: 'bg-violet-500'  },
];

const RADIAN = Math.PI / 180;

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x} y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
      style={{ pointerEvents: 'none' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-lg text-sm min-w-[130px]">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full" style={{ background: p.payload.color }} />
        <span className="font-semibold text-slate-700">{p.name}</span>
      </div>
      <p className="text-xl font-bold text-slate-900">{p.value}</p>
      <p className="text-[11px] text-slate-400">
        {((p.value / p.payload.total) * 100).toFixed(1)}% of {p.payload.total} total
      </p>
    </div>
  );
};

export default function PassFailChart({ stats }) {
  const total = stats?.total ?? 0;

  const chartData = SEGMENTS
    .map(s => ({ name: s.label, value: stats?.[s.key] ?? 0, color: s.color, total }))
    .filter(d => d.value > 0);

  const completionRate = total > 0 ? Math.round(((stats?.completed ?? 0) / total) * 100) : 0;

  return (
    <div className="card p-6">
      {/* Header — matches screenshot exactly */}
      <div className="mb-2">
        <h3 className="text-base font-bold text-slate-900">Pass / Fail Rate</h3>
        <p className="text-sm text-slate-400 mt-0.5">System-wide loan approval distribution</p>
      </div>

      {/* Donut chart — centred, matches screenshot */}
      <div className="relative mx-auto" style={{ width: 220, height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={100}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              labelLine={false}
              label={renderLabel}
              stroke="none"
              paddingAngle={2}
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Centre label — same as screenshot */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-4xl font-extrabold text-slate-900 leading-none">
            {completionRate}%
          </p>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">Pass Rate</p>
        </div>
      </div>

      {/* Count tiles — same grid layout as screenshot, extended to 4 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
        {SEGMENTS.map(seg => {
          const value = stats?.[seg.key] ?? 0;
          return (
            <div
              key={seg.key}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
            >
              <div className={`w-2.5 h-2.5 rounded-full ${seg.dot} mb-2`} />
              <p className="text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
              <p className="text-xs text-slate-500 mt-1.5 font-medium">{seg.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
