import { useState, useMemo } from 'react';
import useAppStore from '../../store/useAppStore';
import { Table, THead, TH, TBody, TR, TD } from '../../components/common/Table';
import { StatusBadge } from '../../components/common/Badge';
import { SearchInput, Select } from '../../components/common/Input';
import Pagination from '../../components/common/Pagination';
import Card from '../../components/common/Card';
import { loanTypes, stages } from '../../data/mockData';

const PER_PAGE = 10;

export default function LoanStatusTable() {
  const { loans } = useAppStore();

  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('all');
  const [type, setType]       = useState('all');
  const [stageF, setStageF]   = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]   = useState('');
  const [page, setPage]       = useState(1);
  const [sort, setSort]       = useState({ field: 'lastUpdated', dir: 'desc' });

  const filtered = useMemo(() => {
    let list = [...loans];
    if (status !== 'all') list = list.filter(l => l.ruleStatus === status);
    if (type   !== 'all') list = list.filter(l => l.loanType === type);
    if (stageF !== 'all') list = list.filter(l => l.stage === stageF);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(l => l.id.toLowerCase().includes(q) || l.borrowerName.toLowerCase().includes(q));
    }
    if (dateFrom) list = list.filter(l => l.submissionDate >= dateFrom);
    if (dateTo)   list = list.filter(l => l.submissionDate <= dateTo);
    list.sort((a, b) => {
      const aV = a[sort.field] || '';
      const bV = b[sort.field] || '';
      return sort.dir === 'asc' ? aV.localeCompare(bV) : bV.localeCompare(aV);
    });
    return list;
  }, [loans, search, status, type, stageF, dateFrom, dateTo, sort]);

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const handleSort = (field) => {
    setSort(s => ({ field, dir: s.field === field && s.dir === 'asc' ? 'desc' : 'asc' }));
    setPage(1);
  };

  const stageLabel = (stage) => {
    const map = {
      'Document Ingested': 'Ingested',
      'In Rule Review': 'In Review',
    };
    return map[stage] || stage;
  };

  const stageColor = (stage) => {
    const map = {
      'Completed': 'text-emerald-700 bg-emerald-50',
      'Failed':    'text-red-700 bg-red-50',
      'Pending':   'text-amber-700 bg-amber-50',
      'In Rule Review': 'text-blue-700 bg-blue-50',
      'Extracted': 'text-purple-700 bg-purple-50',
      'Classified': 'text-sky-700 bg-sky-50',
      'Document Ingested': 'text-slate-700 bg-slate-100',
    };
    return map[stage] || 'text-slate-600 bg-slate-100';
  };

  const clearFilters = () => {
    setSearch(''); setStatus('all'); setType('all'); setStageF('all');
    setDateFrom(''); setDateTo(''); setPage(1);
  };

  const hasFilters = search || status !== 'all' || type !== 'all' || stageF !== 'all' || dateFrom || dateTo;

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Filter panel */}
      <Card className="py-4">
        <div className="flex flex-wrap items-end gap-3">
          <SearchInput
            value={search}
            onChange={v => { setSearch(v); setPage(1); }}
            placeholder="Search loan ID or borrower..."
            className="w-60"
          />
          <Select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="w-36 py-1.5">
            <option value="all">All Statuses</option>
            <option value="Pass">Pass</option>
            <option value="Partial">Partial</option>
            <option value="Fail">Fail</option>
          </Select>
          <Select value={type} onChange={e => { setType(e.target.value); setPage(1); }} className="w-36 py-1.5">
            <option value="all">All Types</option>
            {loanTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select value={stageF} onChange={e => { setStageF(e.target.value); setPage(1); }} className="w-44 py-1.5">
            <option value="all">All Stages</option>
            {stages.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
          <div className="flex items-end gap-2">
            <div>
              <label className="text-xs text-slate-500 block mb-1">From</label>
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                className="px-2 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">To</label>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
                className="px-2 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
              Clear filters ×
            </button>
          )}
          <span className="ml-auto text-xs text-slate-400">{filtered.length} of {loans.length} loans</span>
        </div>
      </Card>

      {/* Table */}
      <Card noPad>
        <Table>
          <THead>
            <tr>
              <TH sortable sorted={sort.field === 'id'} dir={sort.dir} onSort={() => handleSort('id')}>Loan ID</TH>
              <TH sortable sorted={sort.field === 'borrowerName'} dir={sort.dir} onSort={() => handleSort('borrowerName')}>Borrower Name</TH>
              <TH sortable sorted={sort.field === 'loanType'} dir={sort.dir} onSort={() => handleSort('loanType')}>Loan Type</TH>
              <TH>Amount</TH>
              <TH sortable sorted={sort.field === 'stage'} dir={sort.dir} onSort={() => handleSort('stage')}>Current Stage</TH>
              <TH sortable sorted={sort.field === 'ruleStatus'} dir={sort.dir} onSort={() => handleSort('ruleStatus')}>Pass/Fail</TH>
              <TH sortable sorted={sort.field === 'lastUpdated'} dir={sort.dir} onSort={() => handleSort('lastUpdated')}>Last Updated</TH>
              <TH sortable sorted={sort.field === 'submissionDate'} dir={sort.dir} onSort={() => handleSort('submissionDate')}>Submitted</TH>
            </tr>
          </THead>
          <TBody>
            {paginated.length === 0 ? (
              <TR>
                <TD className="text-center py-12 text-slate-400">No loans match your current filters.</TD>
              </TR>
            ) : paginated.map(loan => (
              <TR key={loan.id}>
                <TD className="font-mono text-xs text-blue-700 font-semibold">{loan.id}</TD>
                <TD className="font-medium text-slate-900 whitespace-nowrap">{loan.borrowerName}</TD>
                <TD>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600 font-medium">{loan.loanType}</span>
                </TD>
                <TD className="text-slate-600 font-medium">{loan.amount}</TD>
                <TD>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${stageColor(loan.stage)}`}>
                    {stageLabel(loan.stage)}
                  </span>
                </TD>
                <TD><StatusBadge status={loan.ruleStatus} /></TD>
                <TD className="text-slate-500 text-xs">{loan.lastUpdated}</TD>
                <TD className="text-slate-500 text-xs">{loan.submissionDate}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
        <div className="px-5 pb-4">
          <Pagination page={page} totalPages={totalPages} onPage={setPage} total={filtered.length} perPage={PER_PAGE} />
        </div>
      </Card>
    </div>
  );
}
