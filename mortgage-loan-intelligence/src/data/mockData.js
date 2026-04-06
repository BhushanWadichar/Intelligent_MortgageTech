// ─── Helpers ────────────────────────────────────────────────────────────────

const makeDoc = (docType, fields) => ({
  docId: `DOC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
  docType,
  fileName: docType.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.pdf',
  uploadedAt: new Date(Date.now() - Math.random() * 864e6).toISOString(),
  overallConfidence: +(0.93 + Math.random() * 0.06).toFixed(2),
  fields,
});

const fld = (field, value, confidence) => ({ field, value, confidence: confidence ?? +(0.93 + Math.random() * 0.06).toFixed(2) });

const w2 = (employer, wages) => makeDoc('W-2 Wage Statement', [
  fld('Employer Name', employer, 0.98),
  fld('Employee SSN', `***-**-${1000 + Math.floor(Math.random() * 9000)}`, 0.97),
  fld('Wages, Tips & Compensation', `$${wages.toLocaleString()}`, 0.99),
  fld('Federal Income Tax Withheld', `$${Math.round(wages * 0.22).toLocaleString()}`, 0.97),
  fld('Social Security Wages', `$${wages.toLocaleString()}`, 0.98),
  fld('Tax Year', '2023', 1.0),
]);

const tax1040 = (agi) => makeDoc('Federal Tax Return (1040)', [
  fld('Filing Status', 'Married Filing Jointly', 0.96),
  fld('Adjusted Gross Income', `$${agi.toLocaleString()}`, 0.99),
  fld('Total Income', `$${Math.round(agi * 1.04).toLocaleString()}`, 0.97),
  fld('Total Tax', `$${Math.round(agi * 0.21).toLocaleString()}`, 0.96),
  fld('Tax Year', '2023', 1.0),
]);

const bankStmt = (avgBal) => makeDoc('Bank Statement (3-Month)', [
  fld('Account Holder', 'On File', 0.99),
  fld('Account Number', `****${1000 + Math.floor(Math.random() * 9000)}`, 1.0),
  fld('Statement Period', '3-Month Period', 0.99),
  fld('Average Monthly Balance', `$${avgBal.toLocaleString()}`, 0.97),
  fld('NSF / Overdraft Events', '0', 0.99),
  fld('Large Unexplained Deposits', 'None', 0.96),
]);

const empLetter = (employer, salary, yrs) => makeDoc('Employment Verification Letter', [
  fld('Employer Name', employer, 0.98),
  fld('Employment Type', 'Full-Time Permanent', 0.97),
  fld('Annual Base Salary', `$${salary.toLocaleString()}`, 0.99),
  fld('Start Date', `Jan ${new Date().getFullYear() - yrs}`, 0.94),
  fld('Position', 'Verified on File', 0.95),
]);

const appraisal = (value, addr) => makeDoc('Property Appraisal Report', [
  fld('Property Address', addr, 0.97),
  fld('Appraised Value', `$${value.toLocaleString()}`, 0.99),
  fld('Property Type', 'Single Family Residence', 0.97),
  fld('Condition Rating', 'C3 — Average', 0.93),
  fld('Effective Date', new Date(Date.now() - 30 * 864e5).toLocaleDateString('en-US'), 0.99),
]);

const creditRpt = (score, util) => makeDoc('Credit Report (Tri-Merge)', [
  fld('FICO Score', `${score}`, 1.0),
  fld('Credit Utilization', `${util}%`, 0.99),
  fld('Open Accounts', `${5 + Math.floor(Math.random() * 8)}`, 1.0),
  fld('Derogatory Marks', score > 720 ? '0' : '1', 0.98),
  fld('Bankruptcy History', score > 680 ? 'None' : 'Discharged 2019', 0.99),
  fld('Collections', '0', 1.0),
]);

const titleReport = (addr) => makeDoc('Title Search Report', [
  fld('Property Address', addr, 0.97),
  fld('Title Status', 'Clear', 0.99),
  fld('Outstanding Liens', 'None', 0.98),
  fld('Easements', 'Standard Utility', 0.96),
  fld('Legal Description', 'On File', 0.99),
]);

// ─── Rules ──────────────────────────────────────────────────────────────────

const rule = (id, name, cat, desc, status, actual, threshold, detail) => ({
  ruleId: id, ruleName: name, category: cat,
  description: desc, status, actualValue: actual, threshold, details: detail,
});

const buildRules = ({ dti, score, ltv, empYrs, dtiMax = 43 }) => [
  rule('R-001', 'Debt-to-Income Ratio', 'Income',
    `Monthly debt obligations must not exceed ${dtiMax}% of gross monthly income`,
    dti <= dtiMax ? 'Pass' : 'Fail',
    `${dti}%`, `≤ ${dtiMax}%`,
    `Monthly debt: $${Math.round(dti * 75 * 10)} / Gross monthly: $${(75 * 1000).toLocaleString()}`),

  rule('R-002', 'Minimum Credit Score', 'Credit',
    'Borrower must meet credit score floor for selected loan product',
    score >= 620 ? 'Pass' : 'Fail',
    `${score}`, '≥ 620',
    'FICO obtained from TransUnion tri-merge. Score satisfies conventional minimum.'),

  rule('R-003', 'Loan-to-Value Ratio', 'Property',
    'LTV must comply with program guidelines; PMI triggered above 80%',
    ltv <= 97 ? 'Pass' : 'Fail',
    `${ltv}%`, '≤ 97%',
    `Loan ÷ Appraised Value. ${ltv > 80 ? 'PMI required.' : 'PMI not required.'}`),

  rule('R-004', 'Employment History', 'Employment',
    'Borrower must demonstrate stable, continuous employment ≥ 2 years',
    empYrs >= 2 ? 'Pass' : 'Fail',
    `${empYrs} yr${empYrs !== 1 ? 's' : ''}`, '≥ 2 years',
    'Verified via employer letter and two-year W-2 history.'),

  rule('R-005', 'Bankruptcy Clearance', 'Compliance',
    'No active bankruptcy; prior discharge must be > 4 years old',
    'Pass', 'None Active', 'None Active', 'Public records search cleared.'),

  rule('R-006', 'Appraisal–Purchase Variance', 'Property',
    'Appraised value must be within ±5% of contracted purchase price',
    'Pass', '2.1% variance', '≤ 5%',
    'Independent licensed appraisal cross-checked against signed purchase agreement.'),

  rule('R-007', 'Asset Reserve Adequacy', 'Assets',
    'Must maintain ≥ 2 months PITI reserves post-closing',
    'Pass', '4.2 months', '≥ 2 months',
    'Verified from 3-month bank statements. Liquid assets confirmed.'),

  rule('R-008', 'Income Documentation Completeness', 'Compliance',
    'W-2, pay stubs, and tax returns must be current (< 120 days)',
    'Pass', '100% Complete', '100% Complete',
    'All documents received, dated within requirement window.'),

  rule('R-009', 'Title Clear of Encumbrances', 'Compliance',
    'Title must be free of unresolved liens and encumbrances',
    'Pass', 'Clear', 'Clear',
    'Title search completed by licensed title company. No issues found.'),

  rule('R-010', 'Insurance Coverage Adequacy', 'Compliance',
    'Homeowners insurance must equal or exceed property replacement cost',
    'Pass', '110% Replacement Cost', '≥ 100%',
    'Policy reviewed and approved by underwriter.'),
];

// ─── Loans ──────────────────────────────────────────────────────────────────

export const LOANS = [
  {
    id: 'LN-2024-0001', borrowerName: 'James Mitchell', coBorrowerName: 'Sarah Mitchell',
    loanType: 'Conventional', loanAmount: 485000, purchasePrice: 520000,
    propertyAddress: '1842 Maple Grove Dr, Austin, TX 78701',
    processor: 'Emily Chen', currentStage: 'Completed', status: 'Pass',
    createdAt: '2024-01-08T09:00:00Z', lastUpdated: '2024-01-22T16:30:00Z',
    stageStatus: { ingested: 'complete', classified: 'complete', extracted: 'complete', ruleReview: 'complete', final: 'pass' },
    stageDates: { ingested: '2024-01-08T09:00:00Z', classified: '2024-01-08T11:30:00Z', extracted: '2024-01-09T14:00:00Z', ruleReview: '2024-01-15T10:00:00Z', final: '2024-01-22T16:30:00Z' },
    extractedDocuments: [w2('Horizon Tech Solutions', 145000), tax1040(142000), bankStmt(85000), empLetter('Horizon Tech Solutions', 145000, 6), appraisal(518000, '1842 Maple Grove Dr, Austin, TX 78701'), creditRpt(768, 18), titleReport('1842 Maple Grove Dr, Austin, TX 78701')],
    ruleResults: buildRules({ dti: 32, score: 768, ltv: 75, empYrs: 6 }),
  },
  {
    id: 'LN-2024-0002', borrowerName: 'Maria Rodriguez', coBorrowerName: null,
    loanType: 'FHA', loanAmount: 225000, purchasePrice: 235000,
    propertyAddress: '567 Oak Street, Houston, TX 77001',
    processor: 'David Park', currentStage: 'Completed', status: 'Fail',
    createdAt: '2024-01-10T10:00:00Z', lastUpdated: '2024-01-25T14:00:00Z',
    stageStatus: { ingested: 'complete', classified: 'complete', extracted: 'complete', ruleReview: 'complete', final: 'fail' },
    stageDates: { ingested: '2024-01-10T10:00:00Z', classified: '2024-01-10T12:30:00Z', extracted: '2024-01-11T16:00:00Z', ruleReview: '2024-01-20T10:00:00Z', final: '2024-01-25T14:00:00Z' },
    extractedDocuments: [w2('City Services Dept.', 52000), tax1040(50000), bankStmt(8500), empLetter('City Services Dept.', 52000, 3), appraisal(234000, '567 Oak Street, Houston, TX 77001'), creditRpt(605, 72), titleReport('567 Oak Street, Houston, TX 77001')],
    ruleResults: [
      { ...buildRules({ dti: 47, score: 605, ltv: 96, empYrs: 3 })[0], status: 'Fail', actualValue: '47%', details: 'High existing debt load versus income.' },
      buildRules({ dti: 47, score: 605, ltv: 96, empYrs: 3 })[1],
      ...buildRules({ dti: 47, score: 605, ltv: 96, empYrs: 3 }).slice(2),
    ],
  },
  {
    id: 'LN-2024-0003', borrowerName: 'Robert Johnson', coBorrowerName: 'Lisa Johnson',
    loanType: 'VA', loanAmount: 380000, purchasePrice: 380000,
    propertyAddress: '2891 Veterans Blvd, San Antonio, TX 78201',
    processor: 'Jennifer Walsh', currentStage: 'In Rule Review', status: 'Pending',
    createdAt: '2024-01-15T08:00:00Z', lastUpdated: '2024-01-28T11:00:00Z',
    stageStatus: { ingested: 'complete', classified: 'complete', extracted: 'complete', ruleReview: 'active', final: 'pending' },
    stageDates: { ingested: '2024-01-15T08:00:00Z', classified: '2024-01-15T10:00:00Z', extracted: '2024-01-17T14:30:00Z', ruleReview: '2024-01-28T11:00:00Z', final: null },
    extractedDocuments: [w2('US Army Reserve', 78000), tax1040(76000), bankStmt(45000), empLetter('US Army Reserve', 78000, 8), appraisal(382000, '2891 Veterans Blvd, San Antonio, TX 78201'), creditRpt(712, 24), titleReport('2891 Veterans Blvd, San Antonio, TX 78201')],
    ruleResults: buildRules({ dti: 35, score: 712, ltv: 100, empYrs: 8 }),
  },
  {
    id: 'LN-2024-0004', borrowerName: 'William Zhang', coBorrowerName: 'Helen Zhang',
    loanType: 'Jumbo', loanAmount: 1250000, purchasePrice: 1400000,
    propertyAddress: '9 Harbor View Ln, Dallas, TX 75201',
    processor: 'Emily Chen', currentStage: 'Extracted', status: 'Pending',
    createdAt: '2024-01-18T09:00:00Z', lastUpdated: '2024-01-30T15:00:00Z',
    stageStatus: { ingested: 'complete', classified: 'complete', extracted: 'active', ruleReview: 'pending', final: 'pending' },
    stageDates: { ingested: '2024-01-18T09:00:00Z', classified: '2024-01-18T11:00:00Z', extracted: '2024-01-30T15:00:00Z', ruleReview: null, final: null },
    extractedDocuments: [w2('Global Investments LLC', 420000), tax1040(415000), bankStmt(580000), empLetter('Global Investments LLC', 420000, 12), appraisal(1410000, '9 Harbor View Ln, Dallas, TX 75201'), creditRpt(810, 8), titleReport('9 Harbor View Ln, Dallas, TX 75201')],
    ruleResults: [],
  },
  {
    id: 'LN-2024-0005', borrowerName: 'Angela Thompson', coBorrowerName: null,
    loanType: 'FHA', loanAmount: 195000, purchasePrice: 205000,
    propertyAddress: '312 Elm Court, Austin, TX 78702',
    processor: 'Marcus Lee', currentStage: 'Completed', status: 'Pass',
    createdAt: '2024-01-05T10:00:00Z', lastUpdated: '2024-01-20T16:00:00Z',
    stageStatus: { ingested: 'complete', classified: 'complete', extracted: 'complete', ruleReview: 'complete', final: 'pass' },
    stageDates: { ingested: '2024-01-05T10:00:00Z', classified: '2024-01-05T13:00:00Z', extracted: '2024-01-07T09:30:00Z', ruleReview: '2024-01-12T14:00:00Z', final: '2024-01-20T16:00:00Z' },
    extractedDocuments: [w2('Austin Medical Center', 68000), tax1040(66000), bankStmt(28000), empLetter('Austin Medical Center', 68000, 4), appraisal(207000, '312 Elm Court, Austin, TX 78702'), creditRpt(685, 38), titleReport('312 Elm Court, Austin, TX 78702')],
    ruleResults: buildRules({ dti: 38, score: 685, ltv: 95, empYrs: 4 }),
  },
  {
    id: 'LN-2024-0006', borrowerName: 'Thomas Crawford', coBorrowerName: 'Patricia Crawford',
    loanType: 'Conventional', loanAmount: 640000, purchasePrice: 700000,
    propertyAddress: '4521 Highland Ridge, Plano, TX 75024',
    processor: 'Jennifer Walsh', currentStage: 'In Rule Review', status: 'Pending',
    createdAt: '2024-01-20T08:00:00Z', lastUpdated: '2024-02-01T10:00:00Z',
    stageStatus: { ingested: 'complete', classified: 'complete', extracted: 'complete', ruleReview: 'active', final: 'pending' },
    stageDates: { ingested: '2024-01-20T08:00:00Z', classified: '2024-01-20T10:30:00Z', extracted: '2024-01-22T14:00:00Z', ruleReview: '2024-02-01T10:00:00Z', final: null },
    extractedDocuments: [w2('Crawford & Associates', 195000), tax1040(192000), bankStmt(125000), empLetter('Crawford & Associates', 195000, 15), appraisal(705000, '4521 Highland Ridge, Plano, TX 75024'), creditRpt(745, 22), titleReport('4521 Highland Ridge, Plano, TX 75024')],
    ruleResults: buildRules({ dti: 34, score: 745, ltv: 91, empYrs: 15 }),
  },
  {
    id: 'LN-2024-0007', borrowerName: 'Jennifer Santos', coBorrowerName: null,
    loanType: 'Conventional', loanAmount: 320000, purchasePrice: 345000,
    propertyAddress: '789 Sunset Ave, Fort Worth, TX 76101',
    processor: 'David Park', currentStage: 'Classified', status: 'Pending',
    createdAt: '2024-01-25T09:00:00Z', lastUpdated: '2024-01-26T11:00:00Z',
    stageStatus: { ingested: 'complete', classified: 'active', extracted: 'pending', ruleReview: 'pending', final: 'pending' },
    stageDates: { ingested: '2024-01-25T09:00:00Z', classified: '2024-01-26T11:00:00Z', extracted: null, ruleReview: null, final: null },
    extractedDocuments: [], ruleResults: [],
  },
  {
    id: 'LN-2024-0008', borrowerName: 'Charles Wellington', coBorrowerName: 'Diana Wellington',
    loanType: 'Jumbo', loanAmount: 2100000, purchasePrice: 2200000,
    propertyAddress: '1 Prestige Court, Highland Park, TX 75205',
    processor: 'Marcus Lee', currentStage: 'Completed', status: 'Fail',
    createdAt: '2024-01-03T09:00:00Z', lastUpdated: '2024-01-25T17:00:00Z',
    stageStatus: { ingested: 'complete', classified: 'complete', extracted: 'complete', ruleReview: 'complete', final: 'fail' },
    stageDates: { ingested: '2024-01-03T09:00:00Z', classified: '2024-01-03T14:00:00Z', extracted: '2024-01-06T10:00:00Z', ruleReview: '2024-01-18T09:00:00Z', final: '2024-01-25T17:00:00Z' },
    extractedDocuments: [w2('Wellington Capital', 580000), tax1040(570000), bankStmt(920000), empLetter('Wellington Capital', 580000, 20), appraisal(2180000, '1 Prestige Court, Highland Park, TX 75205'), creditRpt(734, 31), titleReport('1 Prestige Court, Highland Park, TX 75205')],
    ruleResults: [
      { ...buildRules({ dti: 52, score: 734, ltv: 95, empYrs: 20 })[0], status: 'Fail', actualValue: '52%', details: 'Multiple investment properties driving elevated DTI.' },
      ...buildRules({ dti: 52, score: 734, ltv: 95, empYrs: 20 }).slice(1, 8),
      { ...buildRules({ dti: 52, score: 734, ltv: 95, empYrs: 20 })[8], status: 'Fail', actualValue: 'Lien Found', details: 'Outstanding contractor lien of $45,000 identified on property.' },
      buildRules({ dti: 52, score: 734, ltv: 95, empYrs: 20 })[9],
    ],
  },
  {
    id: 'LN-2024-0009', borrowerName: 'Michael Torres', coBorrowerName: null,
    loanType: 'VA', loanAmount: 295000, purchasePrice: 295000,
    propertyAddress: '2245 Freedom Ln, Killeen, TX 76540',
    processor: 'Emily Chen', currentStage: 'Document Ingested', status: 'Pending',
    createdAt: '2024-01-30T14:00:00Z', lastUpdated: '2024-01-30T14:00:00Z',
    stageStatus: { ingested: 'active', classified: 'pending', extracted: 'pending', ruleReview: 'pending', final: 'pending' },
    stageDates: { ingested: '2024-01-30T14:00:00Z', classified: null, extracted: null, ruleReview: null, final: null },
    extractedDocuments: [], ruleResults: [],
  },
  {
    id: 'LN-2024-0010', borrowerName: 'Susan Kelley', coBorrowerName: 'Brian Kelley',
    loanType: 'VA', loanAmount: 415000, purchasePrice: 415000,
    propertyAddress: '6780 Oak Hollow Rd, Waco, TX 76701',
    processor: 'David Park', currentStage: 'Completed', status: 'Pass',
    createdAt: '2024-01-12T08:00:00Z', lastUpdated: '2024-01-28T15:00:00Z',
    stageStatus: { ingested: 'complete', classified: 'complete', extracted: 'complete', ruleReview: 'complete', final: 'pass' },
    stageDates: { ingested: '2024-01-12T08:00:00Z', classified: '2024-01-12T10:30:00Z', extracted: '2024-01-14T13:00:00Z', ruleReview: '2024-01-22T09:30:00Z', final: '2024-01-28T15:00:00Z' },
    extractedDocuments: [w2('US Marine Corps', 95000), tax1040(93000), bankStmt(65000), empLetter('US Marine Corps', 95000, 10), appraisal(420000, '6780 Oak Hollow Rd, Waco, TX 76701'), creditRpt(752, 20), titleReport('6780 Oak Hollow Rd, Waco, TX 76701')],
    ruleResults: buildRules({ dti: 30, score: 752, ltv: 100, empYrs: 10 }),
  },
  {
    id: 'LN-2024-0011', borrowerName: 'Carlos Mendoza', coBorrowerName: null,
    loanType: 'FHA', loanAmount: 185000, purchasePrice: 192000,
    propertyAddress: '445 Spring Street, El Paso, TX 79901',
    processor: 'Jennifer Walsh', currentStage: 'In Rule Review', status: 'Pending',
    createdAt: '2024-01-22T09:00:00Z', lastUpdated: '2024-01-31T14:00:00Z',
    stageStatus: { ingested: 'complete', classified: 'complete', extracted: 'complete', ruleReview: 'active', final: 'pending' },
    stageDates: { ingested: '2024-01-22T09:00:00Z', classified: '2024-01-22T11:00:00Z', extracted: '2024-01-24T15:00:00Z', ruleReview: '2024-01-31T14:00:00Z', final: null },
    extractedDocuments: [w2('Southwest Logistics', 58000), tax1040(56000), bankStmt(18000), empLetter('Southwest Logistics', 58000, 5), appraisal(193000, '445 Spring Street, El Paso, TX 79901'), creditRpt(638, 55), titleReport('445 Spring Street, El Paso, TX 79901')],
    ruleResults: buildRules({ dti: 41, score: 638, ltv: 96, empYrs: 5 }),
  },
  {
    id: 'LN-2024-0012', borrowerName: 'Patricia Nguyen', coBorrowerName: 'David Nguyen',
    loanType: 'Conventional', loanAmount: 560000, purchasePrice: 600000,
    propertyAddress: '2301 Lakeside Dr, Frisco, TX 75034',
    processor: 'Marcus Lee', currentStage: 'Extracted', status: 'Pending',
    createdAt: '2024-01-26T08:00:00Z', lastUpdated: '2024-01-31T16:00:00Z',
    stageStatus: { ingested: 'complete', classified: 'complete', extracted: 'active', ruleReview: 'pending', final: 'pending' },
    stageDates: { ingested: '2024-01-26T08:00:00Z', classified: '2024-01-26T10:00:00Z', extracted: '2024-01-31T16:00:00Z', ruleReview: null, final: null },
    extractedDocuments: [w2('Quantum Dynamics Corp', 168000), tax1040(165000), bankStmt(145000), empLetter('Quantum Dynamics Corp', 168000, 7), appraisal(603000, '2301 Lakeside Dr, Frisco, TX 75034'), creditRpt(788, 15), titleReport('2301 Lakeside Dr, Frisco, TX 75034')],
    ruleResults: [],
  },
  {
    id: 'LN-2024-0013', borrowerName: "Kevin O'Brien", coBorrowerName: null,
    loanType: 'Conventional', loanAmount: 395000, purchasePrice: 430000,
    propertyAddress: '883 Rolling Hills Blvd, Round Rock, TX 78664',
    processor: 'Emily Chen', currentStage: 'Completed', status: 'Pass',
    createdAt: '2024-01-08T10:00:00Z', lastUpdated: '2024-01-23T14:00:00Z',
    stageStatus: { ingested: 'complete', classified: 'complete', extracted: 'complete', ruleReview: 'complete', final: 'pass' },
    stageDates: { ingested: '2024-01-08T10:00:00Z', classified: '2024-01-08T13:00:00Z', extracted: '2024-01-10T09:00:00Z', ruleReview: '2024-01-16T11:00:00Z', final: '2024-01-23T14:00:00Z' },
    extractedDocuments: [w2('Dell Technologies', 128000), tax1040(125000), bankStmt(95000), empLetter('Dell Technologies', 128000, 9), appraisal(432000, '883 Rolling Hills Blvd, Round Rock, TX 78664'), creditRpt(771, 16), titleReport('883 Rolling Hills Blvd, Round Rock, TX 78664')],
    ruleResults: buildRules({ dti: 29, score: 771, ltv: 92, empYrs: 9 }),
  },
  {
    id: 'LN-2024-0014', borrowerName: 'Amanda Foster', coBorrowerName: null,
    loanType: 'Conventional', loanAmount: 275000, purchasePrice: 285000,
    propertyAddress: '1122 Main Street, Georgetown, TX 78626',
    processor: 'David Park', currentStage: 'Completed', status: 'Fail',
    createdAt: '2024-01-11T09:00:00Z', lastUpdated: '2024-01-26T10:00:00Z',
    stageStatus: { ingested: 'complete', classified: 'complete', extracted: 'complete', ruleReview: 'complete', final: 'fail' },
    stageDates: { ingested: '2024-01-11T09:00:00Z', classified: '2024-01-11T11:30:00Z', extracted: '2024-01-13T14:00:00Z', ruleReview: '2024-01-20T09:00:00Z', final: '2024-01-26T10:00:00Z' },
    extractedDocuments: [w2('Freelance Consulting', 62000), tax1040(58000), bankStmt(12000), empLetter('Self-Employed', 62000, 1), appraisal(285000, '1122 Main Street, Georgetown, TX 78626'), creditRpt(642, 68), titleReport('1122 Main Street, Georgetown, TX 78626')],
    ruleResults: [
      { ...buildRules({ dti: 46, score: 642, ltv: 96, empYrs: 1 })[0], status: 'Fail', actualValue: '46%', details: 'Freelance income inconsistency raises DTI above threshold.' },
      buildRules({ dti: 46, score: 642, ltv: 96, empYrs: 1 })[1],
      buildRules({ dti: 46, score: 642, ltv: 96, empYrs: 1 })[2],
      { ...buildRules({ dti: 46, score: 642, ltv: 96, empYrs: 1 })[3], status: 'Fail', actualValue: '1 year', details: 'Self-employment history insufficient — 2-year history required.' },
      ...buildRules({ dti: 46, score: 642, ltv: 96, empYrs: 1 }).slice(4),
    ],
  },
  {
    id: 'LN-2024-0015', borrowerName: 'Ryan Patel', coBorrowerName: null,
    loanType: 'FHA', loanAmount: 210000, purchasePrice: 220000,
    propertyAddress: '3456 Campus Dr, Lubbock, TX 79401',
    processor: 'Marcus Lee', currentStage: 'Document Ingested', status: 'Pending',
    createdAt: '2024-01-31T11:00:00Z', lastUpdated: '2024-01-31T11:00:00Z',
    stageStatus: { ingested: 'active', classified: 'pending', extracted: 'pending', ruleReview: 'pending', final: 'pending' },
    stageDates: { ingested: '2024-01-31T11:00:00Z', classified: null, extracted: null, ruleReview: null, final: null },
    extractedDocuments: [], ruleResults: [],
  },
  {
    id: 'LN-2024-0016', borrowerName: 'Elizabeth Morrison', coBorrowerName: 'Robert Morrison',
    loanType: 'Jumbo', loanAmount: 1580000, purchasePrice: 1750000,
    propertyAddress: '72 Lakewood Estates Dr, Austin, TX 78738',
    processor: 'Jennifer Walsh', currentStage: 'In Rule Review', status: 'Pending',
    createdAt: '2024-01-17T09:00:00Z', lastUpdated: '2024-01-30T10:00:00Z',
    stageStatus: { ingested: 'complete', classified: 'complete', extracted: 'complete', ruleReview: 'active', final: 'pending' },
    stageDates: { ingested: '2024-01-17T09:00:00Z', classified: '2024-01-17T12:00:00Z', extracted: '2024-01-21T15:00:00Z', ruleReview: '2024-01-30T10:00:00Z', final: null },
    extractedDocuments: [w2('Morrison & Partners LLP', 385000), tax1040(380000), bankStmt(680000), empLetter('Morrison & Partners LLP', 385000, 18), appraisal(1760000, '72 Lakewood Estates Dr, Austin, TX 78738'), creditRpt(795, 12), titleReport('72 Lakewood Estates Dr, Austin, TX 78738')],
    ruleResults: buildRules({ dti: 31, score: 795, ltv: 90, empYrs: 18 }),
  },
  {
    id: 'LN-2024-0017', borrowerName: 'Daniel Kim', coBorrowerName: null,
    loanType: 'FHA', loanAmount: 175000, purchasePrice: 182000,
    propertyAddress: '228 Peachtree Lane, Corpus Christi, TX 78401',
    processor: 'Emily Chen', currentStage: 'Completed', status: 'Pass',
    createdAt: '2024-01-09T09:00:00Z', lastUpdated: '2024-01-24T16:00:00Z',
    stageStatus: { ingested: 'complete', classified: 'complete', extracted: 'complete', ruleReview: 'complete', final: 'pass' },
    stageDates: { ingested: '2024-01-09T09:00:00Z', classified: '2024-01-09T11:00:00Z', extracted: '2024-01-11T13:00:00Z', ruleReview: '2024-01-18T10:00:00Z', final: '2024-01-24T16:00:00Z' },
    extractedDocuments: [w2('Coastal Healthcare', 72000), tax1040(70000), bankStmt(32000), empLetter('Coastal Healthcare', 72000, 5), appraisal(184000, '228 Peachtree Lane, Corpus Christi, TX 78401'), creditRpt(698, 32), titleReport('228 Peachtree Lane, Corpus Christi, TX 78401')],
    ruleResults: buildRules({ dti: 37, score: 698, ltv: 96, empYrs: 5 }),
  },
  {
    id: 'LN-2024-0018', borrowerName: 'Laura Henderson', coBorrowerName: null,
    loanType: 'FHA', loanAmount: 165000, purchasePrice: 172000,
    propertyAddress: '541 Birch Way, Abilene, TX 79601',
    processor: 'David Park', currentStage: 'Classified', status: 'Pending',
    createdAt: '2024-01-28T10:00:00Z', lastUpdated: '2024-01-29T09:00:00Z',
    stageStatus: { ingested: 'complete', classified: 'active', extracted: 'pending', ruleReview: 'pending', final: 'pending' },
    stageDates: { ingested: '2024-01-28T10:00:00Z', classified: '2024-01-29T09:00:00Z', extracted: null, ruleReview: null, final: null },
    extractedDocuments: [], ruleResults: [],
  },
  {
    id: 'LN-2024-0019', borrowerName: 'Christopher Reed', coBorrowerName: 'Amanda Reed',
    loanType: 'VA', loanAmount: 350000, purchasePrice: 350000,
    propertyAddress: '1893 Military Ave, El Paso, TX 79903',
    processor: 'Marcus Lee', currentStage: 'Extracted', status: 'Pending',
    createdAt: '2024-01-27T08:00:00Z', lastUpdated: '2024-01-31T14:00:00Z',
    stageStatus: { ingested: 'complete', classified: 'complete', extracted: 'active', ruleReview: 'pending', final: 'pending' },
    stageDates: { ingested: '2024-01-27T08:00:00Z', classified: '2024-01-27T10:30:00Z', extracted: '2024-01-31T14:00:00Z', ruleReview: null, final: null },
    extractedDocuments: [w2('US Air Force', 88000), tax1040(86000), bankStmt(52000), empLetter('US Air Force', 88000, 7), appraisal(355000, '1893 Military Ave, El Paso, TX 79903'), creditRpt(728, 25), titleReport('1893 Military Ave, El Paso, TX 79903')],
    ruleResults: [],
  },
  {
    id: 'LN-2024-0020', borrowerName: 'Nathan Brooks', coBorrowerName: null,
    loanType: 'Conventional', loanAmount: 510000, purchasePrice: 530000,
    propertyAddress: '3301 Creek Side Dr, Pflugerville, TX 78660',
    processor: 'Jennifer Walsh', currentStage: 'Completed', status: 'Fail',
    createdAt: '2024-01-14T09:00:00Z', lastUpdated: '2024-01-29T11:00:00Z',
    stageStatus: { ingested: 'complete', classified: 'complete', extracted: 'complete', ruleReview: 'complete', final: 'fail' },
    stageDates: { ingested: '2024-01-14T09:00:00Z', classified: '2024-01-14T12:00:00Z', extracted: '2024-01-16T15:00:00Z', ruleReview: '2024-01-23T10:00:00Z', final: '2024-01-29T11:00:00Z' },
    extractedDocuments: [w2('Independent Contractor', 92000), tax1040(85000), bankStmt(22000), empLetter('Self-Employed', 92000, 1.5), appraisal(505000, '3301 Creek Side Dr, Pflugerville, TX 78660'), creditRpt(659, 61), titleReport('3301 Creek Side Dr, Pflugerville, TX 78660')],
    ruleResults: [
      { ...buildRules({ dti: 48, score: 659, ltv: 96, empYrs: 1.5 })[0], status: 'Fail', actualValue: '48%', details: 'High student loan balance inflating monthly obligations.' },
      buildRules({ dti: 48, score: 659, ltv: 96, empYrs: 1.5 })[1],
      buildRules({ dti: 48, score: 659, ltv: 96, empYrs: 1.5 })[2],
      { ...buildRules({ dti: 48, score: 659, ltv: 96, empYrs: 1.5 })[3], status: 'Fail', actualValue: '1.5 years', details: 'Contractor history insufficient — 2-year self-employment history required.' },
      ...buildRules({ dti: 48, score: 659, ltv: 96, empYrs: 1.5 }).slice(4),
    ],
  },
];

// ─── Analytics helpers ───────────────────────────────────────────────────────

export const getKPIs = (loans) => {
  const pass = loans.filter(l => l.status === 'Pass').length;
  const fail = loans.filter(l => l.status === 'Fail').length;
  const inProgress = loans.filter(l => l.status === 'Pending').length;
  const completed = loans.filter(l => l.currentStage === 'Completed').length;
  const passRate = completed > 0 ? Math.round((pass / completed) * 100) : 0;
  const avgAmount = Math.round(loans.reduce((s, l) => s + l.loanAmount, 0) / loans.length);
  return { total: loans.length, pass, fail, inProgress, passRate, avgAmount };
};

export const getPassFailData = (loans) => {
  const pass = loans.filter(l => l.status === 'Pass').length;
  const fail = loans.filter(l => l.status === 'Fail').length;
  const pending = loans.filter(l => l.status === 'Pending').length;
  return [
    { name: 'Pass', value: pass, color: '#16a34a' },
    { name: 'Fail', value: fail, color: '#dc2626' },
    { name: 'Pending', value: pending, color: '#9ca3af' },
  ];
};

export const getLoanTypeData = (loans) => {
  const types = ['Conventional', 'FHA', 'VA', 'Jumbo'];
  return types.map(t => ({
    name: t,
    total: loans.filter(l => l.loanType === t).length,
    pass: loans.filter(l => l.loanType === t && l.status === 'Pass').length,
    fail: loans.filter(l => l.loanType === t && l.status === 'Fail').length,
    pending: loans.filter(l => l.loanType === t && l.status === 'Pending').length,
  }));
};

export const getStageFunnelData = (loans) => [
  { stage: 'Ingested', count: loans.length, color: '#3b82f6' },
  { stage: 'Classified', count: loans.filter(l => ['Classified','Extracted','In Rule Review','Completed','Failed'].includes(l.currentStage) || l.stageStatus.classified !== 'pending').length, color: '#8b5cf6' },
  { stage: 'Extracted', count: loans.filter(l => ['Extracted','In Rule Review','Completed','Failed'].includes(l.currentStage)).length, color: '#0891b2' },
  { stage: 'Rule Review', count: loans.filter(l => ['In Rule Review','Completed','Failed'].includes(l.currentStage)).length, color: '#d97706' },
  { stage: 'Completed', count: loans.filter(l => l.currentStage === 'Completed').length, color: '#16a34a' },
];

export const getRuleFailureData = (loans) => {
  const freq = {};
  loans.forEach(l => l.ruleResults.filter(r => r.status === 'Fail').forEach(r => {
    freq[r.ruleName] = (freq[r.ruleName] || 0) + 1;
  }));
  return Object.entries(freq)
    .map(([name, count]) => ({ name: name.length > 28 ? name.slice(0, 26) + '…' : name, fullName: name, count }))
    .sort((a, b) => b.count - a.count);
};

export const getComplianceData = (loans) => {
  const DOC_TYPES = ['W-2 Wage Statement', 'Federal Tax Return (1040)', 'Bank Statement (3-Month)', 'Employment Verification Letter', 'Property Appraisal Report', 'Credit Report (Tri-Merge)', 'Title Search Report'];
  return loans
    .filter(l => l.extractedDocuments.length > 0)
    .slice(0, 12)
    .map(l => ({
      loanId: l.id.replace('LN-2024-', 'LN-'),
      borrower: l.borrowerName.split(' ').map((p, i) => i === 0 ? p : p[0] + '.').join(' '),
      docs: DOC_TYPES.map(dt => ({
        type: dt,
        present: l.extractedDocuments.some(d => d.docType === dt),
      })),
    }));
};

export const DOC_SHORT_NAMES = {
  'W-2 Wage Statement': 'W-2',
  'Federal Tax Return (1040)': '1040',
  'Bank Statement (3-Month)': 'Bank Stmt',
  'Employment Verification Letter': 'Emp. Letter',
  'Property Appraisal Report': 'Appraisal',
  'Credit Report (Tri-Merge)': 'Credit Rpt',
  'Title Search Report': 'Title',
};

export const PROCESSORS = ['All Processors', 'Emily Chen', 'David Park', 'Jennifer Walsh', 'Marcus Lee'];
export const LOAN_TYPES = ['All Types', 'Conventional', 'FHA', 'VA', 'Jumbo'];
export const STAGES = ['All Stages', 'Document Ingested', 'Classified', 'Extracted', 'In Rule Review', 'Completed'];
export const STATUSES = ['All Statuses', 'Pass', 'Fail', 'Pending'];
