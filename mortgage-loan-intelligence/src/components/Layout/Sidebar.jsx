import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, GitBranch, ClipboardList, BarChart3,
  Building2, ChevronLeft, ChevronRight, UploadCloud, BrainCircuit
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const NAV = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard',             end: true },
  { to: '/pipeline',  icon: GitBranch,       label: 'Loan Pipeline'                  },
  { to: '/loans',     icon: ClipboardList,   label: 'Loan Status'                    },
  { to: '/analytics', icon: BarChart3,       label: 'Analytics'                      },
  { to: '/upload',    icon: UploadCloud,     label: 'Upload Loan Package'            },
  { to: '/doc-intel', icon: BrainCircuit,    label: 'Document Intelligence'          },
];

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useApp();

  return (
    <aside
      className={`
        flex-shrink-0 flex flex-col bg-slate-900 text-white
        transition-all duration-200 ease-in-out h-screen sticky top-0 z-30
        ${sidebarOpen ? 'w-60' : 'w-16'}
      `}
    >
      {/* Brand */}
      <div className={`flex items-center gap-3 px-4 h-16 border-b border-slate-800 flex-shrink-0 ${!sidebarOpen && 'justify-center'}`}>
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 size={16} className="text-white" />
        </div>
        {sidebarOpen && (
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight text-white">Doc Data Validation</p>
            <p className="text-[10px] text-slate-400 leading-tight">Intelligent Mortgage Platform</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {sidebarOpen && (
          <p className="px-4 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Navigation</p>
        )}
        <ul className="space-y-0.5 px-2">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-100
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }
                  ${!sidebarOpen && 'justify-center'}`
                }
                title={!sidebarOpen ? label : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Toggle */}
      <div className="p-3 border-t border-slate-800 flex-shrink-0">
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-medium ${!sidebarOpen && 'justify-center'}`}
        >
          {sidebarOpen ? <><ChevronLeft size={15} /><span>Collapse</span></> : <ChevronRight size={15} />}
        </button>
      </div>
    </aside>
  );
}
