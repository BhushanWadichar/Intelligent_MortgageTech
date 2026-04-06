import { useMemo } from 'react';
import {
  ClipboardDocumentCheckIcon, CheckCircleIcon,
  XCircleIcon, ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import useAppStore from '../../store/useAppStore';
import { StatCard } from '../../components/common/Card';
import Card, { CardHeader } from '../../components/common/Card';
import DonutChart from '../../components/charts/DonutChart';
import { RulePassFailChart } from '../../components/charts/BarChartComponent';

export default function RulesDashboard() {
  const { dashboardStats, loans } = useAppStore();

  const passFailData = useMemo(() => [
    { name: 'All Passed',   value: dashboardStats.allPassed,   color: '#059669' },
    { name: 'Partial Fail', value: dashboardStats.partialFail, color: '#d97706' },
    { name: 'Fully Failed', value: dashboardStats.fullyFailed, color: '#dc2626' },
  ], [dashboardStats]);

  const ruleChartData = useMemo(() =>
    dashboardStats.ruleAggregates.map(r => ({
      rule: r.rule.split(/[≤≥]/)[0].trim().slice(0, 14),
      passed: r.passed,
      failed: r.failed,
      category: r.category,
    })),
  [dashboardStats]);

  const categoryGroups = useMemo(() => {
    const groups = {};
    dashboardStats.ruleAggregates.forEach(r => {
      if (!groups[r.category]) groups[r.category] = { passed: 0, failed: 0 };
      groups[r.category].passed += r.passed;
      groups[r.category].failed += r.failed;
    });
    return groups;
  }, [dashboardStats]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* KPI cards */}
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
          sub={`${((dashboardStats.allPassed / dashboardStats.totalLoans) * 100).toFixed(0)}% of total`}
          color="green"
          icon={<CheckCircleIcon className="w-5 h-5" />}
        />
        <StatCard
          label="Partial Failures"
          value={dashboardStats.partialFail}
          sub="1–3 rules failed"
          color="amber"
          icon={<ExclamationCircleIcon className="w-5 h-5" />}
        />
        <StatCard
          label="Fully Failed"
          value={dashboardStats.fullyFailed}
          sub="4+ rules failed"
          color="red"
          icon={<XCircleIcon className="w-5 h-5" />}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut: pass/fail distribution */}
        <Card>
          <CardHeader title="Loan Rule Evaluation Status" subtitle="Distribution across all loans" className="mb-4" />
          <DonutChart data={passFailData} title="" />
        </Card>

        {/* Rule-level pass/fail bar chart */}
        <Card>
          <CardHeader title="Rule-Level Pass / Fail" subtitle="Aggregated across all loans" className="mb-4" />
          <RulePassFailChart data={ruleChartData} height={300} />
        </Card>
      </div>

      {/* Category breakdown */}
      <Card>
        <CardHeader title="Rule Category Summary" subtitle="Pass/fail totals by category" className="mb-5" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(categoryGroups).map(([cat, stats]) => {
            const total = stats.passed + stats.failed;
            const pct = total ? Math.round((stats.passed / total) * 100) : 0;
            const colors = {
              'Income Verification': { bg: 'bg-blue-50',    text: 'text-blue-700',    bar: 'bg-blue-500' },
              'Credit':              { bg: 'bg-purple-50',  text: 'text-purple-700',  bar: 'bg-purple-500' },
              'Employment':          { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500' },
              'Compliance':          { bg: 'bg-amber-50',   text: 'text-amber-700',   bar: 'bg-amber-500' },
            };
            const c = colors[cat] || colors['Compliance'];
            return (
              <div key={cat} className={`${c.bg} rounded-xl p-4`}>
                <p className={`text-xs font-semibold ${c.text} mb-2`}>{cat}</p>
                <div className="flex items-end justify-between mb-2">
                  <span className={`text-2xl font-bold ${c.text}`}>{pct}%</span>
                  <span className="text-xs text-slate-400">pass rate</span>
                </div>
                <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <span>✓ {stats.passed}</span>
                  <span>✗ {stats.failed}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent loan evaluations */}
      <Card>
        <CardHeader title="Recent Loan Evaluations" subtitle="Last 5 processed loans" className="mb-4" />
        <div className="space-y-2">
          {loans.slice(0, 5).map(loan => {
            const passCount = loan.ruleResults.filter(r => r.result === 'Pass').length;
            const total = loan.ruleResults.length;
            const pct = Math.round((passCount / total) * 100);
            const statusColor = loan.ruleStatus === 'Pass' ? 'text-emerald-600' : loan.ruleStatus === 'Fail' ? 'text-red-600' : 'text-amber-600';
            return (
              <div key={loan.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{loan.borrowerName}</span>
                    <span className="text-xs text-slate-400">{loan.id}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 w-16 text-right">{passCount}/{total} rules</span>
                  </div>
                </div>
                <span className={`text-sm font-bold ${statusColor}`}>{loan.ruleStatus}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
