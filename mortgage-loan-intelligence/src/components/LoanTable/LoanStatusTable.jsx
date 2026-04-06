import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, FileSearch, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import Badge from '../common/Badge';
import ExtractionModal from '../Pipeline/ExtractionModal';
import RuleReviewModal from '../Pipeline/RuleReviewModal';

export default function LoanStatusTable({ loans }) {
  const [sort, setSort] = useState({ key: 'lastUpdated', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [extractionLoan, setExtractionLoan] = useState(null);
  const [ruleReviewLoan, setRuleReviewLoan] = useState(null);
  const perPage = 10;

  const sorted = useMemo(() => {
    return [...loans].sort((a, b) => {
      let av = a[sort.key], bv = b[sort.key];
      if (sort.key === 'loanAmount') return sort.dir === 'asc' ? av - bv : bv - av;
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [loans, sort]);

  const totalPages = Math.ceil(sorted.length / perPage);
  const pageData = sorted.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (key) => {
    setPage(1);
    setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  };

  const SortIcon = ({ k }) => {
    if (sort.key !== k) return <ChevronUp size={11} className="text-slate-300" />;
    return sort.dir === 'asc' ? <ChevronUp size={11} className="text-blue-500" /> : <ChevronDown size={11} className="text-blue-500" />;
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
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <Th label="Loan ID" k="id" className="min-w-[130px]" />
                <Th label="Borrower Name" k="borrowerName" className="min-w-[180px]" />
                <Th label="Loan Type" k="loanType" />
                <Th label="Amount" k="loanAmount" />
                <Th label="Current Stage" k="currentStage" />
                <Th label="Status" k="status" />
                <th className="th">Docs</th>
                <th className="th">Rules</th>
                <Th label="Processor" k="processor" />
                <Th label="Last Updated" k="lastUpdated" className="min-w-[120px]" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageData.map(loan => (
                <tr key={loan.id} className="tr-hover group">
                  <td className="td">
                    <span className="font-mono text-xs font-semibold text-blue-600">{loan.id}</span>
                  </td>
                  <td className="td">
                    <div>
                      <p className="font-medium text-slate-800">{loan.borrowerName}</p>
                      {loan.coBorrowerName && (
                        <p className="text-xs text-slate-400">+ {loan.coBorrowerName}</p>
                      )}
                    </div>
                  </td>
                  <td className="td"><Badge label={loan.loanType} size="xs" /></td>
                  <td className="td font-medium text-slate-800 text-right tabular-nums">
                    ${loan.loanAmount.toLocaleString()}
                  </td>
                  <td className="td"><Badge label={loan.currentStage} size="xs" /></td>
                  <td className="td"><Badge label={loan.status} size="xs" /></td>
                  <td className="td">
                    {loan.extractedDocuments.length > 0 ? (
                      <button
                        onClick={() => setExtractionLoan(loan)}
                        className="flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-800 font-medium hover:bg-cyan-50 px-2 py-1 rounded-lg transition-colors"
                        title="View extracted documents"
                      >
                        <FileSearch size={13} />
                        <span>{loan.extractedDocuments.length}</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="td">
                    {loan.ruleResults.length > 0 ? (
                      <button
                        onClick={() => setRuleReviewLoan(loan)}
                        className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 font-medium hover:bg-amber-50 px-2 py-1 rounded-lg transition-colors"
                        title="View rule review results"
                      >
                        <ShieldCheck size={13} />
                        <span>
                          {loan.ruleResults.filter(r => r.status === 'Pass').length}/
                          {loan.ruleResults.length}
                        </span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="td text-slate-500 text-xs">{loan.processor}</td>
                  <td className="td text-slate-400 text-xs">
                    {format(new Date(loan.lastUpdated), 'MMM d, yyyy')}
                  </td>
                </tr>
              ))}
              {pageData.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-400 text-sm">
                    No loans match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold">{Math.min((page - 1) * perPage + 1, sorted.length)}</span>–
            <span className="font-semibold">{Math.min(page * perPage, sorted.length)}</span> of{' '}
            <span className="font-semibold">{sorted.length}</span> loans
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary py-1 px-3 text-xs disabled:opacity-40"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 text-xs rounded-lg font-medium transition-colors ${
                  p === page ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="btn-secondary py-1 px-3 text-xs disabled:opacity-40"
            >
              Next
            </button>
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
