import { useLocation } from 'react-router-dom';
import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const routeTitles = {
  '/':                           { title: 'Overview Dashboard',      sub: 'Mortgage Loan Document Intelligence Platform' },
  '/classification/upload':      { title: 'Document Upload',          sub: 'Module 1 · Document Classification & Extraction' },
  '/classification/results':     { title: 'Classification Results',   sub: 'Module 1 · Document Classification & Extraction' },
  '/classification/extraction':  { title: 'Data Extraction',          sub: 'Module 1 · Document Classification & Extraction' },
  '/rules/dashboard':            { title: 'Rule Evaluation Dashboard', sub: 'Module 2 · Rule Reviewer Portal' },
  '/rules/loans':                { title: 'Loan List',                 sub: 'Module 2 · Rule Reviewer Portal' },
  '/rules/loans/:id':            { title: 'Rule Execution Detail',     sub: 'Module 2 · Rule Reviewer Portal' },
  '/management/pipeline':        { title: 'Pipeline Tracker',          sub: 'Module 3 · Management & Reporting' },
  '/management/status':          { title: 'Loan Status Table',         sub: 'Module 3 · Management & Reporting' },
  '/management/analytics':       { title: 'Analytics & Reporting',     sub: 'Module 3 · Management & Reporting' },
};

export default function Header() {
  const { pathname } = useLocation();
  const info = routeTitles[pathname] || routeTitles['/'];

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
      <div className="lg:block hidden">
        <h1 className="text-lg font-bold text-slate-900 leading-tight">{info.title}</h1>
        <p className="text-xs text-slate-500 mt-0.5">{info.sub}</p>
      </div>
      <div className="lg:hidden" />

      <div className="flex items-center gap-3 ml-auto">
        {/* Search */}
        <div className="relative hidden sm:block">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search loans, docs..."
            className="pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 w-52 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            aria-label="Global search"
          />
        </div>

        {/* Notifications */}
        <button
          className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          aria-label="Notifications"
        >
          <BellIcon className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" aria-hidden />
        </button>

        {/* Date */}
        <div className="hidden md:flex flex-col items-end">
          <span className="text-xs text-slate-500">Today</span>
          <span className="text-xs font-semibold text-slate-700">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Environment badge */}
        <span className="hidden sm:inline-flex px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-100">
          Demo
        </span>
      </div>
    </header>
  );
}
