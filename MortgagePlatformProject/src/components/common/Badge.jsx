const variants = {
  success:  'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
  danger:   'bg-red-100 text-red-800 ring-1 ring-red-200',
  warning:  'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
  info:     'bg-blue-100 text-blue-800 ring-1 ring-blue-200',
  neutral:  'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  purple:   'bg-purple-100 text-purple-800 ring-1 ring-purple-200',
};

const dots = {
  success: 'bg-emerald-500',
  danger:  'bg-red-500',
  warning: 'bg-amber-500',
  info:    'bg-blue-500',
  neutral: 'bg-slate-400',
  purple:  'bg-purple-500',
};

export default function Badge({ children, variant = 'neutral', dot = false, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dots[variant]}`} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    Pass: { variant: 'success', label: 'Pass' },
    Fail: { variant: 'danger',  label: 'Fail' },
    Partial: { variant: 'warning', label: 'Partial' },
    Verified: { variant: 'success', label: 'Verified' },
    Pending:  { variant: 'warning', label: 'Pending' },
    Missing:  { variant: 'danger',  label: 'Missing' },
    Completed: { variant: 'success', label: 'Completed' },
    Failed:   { variant: 'danger', label: 'Failed' },
    'In Rule Review': { variant: 'info', label: 'In Review' },
    classified:   { variant: 'success', label: 'Classified' },
    unclassified: { variant: 'warning', label: 'Unclassified' },
  };
  const cfg = map[status] || { variant: 'neutral', label: status };
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
}
