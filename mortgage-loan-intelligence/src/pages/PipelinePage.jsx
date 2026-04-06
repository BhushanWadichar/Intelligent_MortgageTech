import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import PipelineTracker from '../components/Pipeline/PipelineTracker';
import { LOAN_TYPES, STAGES } from '../data/mockData';
import { Search, X } from 'lucide-react';

export default function PipelinePage() {
  const { loans } = useApp();
  const [search, setSearch] = useState('');
  const [loanType, setLoanType] = useState('');
  const [stage, setStage] = useState('');

  const filtered = useMemo(() => {
    return loans.filter(l => {
      if (loanType && l.loanType !== loanType) return false;
      if (stage && l.currentStage !== stage) return false;
      if (search) {
        const q = search.toLowerCase();
        return l.id.toLowerCase().includes(q) || l.borrowerName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [loans, loanType, stage, search]);

  const hasFilters = loanType || stage || search;

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Loan Pipeline Tracker</h2>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} of {loans.length} loans displayed</p>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="card px-5 py-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input-base pl-8 text-sm"
              placeholder="Search loan ID or borrower…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="relative">
            <select
              value={loanType}
              onChange={e => setLoanType(e.target.value)}
              className="select-base text-sm min-w-[140px]"
            >
              {LOAN_TYPES.map(t => (
                <option key={t} value={t === 'All Types' ? '' : t}>{t}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="relative">
            <select
              value={stage}
              onChange={e => setStage(e.target.value)}
              className="select-base text-sm min-w-[160px]"
            >
              {STAGES.map(s => (
                <option key={s} value={s === 'All Stages' ? '' : s}>{s}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setLoanType(''); setStage(''); }}
              className="btn-ghost text-xs"
            >
              <X size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Tracker */}
      <PipelineTracker loans={filtered} />
    </div>
  );
}
