import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Spinner from './components/common/Spinner';

// ─── Lazy-loaded module pages ────────────────────────────────────────────────
const OverviewDashboard    = lazy(() => import('./modules/OverviewDashboard'));
const DocumentUpload       = lazy(() => import('./modules/classification/DocumentUpload'));
const ClassificationResults = lazy(() => import('./modules/classification/ClassificationResults'));
const ExtractionView       = lazy(() => import('./modules/classification/ExtractionView'));
const RulesDashboard       = lazy(() => import('./modules/rules/RulesDashboard'));
const LoanList             = lazy(() => import('./modules/rules/LoanList'));
const RuleExecutionDetail  = lazy(() => import('./modules/rules/RuleExecutionDetail'));
const PipelineTracker      = lazy(() => import('./modules/management/PipelineTracker'));
const LoanStatusTable      = lazy(() => import('./modules/management/LoanStatusTable'));
const AnalyticsDashboard   = lazy(() => import('./modules/management/AnalyticsDashboard'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-slate-400 font-medium">Loading…</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AppLayout />}>
            {/* Overview */}
            <Route index element={<OverviewDashboard />} />

            {/* Module 1 – Document Classification & Extraction */}
            <Route path="classification">
              <Route index element={<Navigate to="upload" replace />} />
              <Route path="upload"      element={<DocumentUpload />} />
              <Route path="results"     element={<ClassificationResults />} />
              <Route path="extraction"  element={<ExtractionView />} />
            </Route>

            {/* Module 2 – Rule Reviewer Portal */}
            <Route path="rules">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<RulesDashboard />} />
              <Route path="loans"     element={<LoanList />} />
              <Route path="loans/:loanId" element={<RuleExecutionDetail />} />
            </Route>

            {/* Module 3 – Management & Reporting */}
            <Route path="management">
              <Route index element={<Navigate to="pipeline" replace />} />
              <Route path="pipeline"  element={<PipelineTracker />} />
              <Route path="status"    element={<LoanStatusTable />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
