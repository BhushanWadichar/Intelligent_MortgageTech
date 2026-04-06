import { X, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LOAN_TYPES, STAGES, STATUSES } from '../../data/mockData';

export default function FilterBar() {
  const { filters, setFilters } = useApp();

  const set = (key, val) => setFilters(f => ({ ...f, [key]: val }));
  const clearAll = () => setFilters({ status: '', loanType: '', stage: '', search: '' });
  const hasFilters = filters.status || filters.loanType || filters.stage || filters.search;

  const Select = ({ id, label, options, value, onChange }) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-slate-500">{label}</label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="select-base text-sm min-w-[140px]"
        >
          {options.map(o => <option key={o} value={o === options[0] ? '' : o}>{o}</option>)}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );

  return (
    <div className="card px-5 py-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex items-center gap-2 text-slate-600">
          <SlidersHorizontal size={15} />
          <span className="text-sm font-semibold">Filters</span>
        </div>

        <Select
          id="status-filter"
          label="Status"
          options={STATUSES}
          value={filters.status || STATUSES[0]}
          onChange={v => set('status', v)}
        />
        <Select
          id="type-filter"
          label="Loan Type"
          options={LOAN_TYPES}
          value={filters.loanType || LOAN_TYPES[0]}
          onChange={v => set('loanType', v)}
        />
        <Select
          id="stage-filter"
          label="Stage"
          options={STAGES}
          value={filters.stage || STAGES[0]}
          onChange={v => set('stage', v)}
        />

        {hasFilters && (
          <button onClick={clearAll} className="btn-ghost text-xs flex items-center gap-1.5 mt-4">
            <X size={13} /> Clear Filters
          </button>
        )}

        <div className="ml-auto text-right">
          {hasFilters && (
            <div className="flex flex-wrap gap-1.5 justify-end">
              {filters.status && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium ring-1 ring-blue-100">
                  {filters.status} <button onClick={() => set('status', '')}><X size={10} /></button>
                </span>
              )}
              {filters.loanType && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium ring-1 ring-purple-100">
                  {filters.loanType} <button onClick={() => set('loanType', '')}><X size={10} /></button>
                </span>
              )}
              {filters.stage && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium ring-1 ring-amber-100">
                  {filters.stage} <button onClick={() => set('stage', '')}><X size={10} /></button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
