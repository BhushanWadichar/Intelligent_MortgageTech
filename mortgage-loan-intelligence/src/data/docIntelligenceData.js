// ─── Helpers ────────────────────────────────────────────────────────────────

const bb = (x, y, w, h, page = 0) => ({ x, y, w, h, page });
const uid = () => Math.random().toString(36).slice(2, 9);

export const DOCUMENT_TYPES_LIST = [
  'W-2 Wage Statement',
  'Federal Tax Return (1040)',
  'Bank Statement',
  'Employment Verification Letter',
  'Property Appraisal Report',
  'Credit Report',
  'Title Search Report',
  'Pay Stub',
  '1003 Loan Application',
  'Purchase Agreement',
  'Unclassified',
];

// ─── Document Templates ──────────────────────────────────────────────────────

const makeW2 = (id, loanId, borrower, employer, wages) => ({
  id, loanId, borrowerName: borrower,
  fileName: `${borrower.split(' ')[1].toLowerCase()}_w2_2023.pdf`,
  fileSize: 245760, uploadedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  totalPages: 2,
  classifiedType: 'W-2 Wage Statement',
  confidence: 0.97, isUnclassified: false, pipelineStatus: 'complete',
  sections: [
    {
      id: 'employer-info', label: 'Employer Information',
      fields: [
        { id: `${id}-f1`, label: 'Employer Name',    value: employer,        confidence: 0.98, page: 0, bbox: bb(0.05, 0.09, 0.42, 0.038) },
        { id: `${id}-f2`, label: 'Employer EIN',     value: '82-4421703',    confidence: 0.97, page: 0, bbox: bb(0.05, 0.04, 0.35, 0.038) },
        { id: `${id}-f3`, label: 'Employer Address', value: '100 Corp Blvd, Austin TX 78701', confidence: 0.94, page: 0, bbox: bb(0.05, 0.14, 0.42, 0.038) },
      ],
    },
    {
      id: 'employee-info', label: 'Employee Information',
      fields: [
        { id: `${id}-f4`, label: 'Employee SSN',     value: '***-**-4821',   confidence: 0.99, page: 0, bbox: bb(0.55, 0.04, 0.30, 0.038) },
        { id: `${id}-f5`, label: 'Employee Name',    value: borrower,        confidence: 0.99, page: 0, bbox: bb(0.05, 0.62, 0.55, 0.038) },
        { id: `${id}-f6`, label: 'Employee Address', value: '123 Main St, Austin, TX 78702', confidence: 0.93, page: 0, bbox: bb(0.05, 0.68, 0.55, 0.038) },
      ],
    },
    {
      id: 'wages', label: 'Wages & Compensation',
      fields: [
        { id: `${id}-f7`,  label: 'Wages, Tips & Compensation',   value: `$${wages.toLocaleString()}`,                       confidence: 0.99, page: 0, bbox: bb(0.50, 0.30, 0.22, 0.038) },
        { id: `${id}-f8`,  label: 'Federal Income Tax Withheld',  value: `$${Math.round(wages * 0.22).toLocaleString()}`,     confidence: 0.98, page: 0, bbox: bb(0.74, 0.30, 0.22, 0.038) },
        { id: `${id}-f9`,  label: 'Social Security Wages',        value: `$${wages.toLocaleString()}`,                       confidence: 0.98, page: 0, bbox: bb(0.50, 0.37, 0.22, 0.038) },
        { id: `${id}-f10`, label: 'Social Security Tax',          value: `$${Math.round(wages * 0.062).toLocaleString()}`,   confidence: 0.97, page: 0, bbox: bb(0.74, 0.37, 0.22, 0.038) },
        { id: `${id}-f11`, label: 'Medicare Wages',               value: `$${wages.toLocaleString()}`,                       confidence: 0.97, page: 0, bbox: bb(0.50, 0.44, 0.22, 0.038) },
        { id: `${id}-f12`, label: 'Medicare Tax Withheld',        value: `$${Math.round(wages * 0.0145).toLocaleString()}`,  confidence: 0.97, page: 0, bbox: bb(0.74, 0.44, 0.22, 0.038) },
        { id: `${id}-f13`, label: 'Tax Year',                     value: '2023',                                              confidence: 1.00, page: 0, bbox: bb(0.55, 0.55, 0.18, 0.038) },
      ],
    },
    {
      id: 'state-info', label: 'State Tax Information',
      fields: [
        { id: `${id}-f14`, label: 'State',            value: 'TX',                             confidence: 0.99, page: 1, bbox: bb(0.05, 0.10, 0.10, 0.038) },
        { id: `${id}-f15`, label: 'State Wages',      value: `$${wages.toLocaleString()}`,      confidence: 0.98, page: 1, bbox: bb(0.20, 0.10, 0.25, 0.038) },
        { id: `${id}-f16`, label: 'State Income Tax', value: '$0',                              confidence: 0.99, page: 1, bbox: bb(0.47, 0.10, 0.25, 0.038) },
      ],
    },
  ],
});

