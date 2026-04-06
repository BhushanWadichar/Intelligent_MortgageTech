import { useState, useCallback, useRef } from 'react';

// ─── Helpers ────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10).toUpperCase();

const DOC_TYPES = [
  'W-2 Wage Statement',
  'Federal Tax Return (1040)',
  'Bank Statement',
  'Employment Letter',
  'Property Appraisal',
  'Credit Report',
  'Title Report',
  'Purchase Agreement',
  'HOI Policy',
  'Flood Cert',
];

const LOAN_TYPES = ['Conventional', 'FHA', 'VA', 'Jumbo'];

function generateFiles(estimatedLoans) {
  const files = [];
  for (let i = 0; i < estimatedLoans; i++) {
    const loanId = `LN-${new Date().getFullYear()}-${String(1000 + i).padStart(4, '0')}`;
    const loanType = LOAN_TYPES[Math.floor(Math.random() * LOAN_TYPES.length)];
    const docsForLoan = DOC_TYPES.slice(0, 5 + Math.floor(Math.random() * 5));
    docsForLoan.forEach(docType => {
      const slug = docType.toLowerCase().replace(/[^a-z0-9]/g, '_');
      files.push({
        id: uid(),
        name: `${loanId}_${slug}.pdf`,
        loanId,
        loanType,
        docType,
        size: Math.floor(80 + Math.random() * 900) * 1024, // 80KB – 980KB
        status: 'queued', // queued | processing | success | failed
        processedAt: null,
      });
    });
  }
  return files;
}

const STAGES = [
  { key: 'uploading',    label: 'Uploading Package',         durationMs: 1800 },
  { key: 'extracting',   label: 'Extracting ZIP Contents',   durationMs: 2200 },
  { key: 'classifying',  label: 'Classifying Documents',     durationMs: 3000 },
  { key: 'validating',   label: 'Validating Loan Records',   durationMs: 2500 },
  { key: 'rules',        label: 'Running Rule Engine',       durationMs: 3500 },
  { key: 'completed',    label: 'Processing Complete',       durationMs: 0    },
];

// ─── Hook ────────────────────────────────────────────────────────────────────

export function usePackageProcessor() {
  const [packages, setPackages] = useState([]);
  const timers = useRef({});

  const updatePkg = useCallback((id, patch) => {
    setPackages(prev =>
      prev.map(p => p.id === id ? { ...p, ...patch } : p)
    );
  }, []);

  const processStages = useCallback((pkgId, stageIndex, startTime) => {
    if (stageIndex >= STAGES.length - 1) {
      // Final stage — completed
      const elapsed = Date.now() - startTime;
      setPackages(prev =>
        prev.map(p => {
          if (p.id !== pkgId) return p;
          const failChance = Math.random() < 0.08; // 8% chance of partial failure
          const files = p.files.map(f => ({
            ...f,
            status: Math.random() < (failChance ? 0.12 : 0.02) ? 'failed' : 'success',
            processedAt: new Date().toISOString(),
          }));
          const successCount = files.filter(f => f.status === 'success').length;
          const failedCount  = files.filter(f => f.status === 'failed').length;
          return {
            ...p,
            status: failedCount > 0 ? 'completed_with_errors' : 'completed',
            currentStageKey: 'completed',
            currentStageLabel: 'Processing Complete',
            stageIndex: STAGES.length - 1,
            completedAt: new Date().toISOString(),
            processingMs: elapsed,
            progress: 100,
            files,
            successCount,
            failedCount,
            stageHistory: [
              ...p.stageHistory,
              {
                key: 'completed',
                label: 'Processing Complete',
                startedAt: new Date().toISOString(),
                completedAt: new Date().toISOString(),
                durationMs: 0,
              },
            ],
          };
        })
      );
      return;
    }

    const stage = STAGES[stageIndex];
    const nextStage = STAGES[stageIndex + 1];
    const stageStart = new Date().toISOString();
    const progressAtStage = Math.round(((stageIndex + 1) / (STAGES.length - 1)) * 100);

    updatePkg(pkgId, {
      status: 'processing',
      currentStageKey: stage.key,
      currentStageLabel: stage.label,
      stageIndex,
      progress: progressAtStage,
    });

    // Append to stageHistory
    setPackages(prev =>
      prev.map(p => {
        if (p.id !== pkgId) return p;
        const hist = [...(p.stageHistory || [])];
        const existing = hist.findIndex(h => h.key === stage.key);
        if (existing >= 0) return p;
        return {
          ...p,
          stageHistory: [...hist, {
            key: stage.key,
            label: stage.label,
            startedAt: stageStart,
            completedAt: null,
            durationMs: null,
          }],
        };
      })
    );

    const jitter = (Math.random() - 0.5) * 600; // ±300ms natural jitter
    const tid = setTimeout(() => {
      // Mark this stage complete in history
      const stageEnd = new Date().toISOString();
      setPackages(prev =>
        prev.map(p => {
          if (p.id !== pkgId) return p;
          return {
            ...p,
            stageHistory: p.stageHistory.map(h =>
              h.key === stage.key
                ? { ...h, completedAt: stageEnd, durationMs: stage.durationMs + jitter }
                : h
            ),
          };
        })
      );
      processStages(pkgId, stageIndex + 1, startTime);
    }, stage.durationMs + jitter);

    timers.current[`${pkgId}-${stageIndex}`] = tid;
  }, [updatePkg]);

  const addPackage = useCallback((file) => {
    const estimatedLoans = Math.max(5, Math.floor(file.size / 150000)); // ~150KB per loan
    const cappedLoans = Math.min(estimatedLoans, 120); // cap display at 120 files
    const files = generateFiles(cappedLoans);

    const pkg = {
      id: uid(),
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      status: 'processing',
      currentStageKey: 'uploading',
      currentStageLabel: 'Uploading Package',
      stageIndex: 0,
      progress: 0,
      completedAt: null,
      processingMs: null,
      totalFiles: files.length,
      successCount: 0,
      failedCount: 0,
      files,
      stageHistory: [],
      expanded: false,
    };

    setPackages(prev => [pkg, ...prev]);
    processStages(pkg.id, 0, Date.now());
    return pkg.id;
  }, [processStages]);

  const toggleExpand = useCallback((id) => {
    setPackages(prev =>
      prev.map(p => p.id === id ? { ...p, expanded: !p.expanded } : p)
    );
  }, []);

  return { packages, addPackage, toggleExpand };
}
