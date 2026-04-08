import { useState, useRef, useMemo } from 'react';
import {
  UploadCloud, FileArchive, AlertTriangle, CheckCircle2,
  Loader2, SlidersHorizontal, X, Layers, FileSearch
} from 'lucide-react';
import { useDocPipeline } from '../hooks/useDocPipeline';
import ClassificationCard from '../components/DocIntelligence/ClassificationCard';
import ExtractionPanel from '../components/DocIntelligence/ExtractionPanel';
import { LOAN_OPTIONS } from '../data/docIntelligenceData';

// ─── Mini upload zone (inline, compact) ──────────────────────────────────────

function InlineUploadZone({ onDrop }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError]       = useState('');
  const inputRef                = useRef(null);

  const handle = (files) => {
    const valid = Array.from(files).filter(f => /\.(pdf|png|jpg|jpeg|tiff?)$/i.test(f.name));
    if (!valid.length) { setError('Only PDF, PNG, JPG, or TIFF files supported.'); return; }
    setError('');
    valid.forEach(f => onDrop(f));
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <div
        onDrop={e => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files); }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer
          px-8 py-10 transition-all duration-200 select-none
          ${dragging ? 'border-blue-500 bg-blue-50 scale-[1.01]' : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40'}`}
      >
        {dragging && (
          <div className="absolute inset-0 rounded-2xl border-2 border-blue-400 animate-ping opacity-25 pointer-events-none" />
        )}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${dragging ? 'bg-blue-100' : 'bg-white shadow-sm border border-slate-200'}`}>
          {dragging
            ? <UploadCloud size={22} className="text-blue-600 animate-bounce" />
            : <UploadCloud size={22} className="text-blue-500" />
          }
        </div>
        <p className={`text-sm font-semibold ${dragging ? 'text-blue-700' : 'text-slate-700'}`}>
          {dragging ? 'Release to classify & extract' : 'Drag & drop documents here'}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          or <span className="text-blue-600 font-medium underline underline-offset-2">click to browse</span> · PDF, PNG, JPG, TIFF
        </p>
        <div className="flex items-center gap-3 mt-4 text-[10px] text-slate-400">
          <span className="bg-white border border-slate-200 rounded-full px-3 py-1">Auto-classification</span>
          <span className="bg-white border border-slate-200 rounded-full px-3 py-1">AI extraction</span>
          <span className="bg-white border border-slate-200 rounded-full px-3 py-1">Instant results</span>
        </div>
        <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.tif,.tiff" multiple onChange={e => handle(e.target.files)} className="hidden" />
      </div>
      {error && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          <AlertTriangle size={13} className="flex-shrink-0" /> {error}
        </div>
      )}
    </div>
  );
}

// ─── Stats strip ──────────────────────────────────────────────────────────────

function StatsStrip({ docs }) {
  const counts = {
    total:         docs.length,
    complete:      docs.filter(d => d.pipelineStatus === 'complete').length,
    processing:    docs.filter(d => d.pipelineStatus === 'classifying' || d.pipelineStatus === 'extracting').length,
    unclassified:  docs.filter(d => d.isUnclassified).length,
  };
  return (
    <div className="grid grid-cols-4 gap-3">
      {[
        { label: 'Total Docs',    val: counts.total,        bg: 'bg-slate-50',    text: 'text-slate-800',    border: 'border-slate-200',    icon: Layers       },
        { label: 'Processed',     val: counts.complete,     bg: 'bg-emerald-50',  text: 'text-emerald-700',  border: 'border-emerald-200',  icon: CheckCircle2 },
        { label: 'Processing',    val: counts.processing,   bg: 'bg-blue-50',     text: 'text-blue-700',     border: 'border-blue-200',     icon: Loader2      },
        { label: 'Unclassified',  val: counts.unclassified, bg: 'bg-yellow-50',   text: 'text-yellow-700',   border: 'border-yellow-200',   icon: AlertTriangle},
      ].map(({ label, val, bg, text, border, icon: Icon }) => (
        <div key={label} className={`flex items-center gap-3 p-3 rounded-xl border ${bg} ${border}`}>
          <Icon size={16} className={`${text} flex-shrink-0 ${label === 'Processing' && val > 0 ? 'animate-spin' : ''}`} />
          <div>
            <p className={`text-xl font-extrabold leading-none ${text}`}>{val}</p>
            <p className={`text-[11px] mt-0.5 ${text} opacity-70 font-medium`}>{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DocumentIntelligencePage() {
  const { documents, uploadDocument, overrideClassification, updateFieldValue, saveDocument } = useDocPipeline();

  const [mode, setMode]                 = useState('classify'); // 'classify' | 'extract'
  const [selectedLoanId, setLoanId]     = useState(LOAN_OPTIONS[0].id);
  const [extractDocId, setExtractDocId] = useState(null);
  const [typeFilter, setTypeFilter]     = useState('');
  const [showUpload, setShowUpload]     = useState(true);

  const loanDocs = useMemo(() =>
    documents.filter(d => d.loanId === selectedLoanId),
    [documents, selectedLoanId]
  );

  const filteredDocs = useMemo(() =>
    typeFilter ? loanDocs.filter(d => d.classifiedType === typeFilter) : loanDocs,
    [loanDocs, typeFilter]
  );

  const handleUpload = (file) => {
    const loan = LOAN_OPTIONS.find(l => l.id === selectedLoanId);
    const borrower = loan?.label.split('— ')[1] ?? 'Unknown Borrower';
    uploadDocument(file, selectedLoanId, borrower);
  };

  const handleViewExtraction = (doc) => {
    setExtractDocId(doc.id);
    setMode('extract');
  };

  const completedDocs = loanDocs.filter(d => d.pipelineStatus === 'complete');

  const docTypes = useMemo(() => {
    const types = [...new Set(loanDocs.map(d => d.classifiedType).filter(Boolean))];
    return types;
  }, [loanDocs]);

  // ── Extraction mode ────────────────────────────────────────────────────────
  if (mode === 'extract') {
    return (
      <div className="h-[calc(100vh-4rem)] -m-6 animate-fade-in">
        <ExtractionPanel
          docs={completedDocs}
          initialDocId={extractDocId}
          onBack={() => { setMode('classify'); setExtractDocId(null); }}
          onValueChange={updateFieldValue}
          onSave={saveDocument}
        />
      </div>
    );
  }

  // ── Classification mode ────────────────────────────────────────────────────
  return (
    <div className="space-y-5 animate-slide-up">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Document Intelligence</h2>
          <p className="text-sm text-slate-500 mt-0.5">AI-powered classification and field extraction for mortgage documents</p>
        </div>
        {completedDocs.length > 0 && (
          <button
            onClick={() => { setExtractDocId(completedDocs[0].id); setMode('extract'); }}
            className="btn-primary text-sm flex-shrink-0"
          >
            <FileSearch size={15} /> Open Extraction View
          </button>
        )}
      </div>

      {/* Stats */}
      <StatsStrip docs={loanDocs} />

      {/* Loan selector */}
      <div className="card p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <SlidersHorizontal size={15} className="text-slate-400" /> Loan
        </div>
        <div className="relative">
          <select
            value={selectedLoanId}
            onChange={e => { setLoanId(e.target.value); setTypeFilter(''); }}
            className="select-base text-sm min-w-[260px]"
          >
            {LOAN_OPTIONS.map(l => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Doc type filter chips */}
        <div className="flex flex-wrap gap-1.5 ml-2">
          <button
            onClick={() => setTypeFilter('')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${!typeFilter ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            All ({loanDocs.length})
          </button>
          {docTypes.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(f => f === t ? '' : t)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${typeFilter === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Upload toggle */}
        <button
          onClick={() => setShowUpload(v => !v)}
          className="ml-auto btn-secondary text-xs flex items-center gap-1.5"
        >
          <UploadCloud size={13} />
          {showUpload ? 'Hide Upload' : 'Upload Document'}
        </button>
      </div>

      {/* Upload zone */}
      {showUpload && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <UploadCloud size={15} className="text-blue-500" />
            <p className="text-sm font-semibold text-slate-800">Upload to Loan {selectedLoanId}</p>
            <span className="text-xs text-slate-400">· Classification and extraction will run automatically</span>
          </div>
          <InlineUploadZone onDrop={handleUpload} />
        </div>
      )}

      {/* Classification grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-800">
            Classification Results
            <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
              {filteredDocs.length}
            </span>
          </p>
          {typeFilter && (
            <button onClick={() => setTypeFilter('')} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
              <X size={12} /> Clear filter
            </button>
          )}
        </div>

        {filteredDocs.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-14">
            <FileArchive size={28} className="text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-500">No documents found</p>
            <p className="text-xs text-slate-400 mt-1">Upload documents above to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredDocs.map(doc => (
              <ClassificationCard
                key={doc.id}
                doc={doc}
                onViewExtraction={handleViewExtraction}
                onOverride={overrideClassification}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
