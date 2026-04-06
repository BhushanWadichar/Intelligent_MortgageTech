// ─── Helpers ────────────────────────────────────────────────────────────────
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];
const fmt = (d) => d.toISOString().split('T')[0];

const borrowerNames = [
  'James Harrington', 'Sofia Mendoza', 'David Chen', 'Priya Patel',
  'Michael Thompson', 'Rachel Kim', 'Carlos Rivera', 'Amanda Johnson',
  'Tyler Brooks', 'Natalie Scott', 'Kevin Wu', 'Emily Davis',
  'Brian Carter', 'Megan Liu', 'Jason Martinez',
];

const loanTypes = ['Conventional', 'FHA', 'VA', 'Jumbo', 'USDA'];
const stages = ['Document Ingested', 'Classified', 'Extracted', 'In Rule Review', 'Completed', 'Pending', 'Failed'];
const docTypes = ['Paystub', 'W-2', 'Bank Statement', 'Tax Return', '1003 Application', 'Credit Report', 'Appraisal', 'Title Report'];

// ─── Documents ───────────────────────────────────────────────────────────────
export const mockDocuments = [
  {
    id: 'doc-001',
    name: 'john_paystub_march.pdf',
    type: 'PDF',
    size: '1.2 MB',
    classifiedAs: 'Paystub',
    confidence: 96,
    status: 'classified',
    pages: 2,
    uploadedAt: '2024-03-15T09:22:00Z',
    extractedFields: {
      'Borrower Info': [
        { id: 'f1', label: 'Borrower Name', value: 'James Harrington', confidence: 99, bbox: { x: 10, y: 8, w: 35, h: 5 } },
        { id: 'f2', label: 'SSN (Last 4)', value: '4829', confidence: 97, bbox: { x: 55, y: 8, w: 20, h: 5 } },
        { id: 'f3', label: 'Date of Birth', value: '1982-07-14', confidence: 95, bbox: { x: 10, y: 15, w: 25, h: 5 } },
      ],
      'Income': [
        { id: 'f4', label: 'Gross Pay', value: '$8,450.00', confidence: 98, bbox: { x: 10, y: 35, w: 30, h: 5 } },
        { id: 'f5', label: 'Net Pay', value: '$6,120.00', confidence: 98, bbox: { x: 45, y: 35, w: 30, h: 5 } },
        { id: 'f6', label: 'Pay Period', value: '03/01/2024 – 03/15/2024', confidence: 94, bbox: { x: 10, y: 42, w: 45, h: 5 } },
        { id: 'f7', label: 'YTD Gross', value: '$50,700.00', confidence: 97, bbox: { x: 10, y: 50, w: 30, h: 5 } },
      ],
      'Employment': [
        { id: 'f8', label: 'Employer Name', value: 'Harrington & Associates LLC', confidence: 96, bbox: { x: 10, y: 62, w: 50, h: 5 } },
        { id: 'f9', label: 'Position', value: 'Senior Engineer', confidence: 93, bbox: { x: 10, y: 69, w: 35, h: 5 } },
        { id: 'f10', label: 'Hire Date', value: '2018-04-01', confidence: 91, bbox: { x: 55, y: 69, w: 25, h: 5 } },
      ],
    },
  },
  {
    id: 'doc-002',
    name: 'W2_2023_harrington.pdf',
    type: 'PDF',
    size: '0.8 MB',
    classifiedAs: 'W-2',
    confidence: 99,
    status: 'classified',
    pages: 1,
    uploadedAt: '2024-03-15T09:23:00Z',
    extractedFields: {
      'Borrower Info': [
        { id: 'f11', label: 'Employee Name', value: 'James Harrington', confidence: 99, bbox: { x: 5, y: 20, w: 40, h: 6 } },
        { id: 'f12', label: 'SSN', value: '***-**-4829', confidence: 99, bbox: { x: 50, y: 20, w: 30, h: 6 } },
      ],
      'Income': [
        { id: 'f13', label: 'Wages Box 1', value: '$101,400.00', confidence: 99, bbox: { x: 5, y: 40, w: 35, h: 6 } },
        { id: 'f14', label: 'Federal Tax Withheld', value: '$18,252.00', confidence: 98, bbox: { x: 45, y: 40, w: 35, h: 6 } },
        { id: 'f15', label: 'Social Security Wages', value: '$101,400.00', confidence: 98, bbox: { x: 5, y: 52, w: 35, h: 6 } },
      ],
      'Employment': [
        { id: 'f16', label: 'Employer EIN', value: '45-1234567', confidence: 97, bbox: { x: 5, y: 65, w: 30, h: 6 } },
        { id: 'f17', label: 'Employer Name', value: 'Harrington & Associates LLC', confidence: 99, bbox: { x: 5, y: 74, w: 50, h: 6 } },
      ],
    },
  },
  {
    id: 'doc-003',
    name: 'bank_statement_jan_mar.pdf',
    type: 'PDF',
    size: '3.1 MB',
    classifiedAs: 'Bank Statement',
    confidence: 88,
    status: 'classified',
    pages: 6,
    uploadedAt: '2024-03-15T09:24:00Z',
    extractedFields: {
      'Borrower Info': [
        { id: 'f18', label: 'Account Holder', value: 'James & Sarah Harrington', confidence: 95, bbox: { x: 5, y: 10, w: 50, h: 5 } },
        { id: 'f19', label: 'Account Number', value: '****4821', confidence: 99, bbox: { x: 5, y: 18, w: 30, h: 5 } },
      ],
      'Income': [
        { id: 'f20', label: 'Average Monthly Balance', value: '$24,350.00', confidence: 87, bbox: { x: 5, y: 30, w: 40, h: 5 } },
        { id: 'f21', label: 'Total Deposits (3-mo)', value: '$25,650.00', confidence: 89, bbox: { x: 5, y: 38, w: 40, h: 5 } },
      ],
    },
  },
  {
    id: 'doc-004',
    name: 'unknown_scan_001.png',
    type: 'PNG',
    size: '2.4 MB',
    classifiedAs: 'Unclassified',
    confidence: 42,
    status: 'unclassified',
    pages: 1,
    uploadedAt: '2024-03-15T09:25:00Z',
    extractedFields: {},
  },
];

