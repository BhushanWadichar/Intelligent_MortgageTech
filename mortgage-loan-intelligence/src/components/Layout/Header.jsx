import { useLocation } from 'react-router-dom';
import { Bell, Search, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const PAGE_TITLES = {
  '/':          { title: 'Dashboard',            sub: 'System-wide loan intelligence overview'            },
  '/pipeline':  { title: 'Loan Pipeline',        sub: 'Track loan processing stages in real time'        },
  '/loans':     { title: 'Loan Status',          sub: 'Manage and filter all loan records'               },
  '/analytics': { title: 'Analytics',            sub: 'Reporting, trends, and compliance metrics'        },
  '/upload':    { title: 'Upload Loan Package',     sub: 'Async bulk ingestion — upload ZIP packages'              },
  '/doc-intel': { title: 'Document Intelligence',  sub: 'AI classification, extraction and field-level review'   },
};

export default function Header() {
  const { pathname } = useLocation();
  const { filters, setFilters } = useApp();
  const page = PAGE_TITLES[pathname] || { title: 'MortgageIQ', sub: '' };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4 sticky top-0 z-20 flex-shrink-0">
      {/* Page info */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-slate-900 leading-tight">{page.title}</h1>
        <p className="text-xs text-slate-400 leading-tight hidden sm:block">{page.sub}</p>
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="pl-8 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition-all focus:w-72"
          placeholder="Search loans…"
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-semibold text-slate-800 leading-tight">Admin User</p>
            <p className="text-[10px] text-slate-400 leading-tight">Underwriting Team</p>
          </div>
        </div>
      </div>
    </header>
  );
}
