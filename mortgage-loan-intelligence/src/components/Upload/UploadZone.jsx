import { useState, useRef } from 'react';
import { UploadCloud, FileArchive, AlertCircle } from 'lucide-react';

export default function UploadZone({ onUpload }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError]       = useState('');
  const inputRef                = useRef(null);

  const validate = (file) => {
    if (!file) return 'No file selected.';
    if (!file.name.toLowerCase().endsWith('.zip')) return 'Only .zip files are supported.';
    if (file.size > 2 * 1024 * 1024 * 1024) return 'File must be under 2 GB.';
    return null;
  };

  const handle = (file) => {
    const err = validate(file);
    if (err) { setError(err); return; }
    setError('');
    onUpload(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    handle(file);
  };

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onChange    = (e) => handle(e.target.files?.[0]);

  return (
    <div className="space-y-3">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center
          rounded-2xl border-2 border-dashed cursor-pointer
          px-8 py-14 transition-all duration-200 select-none
          ${dragging
            ? 'border-blue-500 bg-blue-50 scale-[1.01]'
            : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50'
          }
        `}
      >
        {/* Animated pulse ring when dragging */}
        {dragging && (
          <div className="absolute inset-0 rounded-2xl border-2 border-blue-400 animate-ping opacity-30 pointer-events-none" />
        )}

        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
          dragging ? 'bg-blue-100' : 'bg-white shadow-sm border border-slate-200'
        }`}>
          {dragging
            ? <UploadCloud size={28} className="text-blue-600 animate-bounce" />
            : <FileArchive size={28} className="text-blue-500" />
          }
        </div>

        <p className={`text-base font-semibold transition-colors ${dragging ? 'text-blue-700' : 'text-slate-700'}`}>
          {dragging ? 'Release to upload' : 'Drag & drop your ZIP package here'}
        </p>
        <p className="text-sm text-slate-400 mt-1.5">
          or <span className="text-blue-600 font-medium underline underline-offset-2">click to browse</span>
        </p>

        <div className="flex items-center gap-4 mt-5 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1 shadow-sm">
            <FileArchive size={11} /> .zip files only
          </span>
          <span className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1 shadow-sm">
            <UploadCloud size={11} /> Up to 2 GB
          </span>
          <span className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1 shadow-sm">
            ∞ Thousands of loans
          </span>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".zip,application/zip"
          onChange={onChange}
          className="hidden"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle size={15} className="flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