const makeBankStmt = (id, loanId, borrower, balance) => ({
  id, loanId, borrowerName: borrower,
  fileName: `${borrower.split(' ')[1].toLowerCase()}_bankstmt_q4_2023.pdf`,
  fileSize: 128000, uploadedAt: new Date(Date.now() - 18 * 86400000).toISOString(),
  totalPages: 1,
  classifiedType: 'Bank Statement',
  confidence: 0.95, isUnclassified: false, pipelineStatus: 'complete',
  sections: [
    {
      id: 'account-info', label: 'Account Information',
      fields: [
        { id: `${id}-f1`, label: 'Account Holder',   value: borrower,                        confidence: 0.99, page: 0, bbox: bb(0.05, 0.06, 0.52, 0.038) },
        { id: `${id}-f2`, label: 'Account Number',   value: '****8821',                      confidence: 1.00, page: 0, bbox: bb(0.05, 0.12, 0.35, 0.038) },
        { id: `${id}-f3`, label: 'Statement Period', value: 'Oct 1 – Dec 31, 2023',          confidence: 0.98, page: 0, bbox: bb(0.55, 0.06, 0.40, 0.038) },
        { id: `${id}-f4`, label: 'Bank Name',        value: 'First National Bank of Texas',  confidence: 0.97, page: 0, bbox: bb(0.55, 0.12, 0.40, 0.038) },
      ],
    },
    {
      id: 'balance-summary', label: 'Balance Summary',
      fields: [
        { id: `${id}-f5`, label: 'Opening Balance',       value: `$${Math.round(balance * 0.88).toLocaleString()}.00`, confidence: 0.98, page: 0, bbox: bb(0.55, 0.33, 0.40, 0.038) },
        { id: `${id}-f6`, label: 'Closing Balance',       value: `$${balance.toLocaleString()}.00`,                   confidence: 0.99, page: 0, bbox: bb(0.55, 0.39, 0.40, 0.038) },
        { id: `${id}-f7`, label: 'Average Daily Balance', value: `$${Math.round(balance * 0.93).toLocaleString()}.00`,confidence: 0.97, page: 0, bbox: bb(0.55, 0.45, 0.40, 0.038) },
        { id: `${id}-f8`, label: 'Total Deposits',        value: `$${Math.round(balance * 0.35).toLocaleString()}.00`,confidence: 0.96, page: 0, bbox: bb(0.05, 0.33, 0.45, 0.038) },
        { id: `${id}-f9`, label: 'Total Withdrawals',     value: `$${Math.round(balance * 0.28).toLocaleString()}.00`,confidence: 0.95, page: 0, bbox: bb(0.05, 0.39, 0.45, 0.038) },
      ],
    },
    {
      id: 'compliance-flags', label: 'Compliance Flags',
      fields: [
        { id: `${id}-f10`, label: 'NSF / Overdraft Events',        value: '0',              confidence: 0.99, page: 0, bbox: bb(0.05, 0.56, 0.45, 0.038) },
        { id: `${id}-f11`, label: 'Large Deposits (>$5,000)',      value: 'None detected',  confidence: 0.97, page: 0, bbox: bb(0.05, 0.62, 0.45, 0.038) },
        { id: `${id}-f12`, label: 'Recurring Unexplained Deposits', value: 'None detected', confidence: 0.96, page: 0, bbox: bb(0.05, 0.68, 0.45, 0.038) },
      ],
    },
  ],
});

