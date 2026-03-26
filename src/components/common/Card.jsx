export default function Card({ children, className = '', noPad = false, hover = false }) {
  return (
    <div className={`
      bg-white rounded-xl border border-slate-200 shadow-sm
      ${hover ? 'hover:shadow-md hover:border-slate-300 transition-all duration-150 cursor-pointer' : ''}
      ${noPad ? '' : 'p-5'}
      ${className}
    `}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, actions, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, sub, icon, color = 'blue', trend }) {
  const colors = {
    blue:    { bg: 'bg-blue-50',    icon: 'bg-blue-600',    text: 'text-blue-700' },
    green:   { bg: 'bg-emerald-50', icon: 'bg-emerald-600', text: 'text-emerald-700' },
    amber:   { bg: 'bg-amber-50',   icon: 'bg-amber-500',   text: 'text-amber-700' },
    red:     { bg: 'bg-red-50',     icon: 'bg-red-600',     text: 'text-red-700' },
    purple:  { bg: 'bg-purple-50',  icon: 'bg-purple-600',  text: 'text-purple-700' },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${c.text}`}>{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
          {trend && (
            <p className={`text-xs mt-1 font-medium ${trend.up ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend.up ? '↑' : '↓'} {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className={`${c.bg} ${c.icon} bg-opacity-20 w-11 h-11 rounded-xl flex items-center justify-center`}>
            <div className={`${c.icon} bg-opacity-100 w-9 h-9 rounded-lg flex items-center justify-center text-white`}>
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
