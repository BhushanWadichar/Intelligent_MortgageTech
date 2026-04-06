import { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';

function ConfidenceBar({ value }) {
  const pct = Math.round(value * 100);
  const color = pct >= 95 ? 'bg-emerald-500' : pct >= 85 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-slate-500 w-8 text-right">{pct}%</span>
    </div>
  );
}

function DocCard({ doc }) {
  const [open, setOpen] = useState(false);
  const allHigh = doc.fields.every(f => f.confidence >= 0.9);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText size={16} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800">{doc.docType}</p>
          <p className="text-xs text-slate-400 truncate">{doc.fileName}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {allHigh
            ? <CheckCircle size={15} className="text-emerald-500" />
            : <AlertCircle size={15} className="text-amber-500" />
          }
          <span className="text-[11px] text-slate-500 hidden sm:block">
            {doc.fields.length} fields
          </span>
          {open ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-100 bg-slate-50/50">
          <div className="grid grid-cols-1 divide-y divide-slate-100">
            {doc.fields.map((f, i) => (
              <div key={i} className="px-4 py-2.5 grid grid-cols-2 gap-4 items-center">
                <div>
                  <p className="text-xs text-slate-500">{f.field}</p>
                  <p className="text-sm font-medium text-slate-800 mt-0.5">{f.value}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-1">Confidence</p>
                  <ConfidenceBar value={f.confidence} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExtractionModal({ loan, onClose }) {
  if (!loan) return null;
  const docs = loan.extractedDocuments;

  return (
    <Modal
      title="Extracted Documents"
      subtitle={`${loan.id} — ${loan.borrowerName} · ${docs.length} documents processed`}
      onClose={onClose}
      size="lg"
    >
      {docs.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <FileText size={36} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No extraction data available yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Documents', value: docs.length },
              { label: 'Total Fields', value: docs.reduce((s, d) => s + d.fields.length, 0) },
              { label: 'Avg Confidence', value: `${Math.round(docs.reduce((s, d) => s + d.overallConfidence, 0) / docs.length * 100)}%` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-blue-700">{value}</p>
                <p className="text-xs text-blue-600 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {docs.map((doc) => (
            <DocCard key={doc.docId} doc={doc} />
          ))}
        </div>
      )}
    </Modal>
  );
}
