import { useState } from 'react';
import {
  UploadCloud, Package, CheckCircle2, XCircle,
  Loader2, AlertTriangle, InboxIcon
} from 'lucide-react';
import UploadZone from '../components/Upload/UploadZone';
import PackageCard from '../components/Upload/PackageCard';
import { usePackageProcessor } from '../hooks/usePackageProcessor';

export default function UploadPage() {
  const { packages, addPackage, toggleExpand } = usePackageProcessor();

  const stats = {
    total:      packages.length,
    processing: packages.filter(p => p.status === 'processing').length,
    completed:  packages.filter(p => p.status === 'completed').length,
    errors:     packages.filter(p => p.status === 'completed_with_errors').length,
    failed:     packages.filter(p => p.status === 'failed').length,
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Upload Loan Package</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Upload a ZIP archive containing thousands of loan documents. Processing runs asynchronously — you can upload multiple packages and track each one below.
        </p>
      </div>

      {/* Upload zone */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
            <UploadCloud size={15} className="text-blue-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">Upload New Package</h3>
        </div>
        <UploadZone onUpload={addPackage} />

        {/* How it works */}
        <div className="mt-5 pt-5 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">How it works</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { step: '1', label: 'Upload ZIP',           color: 'bg-blue-50 text-blue-700'    },
              { step: '2', label: 'Extract Contents',     color: 'bg-purple-50 text-purple-700' },
              { step: '3', label: 'Classify Documents',   color: 'bg-cyan-50 text-cyan-700'     },
              { step: '4', label: 'Validate Loans',       color: 'bg-amber-50 text-amber-700'   },
              { step: '5', label: 'Run Rule Engine',      color: 'bg-orange-50 text-orange-700' },
              { step: '6', label: 'Results Ready',        color: 'bg-emerald-50 text-emerald-700' },
            ].map(({ step, label, color }) => (
              <div key={step} className={`flex flex-col items-center text-center p-3 rounded-xl ${color}`}>
                <span className="text-lg font-extrabold leading-none mb-1">{step}</span>
                <span className="text-[11px] font-medium leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Package summary stats */}
      {packages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total Packages',  value: stats.total,      bg: 'bg-slate-50',    text: 'text-slate-800',    border: 'border-slate-200',    icon: Package       },
            { label: 'Processing',      value: stats.processing, bg: 'bg-blue-50',     text: 'text-blue-700',     border: 'border-blue-200',     icon: Loader2       },
            { label: 'Completed',       value: stats.completed,  bg: 'bg-emerald-50',  text: 'text-emerald-700',  border: 'border-emerald-200',  icon: CheckCircle2  },
            { label: 'With Errors',     value: stats.errors,     bg: 'bg-amber-50',    text: 'text-amber-700',    border: 'border-amber-200',    icon: AlertTriangle },
            { label: 'Failed',          value: stats.failed,     bg: 'bg-red-50',      text: 'text-red-700',      border: 'border-red-200',      icon: XCircle       },
          ].map(({ label, value, bg, text, border, icon: Icon }) => (
            <div key={label} className={`flex items-center gap-3 p-3.5 rounded-xl border ${bg} ${border}`}>
              <Icon size={18} className={`${text} flex-shrink-0 ${label === 'Processing' && value > 0 ? 'animate-spin' : ''}`} />
              <div>
                <p className={`text-xl font-extrabold leading-none ${text}`}>{value}</p>
                <p className={`text-[11px] font-medium mt-0.5 ${text} opacity-70`}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Package list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Package size={15} className="text-slate-500" />
            Order Packages
            {packages.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">{packages.length}</span>
            )}
          </h3>
          {packages.length > 0 && (
            <p className="text-xs text-slate-400">Click any package to expand stage timeline & files</p>
          )}
        </div>

        {packages.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <InboxIcon size={24} className="text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600">No packages uploaded yet</p>
            <p className="text-xs text-slate-400 mt-1">Upload a ZIP file above to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {packages.map(pkg => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onToggle={() => toggleExpand(pkg.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
