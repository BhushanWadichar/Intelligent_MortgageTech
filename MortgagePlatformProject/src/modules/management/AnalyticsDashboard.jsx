import { useMemo } from 'react';
import useAppStore from '../../store/useAppStore';
import Card, { CardHeader, StatCard } from '../../components/common/Card';
import DonutChart from '../../components/charts/DonutChart';
import {
  GroupedBarChart, HorizontalBarChart, FunnelBarChart,
} from '../../components/charts/BarChartComponent';
import {
  ChartBarIcon, DocumentTextIcon, ShieldCheckIcon, ClockIcon,
} from '@heroicons/react/24/outline';

// ─── Document Compliance Heatmap ──────────────────────────────────────────
function ComplianceHeatmap({ data }) {
  const allDocTypes = data[0]?.docs.map(d => d.type) || [];
  const statusColors = {
    Verified: 'bg-emerald-500',
    Pending:  'bg-amber-400',
    Missing:  'bg-red-400',
  };
  const statusBg = {
    Verified: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    Pending:  'bg-amber-50 border-amber-200 text-amber-800',
    Missing:  'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-xs min-w-[700px]">
          <thead>
            <tr>
              <th className="py-2 px-3 text-left text-slate-500 font-semibold w-28">Borrower</th>
              {allDocTypes.map(dt => (
                <th key={dt} className="py-2 px-1 text-center text-slate-500 font-medium" style={{ minWidth: 70 }}>
                  {dt.split(' ').map(w => w[0]).join('')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map(row => (
              <tr key={row.loanId} className="hover:bg-slate-50">
                <td className="py-2 px-3 font-medium text-slate-700 whitespace-nowrap">{row.borrower}</td>
                {row.docs.map(doc => (
                  <td key={doc.type} className="py-2 px-1 text-center">
                    <span className={`inline-block w-16 py-0.5 rounded text-xs font-medium border ${statusBg[doc.status] || 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                      {doc.status}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
        {['Verified', 'Pending', 'Missing'].map(s => (
          <span key={s} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className={`w-3 h-3 rounded ${statusColors[s]}`} />
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const { analytics, dashboardStats, loans } = useAppStore();

  const loanTypeChartData = useMemo(() =>
    analytics.loanByType.map(d => ({
      type: d.type,
      approved: d.approved,
      rejected: d.rejected,
      pending: d.count - d.approved - d.rejected,
    })),
  [analytics]);

  const ruleFailData = useMemo(() =>
    analytics.ruleFailureFreq.map(d => ({ name: d.rule, value: d.failures })),
  [analytics]);

  const totalLoans = loans.length;
  const passRate = ((dashboardStats.allPassed / totalLoans) * 100).toFixed(1);
  const avgDocs = 4.2;
  const completedLoans = loans.filter(l => l.stage === 'Completed').length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Overall Pass Rate"
          value={`${passRate}%`}
          sub={`${dashboardStats.allPassed} of ${totalLoans} loans`}
          color="green"
          icon={<ShieldCheckIcon className="w-5 h-5" />}
          trend={{ up: true, label: '+3.2% vs last month' }}
        />
        <StatCard
          label="Loans Processed"
          value={totalLoans}
          sub="All time"
          color="blue"
          icon={<ChartBarIcon className="w-5 h-5" />}
        />
        <StatCard
          label="Completed Loans"
          value={completedLoans}
          sub={`${((completedLoans / totalLoans) * 100).toFixed(0)}% completion rate`}
          color="purple"
          icon={<ClockIcon className="w-5 h-5" />}
        />
        <StatCard
          label="Avg Docs / Loan"
          value={avgDocs}
          sub="4 document types avg."
          color="amber"
          icon={<DocumentTextIcon className="w-5 h-5" />}
        />
      </div>

      {/* Row 1: Pass/fail donut + Loan type bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Loan Pass / Fail Rate"
            subtitle="System-wide approval vs rejection rate"
            className="mb-4"
          />
          <DonutChart data={analytics.passFailRate} innerRadius={60} />
        </Card>

        <Card>
          <CardHeader
            title="Loan Distribution by Type"
            subtitle="Approved vs rejected per loan product"
            className="mb-4"
          />
          <GroupedBarChart
            data={loanTypeChartData}
            bars={[
              { key: 'approved', label: 'Approved', color: '#059669', xKey: 'type' },
              { key: 'rejected', label: 'Rejected', color: '#dc2626', xKey: 'type' },
              { key: 'pending',  label: 'Pending',  color: '#d97706', xKey: 'type' },
            ]}
            height={240}
          />
        </Card>
      </div>

      {/* Row 2: Stage funnel + Rule failure freq */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Loan Status Overview"
            subtitle="Funnel distribution across pipeline stages"
            className="mb-5"
          />
          <FunnelBarChart data={analytics.stageDistribution} />
        </Card>

        <Card>
          <CardHeader
            title="Top Rule Failure Frequency"
            subtitle="Most frequently failing rules across all loans"
            className="mb-4"
          />
          <HorizontalBarChart
            data={ruleFailData}
            dataKey="value"
            labelKey="name"
            color="#dc2626"
            height={260}
          />
        </Card>
      </div>

      {/* Row 3: Document compliance heatmap */}
      <Card>
        <CardHeader
          title="Document Compliance Check Report"
          subtitle="Document completeness status per loan (sample)"
          className="mb-4"
        />
        <ComplianceHeatmap data={analytics.docCompliance} />
      </Card>

      {/* Row 4: Rule category performance */}
      <Card>
        <CardHeader
          title="Rule Performance by Category"
          subtitle="Pass rates across rule categories"
          className="mb-5"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.ruleAggregates.reduce((acc, r) => {
            const cat = r.category;
            if (!acc[cat]) acc[cat] = { passed: 0, failed: 0 };
            acc[cat].passed += r.passed;
            acc[cat].failed += r.failed;
            return acc;
          }, {}) && Object.entries(
            dashboardStats.ruleAggregates.reduce((acc, r) => {
              const cat = r.category;
              if (!acc[cat]) acc[cat] = { passed: 0, failed: 0 };
              acc[cat].passed += r.passed;
              acc[cat].failed += r.failed;
              return acc;
            }, {})
          ).map(([cat, stats]) => {
            const total = stats.passed + stats.failed;
            const pct = total ? Math.round((stats.passed / total) * 100) : 0;
            const configs = {
              'Income Verification': { from: 'from-blue-600', to: 'to-blue-400', bg: 'bg-blue-50', text: 'text-blue-700', icon: '💰' },
              'Credit':              { from: 'from-purple-600', to: 'to-purple-400', bg: 'bg-purple-50', text: 'text-purple-700', icon: '📊' },
              'Employment':          { from: 'from-emerald-600', to: 'to-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: '💼' },
              'Compliance':          { from: 'from-amber-600', to: 'to-amber-400', bg: 'bg-amber-50', text: 'text-amber-700', icon: '⚖️' },
            };
            const c = configs[cat] || configs['Compliance'];
            return (
              <div key={cat} className={`${c.bg} rounded-2xl p-5 flex flex-col items-center text-center`}>
                <span className="text-3xl mb-2">{c.icon}</span>
                <p className={`text-sm font-semibold ${c.text}`}>{cat}</p>
                {/* SVG circle gauge */}
                <div className="relative w-20 h-20 my-3">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="3.5" />
                    <circle
                      cx="18" cy="18" r="14" fill="none"
                      stroke={pct >= 75 ? '#059669' : pct >= 50 ? '#d97706' : '#dc2626'}
                      strokeWidth="3.5"
                      strokeDasharray={`${pct * 0.879} 87.9`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-lg font-bold ${c.text}`}>{pct}%</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">{stats.passed} passed · {stats.failed} failed</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
