import { useNavigate } from 'react-router-dom';
import {
  DocumentArrowUpIcon, ClipboardDocumentCheckIcon,
  ChartBarIcon, ArrowRightIcon, CheckCircleIcon,
  ExclamationCircleIcon, XCircleIcon, ClockIcon,
} from '@heroicons/react/24/outline';
import useAppStore from '../store/useAppStore';
import { StatCard } from '../components/common/Card';
import Card, { CardHeader } from '../components/common/Card';
import DonutChart from '../components/charts/DonutChart';
import { StatusBadge } from '../components/common/Badge';

function QuickActionCard({ title, description, icon: Icon, color, path, stats }) {
  const navigate = useNavigate();
  const colors = {
    blue:   { bg: 'bg-blue-600',    hover: 'hover:bg-blue-700',   light: 'bg-blue-50',   text: 'text-blue-700' },
    purple: { bg: 'bg-purple-600',  hover: 'hover:bg-purple-700', light: 'bg-purple-50', text: 'text-purple-700' },
    green:  { bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700',light: 'bg-emerald-50',text: 'text-emerald-700' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
      onClick={() => navigate(path)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(path)}
    >
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 ${c.bg} rounded-xl flex items-center justify-center shadow-sm`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <ArrowRightIcon className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
      </div>
      <h3 className="text-sm font-bold text-slate-900 mt-3">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
      {stats && (
        <div className="flex gap-4 mt-4 pt-4 border-t border-slate-100">
          {stats.map(s => (
            <div key={s.label}>
              <p className={`text-lg font-bold ${c.text}`}>{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OverviewDashboard() {
  const { dashboardStats, loans, analytics } = useAppStore();
  const navigate = useNavigate();

  const passFailData = [
    { name: 'All Passed',   value: dashboardStats.allPassed,   color: '#059669' },
    { name: 'Partial Fail', value: dashboardStats.partialFail, color: '#d97706' },
    { name: 'Fully Failed', value: dashboardStats.fullyFailed, color: '#dc2626' },
  ];

  const recentLoans = [...loans]
    .sort((a, b) => b.submissionDate.localeCompare(a.submissionDate))
    .slice(0, 6);

  const completedCount = loans.filter(l => l.stage === 'Completed').length;
  const inProgressCount = loans.filter(l => ['Document Ingested','Classified','Extracted','In Rule Review'].includes(l.stage)).length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">Welcome to DocuLend AI</h2>
            <p className="text-blue-200 text-sm max-w-xl">
              Mortgage Loan Document Intelligence Platform — automating document classification,
              data extraction, rule evaluation, and compliance reporting.
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => navigate('/classification/upload')}
                className="px-4 py-2 bg-white text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
              >
                Upload Documents
              </button>
              <button
                onClick={() => navigate('/management/analytics')}
                className="px-4 py-2 bg-blue-600 border border-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
              >
                View Analytics
              </button>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end text-right shrink-0">
            <p className="text-blue-200 text-xs mb-1">System Status</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-emerald-300">Operational</span>
            </div>
            <p className="text-blue-300 text-xs mt-2">Last run: Today, 08:42 AM</p>
          </div>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Loans"
          value={dashboardStats.totalLoans}
          sub="All time"
          color="blue"
          icon={<ClipboardDocumentCheckIcon className="w-5 h-5" />}
        />
        <StatCard
          label="All Rules Passed"
          value={dashboardStats.allPassed}
          sub={`${((dashboardStats.allPassed / dashboardStats.totalLoans) * 100).toFixed(0)}% pass rate`}
          color="green"
          icon={<CheckCircleIcon className="w-5 h-5" />}
          trend={{ up: true, label: '+2% vs last week' }}
        />
        <StatCard
          label="In Progress"
          value={inProgressCount}
          sub="Awaiting processing"
          color="amber"
          icon={<ClockIcon className="w-5 h-5" />}
        />
        <StatCard
          label="Fully Failed"
          value={dashboardStats.fullyFailed}
          sub="Requires attention"
          color="red"
          icon={<XCircleIcon className="w-5 h-5" />}
        />
      </div>

      {/* Module quick-access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          title="Document Intelligence"
          description="Upload and classify mortgage documents. Extract data fields with AI-powered OCR."
          icon={DocumentArrowUpIcon}
          color="blue"
          path="/classification/upload"
          stats={[
            { label: 'Documents', value: 4 },
            { label: 'Classified', value: 3 },
          ]}
        />
        <QuickActionCard
          title="Rule Reviewer Portal"
          description="Evaluate loan eligibility against compliance rules. View pass/fail results per rule."
          icon={ClipboardDocumentCheckIcon}
          color="purple"
          path="/rules/dashboard"
          stats={[
            { label: 'Loans', value: dashboardStats.totalLoans },
            { label: 'Passed', value: dashboardStats.allPassed },
          ]}
        />
        <QuickActionCard
          title="Analytics & Reporting"
          description="Track loan pipeline stages, view compliance reports, and analyze system-wide trends."
          icon={ChartBarIcon}
          color="green"
          path="/management/analytics"
          stats={[
            { label: 'Completed', value: completedCount },
            { label: 'Pass Rate', value: `${((dashboardStats.allPassed / dashboardStats.totalLoans) * 100).toFixed(0)}%` },
          ]}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut */}
        <Card>
          <CardHeader title="Rule Evaluation Overview" subtitle="Loan approval status distribution" className="mb-2" />
          <DonutChart data={passFailData} />
        </Card>

        {/* Recent loans */}
        <Card>
          <CardHeader
            title="Recent Loan Activity"
            subtitle="Latest submissions"
            actions={
              <button onClick={() => navigate('/management/status')} className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
                View all →
              </button>
            }
            className="mb-4"
          />
          <div className="space-y-2">
            {recentLoans.map(loan => (
              <div
                key={loan.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/rules/loans/${loan.id}`)}
              >
                <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                  {loan.borrowerName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{loan.borrowerName}</p>
                  <p className="text-xs text-slate-400">{loan.id} · {loan.loanType} · {loan.submissionDate}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <StatusBadge status={loan.ruleStatus} />
                  <span className="text-xs text-slate-400">{loan.stage.replace('Document ', '').replace('In Rule ', 'In ')}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
