import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell, LabelList,
} from 'recharts';

export function GroupedBarChart({ data, bars, title, height = 260 }) {
  return (
    <div>
      {title && <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">{title}</h4>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} barGap={4} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey={bars[0]?.xKey || 'name'} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          {bars.map(b => (
            <Bar key={b.key} dataKey={b.key} name={b.label} fill={b.color} radius={[4,4,0,0]} maxBarSize={40} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HorizontalBarChart({ data, dataKey = 'value', labelKey = 'name', color = '#3b82f6', title, height }) {
  const h = height || Math.max(200, data.length * 36);
  return (
    <div>
      {title && <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">{title}</h4>}
      <ResponsiveContainer width="100%" height={h}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 50, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey={labelKey} width={130} tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
          <Bar dataKey={dataKey} radius={[0,4,4,0]} maxBarSize={24}>
            {data.map((entry, i) => (
              <Cell key={i} fill={`hsl(${220 + i * 15}, 70%, ${55 + i * 2}%)`} />
            ))}
            <LabelList dataKey={dataKey} position="right" style={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RulePassFailChart({ data, title, height = 280 }) {
  return (
    <div>
      {title && <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">{title}</h4>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="rule"
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="passed" name="Passed" fill="#059669" radius={[4,4,0,0]} maxBarSize={36} />
          <Bar dataKey="failed" name="Failed" fill="#dc2626" radius={[4,4,0,0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FunnelBarChart({ data, title, height = 220 }) {
  const max = Math.max(...data.map(d => d.count));
  return (
    <div>
      {title && <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">{title}</h4>}
      <div className="space-y-2">
        {data.map((item, i) => {
          const pct = max ? (item.count / max) * 100 : 0;
          const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#059669', '#94a3b8', '#ef4444'];
          return (
            <div key={item.stage} className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-24 text-right shrink-0">{item.stage}</span>
              <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                <div
                  className="h-full rounded-full flex items-center pl-3 transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length], minWidth: item.count > 0 ? 40 : 0 }}
                >
                  <span className="text-white text-xs font-semibold">{item.count}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
