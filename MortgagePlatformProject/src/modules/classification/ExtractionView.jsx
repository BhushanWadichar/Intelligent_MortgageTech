import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircleIcon, ExclamationCircleIcon,
  DocumentTextIcon, ChevronUpIcon, ChevronDownIcon,
} from '@heroicons/react/24/outline';
import useAppStore from '../../store/useAppStore';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ConfidenceBar from '../../components/common/ConfidenceBar';
import Badge from '../../components/common/Badge';

// ─── Simulated Document Viewer ─────────────────────────────────────────────
function DocumentViewer({ doc, activeField }) {
  if (!doc) return null;

  // Generate a mock document background with colored regions
  const allFields = Object.values(doc.extractedFields || {}).flat();

  return (
    <div className="h-full flex flex-col">
      {/* Viewer toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 text-white text-xs">
        <span className="font-medium truncate max-w-48">{doc.name}</span>
        <span className="text-slate-400">{doc.pages} page{doc.pages !== 1 ? 's' : ''}</span>
      </div>

      {/* Document page */}
      <div className="flex-1 overflow-y-auto bg-slate-700 p-4 scrollbar-thin">
        <div
          className="relative mx-auto bg-white shadow-xl rounded-sm"
          style={{ width: '100%', maxWidth: 520, aspectRatio: '8.5 / 11' }}
        >
          {/* Mock document content — striped background */}
          <div className="absolute inset-0 p-6 opacity-10">
            {Array.from({ length: 32 }).map((_, i) => (
              <div key={i} className="h-2 bg-slate-400 rounded mb-3" style={{ width: `${60 + (i % 5) * 8}%` }} />
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-4 left-6 right-6 border-b-2 border-slate-300 pb-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="w-20 h-4 bg-slate-800 rounded mb-1" />
                <div className="w-32 h-2 bg-slate-300 rounded" />
              </div>
              <div className="text-right">
                <div className="w-16 h-4 bg-blue-600 rounded mb-1" />
                <div className="w-20 h-2 bg-slate-300 rounded" />
              </div>
            </div>
          </div>

          {/* Bounding boxes for extracted fields */}
          {allFields.map(field => (
            <div
              key={field.id}
              className={`field-highlight ${activeField === field.id ? 'active' : ''}`}
              style={{
                left:   `${field.bbox.x}%`,
                top:    `${field.bbox.y}%`,
                width:  `${field.bbox.w}%`,
                height: `${field.bbox.h}%`,
              }}
              title={field.label}
            />
          ))}

          {/* Active field tooltip */}
          {activeField && (() => {
            const f = allFields.find(f => f.id === activeField);
            if (!f) return null;
            return (
              <div
                className="absolute z-10 bg-amber-600 text-white text-xs px-2 py-1 rounded-md shadow-lg pointer-events-none"
                style={{ left: `${f.bbox.x}%`, top: `calc(${f.bbox.y}% - 28px)`, whiteSpace: 'nowrap' }}
              >
                {f.label}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ─── Field Item ────────────────────────────────────────────────────────────
function FieldRow({ field, docId, sectionKey, isActive, onFocus, onUpdate }) {
  const [editValue, setEditValue] = useState(field.value);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (v) => {
    setEditValue(v);
    setDirty(v !== field.value);
    setSaved(false);
  };

  const handleSave = () => {
    onUpdate(docId, sectionKey, field.id, editValue);
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const confidenceVariant = field.confidence >= 90 ? 'success' : field.confidence >= 75 ? 'warning' : 'danger';

  return (
    <div
      className={`p-3 rounded-lg border cursor-pointer transition-all duration-150 ${
        isActive ? 'border-amber-400 bg-amber-50 shadow-sm' : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
      }`}
      onClick={onFocus}
    >
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-slate-600">{field.label}</label>
        <Badge variant={confidenceVariant} className="text-xs">{field.confidence}%</Badge>
      </div>
      <input
        type="text"
        value={editValue}
        onChange={e => handleChange(e.target.value)}
        onClick={e => e.stopPropagation()}
        className={`w-full px-2 py-1.5 text-sm rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all
          ${dirty ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-slate-50'}
        `}
        aria-label={field.label}
      />
      <div className="flex items-center justify-between mt-1.5">
        <ConfidenceBar value={field.confidence} showLabel={false} className="flex-1 mr-3" />
        {dirty && (
          <button
            onClick={e => { e.stopPropagation(); handleSave(); }}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap"
          >
            Save ✓
          </button>
        )}
        {saved && <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircleIcon className="w-3 h-3" /> Saved</span>}
      </div>
    </div>
  );
}

// ─── Section Accordion ─────────────────────────────────────────────────────
function FieldSection({ title, fields, docId, sectionKey, activeField, onFieldFocus, onUpdate }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{title}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{fields.length} fields</span>
          {open ? <ChevronUpIcon className="w-4 h-4 text-slate-400" /> : <ChevronDownIcon className="w-4 h-4 text-slate-400" />}
        </div>
      </button>
      {open && (
        <div className="p-3 space-y-2 bg-white">
          {fields.map(f => (
            <FieldRow
              key={f.id}
              field={f}
              docId={docId}
              sectionKey={sectionKey}
              isActive={activeField === f.id}
              onFocus={() => onFieldFocus(f.id)}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Extraction View ──────────────────────────────────────────────────
export default function ExtractionView() {
  const { classifiedDocuments, activeDocument, setActiveDocument, activeField, setActiveField, updateField } = useAppStore();
  const navigate = useNavigate();

  const extractableDocs = classifiedDocuments.filter(d => Object.keys(d.extractedFields || {}).length > 0);
  const currentDoc = activeDocument || extractableDocs[0];

  const [savedAll, setSavedAll] = useState(false);

  const handleSaveAll = () => {
    setSavedAll(true);
    setTimeout(() => setSavedAll(false), 2500);
  };

  if (!currentDoc || extractableDocs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <DocumentTextIcon className="w-14 h-14 mb-4 opacity-40" />
        <p className="text-base font-medium text-slate-500">No extracted documents available</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate('/classification/results')}>
          ← Back to Results
        </Button>
      </div>
    );
  }

  const totalFields = Object.values(currentDoc.extractedFields).flat().length;
  const avgConfidence = totalFields
    ? Math.round(Object.values(currentDoc.extractedFields).flat().reduce((s, f) => s + f.confidence, 0) / totalFields)
    : 0;

  return (
    <div className="flex flex-col gap-4 animate-fade-in-up h-full">
      {/* Tab bar */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
        {extractableDocs.map(doc => (
          <button
            key={doc.id}
            onClick={() => { setActiveDocument(doc); setActiveField(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${
              currentDoc.id === doc.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
            }`}
          >
            {doc.classifiedAs}
          </button>
        ))}
      </div>

      {/* Doc meta + actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="text-xs text-slate-500">
            <span className="font-semibold text-slate-800">{totalFields}</span> fields extracted
          </div>
          <div className="text-xs text-slate-500">
            Avg. confidence: <span className={`font-semibold ${avgConfidence >= 90 ? 'text-emerald-600' : avgConfidence >= 75 ? 'text-amber-600' : 'text-red-600'}`}>{avgConfidence}%</span>
          </div>
        </div>
        <Button
          variant={savedAll ? 'success' : 'primary'}
          size="sm"
          onClick={handleSaveAll}
          icon={savedAll ? <CheckCircleIcon className="w-4 h-4" /> : null}
        >
          {savedAll ? 'Changes Saved!' : 'Save All Changes'}
        </Button>
      </div>

      {/* Split panel */}
      <div className="flex gap-4 min-h-[600px]">
        {/* Left: Document viewer */}
        <div className="w-1/2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <DocumentViewer doc={currentDoc} activeField={activeField} />
        </div>

        {/* Right: Extracted fields */}
        <div className="w-1/2 flex flex-col">
          <Card className="flex-1 overflow-y-auto scrollbar-thin" noPad>
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <p className="text-sm font-semibold text-slate-900">Extracted Fields</p>
              <p className="text-xs text-slate-500 mt-0.5">Click a field to highlight it in the document</p>
            </div>
            <div className="p-4 space-y-4">
              {Object.entries(currentDoc.extractedFields).map(([section, fields]) => (
                <FieldSection
                  key={section}
                  title={section}
                  fields={fields}
                  docId={currentDoc.id}
                  sectionKey={section}
                  activeField={activeField}
                  onFieldFocus={setActiveField}
                  onUpdate={updateField}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
