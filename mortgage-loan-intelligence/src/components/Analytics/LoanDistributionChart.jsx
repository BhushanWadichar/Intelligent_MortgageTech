import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell
} from 'recharts';

const COLORS = { pass: '#16a34a', fail: '#dc2626', pending: '#94a3b8' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-lg text-sm min-w-[130px]">
      <p className="font-semibold text-slate-800 mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span className="text-slate-500 capitalize">{p.name}</span>
          <span className="font-semibold" style={{ color: p.fill }}>{p.value}</span>
        </div>
      ))}
      <div className="border-t border-slate-100 mt-1.5 pt-1.5 flex justify-between">
        <span className="text-slate-400 text-xs">Total</span>
        <span className="font-bold text-slate-800 text-xs">{payload.reduce((s, p) => s + p.value, 0)}</span>
      </div>
    </div>
  );
};

export default function LoanDistributionChart({ data }) {
  return (
    <div className="card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-800">Loan Distribution by Type</h3>
        <p className="text-xs text-slate-400 mt-0.5">Volume and outcome breakdown per loan product</p>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barSize={14} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            formatter={val => <span style={{ color: '#64748b', textTransform: 'capitalize' }}>{val}</span>}
          />
          <Bar dataKey="pass" fill={COLORS.pass} radius={[3, 3, 0, 0]} name="pass" />
          <Bar dataKey="fail" fill={COLORS.fail} radius={[3, 3, 0, 0]} name="fail" />
          <Bar dataKey="pending" fill={COLORS.pending} radius={[3, 3, 0, 0]} name="pending" />
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-4 gap-2 mt-4">
        {data.map(d => (
          <div key={d.name} className="text-center p-2 bg-slate-50 rounded-lg">
            <p className="text-base font-bold text-slate-900">{d.total}</p>
            <p className="text-[11px] text-slate-500">{d.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
