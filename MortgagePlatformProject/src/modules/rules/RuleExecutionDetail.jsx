import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon, ChevronDownIcon, ChevronRightIcon,
  CheckCircleIcon, XCircleIcon, InformationCircleIcon,
} from '@heroicons/react/24/outline';
import useAppStore from '../../store/useAppStore';
import Card, { CardHeader } from '../../components/common/Card';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Button from '../../components/common/Button';

const categoryColors = {
  'Income Verification': { bg: 'bg-blue-50',    border: 'border-blue-200',   text: 'text-blue-700',    icon: '💰' },
  'Credit':              { bg: 'bg-purple-50',  border: 'border-purple-200', text: 'text-purple-700',  icon: '📊' },
  'Employment':          { bg: 'bg-emerald-50', border: 'border-emerald-200',text: 'text-emerald-700', icon: '💼' },
  'Compliance':          { bg: 'bg-amber-50',   border: 'border-amber-200',  text: 'text-amber-700',   icon: '⚖️' },
};

function RuleRow({ rule }) {
  const [expanded, setExpanded] = useState(false);
  const isPassed = rule.result === 'Pass';

  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${isPassed ? 'border-slate-200' : 'border-red-200'}`}>
      {/* Header row */}
      <button
        className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors ${
          expanded ? (isPassed ? 'bg-slate-50' : 'bg-red-50') : 'bg-white hover:bg-slate-50'
        }`}
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        {/* Status icon */}
        <div className="shrink-0">
          {isPassed
            ? <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
            : <XCircleIcon className="w-5 h-5 text-red-500" />
          }
        </div>

        {/* Rule name */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900">{rule.name}</p>
          <p className="text-xs text-slate-500 truncate">{rule.description}</p>
        </div>

        {/* Values */}
        <div className="hidden sm:flex items-center gap-6 shrink-0">
          <div className="text-right">
            <p className="text-xs text-slate-400">Evaluated</p>
            <p className={`text-sm font-bold ${isPassed ? 'text-emerald-700' : 'text-red-700'}`}>{rule.evaluatedValue}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Threshold</p>
            <p className="text-sm font-bold text-slate-700">{rule.threshold}</p>
          </div>
        </div>

        {/* Status badge */}
        <StatusBadge status={rule.result} />

        {/* Expand toggle */}
        <span className="text-slate-400 shrink-0">
          {expanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
        </span>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className={`px-4 py-4 border-t ${isPassed ? 'border-slate-100 bg-slate-50/50' : 'border-red-100 bg-red-50/40'}`}>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Evaluated Value</p>
              <p className={`text-base font-bold ${isPassed ? 'text-emerald-700' : 'text-red-700'}`}>{rule.evaluatedValue}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Required Threshold</p>
              <p className="text-base font-bold text-slate-700">{rule.threshold}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 mt-3">
            <InformationCircleIcon className={`w-4 h-4 mt-0.5 shrink-0 ${isPassed ? 'text-slate-400' : 'text-red-500'}`} />
            <p className={`text-xs ${isPassed ? 'text-slate-500' : 'text-red-700'}`}>
              {isPassed
                ? `✓ Rule passed. ${rule.description}`
                : `✗ ${rule.failureReason}`
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RuleExecutionDetail() {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const { loans } = useAppStore();

  const loan = loans.find(l => l.id === loanId);
  if (!loan) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p className="text-base font-medium">Loan not found: {loanId}</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate('/rules/loans')}>
          ← Back to Loan List
        </Button>
      </div>
    );
  }

  const grouped = loan.ruleResults.reduce((acc, rule) => {
    if (!acc[rule.category]) acc[rule.category] = [];
    acc[rule.category].push(rule);
    return acc;
  }, {});

  const passed = loan.ruleResults.filter(r => r.result === 'Pass').length;
  const total = loan.ruleResults.length;
  const passPct = Math.round((passed / total) * 100);

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl">
      {/* Back navigation */}
      <button
        onClick={() => navigate('/rules/loans')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Loan List
      </button>

      {/* Loan header card */}
      <Card>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-slate-900">{loan.borrowerName}</h2>
              <StatusBadge status={loan.ruleStatus} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <span><span className="font-medium text-slate-700">Loan ID:</span> {loan.id}</span>
              <span><span className="font-medium text-slate-700">Type:</span> {loan.loanType}</span>
              <span><span className="font-medium text-slate-700">Amount:</span> {loan.amount}</span>
              <span><span className="font-medium text-slate-700">Submitted:</span> {loan.submissionDate}</span>
              <span><span className="font-medium text-slate-700">Stage:</span> {loan.stage}</span>
            </div>
          </div>

          {/* Pass rate gauge */}
          <div className="text-center">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                <circle
                  cx="18" cy="18" r="14" fill="none"
                  stroke={passPct >= 75 ? '#059669' : passPct >= 50 ? '#d97706' : '#dc2626'}
                  strokeWidth="3.5"
                  strokeDasharray={`${passPct * 0.879} 87.9`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-bold text-slate-800">{passPct}%</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">{passed}/{total} passed</p>
          </div>
        </div>
      </Card>

      {/* Rule groups by category */}
      {Object.entries(grouped).map(([category, rules]) => {
        const c = categoryColors[category] || categoryColors['Compliance'];
        const catPassed = rules.filter(r => r.result === 'Pass').length;
        return (
          <div key={category}>
            {/* Category header */}
            <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl ${c.bg} border ${c.border} border-b-0`}>
              <div className="flex items-center gap-2">
                <span className="text-base">{c.icon}</span>
                <span className={`text-sm font-semibold ${c.text}`}>{category}</span>
                <span className="text-xs text-slate-400">{rules.length} rules</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={catPassed === rules.length ? 'success' : catPassed > 0 ? 'warning' : 'danger'}>
                  {catPassed}/{rules.length} passed
                </Badge>
              </div>
            </div>

            {/* Rule rows */}
            <div className={`border ${c.border} border-t-0 rounded-b-xl overflow-hidden divide-y divide-slate-100`}>
              {rules.map(rule => <RuleRow key={rule.id} rule={rule} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
