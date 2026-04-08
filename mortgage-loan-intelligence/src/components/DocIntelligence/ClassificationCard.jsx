import { useState } from 'react';
import {
  FileText, AlertTriangle, CheckCircle2, Loader2, ChevronDown,
  Eye, Edit3, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { DOCUMENT_TYPES_LIST } from '../../data/docIntelligenceData';

// ─── Confidence chip ──────────────────────────────────────────────────────────

function ConfidenceChip({ value }) {
  const pct = Math.round((value ?? 0) * 100);
  const { bg, text, bar } =
    pct >= 90 ? { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500' } :
    pct >= 70 ? { bg: 'bg-amber-50',   text: 'text-amber-700',   bar: 'bg-amber-400'   } :
                { bg: 'bg-red-50',     text: 'text-red-700',     bar: 'bg-red-400'     };
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${bg}`}>
      <div className="w-16 h-1 bg-white/60 rounded-full overflow-hidden">
        <div className={`h-full ${bar} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-[11px] font-bold tabular-nums ${text}`}>{pct}%</span>
    </div>
  );
}

// ─── Pipeline status badge ────────────────────────────────────────────────────

function PipelineBadge({ status }) {
  if (status === 'complete') return null;
  const cfg = {
    classifying: { label: 'Classifying…', cls: 'bg-purple-50 text-purple-700', spin: true },
    extracting:  { label: 'Extracting…',  cls: 'bg-blue-50 text-blue-700',     spin: true },
    failed:      { label: 'Failed',        cls: 'bg-red-50 text-red-700',       spin: false },
  }[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600', spin: false };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
      {cfg.spin ? <Loader2 size={11} className="animate-spin" /> : <Clock size={11} />}
      {cfg.label}
    </span>
  );
}

// ─── Doc type icon color ──────────────────────────────────────────────────────

const TYPE_COLORS = {
  'W-2 Wage Statement':            'bg-blue-100 text-blue-700',
  'Federal Tax Return (1040)':     'bg-violet-100 text-violet-700',
  'Bank Statement':                'bg-teal-100 text-teal-700',
  'Pay Stub':                      'bg-emerald-100 text-emerald-700',
  'Employment Verification Letter':'bg-amber-100 text-amber-700',
  'Property Appraisal Report':     'bg-orange-100 text-orange-700',
  'Credit Report':                 'bg-red-100 text-red-700',
  'Title Search Report':           'bg-slate-100 text-slate-700',
  '1003 Loan Application':         'bg-indigo-100 text-indigo-700',
  'Purchase Agreement':            'bg-pink-100 text-pink-700',
  'Unclassified':                  'bg-yellow-100 text-yellow-700',
};

function fmtSize(b) {
  if (b >= 1048576) return `${(b / 1048576).toFixed(1)} MB`;
  return `${(b / 1024).toFixed(0)} KB`;
}

// ─── Card ────────────────────────────────────────────────────────────────────

export default function ClassificationCard({ doc, onViewExtraction, onOverride }) {
  const [overriding, setOverriding] = useState(false);
  const isProcessing = doc.pipelineStatus !== 'complete' && doc.pipelineStatus !== 'failed';
  const typeCls = TYPE_COLORS[doc.classifiedType] ?? TYPE_COLORS.Unclassified;

  const fieldCount = doc.sections.reduce((s, sec) => s + sec.fields.length, 0);

  return (
    <div className={`card flex flex-col gap-0 overflow-hidden transition-all duration-200
      ${doc.isUnclassified ? 'border-yellow-300 ring-1 ring-yellow-200' : ''}
      ${isProcessing ? 'opacity-80' : 'hover:shadow-md'}`}
    >
      {/* Unclassified banner */}
      {doc.isUnclassified && (
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border-b border-yellow-200 text-xs font-semibold text-yellow-700">
          <AlertTriangle size={13} className="flex-shrink-0" />
          Document could not be confidently classified — manual review required
        </div>
      )}

      <div className="p-4 flex gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeCls}`}>
          {isProcessing
            ? <Loader2 size={18} className="animate-spin" />
            : doc.isUnclassified
            ? <AlertTriangle size={18} />
            : <FileText size={18} />
          }
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Row 1: type + confidence */}
          <div className="flex flex-wrap items-center gap-2">
            {isProcessing ? (
              <PipelineBadge status={doc.pipelineStatus} />
            ) : (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeCls}`}>
                {doc.classifiedType ?? '—'}
              </span>
            )}
            {doc.confidence != null && !isProcessing && (
              <ConfidenceChip value={doc.confidence} />
            )}
            {doc.savedAt && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={10} /> Saved
              </span>
            )}
          </div>

          {/* Row 2: filename */}
          <p className="text-sm font-semibold text-slate-800 truncate">{doc.fileName}</p>

          {/* Row 3: meta */}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-400">
            <span>{fmtSize(doc.fileSize)}</span>
            <span>{doc.totalPages} page{doc.totalPages !== 1 ? 's' : ''}</span>
            {fieldCount > 0 && <span>{fieldCount} fields extracted</span>}
            <span>Uploaded {format(new Date(doc.uploadedAt), 'MMM d, h:mm a')}</span>
          </div>

          {/* Row 4: actions */}
          {!isProcessing && (
            <div className="flex flex-wrap gap-2 pt-1">
              {/* Override classification */}
              <div className="relative">
                <button
                  onClick={() => setOverriding(o => !o)}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Edit3 size={12} /> Override Type <ChevronDown size={11} className={`transition-transform ${overriding ? 'rotate-180' : ''}`} />
                </button>
                {overriding && (
                  <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden w-56">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Select Document Type</p>
                    </div>
                    <div className="max-h-52 overflow-y-auto py-1">
                      {DOCUMENT_TYPES_LIST.map(type => (
                        <button
                          key={type}
                          onClick={() => { onOverride(doc.id, type); setOverriding(false); }}
                          className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-slate-50
                            ${doc.classifiedType === type ? 'font-semibold text-blue-600 bg-blue-50' : 'text-slate-700'}`}
                        >
                          {type}
                          {doc.classifiedType === type && <span className="ml-1 text-blue-400">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* View extraction */}
              {doc.sections.length > 0 && (
                <button
                  onClick={() => onViewExtraction(doc)}
                  className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Eye size={12} /> View Extraction
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
