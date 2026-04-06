import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FunnelIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import useAppStore from '../../store/useAppStore';
import { Table, THead, TH, TBody, TR, TD } from '../../components/common/Table';
import { StatusBadge } from '../../components/common/Badge';
import { SearchInput, Select } from '../../components/common/Input';
import Pagination from '../../components/common/Pagination';
import Card from '../../components/common/Card';
import { loanTypes, stages } from '../../data/mockData';

const PER_PAGE = 8;

export default function LoanList() {
  const { loans, loanSort, setLoanFilter, setLoanSort } = useAppStore();
  const navigate = useNavigate();

  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('all');
  const [type, setType]         = useState('all');
  const [stage, setStage]       = useState('all');
  const [page, setPage]         = useState(1);
  const [sort, setSortLocal]    = useState({ field: 'submissionDate', dir: 'desc' });

  const filtered = useMemo(() => {
    let list = [...loans];
    if (status !== 'all') list = list.filter(l => l.ruleStatus === status);
    if (type   !== 'all') list = list.filter(l => l.loanType === type);
    if (stage  !== 'all') list = list.filter(l => l.stage === stage);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(l => l.id.toLowerCase().includes(q) || l.borrowerName.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      const aVal = a[sort.field] || '';
      const bVal = b[sort.field] || '';
      return sort.dir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    return list;
  }, [loans, search, status, type, stage, sort]);

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const handleSort = (field) => {
    setSortLocal(s => ({ field, dir: s.field === field && s.dir === 'asc' ? 'desc' : 'asc' }));
    setPage(1);
  };

  const handleFilter = (key, val) => {
    if (key === 'status') setStatus(val);
    if (key === 'type') setType(val);
    if (key === 'stage') setStage(val);
    setPage(1);
  };

  const passCount    = loans.filter(l => l.ruleStatus === 'Pass').length;
  const partialCount = loans.filter(l => l.ruleStatus === 'Partial').length;
  const failCount    = loans.filter(l => l.ruleStatus === 'Fail').length;

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Quick summary pills */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'All Loans', value: loans.length, active: status === 'all', onClick: () => handleFilter('status', 'all'), color: 'bg-slate-100 text-slate-700' },
          { label: 'Pass', value: passCount, active: status === 'Pass', onClick: () => handleFilter('status', 'Pass'), color: 'bg-emerald-100 text-emerald-700' },
          { label: 'Partial', value: partialCount, active: status === 'Partial', onClick: () => handleFilter('status', 'Partial'), color: 'bg-amber-100 text-amber-700' },
          { label: 'Fail', value: failCount, active: status === 'Fail', onClick: () => handleFilter('status', 'Fail'), color: 'bg-red-100 text-red-700' },
        ].map(p => (
          <button
            key={p.label}
            onClick={p.onClick}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
              p.active ? `${p.color} border-current` : `${p.color} border-transparent hover:border-current`
            }`}
          >
            {p.label} <span className="font-bold ml-1">{p.value}</span>
          </button>
        ))}
      </div>

      <Card noPad>
        {/* Filters bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 flex-wrap">
          <FunnelIcon className="w-4 h-4 text-slate-400 shrink-0" />
          <SearchInput
            value={search}
            onChange={v => { setSearch(v); setPage(1); }}
            placeholder="Search by loan ID or borrower..."
            className="w-56"
          />
          <Select value={type} onChange={e => handleFilter('type', e.target.value)} className="w-36 py-1.5">
            <option value="all">All Types</option>
            {loanTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select value={stage} onChange={e => handleFilter('stage', e.target.value)} className="w-44 py-1.5">
            <option value="all">All Stages</option>
            {stages.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} results</span>
        </div>

        {/* Table */}
        <Table>
          <THead>
            <tr>
              <TH sortable sorted={sort.field === 'id'} dir={sort.dir} onSort={() => handleSort('id')}>Loan ID</TH>
              <TH sortable sorted={sort.field === 'borrowerName'} dir={sort.dir} onSort={() => handleSort('borrowerName')}>Borrower Name</TH>
              <TH>Loan Type</TH>
              <TH sortable sorted={sort.field === 'submissionDate'} dir={sort.dir} onSort={() => handleSort('submissionDate')}>Submission Date</TH>
              <TH>Stage</TH>
              <TH sortable sorted={sort.field === 'ruleStatus'} dir={sort.dir} onSort={() => handleSort('ruleStatus')}>Rule Status</TH>
              <TH>Rules</TH>
              <TH>Action</TH>
            </tr>
          </THead>
          <TBody>
            {paginated.length === 0 ? (
              <TR>
                <TD className="text-center py-10 text-slate-400" colSpan={8}>No loans match your filters</TD>
              </TR>
            ) : paginated.map(loan => {
              const passCount = loan.ruleResults.filter(r => r.result === 'Pass').length;
              const total = loan.ruleResults.length;
              return (
                <TR key={loan.id} onClick={() => navigate(`/rules/loans/${loan.id}`)}>
                  <TD className="font-mono text-xs text-blue-700 font-semibold">{loan.id}</TD>
                  <TD className="font-medium text-slate-900">{loan.borrowerName}</TD>
                  <TD>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600 font-medium">{loan.loanType}</span>
                  </TD>
                  <TD className="text-slate-500">{loan.submissionDate}</TD>
                  <TD className="text-xs text-slate-600">{loan.stage}</TD>
                  <TD><StatusBadge status={loan.ruleStatus} /></TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${passCount/total >= 0.75 ? 'bg-emerald-500' : passCount/total >= 0.5 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${(passCount/total)*100}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{passCount}/{total}</span>
                    </div>
                  </TD>
                  <TD>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/rules/loans/${loan.id}`); }}
                      className="text-xs text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors"
                    >
                      View Details
                    </button>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>

        <div className="px-5 pb-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPage={setPage}
            total={filtered.length}
            perPage={PER_PAGE}
          />
        </div>
      </Card>
    </div>
  );
}
