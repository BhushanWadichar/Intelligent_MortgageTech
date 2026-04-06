import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, CheckCircle2, XCircle, Clock,
  ArrowRight, Activity, Loader2, FileWarning
} from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';
import KPICard from '../components/common/KPICard';
import Badge from '../components/common/Badge';
import { getStageFunnelData } from '../data/mockData';
import PassFailChart from '../components/Analytics/PassFailChart';
import StatusFunnel from '../components/Analytics/StatusFunnel';

const EXPECTED_DOC_TYPES = [
  'W-2 Wage Statement',
  'Federal Tax Return (1040)',
  'Bank Statement (3-Month)',
  'Employment Verification Letter',
  'Property Appraisal Report',
  'Credit Report (Tri-Merge)',
  'Title Search Report',
];

export default function DashboardPage() {
  const { loans } = useApp();

  const funnelData   = useMemo(() => getStageFunnelData(loans), [loans]);

  const stats = useMemo(() => {
    const total      = loans.length;
    const completed  = loans.filter(l => l.currentStage === 'Completed').length;
    const failed     = loans.filter(l => l.status === 'Fail').length;
    const inProgress = loans.filter(l => l.currentStage !== 'Completed').length;
    const missingDoc = loans.filter(l => {
      if (l.extractedDocuments.length === 0) return false;
      const present = new Set(l.extractedDocuments.map(d => d.docType));
      return EXPECTED_DOC_TYPES.some(t => !present.has(t));
    }).length;
    return { total, completed, failed, inProgress, missingDoc };
  }, [loans]);

  const recent = useMemo(() =>
    [...loans].sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)).slice(0, 6),
    [loans]
  );

  const stageCount = (stage) => loans.filter(l => l.currentStage === stage).length;

  const KPI_CARDS = [
    {
      label: 'Total Loan Processed',
      value: stats.total,
      icon: <FileText size={20} />,
      iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
      sub: 'All loans in the system',
    },
    {
      label: 'Completed Loans',
      value: stats.completed,
      icon: <CheckCircle2 size={20} />,
      iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
      sub: `${Math.round((stats.completed / stats.total) * 100)}% completion rate`,
      subColor: 'text-emerald-600',
    },
    {
      label: 'Failed Loans',
      value: stats.failed,
      icon: <XCircle size={20} />,
      iconBg: 'bg-red-50', iconColor: 'text-red-600',
      sub: 'Require review or resubmission',
      subColor: 'text-red-500',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: <Loader2 size={20} />,
      iconBg: 'bg-amber-50', iconColor: 'text-amber-600',
      sub: 'Actively being processed',
      subColor: 'text-amber-600',
    },
    {
      label: 'Missing Doc Loans',
      value: stats.missingDoc,
      icon: <FileWarning size={20} />,
      iconBg: 'bg-violet-50', iconColor: 'text-violet-600',
      sub: 'Incomplete document sets',
      subColor: stats.missingDoc > 0 ? 'text-violet-600' : 'text-slate-400',
    },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Welcome back, Admin</h2>
            <p className="text-blue-100 text-sm mt-1">
              {format(new Date(), 'EEEE, MMMM d, yyyy')} · {stats.inProgress} loans actively processing
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/pipeline" className="btn bg-white/15 text-white hover:bg-white/25 border border-white/20 text-sm">
              View Pipeline <ArrowRight size={14} />
            </Link>
            <Link to="/analytics" className="btn bg-white text-blue-700 hover:bg-blue-50 text-sm font-semibold">
              Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {KPI_CARDS.map(k => (
          <KPICard key={k.label} {...k} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PassFailChart stats={stats} />
        <StatusFunnel data={funnelData} />
      </div>

      {/* Stage Summary + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stage breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Activity size={15} className="text-blue-500" /> Pipeline Breakdown
          </h3>
          <div className="space-y-3">
            {[
              { stage: 'Document Ingested', color: 'bg-blue-500' },
              { stage: 'Classified', color: 'bg-purple-500' },
              { stage: 'Extracted', color: 'bg-cyan-500' },
              { stage: 'In Rule Review', color: 'bg-amber-500' },
              { stage: 'Completed', color: 'bg-emerald-500' },
            ].map(({ stage, color }) => {
              const count = stageCount(stage);
              const pct = Math.round((count / loans.length) * 100);
              return (
                <div key={stage}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">{stage}</span>
                    <span className="text-slate-800 font-semibold">{count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Clock size={15} className="text-blue-500" /> Recent Activity
            </h3>
            <Link to="/loans" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recent.map(loan => (
              <div key={loan.id} className="flex items-center gap-3 py-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  loan.status === 'Pass' ? 'bg-emerald-50' : loan.status === 'Fail' ? 'bg-red-50' : 'bg-blue-50'
                }`}>
                  {loan.status === 'Pass'
                    ? <CheckCircle2 size={15} className="text-emerald-500" />
                    : loan.status === 'Fail'
                    ? <XCircle size={15} className="text-red-500" />
                    : <Clock size={15} className="text-blue-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-blue-600">{loan.id}</span>
                    <Badge label={loan.loanType} size="xs" />
                  </div>
                  <p className="text-xs text-slate-500 truncate">{loan.borrowerName}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <Badge label={loan.currentStage} size="xs" />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {format(new Date(loan.lastUpdated), 'MMM d')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