const make1040 = (id, loanId, borrower, agi) => ({
  id, loanId, borrowerName: borrower,
  fileName: `${borrower.split(' ')[1].toLowerCase()}_1040_2023.pdf`,
  fileSize: 385024, uploadedAt: new Date(Date.now() - 22 * 86400000).toISOString(),
  totalPages: 2,
  classifiedType: 'Federal Tax Return (1040)',
  confidence: 0.94, isUnclassified: false, pipelineStatus: 'complete',
  sections: [
    {
      id: 'filing-info', label: 'Filing Information',
      fields: [
        { id: `${id}-f1`, label: 'Tax Year',             value: '2023',                    confidence: 1.00, page: 0, bbox: bb(0.75, 0.02, 0.20, 0.032) },
        { id: `${id}-f2`, label: 'Primary Taxpayer',     value: borrower,                  confidence: 0.99, page: 0, bbox: bb(0.05, 0.07, 0.55, 0.038) },
        { id: `${id}-f3`, label: 'SSN',                  value: '***-**-4821',             confidence: 0.99, page: 0, bbox: bb(0.63, 0.07, 0.32, 0.038) },
        { id: `${id}-f4`, label: 'Filing Status',        value: 'Married Filing Jointly',  confidence: 0.97, page: 0, bbox: bb(0.05, 0.13, 0.55, 0.038) },
      ],
    },
    {
      id: 'income', label: 'Income',
      fields: [
        { id: `${id}-f5`, label: 'Total Income (Line 9)',      value: `$${Math.round(agi * 1.03).toLocaleString()}`, confidence: 0.98, page: 0, bbox: bb(0.60, 0.43, 0.35, 0.038) },
        { id: `${id}-f6`, label: 'Adjusted Gross Income',     value: `$${agi.toLocaleString()}`,                    confidence: 0.99, page: 0, bbox: bb(0.60, 0.56, 0.35, 0.038) },
        { id: `${id}-f7`, label: 'Standard Deduction',        value: '$27,700',                                     confidence: 0.97, page: 1, bbox: bb(0.60, 0.12, 0.35, 0.038) },
      ],
    },
    {
      id: 'tax-computation', label: 'Tax Computation',
      fields: [
        { id: `${id}-f8`,  label: 'Taxable Income',      value: `$${Math.max(0, agi - 27700).toLocaleString()}`,   confidence: 0.97, page: 1, bbox: bb(0.60, 0.22, 0.35, 0.038) },
        { id: `${id}-f9`,  label: 'Total Tax',           value: `$${Math.round(agi * 0.21).toLocaleString()}`,     confidence: 0.96, page: 1, bbox: bb(0.60, 0.38, 0.35, 0.038) },
        { id: `${id}-f10`, label: 'Total Payments',      value: `$${Math.round(agi * 0.22).toLocaleString()}`,     confidence: 0.95, page: 1, bbox: bb(0.60, 0.50, 0.35, 0.038) },
        { id: `${id}-f11`, label: 'Refund / Owed',       value: `$${Math.round(agi * 0.01).toLocaleString()} Refund`, confidence: 0.93, page: 1, bbox: bb(0.60, 0.62, 0.35, 0.038) },
      ],
    },
  ],
});

