export default function StatusFunnel({ data }) {
  const max = data[0]?.count || 1;

  return (
    <div className="card p-5">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-slate-800">Loan Status Funnel</h3>
        <p className="text-xs text-slate-400 mt-0.5">Loans progressing through each pipeline stage</p>
      </div>

      <div className="space-y-3">
        {data.map((item, i) => {
          const widthPct = Math.round((item.count / max) * 100);
          const dropOff = i > 0 ? data[i - 1].count - item.count : 0;
          return (
            <div key={item.stage}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-600">{item.stage}</span>
                <div className="flex items-center gap-2">
                  {dropOff > 0 && (
                    <span className="text-[10px] text-slate-400">-{dropOff} dropped</span>
                  )}
                  <span className="text-xs font-bold text-slate-800 w-6 text-right">{item.count}</span>
                </div>
              </div>
              <div className="relative flex justify-center">
                <div
                  className="h-8 rounded-lg flex items-center justify-center text-white text-xs font-semibold transition-all duration-500 shadow-sm"
                  style={{
                    width: `${widthPct}%`,
                    minWidth: '40px',
                    background: item.color,
                    opacity: 0.85 + (0.15 * (1 - i / data.length)),
                  }}
                >
                  {widthPct >= 20 && `${Math.round((item.count / max) * 100)}%`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
        <div className="bg-emerald-50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-emerald-700">
            {data[data.length - 1]?.count || 0}
          </p>
          <p className="text-xs text-emerald-600">Completed</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-slate-700">
            {max - (data[data.length - 1]?.count || 0)}
          </p>
          <p className="text-xs text-slate-500">In Progress</p>
        </div>
      </div>
    </div>
  );
}