// ─── Rules ───────────────────────────────────────────────────────────────────
const ruleDefinitions = [
  { id: 'R001', name: 'DTI Ratio ≤ 43%',          category: 'Income Verification', description: 'Debt-to-income ratio must not exceed 43% for conventional loans.' },
  { id: 'R002', name: 'Min Credit Score 620',       category: 'Credit',              description: 'FICO score must be at or above 620 for standard eligibility.' },
  { id: 'R003', name: '2-Year Employment History',  category: 'Employment',          description: 'Borrower must show continuous employment for at least 2 years.' },
  { id: 'R004', name: 'LTV ≤ 80%',                 category: 'Compliance',          description: 'Loan-to-value ratio must be 80% or below to avoid PMI requirement.' },
  { id: 'R005', name: 'Verified Income Sufficient', category: 'Income Verification', description: 'Monthly verified income must be at least 2.5× monthly obligations.' },
  { id: 'R006', name: 'Asset Reserves 2 Months',    category: 'Credit',              description: 'Borrower must have liquid reserves equivalent to 2 mortgage payments.' },
  { id: 'R007', name: 'Appraisal Gap ≤ 5%',        category: 'Compliance',          description: 'Appraised value cannot differ from purchase price by more than 5%.' },
  { id: 'R008', name: 'No Late Payments (12 mo)',   category: 'Credit',              description: 'No 30+ day late payments in the last 12 months.' },
];

const generateRuleResults = (loanType, seed) => {
  const passRate = loanType === 'Jumbo' ? 0.65 : loanType === 'FHA' ? 0.80 : 0.85;
  return ruleDefinitions.map((rule, i) => {
    const passed = (seed + i) % 10 < passRate * 10;
    const evalValues = {
      'R001': { value: passed ? '38.2%' : '47.8%', threshold: '≤ 43%' },
      'R002': { value: passed ? '720'   : '598',   threshold: '≥ 620' },
      'R003': { value: passed ? '5.2 yrs' : '1.1 yrs', threshold: '≥ 2 yrs' },
      'R004': { value: passed ? '75.4%' : '88.2%', threshold: '≤ 80%' },
      'R005': { value: passed ? '3.1×'  : '2.1×',  threshold: '≥ 2.5×' },
      'R006': { value: passed ? '3.4 mo' : '0.8 mo', threshold: '≥ 2 mo' },
      'R007': { value: passed ? '2.1%'  : '7.3%',  threshold: '≤ 5%' },
      'R008': { value: passed ? '0 late' : '2 late', threshold: '0 late pmts' },
    };
    return {
      ...rule,
      result: passed ? 'Pass' : 'Fail',
      evaluatedValue: evalValues[rule.id]?.value || 'N/A',
      threshold: evalValues[rule.id]?.threshold || 'N/A',
      failureReason: passed ? null : `Value (${evalValues[rule.id]?.value}) does not meet threshold (${evalValues[rule.id]?.threshold}).`,
    };
  });
};

