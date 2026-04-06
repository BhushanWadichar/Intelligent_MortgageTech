import { useState } from 'react';
import { CheckIcon, ClockIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import useAppStore from '../../store/useAppStore';
import Card from '../../components/common/Card';
import { StatusBadge } from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { SearchInput, Select } from '../../components/common/Input';
import { loanTypes } from '../../data/mockData';

const PIPELINE_STAGES = [
  'Document Ingested',
  'Classified',
  'Extracted',
  'In Rule Review',
  'Completed',
];

const stageColors = {
  'Document Ingested': { bg: 'bg-slate-200',   text: 'text-slate-600',    icon: '📥' },
  'Classified':        { bg: 'bg-blue-200',    text: 'text-blue-700',     icon: '🏷️' },
  'Extracted':         { bg: 'bg-purple-200',  text: 'text-purple-700',   icon: '🔍' },
  'In Rule Review':    { bg: 'bg-amber-200',   text: 'text-amber-700',    icon: '⚖️' },
  'Completed':         { bg: 'bg-emerald-200', text: 'text-emerald-700',  icon: '✅' },
  'Pending':           { bg: 'bg-slate-200',   text: 'text-slate-500',    icon: '⏳' },
  'Failed':            { bg: 'bg-red-200',     text: 'text-red-700',      icon: '❌' },
};

function StageCell({ stage, currentStage, loan, onExtractionClick, onRulesClick }) {
  const stageIndex = PIPELINE_STAGES.indexOf(stage);
  const currentIndex = PIPELINE_STAGES.indexOf(currentStage);
  const isTerminal = currentStage === 'Completed' || currentStage === 'Failed' || currentStage === 'Pending';
  const isCompleted = isTerminal ? currentStage === 'Completed' : stageIndex < currentIndex;
  const isCurrent = stage === currentStage && !isTerminal;
  const isFuture = !isTerminal && stageIndex > currentIndex;
  const isFailed = currentStage === 'Failed' && stageIndex === currentIndex;

  const isClickable = stage === 'Extracted' || stage === 'In Rule Review';

  const handleClick = () => {
    if (!isClickable) return;
    if (stage === 'Extracted') onExtractionClick(loan);
    if (stage === 'In Rule Review') onRulesClick(loan);
  };

  return (
    <td
      className={`px-3 py-2 text-center ${isClickable ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
      title={isClickable ? `Click to view ${stage} details` : undefined}
    >
      <div className={`
        inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150
        ${isCompleted ? 'bg-emerald-500 text-white' : ''}
        ${isCurrent ? 'bg-blue-600 text-white ring-2 ring-blue-300 ring-offset-1' : ''}
        ${isFuture ? 'bg-slate-200 text-slate-400' : ''}
        ${isFailed ? 'bg-red-500 text-white' : ''}
        ${currentStage === 'Pending' && stageIndex === 0 ? 'bg-amber-400 text-white' : ''}
        ${isClickable && (isCompleted || isCurrent) ? 'hover:scale-110 hover:shadow-md' : ''}
      `}>
        {isCompleted ? <CheckIcon className="w-4 h-4" /> :
         isFailed ? <XMarkIcon className="w-4 h-4" /> :
         isCurrent ? <span className="text-xs font-bold">•</span> :
         currentStage === 'Pending' && stageIndex === 0 ? <ClockIcon className="w-4 h-4" /> :
         <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />}
      </div>
      {isClickable && (isCompleted || isCurrent) && (
        <div className="text-xs text-blue-600 font-medium mt-0.5 hidden lg:block">view</div>
      )}
    </td>
  );
}

function ExtractionModal({ loan, onClose }) {
  if (!loan) return null;
  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-xs text-slate-500">Borrower: <span className="font-semibold text-slate-800">{loan.borrowerName}</span></p>
          <p className="text-xs text-slate-500">Loan: <span className="font-semibold text-slate-800">{loan.id}</span></p>
        </div>
        <StatusBadge status={loan.ruleStatus} />
      </div>
      <div className="space-y-3">
        {loan.documents.map(doc => (
          <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-xl">📄</span>
              <span className="text-sm font-medium text-slate-800">{doc.type}</span>
            </div>
            <StatusBadge status={doc.status} />
          </div>
        ))}
      </div>
    </>
  );
}

function RulesModal({ loan, onClose }) {
  if (!loan) return null;
  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-xs text-slate-500">Borrower: <span className="font-semibold text-slate-800">{loan.borrowerName}</span></p>
          <p className="text-xs text-slate-500">Loan: <span className="font-semibold text-slate-800">{loan.id}</span></p>
        </div>
        <StatusBadge status={loan.ruleStatus} />
      </div>
      <div className="space-y-2">
        {loan.ruleResults.map(rule => (
          <div
            key={rule.id}
            className={`flex items-center justify-between p-3 rounded-xl border ${
              rule.result === 'Pass' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">{rule.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{rule.category}</p>
              {rule.result === 'Fail' && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <ExclamationTriangleIcon className="w-3 h-3 shrink-0" />
                  {rule.failureReason}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 ml-4 shrink-0">
              <StatusBadge status={rule.result} />
              <span className={`text-xs font-bold ${rule.result === 'Pass' ? 'text-emerald-700' : 'text-red-700'}`}>
                {rule.evaluatedValue}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function PipelineTracker() {
  const { loans } = useAppStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [modal, setModal] = useState(null); // { type: 'extraction'|'rules', loan }

  const filtered = loans.filter(l => {
    const matchSearch = !search || l.id.toLowerCase().includes(search.toLowerCase()) || l.borrowerName.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || l.loanType === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Search loans..." className="w-56" />
        <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-36 py-1.5">
          <option value="all">All Types</option>
          {loanTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} loans</span>
      </div>

      {/* Stage legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <span className="text-slate-500 font-medium">Legend:</span>
        {[
          { color: 'bg-emerald-500', label: 'Completed' },
          { color: 'bg-blue-600', label: 'Current (Active)' },
          { color: 'bg-slate-300', label: 'Pending' },
          { color: 'bg-red-500', label: 'Failed' },
        ].map(l => (
          <span key={l.label} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-full ${l.color}`} />
            {l.label}
          </span>
        ))}
        <span className="text-blue-600 ml-2">· Click Extraction or Rule Review cells to view details</span>
      </div>

      {/* Pipeline table */}
      <Card noPad>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Loan ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Borrower</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                {PIPELINE_STAGES.map(s => (
                  <th key={s} className="px-2 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {stageColors[s]?.icon} {s.replace('Document ', '').replace('In Rule ', '')}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(loan => (
                <tr key={loan.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-blue-700 font-semibold">{loan.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{loan.borrowerName}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600 font-medium">{loan.loanType}</span>
                  </td>
                  {PIPELINE_STAGES.map(stage => (
                    <StageCell
                      key={stage}
                      stage={stage}
                      currentStage={loan.stage}
                      loan={loan}
                      onExtractionClick={l => setModal({ type: 'extraction', loan: l })}
                      onRulesClick={l => setModal({ type: 'rules', loan: l })}
                    />
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={loan.stage === 'Failed' ? 'Failed' : loan.stage === 'Completed' ? 'Completed' : loan.ruleStatus} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Extraction modal */}
      <Modal
        open={modal?.type === 'extraction'}
        onClose={() => setModal(null)}
        title={`Extracted Documents — ${modal?.loan?.id}`}
        size="md"
      >
        <ExtractionModal loan={modal?.loan} onClose={() => setModal(null)} />
      </Modal>

      {/* Rules modal */}
      <Modal
        open={modal?.type === 'rules'}
        onClose={() => setModal(null)}
        title={`Rule Evaluation — ${modal?.loan?.id}`}
        size="lg"
      >
        <RulesModal loan={modal?.loan} onClose={() => setModal(null)} />
      </Modal>
    </div>
  );
}
