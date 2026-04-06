export default function KPICard({ icon, label, value, sub, subColor = 'text-slate-500', iconBg = 'bg-blue-50', iconColor = 'text-blue-600' }) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`flex-shrink-0 p-3 rounded-xl ${iconBg}`}>
        <span className={`${iconColor} w-5 h-5 block`}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5 leading-tight">{value}</p>
        {sub && <p className={`text-xs mt-1 ${subColor}`}>{sub}</p>}
      </div>
    </div>
  );
}
