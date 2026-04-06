import { NavLink, useLocation } from 'react-router-dom';
import {
  DocumentArrowUpIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { path: '/', label: 'Dashboard', icon: HomeIcon, exact: true },
    ],
  },
  {
    label: 'Module 1',
    sub: 'Document Intelligence',
    items: [
      { path: '/classification/upload', label: 'Document Upload', icon: DocumentArrowUpIcon },
      { path: '/classification/results', label: 'Classification Results', icon: ClipboardDocumentListIcon },
      { path: '/classification/extraction', label: 'Data Extraction', icon: DocumentArrowUpIcon },
    ],
  },
  {
    label: 'Module 2',
    sub: 'Rule Reviewer Portal',
    items: [
      { path: '/rules/dashboard', label: 'Rule Dashboard', icon: ChartBarIcon },
      { path: '/rules/loans', label: 'Loan List', icon: ClipboardDocumentListIcon },
    ],
  },
  {
    label: 'Module 3',
    sub: 'Management & Reporting',
    items: [
      { path: '/management/pipeline', label: 'Pipeline Tracker', icon: ChartBarIcon },
      { path: '/management/status', label: 'Loan Status Table', icon: ClipboardDocumentListIcon },
      { path: '/management/analytics', label: 'Analytics & Reports', icon: ChartBarIcon },
    ],
  },
];

function NavItem({ item }) {
  return (
    <NavLink
      to={item.path}
      end={item.exact}
      className={({ isActive }) => `
        flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
        ${isActive
          ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/30'
          : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
        }
      `}
    >
      {({ isActive }) => (
        <>
          <item.icon className="w-4 h-4 shrink-0" />
          <span className="flex-1">{item.label}</span>
          {isActive && <ChevronRightIcon className="w-3 h-3 opacity-60" />}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const Content = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/40">
            <DocumentArrowUpIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-bold leading-tight">DocuLend AI</p>
            <p className="text-slate-400 text-xs">Mortgage Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-5">
        {navGroups.map(group => (
          <div key={group.label}>
            <div className="px-3 mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{group.label}</p>
              {group.sub && <p className="text-xs text-slate-600 mt-0.5">{group.sub}</p>}
            </div>
            <div className="space-y-0.5">
              {group.items.map(item => (
                <NavItem key={item.path} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
            AU
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin User</p>
            <p className="text-xs text-slate-400 truncate">admin@doclend.ai</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-slate-900 shrink-0 h-screen sticky top-0">
        <Content />
      </aside>

      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg"
        onClick={() => setMobileOpen(v => !v)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 shadow-2xl">
            <Content />
          </aside>
        </div>
      )}
    </>
  );
}