const makePayStub = (id, loanId, borrower, employer, salary) => ({
  id, loanId, borrowerName: borrower,
  fileName: `${borrower.split(' ')[1].toLowerCase()}_paystub_dec2023.pdf`,
  fileSize: 98304, uploadedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  totalPages: 1,
  classifiedType: 'Pay Stub',
  confidence: 0.91, isUnclassified: false, pipelineStatus: 'complete',
  sections: [
    {
      id: 'pay-info', label: 'Pay Information',
      fields: [
        { id: `${id}-f1`, label: 'Employee Name',   value: borrower,             confidence: 0.99, page: 0, bbox: bb(0.05, 0.06, 0.45, 0.038) },
        { id: `${id}-f2`, label: 'Employer Name',   value: employer,             confidence: 0.98, page: 0, bbox: bb(0.55, 0.06, 0.40, 0.038) },
        { id: `${id}-f3`, label: 'Pay Period',      value: 'Dec 1 – Dec 31, 2023', confidence: 0.97, page: 0, bbox: bb(0.05, 0.13, 0.45, 0.038) },
        { id: `${id}-f4`, label: 'Pay Date',        value: 'January 5, 2024',    confidence: 0.98, page: 0, bbox: bb(0.55, 0.13, 0.40, 0.038) },
      ],
    },
    {
      id: 'earnings', label: 'Earnings',
      fields: [
        { id: `${id}-f5`, label: 'Gross Pay (Period)',    value: `$${Math.round(salary / 12).toLocaleString()}`, confidence: 0.99, page: 0, bbox: bb(0.55, 0.32, 0.40, 0.038) },
        { id: `${id}-f6`, label: 'YTD Gross Earnings',   value: `$${salary.toLocaleString()}`,                  confidence: 0.99, page: 0, bbox: bb(0.55, 0.38, 0.40, 0.038) },
        { id: `${id}-f7`, label: 'Base Salary (Annual)', value: `$${salary.toLocaleString()}`,                  confidence: 0.97, page: 0, bbox: bb(0.05, 0.32, 0.45, 0.038) },
      ],
    },
    {
      id: 'deductions', label: 'Deductions & Net Pay',
      fields: [
        { id: `${id}-f8`,  label: 'Federal Tax (Period)',  value: `$${Math.round(salary / 12 * 0.22).toLocaleString()}`,  confidence: 0.97, page: 0, bbox: bb(0.05, 0.52, 0.45, 0.038) },
        { id: `${id}-f9`,  label: 'Social Security',      value: `$${Math.round(salary / 12 * 0.062).toLocaleString()}`, confidence: 0.97, page: 0, bbox: bb(0.05, 0.58, 0.45, 0.038) },
        { id: `${id}-f10`, label: 'Medicare',             value: `$${Math.round(salary / 12 * 0.0145).toLocaleString()}`,confidence: 0.96, page: 0, bbox: bb(0.05, 0.64, 0.45, 0.038) },
        { id: `${id}-f11`, label: 'Net Pay',              value: `$${Math.round(salary / 12 * 0.70).toLocaleString()}`,  confidence: 0.99, page: 0, bbox: bb(0.55, 0.58, 0.40, 0.042) },
      ],
    },
  ],
});

const makeUnclassified = (id, loanId, borrower) => ({
  id, loanId, borrowerName: borrower,
  fileName: `${borrower.split(' ')[1].toLowerCase()}_scan_unknown.pdf`,
  fileSize: 162816, uploadedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  totalPages: 1,
  classifiedType: 'Unclassified',
  confidence: 0.34, isUnclassified: true, pipelineStatus: 'complete',
  sections: [
    {
      id: 'detected-fields', label: 'Detected Fields (Low Confidence)',
      fields: [
        { id: `${id}-f1`, label: 'Detected Name',   value: borrower,    confidence: 0.58, page: 0, bbox: bb(0.05, 0.08, 0.50, 0.038) },
        { id: `${id}-f2`, label: 'Detected Date',   value: 'Jan 2024',  confidence: 0.52, page: 0, bbox: bb(0.60, 0.08, 0.30, 0.038) },
        { id: `${id}-f3`, label: 'Detected Amount', value: '$12,450',   confidence: 0.47, page: 0, bbox: bb(0.05, 0.35, 0.40, 0.038) },
      ],
    },
  ],
});

// ─── Seeded Dataset ──────────────────────────────────────────────────────────

