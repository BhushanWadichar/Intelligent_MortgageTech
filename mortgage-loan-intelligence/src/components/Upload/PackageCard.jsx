import { useState } from 'react';
import {
  FileArchive, CheckCircle2, XCircle, Loader2, AlertTriangle,
  ChevronDown, ChevronUp, FileText, Clock, Calendar,
  HardDrive, Files, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import StageTimeline from './StageTimeline';

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtSize(bytes) {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(2)} GB`;
  if (bytes >= 1048576)    return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024)       return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

function fmtDuration(ms) {
  if (ms == null) return '—';
  if (ms < 1000)  return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const m = Math.floor(ms / 60000);
  const s = Math.round((ms % 60000) / 1000);
  return `${m}m ${s}s`;
}

const STATUS_CONFIG = {
  processing:             { label: 'Processing',           bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   icon: Loader2,        iconClass: 'text-blue-500 animate-spin' },
  completed:              { label: 'Completed',             bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2,   iconClass: 'text-emerald-500' },
  completed_with_errors:  { label: 'Completed w/ Errors',  bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  icon: AlertTriangle,  iconClass: 'text-amber-500' },
  failed:                 { label: 'Failed',                bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    icon: XCircle,        iconClass: 'text-red-500' },
};

const FILE_STATUS = {
  queued:     { dot: 'bg-slate-300', text: 'text-slate-400' },
  processing: { dot: 'bg-blue-400 animate-pulse', text: 'text-blue-600' },
  success:    { dot: 'bg-emerald-400', text: 'text-emerald-600' },
  failed:     { dot: 'bg-red-400', text: 'text-red-600' },
};

const DOC_TYPE_COLORS = {
  'W-2 Wage Statement':        'bg-blue-50 text-blue-700',
  'Federal Tax Return (1040)': 'bg-violet-50 text-violet-700',
  'Bank Statement':            'bg-teal-50 text-teal-700',
  'Employment Letter':         'bg-amber-50 text-amber-700',
  'Property Appraisal':        'bg-orange-50 text-orange-700',
  'Credit Report':             'bg-red-50 text-red-600',
  'Title Report':              'bg-slate-100 text-slate-600',
  'Purchase Agreement':        'bg-pink-50 text-pink-700',
  'HOI Policy':                'bg-emerald-50 text-emerald-700',
  'Flood Cert':                'bg-cyan-50 text-cyan-700',
};

// ─── File Table Sub-Panel ────────────────────────────────────────────────────

function FileTable({ files, pkg }) {
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('');
  const [page, setPage]             = useState(1);
  const perPage = 15;

  const filtered = files.filter(f => {
    if (statusFilter && f.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return f.name.toLowerCase().includes(q) || f.loanId.toLowerCase().includes(q) || f.docType.toLowerCase().includes(q);
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged      = filtered.slice((page - 1) * perPage, page * perPage);

  const counts = {
    success:    files.filter(f => f.status === 'success').length,
    failed:     files.filter(f => f.status === 'failed').length,
    queued:     files.filter(f => f.status === 'queued').length,
    processing: files.filter(f => f.status === 'processing').length,
  };

  // Group doc types
  const docTypeCounts = {};
  files.forEach(f => { docTypeCounts[f.docType] = (docTypeCounts[f.docType] || 0) + 1; });

  return (
    <div className="space-y-4">
      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Total', val: files.length, cls: 'bg-slate-100 text-slate-700' },
          { label: 'Success', val: counts.success, cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
          { label: 'Failed',  val: counts.failed,  cls: 'bg-red-50 text-red-700 ring-1 ring-red-200' },
          { label: 'Queued',  val: counts.queued,  cls: 'bg-slate-50 text-slate-500 ring-1 ring-slate-200' },
        ].map(({ label, val, cls }) => (
          <span key={label} className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>
            {val} {label}
          </span>
        ))}
      </div>

      {/* Doc type breakdown */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Document Types in Package</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(docTypeCounts).map(([type, count]) => (
            <span key={type} className={`px-2.5 py-1 rounded-full text-xs font-medium ${DOC_TYPE_COLORS[type] || 'bg-gray-100 text-gray-600'}`}>
              {type} <span className="opacity-70">({count})</span>
            </span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by file name, loan ID, or doc type…"
          className="input-base text-xs flex-1 min-w-[200px] max-w-sm"
        />
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="select-base text-xs min-w-[130px]"
          >
            <option value="">All Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="queued">Queued</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="th">File Name</th>
                <th className="th">Loan ID</th>
                <th className="th">Loan Type</th>
                <th className="th">Document Type</th>
                <th className="th">Size</th>
                <th className="th">Status</th>
                <th className="th">Processed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paged.map(file => {
                const sc = FILE_STATUS[file.status] || FILE_STATUS.queued;
                return (
                  <tr key={file.id} className="tr-hover">
                    <td className="td">
                      <div className="flex items-center gap-2">
                        <FileText size={13} className="text-slate-400 flex-shrink-0" />
                        <span className="font-mono text-[11px] text-slate-700 max-w-[220px] truncate">{file.name}</span>
                      </div>
                    </td>
                    <td className="td">
                      <span className="font-mono text-xs font-semibold text-blue-600">{file.loanId}</span>
                    </td>
                    <td className="td">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        file.loanType === 'Conventional' ? 'bg-blue-50 text-blue-700' :
                        file.loanType === 'FHA'          ? 'bg-violet-50 text-violet-700' :
                        file.loanType === 'VA'           ? 'bg-teal-50 text-teal-700' :
                                                           'bg-orange-50 text-orange-700'
                      }`}>{file.loanType}</span>
                    </td>
                    <td className="td">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${DOC_TYPE_COLORS[file.docType] || 'bg-gray-100 text-gray-600'}`}>
                        {file.docType}
                      </span>
                    </td>
                    <td className="td text-slate-400 text-xs">{fmtSize(file.size)}</td>
                    <td className="td">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc.dot}`} />
                        <span className={`text-xs font-medium capitalize ${sc.text}`}>{file.status}</span>
                      </div>
                    </td>
                    <td className="td text-slate-400 text-[11px]">
                      {file.processedAt
                        ? format(new Date(file.processedAt), 'MMM d, h:mm:ss a')
                        : <span className="text-slate-300">—</span>
                      }
                    </td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">No files match filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length} files
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1 px-2.5 text-xs disabled:opacity-40">Prev</button>
              <span className="px-2 font-semibold text-slate-700">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary py-1 px-2.5 text-xs disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Package Card ────────────────────────────────────────────────────────────