// ─── Loans ───────────────────────────────────────────────────────────────────
const generateLoans = () => {
  return borrowerNames.map((name, i) => {
    const loanType = loanTypes[i % loanTypes.length];
    const ruleResults = generateRuleResults(loanType, i);
    const failCount = ruleResults.filter(r => r.result === 'Fail').length;
    const ruleStatus = failCount === 0 ? 'Pass' : failCount >= 4 ? 'Fail' : 'Partial';
    const stageIndex = Math.min(i % 7, stages.length - 1);
    const stage = stages[stageIndex];
    const baseDate = new Date('2024-01-15');
    baseDate.setDate(baseDate.getDate() + i * 4);

    return {
      id: `LN-${String(10024 + i).padStart(5, '0')}`,
      borrowerName: name,
      loanType,
      submissionDate: fmt(baseDate),
      lastUpdated: fmt(new Date(baseDate.getTime() + rand(1, 10) * 86400000)),
      stage,
      ruleStatus,
      ruleResults,
      amount: `$${(rand(180, 950) * 1000).toLocaleString()}`,
      documents: docTypes.slice(0, rand(3, 6)).map((dt, j) => ({
        id: `doc-${i}-${j}`,
        type: dt,
        status: ['Verified', 'Pending', 'Missing'][j % 3],
      })),
    };
  });
};

export const mockLoans = generateLoans();

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export const mockDashboardStats = {
  totalLoans: mockLoans.length,
  allPassed: mockLoans.filter(l => l.ruleStatus === 'Pass').length,
  partialFail: mockLoans.filter(l => l.ruleStatus === 'Partial').length,
  fullyFailed: mockLoans.filter(l => l.ruleStatus === 'Fail').length,
  ruleAggregates: ruleDefinitions.map(rule => ({
    rule: rule.name,
    category: rule.category,
    passed: mockLoans.filter(l => l.ruleResults.find(r => r.id === rule.id)?.result === 'Pass').length,
    failed: mockLoans.filter(l => l.ruleResults.find(r => r.id === rule.id)?.result === 'Fail').length,
  })),
};

// ─── Analytics Data ───────────────────────────────────────────────────────────
export const mockAnalytics = {
  passFailRate: [
    { name: 'Approved', value: mockLoans.filter(l => l.ruleStatus === 'Pass').length, color: '#059669' },
    { name: 'Partial', value:  mockLoans.filter(l => l.ruleStatus === 'Partial').length, color: '#d97706' },
    { name: 'Rejected', value: mockLoans.filter(l => l.ruleStatus === 'Fail').length, color: '#dc2626' },
  ],
  loanByType: loanTypes.map(type => ({
    type,
    count: mockLoans.filter(l => l.loanType === type).length,
    approved: mockLoans.filter(l => l.loanType === type && l.ruleStatus === 'Pass').length,
    rejected: mockLoans.filter(l => l.loanType === type && l.ruleStatus === 'Fail').length,
  })),
  stageDistribution: [
    { stage: 'Ingested', count: mockLoans.filter(l => l.stage === 'Document Ingested').length },
    { stage: 'Classified', count: mockLoans.filter(l => l.stage === 'Classified').length },
    { stage: 'Extracted', count: mockLoans.filter(l => l.stage === 'Extracted').length },
    { stage: 'Rule Review', count: mockLoans.filter(l => l.stage === 'In Rule Review').length },
    { stage: 'Completed', count: mockLoans.filter(l => l.stage === 'Completed').length },
    { stage: 'Pending', count: mockLoans.filter(l => l.stage === 'Pending').length },
    { stage: 'Failed', count: mockLoans.filter(l => l.stage === 'Failed').length },
  ],
  ruleFailureFreq: mockDashboardStats.ruleAggregates
    .map(r => ({ rule: r.rule.split('≤')[0].split('≥')[0].trim(), failures: r.failed }))
    .sort((a, b) => b.failures - a.failures),
  docCompliance: mockLoans.slice(0, 8).map(l => ({
    loanId: l.id,
    borrower: l.borrowerName.split(' ')[1],
    docs: docTypes.map(dt => ({
      type: dt,
      status: l.documents.find(d => d.type === dt)?.status || 'Missing',
    })),
  })),
};

export const mockClassificationDocTypes = [
  'Paystub', 'W-2', 'Bank Statement', 'Tax Return',
  '1003 Application', 'Credit Report', 'Appraisal', 'Title Report',
];

export { ruleDefinitions, stages, loanTypes };
