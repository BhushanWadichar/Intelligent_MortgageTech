import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Save, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, FileText, ZoomIn, ZoomOut } from 'lucide-react';

// ─── Confidence bar ───────────────────────────────────────────────────────────

function ConfidenceBar({ value }) {
  const pct = Math.round((value ?? 0) * 100);
  const bar  = pct >= 90 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-400' : 'bg-red-400';
  const text = pct >= 90 ? 'text-emerald-600' : pct >= 70 ? 'text-amber-600' : 'text-red-600';
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${bar} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-[10px] font-bold tabular-nums ${text}`}>{pct}%</span>
    </div>
  );
}

// ─── Document page simulation ─────────────────────────────────────────────────

const LINE_PATTERN = [100, 85, 92, 60, 100, 75, 88, 45, 100, 80, 95, 55, 70, 100, 65, 82, 100, 40, 78, 90, 60, 100, 85, 50, 72, 100, 88, 65, 42, 100, 80, 58, 95, 70, 100];

function DocumentPage({ pageIndex, allFields, selectedFieldId, onSelectField, zoom }) {
  const pageFields = allFields.filter(f => f.bbox.page === pageIndex);
  const bboxRefs   = useRef({});

  // Auto-scroll selected bbox into view
  useEffect(() => {
    const sel = pageFields.find(f => f.id === selectedFieldId);
    if (sel && bboxRefs.current[sel.id]) {
      bboxRefs.current[sel.id].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedFieldId]);

  return (
    <div className="mx-auto mb-5 last:mb-0" style={{ width: `${zoom}%`, maxWidth: '100%' }}>
      {/* Page label */}
      <div className="flex items-center gap-2 mb-1.5 px-1">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Page {pageIndex + 1}</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Paper */}
      <div
        className="relative bg-white rounded-sm shadow-md overflow-hidden"
        style={{ paddingTop: '129.4%' /* 8.5:11 ratio */ }}
      >
        <div className="absolute inset-0 p-[6%]">
          {/* Simulated document header */}
          <div className="mb-[3%]">
            <div className="h-[1.5%] bg-slate-200 rounded-full w-2/5 mb-[1%]" />
            <div className="h-[1%] bg-slate-100 rounded-full w-3/5" />
          </div>

          {/* Simulated text lines */}
          {LINE_PATTERN.map((w, i) => (
            <div
              key={i}
              className="h-[0.9%] bg-slate-100 rounded-full mb-[1.2%]"
              style={{ width: `${w}%`, opacity: 0.6 + (i % 3) * 0.1 }}
            />
          ))}
        </div>

        {/* Bounding boxes */}
        {pageFields.map(field => {
          const { x, y, w, h } = field.bbox;
          const isSelected = field.id === selectedFieldId;
          const hasEdit    = field.edited;

          return (
            <div
              key={field.id}
              ref={el => bboxRefs.current[field.id] = el}
              onClick={() => onSelectField(field.id)}
              className={`absolute cursor-pointer rounded transition-all duration-150 group
                ${isSelected
                  ? 'ring-2 ring-blue-500 bg-blue-200/60 z-20'
                  : hasEdit
                  ? 'ring-1 ring-emerald-400 bg-emerald-100/40 hover:bg-emerald-100/60 z-10'
                  : 'ring-1 ring-amber-400 bg-amber-50/50 hover:bg-amber-100/60 z-10'
                }`}
              style={{
                left:   `${x * 100}%`,
                top:    `${y * 100}%`,
                width:  `${w * 100}%`,
                height: `${h * 100}%`,
              }}
              title={`${field.label}: ${field.editedValue ?? field.value}`}
            >
              {/* Tooltip on selected */}
              {isSelected && (
                <div className="absolute -top-6 left-0 pointer-events-none z-30">
                  <span className="whitespace-nowrap bg-blue-600 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded shadow-sm">
                    {field.label}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Left Panel — Document Viewer ────────────────────────────────────────────

function DocumentViewer({ doc, selectedFieldId, onSelectField }) {
  const [zoom, setZoom] = useState(90);
  const allFields = doc.sections.flatMap(s => s.fields);

  return (
    <div className="h-full flex flex-col bg-slate-200">
      {/* Viewer toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-slate-400" />
          <span className="text-xs text-slate-300 font-medium truncate max-w-[200px]">{doc.fileName}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(z => Math.max(60, z - 10))}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Zoom out"
          >
            <ZoomOut size={13} />
          </button>
          <span className="text-xs text-slate-400 w-10 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom(z => Math.min(130, z + 10))}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Zoom in"
          >
            <ZoomIn size={13} />
          </button>
        </div>
      </div>

      {/* Scrollable pages */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
        {Array.from({ length: doc.totalPages }, (_, i) => (
          <DocumentPage
            key={i}
            pageIndex={i}
            allFields={allFields}
            selectedFieldId={selectedFieldId}
            onSelectField={onSelectField}
            zoom={zoom}
          />
        ))}
      </div>

      {/* Bbox legend */}
      <div className="flex items-center gap-4 px-4 py-2 bg-slate-700 text-[10px] text-slate-300 flex-shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded ring-1 ring-amber-400 bg-amber-50/50 inline-block" /> Extracted field
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded ring-2 ring-blue-500 bg-blue-200/60 inline-block" /> Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded ring-1 ring-emerald-400 bg-emerald-100/40 inline-block" /> Edited
        </span>
      </div>
    </div>
  );
}

// ─── Right Panel — Field Editor ───────────────────────────────────────────────

function FieldEditor({ doc, selectedFieldId, onSelectField, onValueChange, onSave }) {
  const fieldRefs = useRef({});

  const hasChanges = doc.sections.some(s => s.fields.some(f => f.edited));

  // Auto-scroll to selected field
  useEffect(() => {
    if (selectedFieldId && fieldRefs.current[selectedFieldId]) {
      fieldRefs.current[selectedFieldId].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedFieldId]);

  return (
    <div className="h-full flex flex-col">
      {/* Fields scroll area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        {doc.sections.map(section => (
          <div key={section.id}>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">
                {section.label}
              </span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <div className="space-y-2.5">
              {section.fields.map(field => {
                const isSelected = field.id === selectedFieldId;
                const val        = field.editedValue ?? field.value;
                const lowConf    = (field.confidence ?? 1) < 0.75;

                return (
                  <div
                    key={field.id}
                    ref={el => fieldRefs.current[field.id] = el}
                    onClick={() => onSelectField(field.id)}
                    className={`rounded-xl border p-3 cursor-pointer transition-all duration-150
                      ${isSelected
                        ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-400 shadow-sm'
                        : field.edited
                        ? 'border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <label className="text-xs font-semibold text-slate-600 leading-tight">{field.label}</label>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {field.edited && (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">Edited</span>
                        )}
                        {lowConf && !field.edited && (
                          <AlertCircle size={12} className="text-amber-500" title="Low confidence — verify manually" />
                        )}
                        <ConfidenceBar value={field.confidence} />
                      </div>
                    </div>
                    <input
                      value={val}
                      onChange={e => onValueChange(doc.id, field.id, e.target.value)}
                      onClick={e => e.stopPropagation()}
                      className={`w-full text-sm rounded-lg px-3 py-1.5 border transition-colors
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${field.edited
                          ? 'border-emerald-300 bg-white'
                          : isSelected
                          ? 'border-blue-300 bg-white'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Save footer */}
      <div className={`border-t px-5 py-3 flex-shrink-0 transition-colors ${hasChanges ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-slate-50'}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            {hasChanges ? (
              <p className="text-xs text-emerald-700 font-semibold">You have unsaved changes</p>
            ) : doc.savedAt ? (
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-500" />
                Saved {new Date(doc.savedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            ) : (
              <p className="text-xs text-slate-400">All fields verified</p>
            )}
          </div>
          <button
            onClick={() => onSave(doc.id)}
            disabled={!hasChanges}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all
              ${hasChanges
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
          >
            <Save size={13} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ExtractionPanel ─────────────────────────────────────────────────────

export default function ExtractionPanel({ docs, initialDocId, onBack, onValueChange, onSave }) {
  const [activeDocId, setActiveDocId] = useState(initialDocId ?? docs[0]?.id);
  const [selectedFieldId, setSelectedFieldId] = useState(null);

  const activeDoc = docs.find(d => d.id === activeDocId) ?? docs[0];

  // Reset selected field when switching docs
  useEffect(() => { setSelectedFieldId(null); }, [activeDocId]);

  const handleSelectField = useCallback((fieldId) => {
    setSelectedFieldId(id => id === fieldId ? null : fieldId);
  }, []);

  if (!activeDoc) return null;

  const tabDocs = docs.filter(d => d.pipelineStatus === 'complete');

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-slate-200 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <ArrowLeft size={15} /> Back to Classification
        </button>
        <div className="w-px h-5 bg-slate-200" />
        <p className="text-sm font-semibold text-slate-700 truncate">
          {activeDoc.borrowerName} — Extraction View
        </p>
      </div>

      {/* Document tabs */}
      {tabDocs.length > 1 && (
        <div className="flex items-end gap-0 overflow-x-auto border-b border-slate-200 bg-slate-50 px-4 flex-shrink-0">
          {tabDocs.map(doc => (
            <button
              key={doc.id}
              onClick={() => setActiveDocId(doc.id)}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors -mb-px
                ${doc.id === activeDocId
                  ? 'border-blue-600 text-blue-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
            >
              {doc.classifiedType}
              {doc.isUnclassified && <span className="ml-1">⚠️</span>}
            </button>
          ))}
        </div>
      )}

      {/* Split panel */}
      <div className="flex-1 grid grid-cols-[45%_55%] min-h-0 overflow-hidden">
        {/* Left — Document viewer */}
        <div className="border-r border-slate-200 overflow-hidden">
          <DocumentViewer
            doc={activeDoc}
            selectedFieldId={selectedFieldId}
            onSelectField={handleSelectField}
          />
        </div>

        {/* Right — Field editor */}
        <div className="overflow-hidden">
          <FieldEditor
            doc={activeDoc}
            selectedFieldId={selectedFieldId}
            onSelectField={handleSelectField}
            onValueChange={onValueChange}
            onSave={onSave}
          />
        </div>
      </div>
    </div>
  );
}
