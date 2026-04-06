import { useApp } from '../context/AppContext';
import FilterBar from '../components/LoanTable/FilterBar';
import LoanStatusTable from '../components/LoanTable/LoanStatusTable';

export default function LoanStatusPage() {
  const { filteredLoans, loans } = useApp();

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Loan Status Summary</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Showing {filteredLoans.length} of {loans.length} total loans
          </p>
        </div>
        <button className="btn-secondary text-sm hidden sm:flex">
          Export CSV
        </button>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Table */}
      <LoanStatusTable loans={filteredLoans} />
    </div>
  );
}
