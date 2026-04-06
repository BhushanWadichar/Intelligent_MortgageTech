import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon, ExclamationTriangleIcon,
  CheckBadgeIcon, PencilSquareIcon,
} from '@heroicons/react/24/outline';
import useAppStore from '../../store/useAppStore';
import Card from '../../components/common/Card';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ConfidenceBar from '../../components/common/ConfidenceBar';
import { Select } from '../../components/common/Input';
import { mockClassificationDocTypes } from '../../data/mockData';

function DocTypeIcon({ type }) {
  const icons = {
    'Paystub': '💰', 'W-2': '📋', 'Bank Statement': '🏦',
    'Tax Return': '📄', '1003 Application': '📝', 'Credit Report': '📊',
    'Appraisal': '🏠', 'Title Report': '⚖️', 'Unclassified': '❓',
  };
  return <span className="text-2xl">{icons[type] || '📄'}</span>;
}

function DocumentCard({ doc }) {
  const { overrideClassification, setActiveDocument } = useAppStore();
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();

  const isUnclassified = doc.classifiedAs === 'Unclassified' || doc.status === 'unclassified';
  const confidenceColor = doc.confidence >= 90 ? 'text-emerald-600' : doc.confidence >= 75 ? 'text-amber-600' : 'text-red-600';

  return (
    <Card className="animate-fade-in-up" hover>
      {/* Top row */}
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isUnclassified ? 'bg-amber-50 ring-2 ring-amber-200' : 'bg-blue-50'}`}>
          <DocTypeIcon type={doc.classifiedAs} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900 truncate">{doc.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {doc.type} · {doc.size} · {doc.pages} page{doc.pages !== 1 ? 's' : ''}
              </p>
            </div>
            {isUnclassified
              ? <Badge variant="warning" dot><ExclamationTriangleIcon className="w-3 h-3" /> Unclassified</Badge>
              : <StatusBadge status="classified" />
            }
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {/* Classification label */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Document Type</span>
          {editing ? (
            <Select
              className="w-44 text-xs py-1"
              value={doc.classifiedAs}
              onChange={e => {
                overrideClassification(doc.id, e.target.value);
                setEditing(false);
              }}
            >
              {mockClassificationDocTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800">{doc.classifiedAs}</span>
              <button
                onClick={() => setEditing(true)}
                className="text-slate-400 hover:text-blue-600 transition-colors"
                aria-label="Edit classification"
              >
                <PencilSquareIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Confidence */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Confidence Score</span>
            <span className={`text-xs font-bold tabular-nums ${confidenceColor}`}>{doc.confidence}%</span>
          </div>
          <ConfidenceBar value={doc.confidence} showLabel={false} />
        </div>

        {/* Uploaded at */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Uploaded {new Date(doc.uploadedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
          {!isUnclassified && (
            <div className="flex items-center gap-1 text-emerald-600 font-medium">
              <CheckBadgeIcon className="w-4 h-4" />
              Verified
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      {!isUnclassified && Object.keys(doc.extractedFields).length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setActiveDocument(doc);
              navigate('/classification/extraction');
            }}
          >
            <DocumentTextIcon className="w-4 h-4" />
            View Extraction
          </Button>
        </div>
      )}
    </Card>
  );
}

export default function ClassificationResults() {
  const { classifiedDocuments } = useAppStore();
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const filtered = filter === 'all' ? classifiedDocuments
    : filter === 'classified' ? classifiedDocuments.filter(d => d.status === 'classified')
    : classifiedDocuments.filter(d => d.status === 'unclassified');

  const totalClassified = classifiedDocuments.filter(d => d.status === 'classified').length;
  const totalUnclassified = classifiedDocuments.filter(d => d.status === 'unclassified').length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Documents', value: classifiedDocuments.length, color: 'text-blue-700 bg-blue-50 border-blue-200' },
          { label: 'Classified',      value: totalClassified,            color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { label: 'Unclassified',    value: totalUnclassified,          color: 'text-amber-700 bg-amber-50 border-amber-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-1 opacity-75">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs + actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {[
            { key: 'all', label: `All (${classifiedDocuments.length})` },
            { key: 'classified', label: `Classified (${totalClassified})` },
            { key: 'unclassified', label: `Unclassified (${totalUnclassified})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all ${
                filter === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/classification/upload')}>
          + Upload More
        </Button>
      </div>

      {/* Document grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No documents found</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => navigate('/classification/upload')}>
            Upload Documents
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(doc => <DocumentCard key={doc.id} doc={doc} />)}
        </div>
      )}
    </div>
  );
}