export const MOCK_DOCUMENTS = [
  makeW2('doc-w2-001',    'LN-2024-0001', 'James Mitchell',  'Horizon Tech Solutions',   145000),
  makeBankStmt('doc-bank-001', 'LN-2024-0001', 'James Mitchell',  85000),
  make1040('doc-1040-001', 'LN-2024-0001', 'James Mitchell',  142000),
  makePayStub('doc-stub-001', 'LN-2024-0001', 'James Mitchell', 'Horizon Tech Solutions', 145000),

  makeW2('doc-w2-002',    'LN-2024-0002', 'Maria Rodriguez', 'City Services Dept.',      52000),
  makeBankStmt('doc-bank-002', 'LN-2024-0002', 'Maria Rodriguez', 8500),
  makeUnclassified('doc-unk-001', 'LN-2024-0002', 'Maria Rodriguez'),

  makeW2('doc-w2-003',    'LN-2024-0003', 'Robert Johnson',  'US Army Reserve',          78000),
  make1040('doc-1040-002', 'LN-2024-0003', 'Robert Johnson',  76000),
  makeBankStmt('doc-bank-003', 'LN-2024-0003', 'Robert Johnson',  45000),

  makeW2('doc-w2-004',    'LN-2024-0005', 'Angela Thompson', 'Austin Medical Center',    68000),
  makePayStub('doc-stub-002', 'LN-2024-0005', 'Angela Thompson', 'Austin Medical Center', 68000),
  makeUnclassified('doc-unk-002', 'LN-2024-0005', 'Angela Thompson'),
];

export const LOAN_OPTIONS = [
  { id: 'LN-2024-0001', label: 'LN-2024-0001 — James Mitchell'  },
  { id: 'LN-2024-0002', label: 'LN-2024-0002 — Maria Rodriguez' },
  { id: 'LN-2024-0003', label: 'LN-2024-0003 — Robert Johnson'  },
  { id: 'LN-2024-0005', label: 'LN-2024-0005 — Angela Thompson' },
];

// Extraction template for newly uploaded docs (used by pipeline hook)
export const generateExtractedSections = (docId, classifiedType, borrower) => {
  const base = {
    'W-2 Wage Statement':         makeW2(docId, '', borrower, 'Employer on File', 75000).sections,
    'Federal Tax Return (1040)':  make1040(docId, '', borrower, 72000).sections,
    'Bank Statement':             makeBankStmt(docId, '', borrower, 35000).sections,
    'Pay Stub':                   makePayStub(docId, '', borrower, 'Employer on File', 75000).sections,
    'Employment Verification Letter': [
      {
        id: 'emp-info', label: 'Employment Information',
        fields: [
          { id: `${docId}-f1`, label: 'Employee Name',      value: borrower,            confidence: 0.98, page: 0, bbox: bb(0.05, 0.12, 0.55, 0.038) },
          { id: `${docId}-f2`, label: 'Employer Name',      value: 'Employer on File',  confidence: 0.97, page: 0, bbox: bb(0.05, 0.20, 0.55, 0.038) },
          { id: `${docId}-f3`, label: 'Employment Type',    value: 'Full-Time',         confidence: 0.96, page: 0, bbox: bb(0.05, 0.28, 0.45, 0.038) },
          { id: `${docId}-f4`, label: 'Annual Base Salary', value: '$75,000',           confidence: 0.95, page: 0, bbox: bb(0.05, 0.36, 0.45, 0.038) },
          { id: `${docId}-f5`, label: 'Start Date',         value: 'Jan 2020',          confidence: 0.93, page: 0, bbox: bb(0.05, 0.44, 0.35, 0.038) },
        ],
      },
    ],
  };
  return base[classifiedType] ?? [
    {
      id: 'detected-fields', label: 'Detected Fields',
      fields: [
        { id: `${docId}-f1`, label: 'Detected Name',   value: borrower,   confidence: 0.72, page: 0, bbox: bb(0.05, 0.08, 0.50, 0.038) },
        { id: `${docId}-f2`, label: 'Detected Date',   value: 'Jan 2024', confidence: 0.65, page: 0, bbox: bb(0.60, 0.08, 0.30, 0.038) },
      ],
    },
  ];
};
