import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  getPassFailData, getLoanTypeData, getStageFunnelData,
  getRuleFailureData, getComplianceData
} from '../data/mockData';
import PassFailChart from '../components/Analytics/PassFailChart';
import LoanDistributionChart from '../components/Analytics/LoanDistributionChart';
import StatusFunnel from '../components/Analytics/StatusFunnel';
import RuleFailureChart from '../components/Analytics/RuleFailureChart';
import ComplianceHeatmap from '../components/Analytics/ComplianceHeatmap';
import KPICard from '../components/common/KPICard';
import { BarChart2, TrendingUp, ShieldAlert, FileCheck } from 'lucide-react';

export default function AnalyticsPage() {
  const { loans } = useApp();

  const passFailData    = useMemo(() => getPassFailData(loans), [loans]);
  const loanTypeData    = useMemo(() => getLoanTypeData(loans), [loans]);
  const funnelData      = useMemo(() => getStageFunnelData(loans), [loans]);
  const ruleFailData    = useMemo(() => getRuleFailureData(loans), [loans]);
  const complianceData  = useMemo(() => getComplianceData(loans), [loans]);

  const completed       = loans.filter(l => l.currentStage === 'Completed');
  const passRate        = completed.length ? Math.round((completed.filter(l => l.status === 'Pass').length / completed.length) * 100) : 0;
  const totalRuleFails  = loans.reduce((s, l) => s + l.ruleResults.filter(r => r.status === 'Fail').length, 0);
  const docsPerLoan     = loans.filter(l => l.extractedDocuments.length > 0);
  const avgDocs         = docsPerLoan.length ? (docsPerLoan.reduce((s, l) => s + l.extractedDocuments.length, 0) / docsPerLoan.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Analytics & Reporting</h2>
        <p className="text-sm text-slate-500 mt-0.5">Comprehensive loan intelligence metrics and compliance reporting</p>
      </div>

      {/* Quick Analytics KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Processed"
          value={completed.length}
          icon={<BarChart2 size={20} />}
          iconBg="bg-blue-50" iconColor="text-blue-600"
          sub={`${loans.length - completed.length} still in progress`}
        />
        <KPICard
          label="Approval Rate"
          value={`${passRate}%`}
          icon={<TrendingUp size={20} />}
          iconBg="bg-emerald-50" iconColor="text-emerald-600"
          sub="Of completed loans"
          subColor="text-emerald-600"
        />
        <KPICard
          label="Rule Failures"
          value={totalRuleFails}
          icon={<ShieldAlert size={20} />}
          iconBg="bg-red-50" iconColor="text-red-600"
          sub={`Across ${ruleFailData.length} distinct rules`}
          subColor="text-red-500"
        />
        <KPICard
          label="Avg Docs / Loan"
          value={avgDocs}
          icon={<FileCheck size={20} />}
          iconBg="bg-violet-50" iconColor="text-violet-600"
          sub="For loans with data extracted"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PassFailChart data={passFailData} />
        <LoanDistributionChart data={loanTypeData} />
        <StatusFunnel data={funnelData} />
        <RuleFailureChart data={ruleFailData} />
      </div>

      {/* Compliance Heatmap — full width */}
      <ComplianceHeatmap data={complianceData} />
    </div>
  );
}