export default function PackageCard({ pkg, onToggle }) {
  const [tab, setTab] = useState('timeline'); // 'timeline' | 'files'
  const cfg = STATUS_CONFIG[pkg.status] || STATUS_CONFIG.processing;
  const StatusIcon = cfg.icon;

  const successRate = pkg.totalFiles > 0
    ? Math.round((pkg.successCount / pkg.totalFiles) * 100)
    : 0;

  return (
    <div className={`card border ${cfg.border} overflow-hidden transition-all duration-200`}>
      {/* ── Header Row ── */}
      <div className="px-5 py-4">
        <div className="flex items-start gap-4">
          {/* File icon */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
            <FileArchive size={20} className={cfg.iconClass} />
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold text-slate-900 truncate max-w-xs">{pkg.fileName}</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                <StatusIcon size={11} className={cfg.iconClass} />
                {cfg.label}
              </span>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <HardDrive size={11} /> {fmtSize(pkg.fileSize)}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar size={11} /> Uploaded {format(new Date(pkg.uploadedAt), 'MMM d, yyyy h:mm a')}
              </span>
              {pkg.completedAt && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={11} /> Completed {format(new Date(pkg.completedAt), 'h:mm:ss a')}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Files size={11} /> {pkg.totalFiles} files
              </span>
              {pkg.processingMs != null && (
                <span className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                  ⏱ {fmtDuration(pkg.processingMs)} processing time
                </span>
              )}
            </div>

            {/* Progress bar (only while processing) */}
            {pkg.status === 'processing' && (
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Loader2 size={11} className="animate-spin text-blue-500" />
                    {pkg.currentStageLabel}
                  </span>
                  <span className="font-semibold text-blue-600">{pkg.progress}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700"
                    style={{ width: `${pkg.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Completion stats */}
            {(pkg.status === 'completed' || pkg.status === 'completed_with_errors') && (
              <div className="flex flex-wrap gap-3 mt-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 size={12} /> {pkg.successCount} succeeded
                </div>
                {pkg.failedCount > 0 && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                    <XCircle size={12} /> {pkg.failedCount} failed
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  {successRate}% success rate
                </div>
              </div>
            )}
          </div>

          {/* Expand toggle */}
          <button
            onClick={onToggle}
            className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {pkg.expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* ── Expanded Detail ── */}
      {pkg.expanded && (
        <div className="border-t border-slate-100">
          {/* Tab bar */}
          <div className="flex gap-0 border-b border-slate-100 bg-slate-50 px-5">
            {[
              { key: 'timeline', label: 'Stage Timeline' },
              { key: 'files',    label: `Files (${pkg.totalFiles})` },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors -mb-px ${
                  tab === t.key
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {tab === 'timeline' && <StageTimeline pkg={pkg} />}
            {tab === 'files'    && <FileTable files={pkg.files} pkg={pkg} />}
          </div>
        </div>
      )}
    </div>
  );
}
