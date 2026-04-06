import { CheckCircle2, XCircle } from 'lucide-react';
import { DOC_SHORT_NAMES } from '../../data/mockData';

export default function ComplianceHeatmap({ data }) {
  if (!data.length) return null;
  const docTypes = data[0]?.docs.map(d => d.type) || [];

  const completenessScore = (row) => {
    const present = row.docs.filter(d => d.present).length;
    return Math.round((present / row.docs.length) * 100);
  };

  return (
    <div className="card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-800">Document Compliance Heatmap</h3>
        <p className="text-xs text-slate-400 mt-0.5">Document completeness per loan — green = present, red = missing</p>
      </div>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left px-2 py-2 text-slate-500 font-semibold min-w-[130px] sticky left-0 bg-white">Loan / Borrower</th>
              {docTypes.map(dt => (
                <th key={dt} className="px-1 py-2 text-center">
                  <div className="text-[10px] text-slate-400 font-medium w-16 mx-auto leading-tight">
                    {DOC_SHORT_NAMES[dt] || dt}
                  </div>
                </th>
              ))}
              <th className="px-2 py-2 text-center text-slate-500 font-semibold min-w-[80px]">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => {
              const score = completenessScore(row);
              return (
                <tr key={row.loanId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-2 py-2 sticky left-0 bg-inherit">
                    <p className="font-mono font-semibold text-blue-600 text-[11px]">{row.loanId}</p>
                    <p className="text-slate-500 text-[10px] truncate max-w-[120px]">{row.borrower}</p>
                  </td>
                  {row.docs.map((doc) => (
                    <td key={doc.type} className="px-1 py-2">
                      <div className="flex justify-center">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                          doc.present
                            ? 'bg-emerald-50 text-emerald-500 ring-1 ring-emerald-100'
                            : 'bg-red-50 text-red-400 ring-1 ring-red-100'
                        }`}>
                          {doc.present
                            ? <CheckCircle2 size={13} />
                            : <XCircle size={13} />
                          }
                        </div>
                      </div>
                    </td>
                  ))}
                  <td className="px-2 py-2">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${score === 100 ? 'bg-emerald-500' : score >= 70 ? 'bg-amber-400' : 'bg-red-400'}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className={`font-bold text-[11px] ${score === 100 ? 'text-emerald-600' : score >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                          {score}%
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
        <span className="flex items-center gap-1"><CheckCircle2 size={13} className="text-emerald-500" /> Document Present</span>
        <span className="flex items-center gap-1"><XCircle size={13} className="text-red-400" /> Document Missing</span>
      </div>
    </div>
  );
}
