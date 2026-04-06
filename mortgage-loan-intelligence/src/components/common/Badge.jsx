const variants = {
  Pass:               'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  Fail:               'bg-red-50 text-red-700 ring-1 ring-red-200',
  Pending:            'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  Warning:            'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  'Completed':        'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  'In Rule Review':   'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  'Extracted':        'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200',
  'Classified':       'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  'Document Ingested':'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  'Failed':           'bg-red-50 text-red-700 ring-1 ring-red-200',
  Conventional:       'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  FHA:                'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
  VA:                 'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
  Jumbo:              'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
};

export default function Badge({ label, size = 'sm' }) {
  const cls = variants[label] || 'bg-gray-100 text-gray-600 ring-1 ring-gray-200';
  const sz = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full ${sz} ${cls}`}>
      {label}
    </span>
  );
}
