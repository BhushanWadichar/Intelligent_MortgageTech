import { create } from 'zustand';
import { mockDocuments, mockLoans, mockDashboardStats, mockAnalytics } from '../data/mockData';

// Simulate async API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const useAppStore = create((set, get) => ({
  // ─── Upload / Classification State ───────────────────────────────────────
  uploadedFiles: [],
  classifiedDocuments: [...mockDocuments],
  activeDocument: null,
  activeField: null,
  uploadProgress: {},
  isClassifying: false,
  classificationError: null,

  setActiveDocument: (doc) => set({ activeDocument: doc, activeField: null }),
  setActiveField: (fieldId) => set({ activeField: fieldId }),

  uploadFiles: async (files) => {
    const newEntries = files.map(f => ({
      id: `upload-${Date.now()}-${f.name}`,
      file: f,
      name: f.name,
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      progress: 0,
      status: 'uploading',
    }));
    set(s => ({ uploadedFiles: [...s.uploadedFiles, ...newEntries] }));

    // Simulate per-file upload progress
    for (const entry of newEntries) {
      for (let p = 10; p <= 100; p += 10) {
        await delay(80);
        set(s => ({
          uploadedFiles: s.uploadedFiles.map(f =>
            f.id === entry.id ? { ...f, progress: p } : f
          ),
        }));
      }
      set(s => ({
        uploadedFiles: s.uploadedFiles.map(f =>
          f.id === entry.id ? { ...f, status: 'done' } : f
        ),
      }));
    }
    get().triggerClassification(newEntries);
  },

  triggerClassification: async (entries) => {
    set({ isClassifying: true, classificationError: null });
    await delay(1500);
    const types = ['Paystub', 'W-2', 'Bank Statement', 'Tax Return', '1003 Application'];
    const newDocs = entries.map((e, i) => ({
      id: e.id,
      name: e.name,
      type: e.name.toLowerCase().includes('pdf') ? 'PDF' : 'Image',
      size: e.size,
      classifiedAs: types[i % types.length],
      confidence: Math.floor(Math.random() * 15) + 82,
      status: 'classified',
      pages: Math.floor(Math.random() * 4) + 1,
      uploadedAt: new Date().toISOString(),
      extractedFields: {},
    }));
    set(s => ({
      classifiedDocuments: [...s.classifiedDocuments, ...newDocs],
      isClassifying: false,
    }));
  },

  overrideClassification: (docId, newType) => {
    set(s => ({
      classifiedDocuments: s.classifiedDocuments.map(d =>
        d.id === docId ? { ...d, classifiedAs: newType, status: 'classified', confidence: 100 } : d
      ),
    }));
  },

  updateField: (docId, sectionKey, fieldId, newValue) => {
    set(s => ({
      classifiedDocuments: s.classifiedDocuments.map(d => {
        if (d.id !== docId) return d;
        return {
          ...d,
          extractedFields: {
            ...d.extractedFields,
            [sectionKey]: d.extractedFields[sectionKey].map(f =>
              f.id === fieldId ? { ...f, value: newValue } : f
            ),
          },
        };
      }),
    }));
  },

  // ─── Loans / Rules State ─────────────────────────────────────────────────
  loans: mockLoans,
  selectedLoan: null,
  loanFilter: { status: 'all', type: 'all', stage: 'all', search: '' },
  loanSort: { field: 'submissionDate', dir: 'desc' },
  isLoadingLoans: false,

  selectLoan: (loanId) => {
    const loan = get().loans.find(l => l.id === loanId) || null;
    set({ selectedLoan: loan });
  },
  clearSelectedLoan: () => set({ selectedLoan: null }),

  setLoanFilter: (filter) => set(s => ({ loanFilter: { ...s.loanFilter, ...filter } })),
  setLoanSort: (sort) => set({ loanSort: sort }),

  getFilteredLoans: () => {
    const { loans, loanFilter, loanSort } = get();
    let list = [...loans];
    if (loanFilter.status !== 'all') list = list.filter(l => l.ruleStatus === loanFilter.status);
    if (loanFilter.type !== 'all') list = list.filter(l => l.loanType === loanFilter.type);
    if (loanFilter.stage !== 'all') list = list.filter(l => l.stage === loanFilter.stage);
    if (loanFilter.search) {
      const q = loanFilter.search.toLowerCase();
      list = list.filter(l =>
        l.id.toLowerCase().includes(q) || l.borrowerName.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const aVal = a[loanSort.field] || '';
      const bVal = b[loanSort.field] || '';
      return loanSort.dir === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
    return list;
  },

  // ─── Dashboard / Analytics ────────────────────────────────────────────────
  dashboardStats: mockDashboardStats,
  analytics: mockAnalytics,

  // ─── Pipeline Modal State ─────────────────────────────────────────────────
  pipelineModal: null,  // { loanId, type: 'extraction' | 'rules' }
  openPipelineModal: (loanId, type) => set({ pipelineModal: { loanId, type } }),
  closePipelineModal: () => set({ pipelineModal: null }),
}));

export default useAppStore;
