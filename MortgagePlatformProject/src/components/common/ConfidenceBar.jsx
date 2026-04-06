export default function ConfidenceBar({ value, showLabel = true, className = '' }) {
  const color = value >= 90 ? 'bg-emerald-500' : value >= 75 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = value >= 90 ? 'text-emerald-700' : value >= 75 ? 'text-amber-700' : 'text-red-700';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      {showLabel && (
        <span className={`text-xs font-medium w-9 text-right tabular-nums ${textColor}`}>
          {value}%
        </span>
      )}
    </div>
  );
}
