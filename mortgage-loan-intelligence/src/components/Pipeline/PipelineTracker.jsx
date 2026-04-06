import { useState, useMemo } from 'react';
import { CheckCircle2, Clock, AlertCircle, Circle, ChevronUp, ChevronDown, FileSearch, ShieldCheck, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Badge from '../common/Badge';
import ExtractionModal from './ExtractionModal';
import RuleReviewModal from './RuleReviewModal';
import { format } from 'date-fns';

// ─── Stage Cell ──────────────────────────────────────────────────────────────

function StageCell({ stageKey, stageStatus, loan, onOpenExtraction, onOpenRuleReview }) {
  const status = stageStatus[stageKey];
  const isClickable = (stageKey === 'extracted' && ['complete', 'active'].includes(status) && loan.extractedDocuments.length > 0)
    || (stageKey === 'ruleReview' && ['complete', 'active'].includes(status) && loan.ruleResults.length > 0);

  const handleClick = () => {
    if (!isClickable) return;
    if (stageKey === 'extracted') onOpenExtraction(loan);
    if (stageKey === 'ruleReview') onOpenRuleReview(loan);
  };

  if (status === 'complete') {
    return (
      <button
        onClick={handleClick}
        disabled={!isClickable}
        className={`flex items-center justify-center w-full h-8 rounded-lg text-xs font-medium transition-all
          ${isClickable
            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer ring-1 ring-emerald-200 hover:ring-emerald-300'
            : 'bg-emerald-50 text-emerald-600 cursor-default ring-1 ring-emerald-100'
          }`}
        title={isClickable ? `Click to view ${stageKey === 'extracted' ? 'extracted documents' : 'rule results'}` : ''}
      >
        <CheckCircle2 size={14} className="mr-1" />
        {isClickable && <span className="hidden lg:inline">{stageKey === 'extracted' ? 'View' : 'View'}</span>}
      </button>
    );
  }
  if (status === 'active') {
    return (
      <button
        onClick={handleClick}
        disabled={!isClickable}
        className={`flex items-center justify-center w-full h-8 rounded-lg text-xs font-medium transition-all
          ${stageKey === 'extracted'
            ? 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200 hover:bg-cyan-100 cursor-pointer'
            : stageKey === 'ruleReview'
            ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100 cursor-pointer'
            : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 cursor-default'
          }`}
        title={isClickable ? `Click to view ${stageKey === 'extracted' ? 'extracted documents' : 'rule results'}` : ''}
      >
        <Clock size={13} className="mr-1 animate-pulse" />
        <span className="hidden lg:inline">Active</span>
      </button>
    );
  }
  if (status === 'failed') {
    return (
      <div className="flex items-center justify-center w-full h-8 rounded-lg bg-red-50 text-red-600 ring-1 ring-red-200 text-xs font-medium">
        <AlertCircle size={13} className="mr-1" />
        <span className="hidden lg:inline">Failed</span>
      </div>
    );
  }
  // pending
  return (
    <div className="flex items-center justify-center w-full h-8 rounded-lg bg-slate-50 text-slate-300 ring-1 ring-slate-100 text-xs">
      <Circle size={13} />
    </div>
  );
}

function FinalCell({ loan }) {
  const { stageStatus } = loan;
  if (stageStatus.final === 'pass') return <Badge label="Pass" />;
  if (stageStatus.final === 'fail') return <Badge label="Fail" />;
  if (stageStatus.final === 'pending' && stageStatus.ruleReview === 'active') return <Badge label="In Rule Review" size="xs" />;
  return <Badge label="Pending" />;
}

// ─── Main Component ──────────────────────────────────────────────────────────

const STAGE_KEYS = ['ingested', 'classified', 'extracted', 'ruleReview'];
const STAGE_LABELS = { ingested: 'Ingested', classified: 'Classified', extracted: 'Extracted', ruleReview: 'Rule Review' };

export default function PipelineTracker({ loans }) {
  const [extractionLoan, setExtractionLoan] = useState(null);
  const [ruleReviewLoan, setRuleReviewLoan] = useState(null);
  const [sort, setSort] = useState({ key: 'lastUpdated', dir: 'desc' });

  const sorted = useMemo(() => {
    return [...loans].sort((a, b) => {
      let av = a[sort.key], bv = b[sort.key];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [loans, sort]);

  const toggleSort = (key) => {
    setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  };

  const SortIcon = ({ k }) => {
    if (sort.key !== k) return <ChevronUp size={12} className="text-slate-300" />;
    return sort.dir === 'asc' ? <ChevronUp size={12} className="text-blue-500" /> : <ChevronDown size={12} className="text-blue-500" />;
  };

  const Th = ({ label, k, className = '' }) => (
    <th className={`th ${className}`}>
      <button onClick={() => toggleSort(k)} className="flex items-center gap-1 hover:text-slate-800 transition-colors">
        {label} <SortIcon k={k} />
      </button>
    </th>
  );

  return (
    <>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs text-slate-500">
        <span className="font-semibold">Stage legend:</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-100 ring-1 ring-emerald-200 inline-block" /> Complete</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-100 ring-1 ring-blue-200 inline-block" /> Active</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-100 ring-1 ring-slate-200 inline-block" /> Pending</span>
        <span className="flex items-center gap-1"><FileSearch size={13} className="text-cyan-600" /> Click Extracted to view docs</span>
        <span className="flex items-center gap-1"><ShieldCheck size={13} className="text-amber-600" /> Click Rule Review to view results</span>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <Th label="Loan ID" k="id" className="min-w-[120px]" />
                <Th label="Borrower" k="borrowerName" className="min-w-[160px]" />
                <Th label="Type" k="loanType" />
                <Th label="Amount" k="loanAmount" />
                {STAGE_KEYS.map(k => (
                  <th key={k} className="th min-w-[90px]">
                    {STAGE_LABELS[k]}
                    {(k === 'extracted' || k === 'ruleReview') && (
                      <span className="ml-1 text-[9px] text-blue-400 font-normal">● clickable</span>
                    )}
                  </th>
                ))}
                <th className="th">Final Status</th>
                <Th label="Updated" k="lastUpdated" className="min-w-[110px]" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map(loan => (
                <tr key={loan.id} className="tr-hover group">
                  <td className="td">
                    <span className="font-mono text-xs font-semibold text-blue-600 group-hover:text-blue-700">{loan.id}</span>
                  </td>
                  <td className="td">
                    <div>
                      <p className="font-medium text-slate-800">{loan.borrowerName}</p>
                      {loan.coBorrowerName && <p className="text-xs text-slate-400">+ {loan.coBorrowerName}</p>}
                    </div>
                  </td>
                  <td className="td"><Badge label={loan.loanType} size="xs" /></td>
                  <td className="td font-medium text-slate-800">${loan.loanAmount.toLocaleString()}</td>
                  {STAGE_KEYS.map(k => (
                    <td key={k} className="td px-2">
                      <StageCell
                        stageKey={k}
                        stageStatus={loan.stageStatus}
                        loan={loan}
                        onOpenExtraction={setExtractionLoan}
                        onOpenRuleReview={setRuleReviewLoan}
                      />
                    </td>
                  ))}
                  <td className="td"><FinalCell loan={loan} /></td>
                  <td className="td text-slate-400 text-xs">
                    {format(new Date(loan.lastUpdated), 'MMM d, yyyy')}
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400 text-sm">
                    No loans match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">{sorted.length} loan{sorted.length !== 1 ? 's' : ''} shown</p>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <ArrowRight size={12} /> Click Extracted or Rule Review cells to view details
          </div>
        </div>
      </div>

      {extractionLoan && (
        <ExtractionModal loan={extractionLoan} onClose={() => setExtractionLoan(null)} />
      )}
      {ruleReviewLoan && (
        <RuleReviewModal loan={ruleReviewLoan} onClose={() => setRuleReviewLoan(null)} />
      )}
    </>
  );
}
