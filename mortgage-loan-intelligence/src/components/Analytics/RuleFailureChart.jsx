import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-lg text-sm max-w-xs">
      <p className="font-semibold text-slate-800">{payload[0].payload.fullName}</p>
      <p className="text-red-600 font-bold mt-0.5">{payload[0].value} failure{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  );
};

export default function RuleFailureChart({ data }) {
  if (!data.length) {
    return (
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Rule Failure Frequency</h3>
        <p className="text-xs text-slate-400">No rule failures recorded.</p>
      </div>
    );
  }

  const maxVal = data[0]?.count || 1;

  return (
    <div className="card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-800">Rule Failure Frequency</h3>
        <p className="text-xs text-slate-400 mt-0.5">Most frequently failing compliance rules</p>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 30, left: 8, bottom: 0 }}
          barSize={14}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            domain={[0, maxVal + 1]}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Failures">
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={i === 0 ? '#dc2626' : i === 1 ? '#ea580c' : i === 2 ? '#d97706' : '#f59e0b'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-1.5">
        {data.slice(0, 3).map((d, i) => (
          <div key={d.fullName} className="flex items-center gap-2 text-xs">
            <span className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center text-white font-bold text-[10px] ${i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-500' : 'bg-amber-500'}`}>
              {i + 1}
            </span>
            <span className="text-slate-600 flex-1 truncate">{d.fullName}</span>
            <span className="font-semibold text-red-600">{d.count}×</span>
          </div>
        ))}
      </div>
    </div>
  );
}
