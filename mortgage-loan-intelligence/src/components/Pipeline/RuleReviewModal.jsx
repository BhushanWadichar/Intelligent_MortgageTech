import { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronRight, ShieldCheck } from 'lucide-react';
import Modal from '../common/Modal';

const CATEGORY_COLORS = {
  Income:     'bg-blue-50 text-blue-700',
  Credit:     'bg-purple-50 text-purple-700',
  Property:   'bg-teal-50 text-teal-700',
  Employment: 'bg-orange-50 text-orange-700',
  Assets:     'bg-emerald-50 text-emerald-700',
  Compliance: 'bg-slate-100 text-slate-600',
};

function RuleRow({ rule }) {
  const [open, setOpen] = useState(false);
  const Icon = rule.status === 'Pass' ? CheckCircle2 : rule.status === 'Fail' ? XCircle : AlertTriangle;
  const iconColor = rule.status === 'Pass' ? 'text-emerald-500' : rule.status === 'Fail' ? 'text-red-500' : 'text-amber-500';
  const rowBg = rule.status === 'Fail' ? 'border-red-100 bg-red-50/30' : rule.status === 'Warning' ? 'border-amber-100' : 'border-slate-200';

  return (
    <div className={`border rounded-xl overflow-hidden ${rowBg}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-slate-50/50 transition-colors"
      >
        <Icon size={18} className={`flex-shrink-0 ${iconColor}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-800">{rule.ruleName}</p>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[rule.category] || 'bg-gray-100 text-gray-600'}`}>
              {rule.category}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{rule.description}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-400">Actual / Threshold</p>
            <p className="text-xs font-semibold text-slate-700">{rule.actualValue} / {rule.threshold}</p>
          </div>
          {open ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
        </div>
      </button>
      {open && (
        <div className="px-4 py-3 border-t border-slate-100 bg-white text-sm text-slate-600">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Underwriter Notes</p>
          {rule.details}
        </div>
      )}
    </div>
  );
}

export default function RuleReviewModal({ loan, onClose }) {
  if (!loan) return null;
  const rules = loan.ruleResults;
  const pass = rules.filter(r => r.status === 'Pass').length;
  const fail = rules.filter(r => r.status === 'Fail').length;
  const warn = rules.filter(r => r.status === 'Warning').length;

  return (
    <Modal
      title="Rule Review Results"
      subtitle={`${loan.id} — ${loan.borrowerName} · ${rules.length} rules evaluated`}
      onClose={onClose}
      size="lg"
    >
      {rules.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <ShieldCheck size={36} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Rule evaluation has not started yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Passed', value: pass, bg: 'bg-emerald-50', text: 'text-emerald-700' },
              { label: 'Failed', value: fail, bg: 'bg-red-50', text: 'text-red-700' },
              { label: 'Warnings', value: warn, bg: 'bg-amber-50', text: 'text-amber-700' },
            ].map(({ label, value, bg, text }) => (
              <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                <p className={`text-xl font-bold ${text}`}>{value}</p>
                <p className={`text-xs ${text} mt-0.5`}>{label}</p>
              </div>
            ))}
          </div>

          {/* Group by status: Fail first */}
          {fail > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <XCircle size={13} /> Failed Rules
              </p>
              <div className="space-y-2">
                {rules.filter(r => r.status === 'Fail').map(r => <RuleRow key={r.ruleId} rule={r} />)}
              </div>
            </div>
          )}
          {pass > 0 && (
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2 mt-4 flex items-center gap-1.5">
                <CheckCircle2 size={13} /> Passed Rules
              </p>
              <div className="space-y-2">
                {rules.filter(r => r.status === 'Pass').map(r => <RuleRow key={r.ruleId} rule={r} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
