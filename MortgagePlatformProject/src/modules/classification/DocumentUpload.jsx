import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import {
  DocumentArrowUpIcon, XMarkIcon, CheckCircleIcon,
  ExclamationTriangleIcon, CloudArrowUpIcon,
} from '@heroicons/react/24/outline';
import useAppStore from '../../store/useAppStore';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

function FileRow({ file }) {
  const pct = file.progress || 0;
  const isDone = file.status === 'done';

  const ext = file.name.split('.').pop().toUpperCase();
  const extColors = { PDF: 'bg-red-100 text-red-700', TIFF: 'bg-purple-100 text-purple-700', JPG: 'bg-amber-100 text-amber-700', PNG: 'bg-blue-100 text-blue-700' };
  const extColor = extColors[ext] || 'bg-slate-100 text-slate-600';

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 bg-white animate-fade-in-up">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${extColor} shrink-0`}>
        {ext}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
        <p className="text-xs text-slate-400 mt-0.5">{file.size}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${isDone ? 'bg-emerald-500' : 'bg-blue-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className={`text-xs font-medium tabular-nums ${isDone ? 'text-emerald-600' : 'text-slate-500'}`}>
            {isDone ? '100%' : `${pct}%`}
          </span>
        </div>
      </div>
      <div className="shrink-0">
        {isDone
          ? <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
          : <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        }
      </div>
    </div>
  );
}

const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'image/tiff': ['.tiff', '.tif'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
};

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

export default function DocumentUpload() {
  const [rejected, setRejected] = useState([]);
  const { uploadedFiles, uploadFiles, isClassifying } = useAppStore();
  const navigate = useNavigate();

  const onDrop = useCallback((accepted, rejectedFiles) => {
    setRejected(rejectedFiles);
    if (accepted.length) uploadFiles(accepted);
  }, [uploadFiles]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_SIZE,
    multiple: true,
  });

  const allDone = uploadedFiles.length > 0 && uploadedFiles.every(f => f.status === 'done');

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      {/* Instructions banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex gap-3">
        <DocumentArrowUpIcon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-900">Batch Document Upload</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Upload multiple mortgage documents at once. Supported formats: PDF, TIFF, JPG, PNG. Max 50 MB per file.
            Documents will be automatically classified and extracted upon upload.
          </p>
        </div>
      </div>

      {/* Drop zone */}
      <Card noPad>
        <div
          {...getRootProps()}
          className={`
            relative flex flex-col items-center justify-center p-16 rounded-xl
            border-2 border-dashed cursor-pointer transition-all duration-200
            ${isDragReject
              ? 'border-red-400 bg-red-50'
              : isDragActive
              ? 'border-blue-500 bg-blue-50 scale-[1.01]'
              : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40'
            }
          `}
          role="button"
          aria-label="File upload drop zone"
          tabIndex={0}
        >
          <input {...getInputProps()} aria-label="File input" />
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isDragActive ? 'bg-blue-100' : 'bg-slate-200'}`}>
            <CloudArrowUpIcon className={`w-9 h-9 ${isDragActive ? 'text-blue-600' : 'text-slate-500'}`} />
          </div>
          {isDragActive ? (
            <>
              <p className="text-base font-semibold text-blue-700">Drop files to upload</p>
              <p className="text-sm text-blue-500 mt-1">Release to start uploading</p>
            </>
          ) : (
            <>
              <p className="text-base font-semibold text-slate-700">Drag & drop files here</p>
              <p className="text-sm text-slate-500 mt-1">or <span className="text-blue-600 font-medium">click to browse</span></p>
              <div className="flex gap-2 mt-4">
                {['PDF', 'TIFF', 'JPG', 'PNG'].map(fmt => (
                  <span key={fmt} className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 rounded-full text-slate-500">{fmt}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Rejected files */}
      {rejected.length > 0 && (
        <div className="space-y-2 animate-fade-in-up">
          {rejected.map(({ file, errors }, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-800 truncate">{file.name}</p>
                <p className="text-xs text-red-600 mt-0.5">{errors.map(e => e.message).join(', ')}</p>
              </div>
              <button onClick={() => setRejected(r => r.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600">
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload queue */}
      {uploadedFiles.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Upload Queue</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {uploadedFiles.filter(f => f.status === 'done').length} of {uploadedFiles.length} files completed
              </p>
            </div>
            {isClassifying && (
              <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                Auto-classifying…
              </div>
            )}
          </div>
          <div className="space-y-2">
            {uploadedFiles.map(f => <FileRow key={f.id} file={f} />)}
          </div>
        </Card>
      )}

      {/* CTA after upload */}
      {allDone && (
        <div className="flex items-center justify-between p-5 bg-emerald-50 border border-emerald-200 rounded-xl animate-fade-in-up">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">Upload Complete</p>
              <p className="text-xs text-emerald-700">
                {isClassifying ? 'Classification in progress…' : 'All documents uploaded & classified successfully.'}
              </p>
            </div>
          </div>
          {!isClassifying && (
            <Button variant="success" onClick={() => navigate('/classification/results')}>
              View Results →
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
