import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';

const ALL_STAGES = [
  { key: 'uploading',   label: 'Uploading Package'       },
  { key: 'extracting',  label: 'Extracting ZIP Contents' },
  { key: 'classifying', label: 'Classifying Documents'   },
  { key: 'validating',  label: 'Validating Loan Records' },
  { key: 'rules',       label: 'Running Rule Engine'     },
  { key: 'completed',   label: 'Processing Complete'     },
];

function fmt(ms) {
  if (ms == null) return '';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function fmtTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function StageTimeline({ pkg }) {
  const { stageHistory = [], currentStageKey, status } = pkg;

  return (
    <div className="space-y-0">
      {ALL_STAGES.map((stage, i) => {
        const hist   = stageHistory.find(h => h.key === stage.key);
        const isActive   = currentStageKey === stage.key && status === 'processing';
        const isDone     = !!hist?.completedAt;
        const isPending  = !hist && !isActive;
        const isFailed   = status === 'failed' && currentStageKey === stage.key;

        return (
          <div key={stage.key} className="flex gap-3">
            {/* Spine */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center z-10 flex-shrink-0 transition-all ${
                isFailed  ? 'bg-red-100'     :
                isDone    ? 'bg-emerald-100' :
                isActive  ? 'bg-blue-100'    :
                            'bg-slate-100'
              }`}>
                {isFailed  ? <XCircle   size={15} className="text-red-500" />     :
                 isDone    ? <CheckCircle2 size={15} className="text-emerald-500" /> :
                 isActive  ? <Loader2   size={15} className="text-blue-500 animate-spin" /> :
                             <Circle    size={13} className="text-slate-300" />
                }
              </div>
              {i < ALL_STAGES.length - 1 && (
                <div className={`w-0.5 flex-1 my-0.5 min-h-[20px] rounded-full ${isDone ? 'bg-emerald-200' : 'bg-slate-100'}`} />
              )}
            </div>

            {/* Content */}
            <div className={`pb-4 flex-1 min-w-0 ${i === ALL_STAGES.length - 1 ? 'pb-0' : ''}`}>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className={`text-sm font-semibold leading-tight ${
                  isFailed ? 'text-red-600' :
                  isDone   ? 'text-slate-800' :
                  isActive ? 'text-blue-700' :
                             'text-slate-400'
                }`}>
                  {stage.label}
                  {isActive && (
                    <span className="ml-2 text-xs font-normal text-blue-500 animate-pulse">Processing…</span>
                  )}
                </p>
                {hist?.durationMs != null && (
                  <span className="text-[11px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 flex-shrink-0">
                    {fmt(hist.durationMs)}
                  </span>
                )}
              </div>
              {hist?.startedAt && (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Started {fmtTime(hist.startedAt)}
                  {hist.completedAt && ` · Completed ${fmtTime(hist.completedAt)}`}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
